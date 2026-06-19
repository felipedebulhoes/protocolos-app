import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ClipboardList,
  Upload,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Award,
  Heart,
  Video,
  MapPin,
  ClipboardCheck,
  X,
} from "lucide-react";

function PersonalizedBanner({ token }: { token: string }) {
  const [dismissed, setDismissed] = useState(false);
  const formQuery = trpc.intake.getByToken.useQuery(
    { token },
    { enabled: !!token && !dismissed, retry: false }
  );

  if (dismissed || !formQuery.data) return null;

  const name = formQuery.data.invitedName || "";
  const firstName = name.split(" ")[0] || "";
  const greeting = firstName ? `Olá, ${firstName}` : "Olá";

  return (
    <div className="relative z-40 cobre-gradient text-white px-4 py-3">
      <div className="container flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 shrink-0 text-white/80" />
          <p className="text-sm font-medium">
            <span className="font-bold">{greeting} —</span>{" "}
            preencha sua ficha de pré-consulta antes da consulta com o Dr. Felipe.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/ficha/${token}`}>
            <Button size="sm" variant="outline" className="text-white border-white/40 bg-white/10 hover:bg-white/20 text-xs font-semibold">
              Preencher agora
            </Button>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PacienteLanding() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  // Meta Pixel — rastrear visualizações e conversões de pacientes
  useEffect(() => {
    (function(f: Window & typeof globalThis, b: Document, e: string, v: string) {
      if ((f as unknown as Record<string, unknown>).fbq) return;
      const n: ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void;
        queue: unknown[];
        push: (...args: unknown[]) => void;
        loaded: boolean;
        version: string;
      } = function(...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
      } as typeof n;
      (f as unknown as Record<string, unknown>).fbq = n;
      if (!(f as unknown as Record<string, unknown>)._fbq) (f as unknown as Record<string, unknown>)._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    const fbq = (window as unknown as Record<string, unknown>).fbq as (...args: unknown[]) => void;
    if (fbq) {
      fbq("init", "1730608694762791");
      fbq("track", "PageView");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-white/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-18 py-3">
          {/* Logo landscape */}
          <div className="flex items-center gap-3">
            <img
              src="/images/isotipo.svg"
              alt="Isotipo Dr. Felipe de Bulhões"
              className="h-10 w-auto invert opacity-85"
            />
            <div>
              <h1 className="font-serif text-xl text-primary tracking-wide">
                Dr. Felipe de Bulhões
              </h1>
              <p className="text-[11px] text-muted-foreground tracking-[0.2em] uppercase font-light">
                Urologia &amp; Cirurgia Geral
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="btn-press text-primary/70 hover:text-primary"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="sm"
                className="btn-press cobre-gradient text-white shadow-sm hover:shadow-md transition-shadow"
              >
                Cadastrar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Banner personalizado via token */}
      {token && <PersonalizedBanner token={token} />}

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Fundo brand-gradient com pattern */}
        <div className="absolute inset-0 brand-gradient" />
        <div className="absolute inset-0 brand-pattern opacity-[0.04]" />
        {/* Linha cobre separadora */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B87333]/60 to-transparent" />

        <div className="relative py-24 md:py-36 px-4">
          <div className="container max-w-3xl text-center">
            {/* Logo landscape branca */}
            <img
              src="/images/logo_landscape.svg"
              alt="Dr. Felipe de Bulhões"
              className="h-16 md:h-20 w-auto mx-auto mb-10 opacity-95"
            />

            <h2 className="font-serif text-3xl md:text-5xl text-white/95 mb-6 leading-tight tracking-wide">
              Portal de Pré-Consulta
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Prepare-se para sua consulta com antecedência. Preencha sua ficha
              de anamnese e envie seus exames de forma prática e segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="btn-press cobre-gradient text-white shadow-lg hover:shadow-xl transition-shadow px-8"
                >
                  Criar Conta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-press border-white/30 text-white bg-white/10 hover:bg-white/20 px-8"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#B87333] mb-3">
              Como funciona
            </p>
            <h3 className="font-serif text-3xl md:text-4xl text-primary">
              Sua consulta começa aqui
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Ficha de Anamnese",
                desc: "Preencha sua história clínica com calma, no seu tempo, antes da consulta.",
              },
              {
                icon: Upload,
                title: "Upload de Exames",
                desc: "Envie seus exames laboratoriais e de imagem de forma segura e organizada.",
              },
              {
                icon: Stethoscope,
                title: "Consulta Otimizada",
                desc: "Seu médico já terá acesso a todas as informações, otimizando o tempo da consulta.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-[#B87333]">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground text-base">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#B87333] mb-3">
              Diferenciais
            </p>
            <h3 className="font-serif text-3xl md:text-4xl text-primary">
              Atendimento Humanizado
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Particular e Convênios",
                desc: "Atendemos diversos convênios e particular",
              },
              {
                icon: Calendar,
                title: "Agendamento Online",
                desc: "Agende sua consulta ou teleconsulta online",
              },
              {
                icon: Award,
                title: "Formado Instituto D'Or",
                desc: "Residência em Urologia pelo IDOR",
              },
              {
                icon: Video,
                title: "Cirurgia Minimamente Invasiva",
                desc: "Técnicas modernas com menor tempo de recuperação",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-xl border border-border bg-background"
              >
                <Icon className="w-6 h-6 text-[#B87333]" />
                <h5 className="font-semibold text-foreground text-sm">{title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEGURANÇA ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-2xl text-center">
          <ShieldCheck className="w-10 h-10 text-[#B87333] mx-auto mb-4 opacity-70" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seus dados são protegidos com criptografia e acessíveis apenas por
            você e seu médico. Este portal segue as melhores práticas de
            segurança e privacidade em saúde.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="brand-gradient border-t border-white/10 py-8 px-4 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <img
              src="/images/isotipo.svg"
              alt="Isotipo Dr. Felipe de Bulhões"
              className="h-8 w-auto invert opacity-80"
            />
            <div>
              <p className="text-sm font-semibold text-white/90 font-serif">
                Dr. Felipe de Bulhões
              </p>
              <p className="text-[11px] text-white/50">
                Urologista &amp; Cirurgião Geral
              </p>
            </div>
          </div>

          {/* Info central */}
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              Teleconsulta disponível
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              São Paulo, SP
            </span>
          </div>

          {/* Memberships */}
          <p className="text-[11px] text-white/40 text-center md:text-right">
            Membro SBU • Membro AUA • Membro EAU
            <br />
            <span className="text-white/30">Portal de Pré-Consulta &amp; Exames</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
