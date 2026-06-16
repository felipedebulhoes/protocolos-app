import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ClipboardList, Upload, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Public-facing landing page for patients (entry point of the pre-consultation
 * portal). Designed to be served at the root of the patient domain
 * (paciente.felipebulhoes.com) as well as at /paciente.
 */
export default function PacienteLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-[#1C3D5A] text-white px-4 py-4 border-b border-amber-600/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <svg width="20" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#FEFEFE" />
                <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide uppercase text-amber-500 leading-tight">
                Dr. Felipe de Bulhões
              </p>
              <p className="text-[11px] font-semibold text-slate-300 leading-tight">
                Urologia &amp; Cirurgia Geral
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="copper-gradient text-white font-semibold border-0">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="navy-gradient text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Portal de Pré-Consulta &amp; Exames
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Sua consulta começa aqui
          </h2>
          <p className="text-slate-200 max-w-xl mx-auto mb-8 leading-relaxed">
            Prepare-se para a sua consulta com antecedência. Preencha sua ficha de
            anamnese e envie seus exames de forma prática e segura.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/cadastro">
              <Button size="lg" className="copper-gradient text-white font-semibold border-0 px-8">
                Criar Conta <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 px-8">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="flex-1 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-2">
            Como funciona
          </p>
          <h3 className="text-center text-2xl font-serif text-[#1C3D5A] mb-10">
            Simples, seguro e no seu tempo
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6 text-amber-600" />}
              title="Ficha de Anamnese"
              text="Preencha sua história clínica com calma, no seu tempo, antes da consulta."
            />
            <FeatureCard
              icon={<Upload className="w-6 h-6 text-amber-600" />}
              title="Upload de Exames"
              text="Envie seus exames laboratoriais e de imagem de forma segura e organizada."
            />
            <FeatureCard
              icon={<Stethoscope className="w-6 h-6 text-amber-600" />}
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

      {/* Footer */}
      <footer className="bg-[#1C3D5A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="font-serif text-lg text-white">Dr. Felipe de Bulhões</p>
          <p className="text-sm text-slate-300">Urologista &amp; Cirurgião Geral</p>
          <p className="text-xs text-slate-400 mt-2">
            Membro SBU • Membro AUA • Membro EAU
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h4 className="font-bold text-[#1C3D5A] mb-2">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
