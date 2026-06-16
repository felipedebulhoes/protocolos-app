import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  Loader2,
  Sparkles,
  Stethoscope,
  FlaskConical,
  FileText,
  User,
  CheckCircle2,
} from "lucide-react";
import { INTAKE_SECTIONS } from "@shared/intakeSchema";
import { analyteLabel, CATEGORY_LABELS, categoryForAnalyte, type AnalyteCategory } from "@shared/analyteCategories";

type ProtocolSuggestion = {
  id: string;
  title: string;
  category: string;
  score: number;
  matchedKeywords: string[];
};

// Build a label lookup for every intake field & option for human-readable answers.
const FIELD_INDEX = (() => {
  const fields = new Map<string, { label: string; options?: Map<string, string> }>();
  for (const s of INTAKE_SECTIONS) {
    for (const f of s.fields) {
      const opts = f.options ? new Map(f.options.map((o) => [o.value, o.label])) : undefined;
      fields.set(f.id, { label: f.label, options: opts });
    }
  }
  return fields;
})();

function renderAnswer(id: string, value: unknown): string {
  const def = FIELD_INDEX.get(id);
  const opts = def?.options;
  if (Array.isArray(value)) {
    return value.map((v) => opts?.get(String(v)) ?? String(v)).join(", ");
  }
  if (value === null || value === undefined || value === "") return "—";
  return opts?.get(String(value)) ?? String(value);
}

function flagBadge(flag: string) {
  if (flag === "high") return <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Alto</Badge>;
  if (flag === "low") return <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Baixo</Badge>;
  if (flag === "normal") return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Normal</Badge>;
  return null;
}

export default function IntakeDetail() {
  const [, params] = useRoute("/fichas/:id");
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const detailQuery = trpc.intake.detail.useQuery({ id }, { enabled: Number.isFinite(id) && id > 0 });
  const review = trpc.intake.review.useMutation();
  const utils = trpc.useUtils();

  const [notes, setNotes] = useState("");

  const form = detailQuery.data?.form;
  const patient = detailQuery.data?.patient;
  const examFiles = detailQuery.data?.examFiles ?? [];
  const examResults = detailQuery.data?.examResults ?? [];

  useEffect(() => {
    if (patient?.notes) setNotes(patient.notes);
  }, [patient?.notes]);

  const suggestions = (form?.suggestedProtocols as ProtocolSuggestion[] | null) ?? [];
  const answers = (form?.answers as Record<string, unknown> | null) ?? {};

  // Group exam results by category
  const groupedResults = useMemo(() => {
    const groups = new Map<AnalyteCategory, typeof examResults>();
    for (const r of examResults) {
      const cat = categoryForAnalyte(r.analyteKey);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(r);
    }
    return Array.from(groups.entries());
  }, [examResults]);

  async function handleReview() {
    try {
      await review.mutateAsync({ id, notes });
      utils.intake.detail.invalidate({ id });
      utils.intake.list.invalidate();
      toast.success("Ficha marcada como revisada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }

  if (detailQuery.isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
        </div>
      </Layout>
    );
  }
  if (detailQuery.isError || !form) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">
          <p>Ficha não encontrada.</p>
          <Button variant="outline" className="mt-4 bg-white" onClick={() => navigate("/fichas")}>
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Back + header */}
        <div>
          <button
            onClick={() => navigate("/fichas")}
            className="text-sm text-muted-foreground hover:text-[#1C3D5A] flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para fichas
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1C3D5A]">
                {patient?.fullName || form.invitedName || "Paciente"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {patient?.email}
                {patient?.phone ? ` • ${patient.phone}` : ""}
              </p>
            </div>
            {form.status === "reviewed" ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Revisada
              </Badge>
            ) : (
              <Button onClick={handleReview} disabled={review.isPending} className="bg-[#1C3D5A] text-white">
                {review.isPending ? "Salvando..." : "Marcar como revisada"}
              </Button>
            )}
          </div>
        </div>

        {/* AI rapport */}
        {form.rapportSummary && (
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50/60 to-white border-l-4 border-l-[#B87333]">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
                <Sparkles className="w-5 h-5 text-[#B87333]" />
                Resumo de rapport (IA)
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{form.rapportSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Suggested protocols */}
        {suggestions.length > 0 && (
          <Card className="border border-slate-100">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
                <Stethoscope className="w-5 h-5 text-[#B87333]" />
                Protocolos sugeridos
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <div key={s.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#1C3D5A]">{s.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {s.score} pts
                      </Badge>
                    </div>
                    {s.matchedKeywords.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Indícios: {s.matchedKeywords.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sugestão automática baseada nas respostas. Decisão clínica é sempre do médico.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Exam results */}
        {examResults.length > 0 && (
          <Card className="border border-slate-100">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
                <FlaskConical className="w-5 h-5 text-[#B87333]" />
                Resultados de exames
              </div>
              {groupedResults.map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {items.map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#1C3D5A] truncate">
                            {analyteLabel(r.analyteKey)}
                          </div>
                          {r.refRange && <div className="text-[11px] text-slate-400">Ref: {r.refRange}</div>}
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
            </CardContent>
          </Card>
        )}

        {/* Uploaded files */}
        {examFiles.length > 0 && (
          <Card className="border border-slate-100">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
                <FileText className="w-5 h-5 text-[#B87333]" />
                Arquivos enviados
              </div>
              <div className="space-y-2">
                {examFiles.map((f) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1C3D5A] truncate">{f.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.labName || "—"}
                        {f.examDate ? ` • ${f.examDate}` : ""}
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
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full answers */}
        <Card className="border border-slate-100">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
              <User className="w-5 h-5 text-[#B87333]" />
              Respostas da ficha
            </div>
            {INTAKE_SECTIONS.map((section) => {
              const sectionAnswers = section.fields.filter(
                (f) => answers[f.id] !== undefined && answers[f.id] !== "",
              );
              if (sectionAnswers.length === 0) return null;
              return (
                <div key={section.id}>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                    {section.title}
                  </div>
                  <div className="space-y-1.5">
                    {sectionAnswers.map((f) => (
                      <div key={f.id} className="grid grid-cols-[1fr_1.4fr] gap-3 text-sm">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="text-[#1C3D5A] font-medium">{renderAnswer(f.id, answers[f.id])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Doctor notes */}
        <Card className="border border-slate-100">
          <CardContent className="p-5 space-y-3">
            <div className="text-[#1C3D5A] font-bold">Anotações do médico</div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Observações internas sobre o paciente..."
              className="bg-white"
            />
            <Button onClick={handleReview} disabled={review.isPending} className="copper-gradient text-white">
              {review.isPending ? "Salvando..." : "Salvar anotações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
