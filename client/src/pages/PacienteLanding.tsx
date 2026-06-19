import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Upload,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Award,
  Heart,
  Phone,
  CheckCircle2,
  Star,
  MapPin,
  Video,
} from "lucide-react";

export default function PacienteLanding() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-[#1C3D5A] text-white px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/images/isotipo.svg"
              alt="Isotipo Dr. Felipe de Bulhões"
              className="h-10 w-auto brightness-0 invert"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-wide text-amber-400 leading-tight">
                Dr. Felipe de Bulhões
              </p>
              <p className="text-[11px] text-slate-300 leading-tight">
                Urologia &amp; Cirurgia Geral
              </p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 text-xs"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold border-0 text-xs"
              >
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #1C3D5A 0%, #0f2a3f 60%, #0a1e2e 100%)" }}
      >
        {/* Pattern de marca com baixa opacidade */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "url('/images/pattern.svg')",
            backgroundSize: "320px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl -ml-20 -mb-20" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Texto */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">
                  Portal de Pré-Consulta
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4">
                Sua consulta começa<br />
                <span className="text-amber-400">antes de chegar</span>
              </h1>

              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                Prepare sua ficha de anamnese e envie seus exames com antecedência.
                Atendimento humanizado, particular e convênios.
              </p>

              {/* Badges de credencial */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                {[
                  "Formado Instituto D'Or",
                  "Atendimento Humanizado",
                  "Particular e Convênios",
                  "Agendamento Online",
                  "Cirurgia Minimamente Invasiva",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/cadastro">
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold border-0 px-8 shadow-lg shadow-amber-900/30"
                  >
                    Criar conta gratuita <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/40 text-white hover:bg-white/10 px-8"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>

            {/* Logo portrait */}
            <div className="hidden md:flex shrink-0 flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-6 backdrop-blur-sm">
                <img
                  src="/images/logo_portrait.svg"
                  alt="Logo Dr. Felipe de Bulhões"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              {/* Afiliações */}
              <div className="flex gap-2 flex-wrap justify-center">
                {["SBU", "AUA", "EAU"].map((org) => (
                  <span
                    key={org}
                    className="bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full"
                  >
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Diferenciais rápidos ─────────────────────────────────────────── */}
      <section className="bg-amber-600 text-white py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-4 text-sm font-semibold">
            {[
              { icon: <MapPin className="w-4 h-4" />, text: "São Paulo – SP" },
              { icon: <Video className="w-4 h-4" />, text: "Teleconsulta disponível" },
              { icon: <Calendar className="w-4 h-4" />, text: "Agendamento Online" },
              { icon: <Award className="w-4 h-4" />, text: "Formado Instituto D'Or" },
              { icon: <Heart className="w-4 h-4" />, text: "Atendimento Humanizado" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                {icon}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-2">
            Como funciona
          </p>
          <h2 className="text-center text-2xl md:text-3xl font-serif text-[#1C3D5A] mb-10">
            Simples, seguro e no seu tempo
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6 text-amber-600" />}
              step="01"
              title="Ficha de Anamnese"
              text="Preencha sua história clínica com calma, no seu tempo, antes da consulta."
            />
            <FeatureCard
              icon={<Upload className="w-6 h-6 text-amber-600" />}
              step="02"
              title="Upload de Exames"
              text="Envie seus exames laboratoriais e de imagem de forma segura e organizada."
            />
            <FeatureCard
              icon={<Stethoscope className="w-6 h-6 text-amber-600" />}
              step="03"
              title="Consulta Otimizada"
              text="Seu médico já terá acesso a todas as informações, otimizando o tempo da consulta."
            />
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Seus dados são protegidos e acessíveis apenas por você e seu médico.
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section
        className="py-14 text-white text-center"
        style={{ background: "linear-gradient(135deg, #1C3D5A 0%, #0f2a3f 100%)" }}
      >
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
            Pronto para começar?
          </h2>
          <p className="text-slate-300 mb-7 text-sm leading-relaxed">
            Crie sua conta gratuitamente e prepare-se para uma consulta mais
            completa e humanizada.
          </p>
          <Link href="/cadastro">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold border-0 px-10 shadow-lg shadow-amber-900/40"
            >
              Criar conta gratuita <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a1e2e] text-white py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/isotipo.svg"
              alt="Isotipo"
              className="h-8 w-auto brightness-0 invert opacity-70"
            />
            <div>
              <p className="font-serif text-sm text-white">Dr. Felipe de Bulhões</p>
              <p className="text-xs text-slate-400">Urologista &amp; Cirurgião Geral</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-400">
              Membro SBU &bull; Membro AUA (International Resident in Training) &bull; Membro EAU (Junior International Member)
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formado pelo Instituto D'Or de Ensino e Pesquisa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  step,
  title,
  text,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full w-7 h-7 flex items-center justify-center">
          {step}
        </span>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h4 className="font-bold text-[#1C3D5A] mb-2 text-base">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
