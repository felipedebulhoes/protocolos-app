import { useState, useMemo } from "react";
import {
  JORNADAS,
  CATEGORIAS_JORNADA,
  type Jornada,
} from "@shared/jornadas";
import {
  ClipboardCheck,
  Stethoscope,
  Sparkles,
  CalendarClock,
  AlertTriangle,
  BookOpen,
  Star,
} from "lucide-react";

const FASE_ICONS = [ClipboardCheck, Stethoscope, Sparkles];

export default function JornadasSelector() {
  const [selectedId, setSelectedId] = useState<string>(
    JORNADAS.find((j) => j.destaque)?.id ?? JORNADAS[0].id
  );

  const selecionada: Jornada = useMemo(
    () => JORNADAS.find((j) => j.id === selectedId) ?? JORNADAS[0],
    [selectedId]
  );

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      {/* ── COLUNA: SELETOR ──────────────────────────────────────────── */}
      <aside className="flex flex-col gap-6">
        {CATEGORIAS_JORNADA.map((cat) => {
          const itens = JORNADAS.filter((j) => j.categoria === cat);
          if (itens.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-medium mb-2">
                {cat}
              </p>
              <div className="flex flex-col gap-1.5">
                {itens.map((j) => {
                  const ativo = j.id === selectedId;
                  return (
                    <button
                      key={j.id}
                      onClick={() => setSelectedId(j.id)}
                      className={`btn-press text-left px-3.5 py-2.5 border text-sm flex items-center gap-2 transition-colors ${
                        ativo
                          ? "cobre-gradient text-white border-transparent shadow-sm"
                          : "bg-card border-border text-primary hover:bg-muted/60"
                      }`}
                    >
                      {j.destaque && (
                        <Star
                          className={`w-3.5 h-3.5 shrink-0 ${
                            ativo ? "text-white" : "text-[#B87333]"
                          }`}
                          fill="currentColor"
                        />
                      )}
                      <span className="leading-tight">{j.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-[11px] text-muted-foreground font-light flex items-center gap-1.5 mt-1">
          <Star className="w-3 h-3 text-[#B87333]" fill="currentColor" />
          Procedimentos mais frequentes
        </p>
      </aside>

      {/* ── COLUNA: DETALHE DA JORNADA ───────────────────────────────── */}
      <div className="min-w-0">
        {/* Cabeçalho da jornada */}
        <div className="border-b border-border pb-5 mb-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] tracking-[0.16em] uppercase bg-primary/10 text-primary px-2.5 py-1">
              {selecionada.tipo}
            </span>
            <span className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {selecionada.categoria}
            </span>
          </div>
          <h4 className="font-serif text-2xl md:text-3xl text-primary mb-2">
            {selecionada.nome}
          </h4>
          <p className="text-muted-foreground font-light leading-relaxed max-w-2xl">
            {selecionada.resumo}
          </p>
        </div>

        {/* Fases ANTES / DURANTE / DEPOIS */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {selecionada.fases.map((fase, i) => {
            const Icon = FASE_ICONS[i] ?? ClipboardCheck;
            return (
              <div
                key={fase.titulo}
                className="bg-card border border-border p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center rounded-sm bg-primary/10 text-primary shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-primary leading-tight">
                      {fase.titulo}
                    </p>
                    <p className="text-[11px] text-[#B87333] font-medium">
                      {fase.janela}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {fase.itens.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2 text-[13px] text-muted-foreground font-light leading-snug"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333] shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Cronograma de acompanhamento */}
        <div className="bg-muted/40 border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h5 className="font-serif text-lg text-primary">
              Cronograma de Acompanhamento
            </h5>
          </div>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {selecionada.seguimento.map((etapa) => (
              <li
                key={etapa.quando + etapa.acao}
                className="flex items-start gap-3 text-sm"
              >
                <span className="shrink-0 min-w-[88px] font-medium text-primary">
                  {etapa.quando}
                </span>
                <span className="text-muted-foreground font-light leading-snug">
                  {etapa.acao}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sinais de alerta */}
        <div className="border border-[#B87333]/40 bg-[#B87333]/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#B87333]" />
            <h5 className="font-serif text-lg text-primary">
              Sinais de Alerta — Contato Imediato
            </h5>
          </div>
          <ul className="space-y-2">
            {selecionada.alertas.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2 text-sm text-foreground/80 font-light leading-snug"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B87333] shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Fontes */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground font-light">
          <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-primary/80">
              Fontes (alto nível de evidência):{" "}
            </span>
            {selecionada.fontes.join(" • ")}
          </div>
        </div>
      </div>
    </div>
  );
}
