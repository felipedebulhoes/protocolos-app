import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowDown,
  Scale,
  Activity,
  Baby,
  ShieldCheck,
  Phone,
  CalendarCheck,
  Syringe,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  MapPin,
  Video,
  BookOpen,
  Printer,
  ArrowLeft,
} from "lucide-react";

const WHATSAPP_NUMERO = "5511981124455";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá! Vim pela página sobre as canetas emagrecedoras (Ozempic / Mounjaro) e gostaria de agendar uma avaliação com o Dr. Felipe de Bulhões."
);
const AGENDAMENTO_URL = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG}`;

/** Cadeia central do material: emagrecimento → testosterona → fertilidade */
const cadeia = [
  {
    icon: Scale,
    step: "1",
    title: "Você perde peso",
    desc: "As canetas (semaglutida e tirzepatida) reduzem o apetite e ajudam a emagrecer de forma consistente, diminuindo a gordura abdominal.",
  },
  {
    icon: Activity,
    step: "2",
    title: "Sua testosterona sobe",
    desc: "A gordura em excesso transforma testosterona em estrogênio. Ao emagrecer, esse processo diminui e os níveis do hormônio masculino tendem a subir naturalmente.",
  },
  {
    icon: Baby,
    step: "3",
    title: "Sua fertilidade melhora",
    desc: "Com mais testosterona e menos inflamação, a qualidade do esperma (forma e movimento) e a saúde sexual tendem a melhorar.",
  },
];

const evidencias = [
  {
    valor: "+1,39 ng/mL",
    label: "de aumento médio na testosterona total",
    fonte:
      "Meta-análise com 7 estudos e 680 homens (Andrology, 2025)",
  },
  {
    valor: "24 sem.",
    label: "de semaglutida melhoraram a forma dos espermatozoides",
    fonte: "Estudos apresentados na ENDO 2026 (Endocrine Society)",
  },
  {
    valor: "Melhor que TRT",
    label:
      "tratar o peso superou a reposição de testosterona isolada em homens com obesidade",
    fonte: "Ensaio de 16 semanas com liraglutida (ENDO 2026)",
  },
];

const efeitos = [
  "Enjoo, náusea ou desconforto no estômago (geralmente nas primeiras semanas)",
  "Prisão de ventre ou diarreia",
  "Sensação de saciedade precoce e menos fome",
  "Mais raramente: refluxo, dor de cabeça ou cansaço",
];

const seguranca = [
  "Início com dose baixa e aumento gradual para reduzir enjoos",
  "Acompanhamento médico periódico com exames de sangue",
  "Orientação alimentar para preservar massa muscular",
  "Avaliação individual de quem pode (e quem não deve) usar",
];

export default function GuiaGLP1() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Estilos de impressão: oculta navegação/CTAs internos, deixa o material limpo para o paciente */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header { position: static !important; }
          .brand-gradient { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          section { break-inside: avoid; }
        }
      `}</style>

      {/* ── BARRA INTERNA (equipe) — não aparece no PDF ─────────────────── */}
      <div className="no-print bg-muted/60 border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <button
            onClick={() => navigate("/")}
            className="btn-press inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos protocolos
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground font-light">
              Material interno — gere o PDF e entregue ao paciente
            </span>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="btn-press cobre-gradient text-white shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" /> Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </div>

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
          <nav className="flex items-center gap-2 no-print">
            <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="btn-press cobre-gradient text-white shadow-sm hover:shadow-md transition-shadow"
              >
                Agendar Avaliação
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
              Guia do Paciente
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-white/95 mb-6 leading-tight tracking-wide">
              Canetas Emagrecedoras: muito além do peso
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Ozempic e Mounjaro viraram febre pelo emagrecimento. Mas para o
              homem existe um benefício pouco comentado: emagrecer pode elevar a
              testosterona e melhorar a fertilidade. Entenda em linguagem simples.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="btn-press cobre-gradient text-white shadow-lg hover:shadow-xl transition-shadow px-8"
                >
                  Quero uma avaliação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── O QUE SÃO ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-sm cobre-gradient text-white">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
                O que são essas "canetas"?
              </h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                São medicamentos da classe dos <strong>análogos de GLP-1</strong>{" "}
                (e do GIP, no caso do Mounjaro). Eles imitam hormônios naturais do
                intestino que avisam ao cérebro que você está satisfeito. O
                resultado é menos fome, menos compulsão e perda de peso
                significativa. Os nomes mais conhecidos são{" "}
                <strong>semaglutida</strong> (Ozempic® e Wegovy®) e{" "}
                <strong>tirzepatida</strong> (Mounjaro®).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── A CADEIA emagrecimento → testosterona → fertilidade ─────────── */}
      <section className="py-20 px-4 bg-muted/40 border-y border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
              A conexão que poucos explicam
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Para o homem, emagrecer não é só estética. Existe uma reação em
              cadeia que impacta diretamente a saúde hormonal e reprodutiva.
            </p>
          </div>

          {/* Desktop: 3 colunas com setas | Mobile: empilhado com setas para baixo */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-3">
            {cadeia.map((c, i) => (
              <div key={c.title} className="flex flex-col md:flex-row md:items-center md:flex-1 gap-6 md:gap-3">
                <div className="relative bg-card border border-border p-7 flex flex-col gap-4 md:flex-1 md:min-h-[260px]">
                  <span className="absolute -top-3 left-7 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-3 py-1">
                    Passo {c.step}
                  </span>
                  <div className="w-12 h-12 mt-2 flex items-center justify-center rounded-sm cobre-gradient text-white">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-primary">{c.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {c.desc}
                  </p>
                </div>
                {i < cadeia.length - 1 && (
                  <>
                    <ArrowRight className="hidden md:block w-7 h-7 text-[#B87333]/60 shrink-0" />
                    <ArrowDown className="md:hidden w-6 h-6 text-[#B87333]/60 mx-auto" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O QUE A CIÊNCIA MOSTRA ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-[#B87333] text-xs tracking-[0.2em] uppercase mb-3">
              <BookOpen className="w-4 h-4" /> Baseado em evidência
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3">
              O que a ciência mais recente mostra
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              Estudos publicados em 2025 e apresentados em 2026 reforçam o
              benefício hormonal em homens com obesidade.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {evidencias.map((e) => (
              <div
                key={e.label}
                className="bg-card border border-border p-7 flex flex-col gap-3 text-center"
              >
                <span className="font-serif text-2xl md:text-3xl text-[#B87333]">
                  {e.valor}
                </span>
                <p className="text-sm text-primary font-medium leading-snug">
                  {e.label}
                </p>
                <p className="text-xs text-muted-foreground font-light mt-auto pt-2 border-t border-border">
                  {e.fonte}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80 text-center mt-8 max-w-3xl mx-auto font-light leading-relaxed">
            Fontes: Salvio G. et al. <em>Effects of GLP-1 receptor agonists on
            testicular dysfunction: a systematic review and meta-analysis.</em>{" "}
            Andrology, 2025 (PMID: 40105090). Endocrine Society — comunicado
            ENDO 2026 (junho de 2026). A maior parte do benefício reprodutivo é{" "}
            <strong>indireta</strong>, decorrente da perda de peso e da melhora
            metabólica.
          </p>
        </div>
      </section>

      {/* ── AVISO IMPORTANTE: FERTILIDADE ───────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-4xl">
          <div className="bg-[#B87333]/8 border-l-4 border-[#B87333] p-7 flex items-start gap-4">
            <AlertTriangle className="w-7 h-7 text-[#B87333] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-lg text-primary mb-2">
                Está tentando ter um filho? Leia com atenção
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Embora emagrecer ajude a fertilidade, essas medicações{" "}
                <strong>não são liberadas durante a tentativa de gravidez do
                casal sem avaliação</strong>, e a segurança em homens que buscam
                concepção ainda está sendo estudada. Se o seu objetivo inclui
                fertilidade, o uso precisa ser planejado individualmente, com
                acompanhamento e, muitas vezes, com tempo de pausa antes de tentar.
                Nunca use por conta própria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EFEITOS COLATERAIS + SEGURANÇA ──────────────────────────────── */}
      <section className="py-20 px-4 bg-muted/40 border-y border-border">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-primary">
                  Efeitos colaterais comuns
                </h4>
              </div>
              <ul className="space-y-3">
                {efeitos.map((ef) => (
                  <li
                    key={ef}
                    className="flex items-start gap-2 text-sm text-muted-foreground font-light"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333] shrink-0" />
                    {ef}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center rounded-sm cobre-gradient text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg text-primary">
                  Como usamos com segurança
                </h4>
              </div>
              <ul className="space-y-3">
                {seguranca.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-sm text-muted-foreground font-light"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B87333] shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── POR QUE COM UM UROLOGISTA ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-4xl text-center">
          <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-sm cobre-gradient text-white">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-primary mb-4">
            Por que tratar isso com um urologista?
          </h3>
          <p className="text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto">
            Porque, para o homem, peso, hormônios, desempenho sexual e
            fertilidade fazem parte de uma mesma história. Como urologista com
            foco em andrologia, avalio o conjunto — não apenas a balança — e
            construo um plano que cuida da sua saúde masculina de forma completa,
            com base em evidência científica e acompanhamento próximo.
          </p>
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
              Quer saber se é indicado para você?
            </h3>
            <p className="text-white/70 mb-10 font-light max-w-lg mx-auto">
              Agende uma avaliação individual — presencial ou por teleconsulta,
              com o mesmo cuidado e o mesmo valor. Vamos analisar seu caso e
              definir, juntos, o melhor caminho.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="btn-press cobre-gradient text-white shadow-lg hover:shadow-xl transition-shadow px-8"
                >
                  Agendar minha avaliação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href={`tel:+${WHATSAPP_NUMERO}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-press border-white/40 text-white hover:bg-white/10 px-8"
                >
                  <Phone className="w-4 h-4 mr-2" /> (11) 98112-4455
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

      {/* ── DISCLAIMER + FOOTER ─────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-background border-t border-border">
        <div className="container max-w-4xl">
          <p className="text-xs text-muted-foreground/70 text-center font-light leading-relaxed">
            Este conteúdo tem caráter exclusivamente informativo e educativo e
            não substitui a consulta médica. As medicações citadas exigem
            prescrição e acompanhamento. Indicações, doses e contraindicações
            devem ser definidas individualmente por seu médico.
          </p>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/80">
            Dr. Felipe de Bulhões — Urologia &amp; Andrologia
          </p>
        </div>
      </footer>
    </div>
  );
}
