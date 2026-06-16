import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { INTAKE_SECTIONS } from "@shared/intakeSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { PatientBrandHeader } from "@/components/intake/PatientBrandHeader";
import { IntakeFieldInput } from "@/components/intake/IntakeFieldInput";
import { ExamUploader, type UploadedExam } from "@/components/intake/ExamUploader";

type Answers = Record<string, string | string[] | number | undefined>;

// One extra step at the end for exams.
const EXAM_STEP_INDEX = INTAKE_SECTIONS.length;

export default function FichaPublica() {
  const [, params] = useRoute("/ficha/:token");
  const token = params?.token ?? "";

  const formQuery = trpc.intake.getByToken.useQuery({ token }, { enabled: !!token, retry: false });
  const submitMutation = trpc.intake.submit.useMutation();
  const uploadMutation = trpc.exams.uploadPublic.useMutation();
  const registerMutation = trpc.patientAuth.register.useMutation();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  const totalSteps = EXAM_STEP_INDEX + 1;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const section = useMemo(
    () => (step < INTAKE_SECTIONS.length ? INTAKE_SECTIONS[step] : null),
    [step],
  );

  function setAnswer(id: string, val: Answers[string]) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  function validateStep(): boolean {
    if (!section) return true;
    for (const f of section.fields) {
      if (!f.required) continue;
      const v = answers[f.id];
      const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      if (empty) {
        toast.error(`Por favor, preencha: ${f.label}`);
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, EXAM_STEP_INDEX));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    try {
      const res = await submitMutation.mutateAsync({ token, answers });
      setSubmittedEmail(res.email);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar a ficha.");
    }
  }

  async function handleCreateAccount() {
    if (password.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        email: submittedEmail,
        password,
        fullName: (answers.fullName as string) || undefined,
        phone: (answers.phone as string) || undefined,
      });
      setAccountCreated(true);
      toast.success("Conta criada! Você já pode acessar o portal.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível criar a conta.");
    }
  }

  // ---- Loading / invalid states -------------------------------------------
  if (!token) {
    return <FullMessage title="Link inválido" text="O endereço acessado não contém um código de ficha válido." />;
  }
  if (formQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1C3D5A]" />
      </div>
    );
  }
  if (formQuery.isError || !formQuery.data) {
    return <FullMessage title="Link inválido ou expirado" text="Solicite um novo link ao consultório do Dr. Felipe." />;
  }
  if (formQuery.data.alreadySubmitted && !done) {
    return (
      <FullMessage
        title="Ficha já preenchida"
        text="Esta ficha já foi enviada. Se precisar atualizar informações, acesse o Portal do Paciente."
        portalLink
      />
    );
  }

  // ---- Success screen ------------------------------------------------------
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <PatientBrandHeader badge="Ficha enviada" />
        <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardContent className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold text-[#1C3D5A]">Recebemos sua ficha!</h2>
              <p className="text-sm text-slate-600">
                Obrigado. O Dr. Felipe já vai receber suas informações e seus exames antes da consulta.
              </p>
            </CardContent>
          </Card>

          {!accountCreated ? (
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#1C3D5A]">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold">Crie seu acesso ao Portal do Paciente</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Com uma senha você poderá adicionar novos exames a qualquer momento e acompanhar seu histórico.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">E-mail</label>
                  <Input value={submittedEmail} disabled className="bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">Crie uma senha</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="bg-white"
                  />
                </div>
                <Button
                  onClick={handleCreateAccount}
                  disabled={registerMutation.isPending}
                  className="w-full copper-gradient text-white font-semibold"
                >
                  {registerMutation.isPending ? "Criando..." : "Criar acesso ao portal"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="p-6 text-center space-y-3">
                <p className="text-sm text-slate-600">Sua conta está pronta.</p>
                <a href="/portal">
                  <Button className="copper-gradient text-white font-semibold">Acessar o Portal do Paciente</Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ---- Main multi-step form ------------------------------------------------
  const isExamStep = step === EXAM_STEP_INDEX;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <PatientBrandHeader badge="Ficha Pré-Consulta" />

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 mt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>
            Etapa {step + 1} de {totalSteps}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full copper-gradient transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="p-6 space-y-5">
            {isExamStep ? (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[#1C3D5A]">Seus exames</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Tem exames recentes? Envie aqui (PDF ou foto). A leitura é automática — não precisa digitar nada.
                    Esta etapa é opcional.
                  </p>
                </div>
                <ExamUploader
                  onUpload={async (a): Promise<UploadedExam> => {
                    const r = await uploadMutation.mutateAsync({ ...a, intakeToken: token });
                    return {
                      fileName: a.fileName,
                      processStatus: r.processStatus,
                      resultCount: r.resultCount,
                      labName: r.labName,
                      examType: r.examType,
                    };
                  }}
                />
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[#1C3D5A]">{section!.title}</h2>
                  {section!.description && (
                    <p className="text-sm text-slate-600 mt-1">{section!.description}</p>
                  )}
                </div>
                <div className="space-y-5">
                  {section!.fields.map((f) => (
                    <IntakeFieldInput
                      key={f.id}
                      field={f}
                      value={answers[f.id]}
                      onChange={(val) => setAnswer(f.id, val)}
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
            className="bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          {isExamStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="copper-gradient text-white font-semibold flex-1 sm:flex-none"
            >
              {submitMutation.isPending ? "Enviando..." : "Concluir e enviar ficha"}
            </Button>
          ) : (
            <Button onClick={next} className="bg-[#1C3D5A] text-white font-semibold flex-1 sm:flex-none">
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FullMessage({
  title,
  text,
  portalLink,
}: {
  title: string;
  text: string;
  portalLink?: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PatientBrandHeader badge="Ficha Pré-Consulta" />
      <div className="max-w-md mx-auto px-4 mt-12">
        <Card className="border-0 shadow-lg rounded-2xl bg-white">
          <CardContent className="p-8 text-center space-y-3">
            <h2 className="text-xl font-bold text-[#1C3D5A]">{title}</h2>
            <p className="text-sm text-slate-600">{text}</p>
            {portalLink && (
              <a href="/portal">
                <Button className="copper-gradient text-white font-semibold mt-2">
                  Ir para o Portal do Paciente
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
