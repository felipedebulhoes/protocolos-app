import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, Loader2, XCircle } from "lucide-react";

export type UploadedExam = {
  fileName: string;
  processStatus: "done" | "failed";
  resultCount: number;
  labName?: string | null;
  examType?: string | null;
};

const MAX_MB = 12;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generic exam uploader. The actual upload call is injected via `onUpload`
 * so the same component works for the public intake flow and the patient portal.
 */
export function ExamUploader({
  onUpload,
  hint,
}: {
  onUpload: (args: {
    fileBase64: string;
    fileName: string;
    mimeType: string;
  }) => Promise<UploadedExam>;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedExam[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name}: arquivo maior que ${MAX_MB}MB.`);
        continue;
      }
      setBusy(true);
      try {
        const base64 = await fileToBase64(file);
        const res = await onUpload({
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        });
        setUploaded((prev) => [...prev, res]);
        if (res.processStatus === "done") {
          toast.success(`${file.name}: ${res.resultCount} resultado(s) lido(s).`);
        } else {
          toast.warning(`${file.name}: enviado, mas a leitura automática falhou. O Dr. verá o arquivo.`);
        }
      } catch (e) {
        toast.error(`Falha ao enviar ${file.name}.`);
        console.error(e);
      } finally {
        setBusy(false);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-slate-300 rounded-xl py-8 px-4 flex flex-col items-center gap-2 text-slate-500 hover:border-amber-500 hover:text-amber-700 transition-colors bg-white disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="text-sm font-medium">Lendo seu exame...</span>
          </>
        ) : (
          <>
            <Upload className="w-7 h-7" />
            <span className="text-sm font-semibold">Enviar exame (PDF ou foto)</span>
            <span className="text-xs">{hint ?? "A leitura é automática. Você pode enviar vários."}</span>
          </>
        )}
      </button>

      {uploaded.length > 0 && (
        <div className="space-y-2">
          {uploaded.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1C3D5A] truncate">{u.fileName}</div>
                <div className="text-xs text-slate-500">
                  {u.processStatus === "done"
                    ? `${u.resultCount} resultado(s)${u.labName ? " • " + u.labName : ""}`
                    : "Enviado (leitura manual pelo médico)"}
                </div>
              </div>
              {u.processStatus === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
