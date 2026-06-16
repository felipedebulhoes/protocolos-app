import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, LogOut, FlaskConical, FileText, AlertTriangle } from "lucide-react";
import { PatientBrandHeader } from "@/components/intake/PatientBrandHeader";
import { ExamUploader, type UploadedExam } from "@/components/intake/ExamUploader";

function flagBadge(flag: string) {
  if (flag === "high")
    return <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Alto</Badge>;
  if (flag === "low")
    return <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Baixo</Badge>;
  if (flag === "normal")
    return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Normal</Badge>;
  return null;
}

export default function PortalPaciente() {
  const utils = trpc.useUtils();
  const meQuery = trpc.patientAuth.me.useQuery(undefined, { retry: false });
  const isAuthed = !!meQuery.data && !meQuery.isError;

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1C3D5A]" />
      </div>
    );
  }

  if (!isAuthed) {
    return <AuthScreen onAuthed={() => utils.patientAuth.me.invalidate()} />;
  }

  return <PortalContent patient={meQuery.data!} />;
}

// ---------------------------------------------------------------------------
// Login / register screen
// ---------------------------------------------------------------------------
function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const login = trpc.patientAuth.login.useMutation();
  const register = trpc.patientAuth.register.useMutation();

  async function submit() {
    if (!email || !password) {
      toast.error("Informe e-mail e senha.");
      return;
    }
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ email, password, fullName: fullName || undefined });
      }
      onAuthed();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível continuar.");
    }
  }

  const busy = login.isPending || register.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientBrandHeader badge="Portal do Paciente" />
      <div className="max-w-md mx-auto px-4 mt-12">
        <Card className="border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1C3D5A]">
                {mode === "login" ? "Acessar meu portal" : "Criar minha conta"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {mode === "login"
                  ? "Entre para acompanhar e enviar seus exames."
                  : "Crie um acesso para guardar seu histórico de exames."}
              </p>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">Nome completo</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={mode === "register" ? "Mínimo de 6 caracteres" : ""}
                className="bg-white"
              />
            </div>

            <Button onClick={submit} disabled={busy} className="w-full copper-gradient text-white font-semibold">
              {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              {mode === "login" ? "Ainda não tem acesso? " : "Já tem conta? "}
              <button
                type="button"
                className="text-amber-700 font-semibold underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Authenticated portal content
// ---------------------------------------------------------------------------
function PortalContent({
  patient,
}: {
  patient: { fullName: string | null; email: string };
}) {
  const utils = trpc.useUtils();
  const resultsQuery = trpc.exams.myResults.useQuery();
  const filesQuery = trpc.exams.listMine.useQuery();
  const upload = trpc.exams.upload.useMutation();
  const logout = trpc.patientAuth.logout.useMutation();

  async function handleLogout() {
    await logout.mutateAsync();
    utils.patientAuth.me.invalidate();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PatientBrandHeader badge="Portal do Paciente" />

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C3D5A]">
              Olá, {patient.fullName?.split(" ")[0] || "paciente"}
            </h2>
            <p className="text-sm text-slate-500">{patient.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white">
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>

        {/* Upload new exam */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#1C3D5A]">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold">Adicionar novo exame</h3>
            </div>
            <ExamUploader
              hint="Envie quando tiver um exame novo — fica salvo no seu histórico."
              onUpload={async (a): Promise<UploadedExam> => {
                const r = await upload.mutateAsync(a);
                utils.exams.myResults.invalidate();
                utils.exams.listMine.invalidate();
                return {
                  fileName: a.fileName,
                  processStatus: r.processStatus,
                  resultCount: r.resultCount,
                  labName: r.labName,
                  examType: r.examType,
                };
              }}
            />
          </CardContent>
        </Card>

        {/* Standardized results by category */}
        <Card className="border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-[#1C3D5A]">Meus resultados</h3>
            {resultsQuery.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : !resultsQuery.data || resultsQuery.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nenhum resultado ainda. Envie um exame acima para começar.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {resultsQuery.data.map((group) => (
                  <div key={group.category}>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                      {group.categoryLabel}
                    </div>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {group.items.map((r, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#1C3D5A] truncate">{r.analyteLabel}</div>
                            {r.measuredAt && (
                              <div className="text-[11px] text-slate-400">{r.measuredAt}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold text-slate-700">
                              {r.valueNum != null ? r.valueNum : r.valueText ?? "—"}
                              {r.unit ? ` ${r.unit}` : ""}
                            </span>
                            {flagBadge(r.abnormalFlag)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded files */}
        {filesQuery.data && filesQuery.data.length > 0 && (
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-[#1C3D5A]">Arquivos enviados</h3>
              <div className="space-y-2">
                {filesQuery.data.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1C3D5A] truncate">{f.fileName}</div>
                      <div className="text-xs text-slate-500">
                        {f.examDate || new Date(f.createdAt).toLocaleDateString("pt-BR")}
                        {f.labName ? ` • ${f.labName}` : ""}
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] border-0 ${
                        f.processStatus === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : f.processStatus === "failed"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {f.processStatus === "done" ? "Lido" : f.processStatus === "failed" ? "Manual" : "Processando"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
