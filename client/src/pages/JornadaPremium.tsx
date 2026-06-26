import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Stethoscope,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
  Phone,
  CalendarCheck,
  Sparkles,
  Quote,
  MapPin,
  Video,
  Award,
} from "lucide-react";

const WHATSAPP_NUMERO = "5511981124455";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá! Vim pela página Jornada Premium e gostaria de agendar uma consulta com o Dr. Felipe de Bulhões."
);
const AGENDAMENTO_URL = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG}`;

const pilares = [
  {
    icon: Stethoscope,
    title: "Diagnóstico de Precisão",
    desc: "Investigação individualizada baseada nas diretrizes EAU 2025 e AUA 2024, não condutas genéricas.",
  },
  {
    icon: HeartHandshake,
    title: "Atendimento Humanizado",
    desc: "Você é acompanhado de perto, com escuta ativa e metas terapêuticas definidas em conjunto.",
  },
  {
    icon: Phone,
    title: "Acesso Direto ao Especialista",
    desc: "Canal direto com o Dr. Felipe e equipe durante toda a sua jornada de tratamento.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança e Continuidade",
    desc: "Reavaliações programadas e ajuste contínuo da terapia para resultados duradouros.",
  },
];

const timeline = [
  {
    phase: "ANTES",
    title: "Avaliação e Preparo",
    icon: ClipboardCheck,
    points: [
      "Anamnese detalhada e exame direcionado",
      "Exames pertinentes e definição de metas",
      "Orientação inicial de estilo de vida (MEV)",
    ],
  },
  {
    phase: "DURANTE",
    title: "Tratamento Acompanhado",
    icon: Stethoscope,
    points: [
      "Reavaliações programadas e ajuste de terapia",
      "Canal direto para dúvidas durante o período",
      "Acompanhamento de adesão e tolerância",
    ],
  },
  {
    phase: "DEPOIS",
    title: "Resultado e Manutenção",
    icon: Sparkles,
    points: [
      "Reavaliação completa documentada",
      "Plano de manutenção de longo prazo",
      "Autonomia com suporte quando necessário",
    ],
  },
];

const diferenciais = [
  "Atendimento Humanizado",
  "Particular e Convênios",
  "Formado Instituto D'Or",
  "Agendamento Online",
  "Cirurgia Minimamente Invasiva",
  "Teleconsulta disponível",
];

export default function JornadaPremium() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo_portrait.svg"
              alt="Dr. Felipe de Bulhões"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="font-serif text-xl text-primary tracking-wide">
                Dr. Felipe de Bulhões
              </h1>
              <p className="text-[11px] text-muted-foreground tracking-[0.2em] uppercase font-light">
                Urologia &amp; Andrologia
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="btn-press cobre-gradient text-white shadow-sm hover:shadow-md transition-shadow"
              >
                Agendar Consulta
              </Button>
            </a>
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient" />
        <div className="absolute inset-0 brand-pattern opacity-[0.04]" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B87333]/60 to-transparent" />

        <div className="relative py-24 md:py-32 px-4">
          <div className="container max-w-3xl text-center">
            <span className="inline-block bg-[#B87333] text-white text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-sm mb-8">
              Clínica Premium Personalizada
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-white/95 mb-6 leading-tight tracking-wide">
              Sua Jornada Premium de Cuidado em Andrologia
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Mais que uma consulta isolada: um acompanhamento contínuo, baseado
              em evidência científica, com acesso direto ao especialista do
              início ao resultado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="btn-press cobre-gradient text-white shadow-lg hover:shadow-xl transition-shadow px-8"
                >
                  Agende sua Transformação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILOSOFIA CPP ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
              A Filosofia CPP
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              A Clínica Premium Personalizada nasce da convicção de que o
              cuidado em saúde masculina precisa ser contínuo, individualizado e
              próximo. Quatro pilares sustentam essa experiência.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilares.map((p) => (
              <div
                key={p.title}
                className="bg-card border border-border p-6 flex flex-col gap-3"
              >
                <div className="w-11 h-11 flex items-center justify-center rounded-sm cobre-gradient text-white">
                  <p.icon className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-primary">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ANTES / DURANTE / DEPOIS ───────────────────────────── */}
      <section className="py-20 px-4 bg-muted/40 border-y border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
              Como Funciona a Jornada
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Do primeiro contato ao resultado consolidado, cada etapa é
              planejada e acompanhada de perto.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {timeline.map((t, i) => (
              <div
                key={t.phase}
                className="relative bg-card border border-border p-7 flex flex-col gap-4"
              >
                <span className="absolute -top-3 left-7 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-3 py-1">
                  {t.phase}
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <t.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-lg text-primary">{t.title}</h4>
                </div>
                <ul className="space-y-2">
                  {t.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2 text-sm text-muted-foreground font-light"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333] shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
                {i < timeline.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-5 w-6 h-6 text-[#B87333]/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap justify-center gap-3">
            {diferenciais.map((d) => (
              <span
                key={d}
                className="flex items-center gap-2 bg-card border border-border px-4 py-2 text-sm text-primary"
              >
                <Award className="w-4 h-4 text-[#B87333]" />
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS (espaço para conteúdo real autorizado) ──────────── */}
      <section className="py-20 px-4 bg-muted/40 border-y border-border">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
              Depoimentos de Pacientes
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Espaço reservado para relatos reais de pacientes, publicados
              somente com autorização expressa e em conformidade com as normas do
              Conselho Federal de Medicina.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-card border border-dashed border-border p-7 flex flex-col gap-4"
              >
                <Quote className="w-7 h-7 text-[#B87333]/50" />
                <p className="text-sm text-muted-foreground italic font-light">
                  Depoimento autorizado a ser inserido aqui pelo Dr. Felipe.
                </p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Nome do paciente
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tratamento realizado
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient" />
        <div className="absolute inset-0 brand-pattern opacity-[0.04]" />
        <div className="relative py-20 px-4">
          <div className="container max-w-2xl text-center">
            <CalendarCheck className="w-12 h-12 text-[#B87333] mx-auto mb-6" />
            <h3 className="font-serif text-2xl md:text-4xl text-white/95 mb-5 leading-tight">
              Pronto para começar sua jornada?
            </h3>
            <p className="text-white/70 mb-10 font-light max-w-lg mx-auto">
              Atendimento presencial ou por teleconsulta, com o mesmo cuidado e o
              mesmo valor. Agende sua consulta e dê o primeiro passo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="btn-press cobre-gradient text-white shadow-lg hover:shadow-xl transition-shadow px-8"
                >
                  Agende sua Transformação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 text-white/60 text-sm font-light">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Presencial
              </span>
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4" /> Teleconsulta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/80">
            Dr. Felipe de Bulhões — Urologia &amp; Andrologia
          </p>
          <Link href="/paciente">
            <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground cursor-pointer">
              Portal de Pré-Consulta
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
