import { useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, CheckCircle2, AlertCircle, XCircle, Info, RotateCcw, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type NodeStatus = "normal" | "warning" | "critical" | "info";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  status: NodeStatus;
  detail?: string;
  children?: FlowChoice[];
}

interface FlowChoice {
  label: string;
  sublabel?: string;
  next: FlowNode;
}

// ─── Nós terminais de conduta ────────────────────────────────────────────────
const CONDUTA_MEV: FlowNode = {
  id: "conduta_mev",
  label: "MEV + Antioxidantes",
  sublabel: "Conduta de 1ª linha",
  status: "normal",
  detail: `**Protocolo antioxidante por 3–6 meses:**
- CoQ10 200–400 mg/dia
- Vitamina E 400 UI/dia
- Vitamina C 500–1000 mg/dia
- Zinco 25–50 mg/dia
- Selênio 100–200 mcg/dia
- L-carnitina 2–3 g/dia

**Modificações de estilo de vida:**
- Cessar tabagismo e álcool excessivo
- Evitar calor escrotal (banhos quentes, laptop no colo)
- Suspender anabolizantes/testosterona exógena
- Perda de peso se IMC > 30

**Reavaliação:** novo espermograma após 3 meses.

*[EAU 2025, AUA/ASRM 2024]*`,
};

const CONDUTA_VARICOCELE: FlowNode = {
  id: "conduta_varicocele",
  label: "Correção de Varicocele",
  sublabel: "Varicocelectomia microcirúrgica subinguinal",
  status: "warning",
  detail: `**Indicação (EAU 2025):**
- Varicocele clínica palpável (grau I–III)
- Parâmetros espermáticos alterados
- Infertilidade documentada do casal
- Parceira com fertilidade normal ou tratável

**Técnica preferida:** varicocelectomia subinguinal microcirúrgica (menor taxa de recorrência e complicações).

**Resultados esperados:**
- Melhora de parâmetros em 60–70% dos casos
- Taxa de gravidez espontânea: 30–50% em 12 meses
- Reavaliação com espermograma após 3–6 meses

**Atenção:** varicocele subclínica (apenas ao Doppler) — não indicar cirurgia isoladamente.

*[EAU 2025, Cochrane 2021]*`,
};

const CONDUTA_IIU: FlowNode = {
  id: "conduta_iiu",
  label: "Inseminação Intrauterina (IIU)",
  sublabel: "Após preparo seminal",
  status: "warning",
  detail: `**Indicação:**
- Oligozoospermia leve-moderada sem melhora após 3–6 meses de tratamento
- Concentração pós-preparo ≥ 1–5 × 10⁶ espermatozoides móveis
- Parceira com tubas pérvias e ovulação normal

**Protocolo:**
- 3–6 ciclos de IIU com estimulação ovariana leve
- Taxa de gravidez por ciclo: 10–20%
- Se sem sucesso após 3–6 ciclos → FIV/ICSI

*[EAU 2025, ASRM 2024]*`,
};

const CONDUTA_FIV_ICSI: FlowNode = {
  id: "conduta_fiv_icsi",
  label: "FIV + ICSI",
  sublabel: "Fertilização in vitro com injeção intracitoplasmática",
  status: "critical",
  detail: `**Indicação:**
- OAT grave (< 5 × 10⁶/mL)
- Falha de IIU
- Teratozoospermia grave
- Fragmentação de DNA elevada (DFI > 25%)
- Criptozoospermia

**Taxa de sucesso (por transferência):**
- Mulher < 35 anos: 40–50%
- Mulher 35–40 anos: 25–35%
- Mulher > 40 anos: 10–20%

**Considerar ICSI com espermatozoides testiculares** se DFI elevado (menor fragmentação no testículo).

*[EAU 2025, AUA/ASRM 2024]*`,
};

const CONDUTA_HORMONAL: FlowNode = {
  id: "conduta_hormonal",
  label: "Tratamento Hormonal",
  sublabel: "Hipogonadismo hipogonadotrófico",
  status: "warning",
  detail: `**Diagnóstico:** FSH ↓ ou normal, LH ↓, testosterona ↓

**Tratamento:**
- hCG 1.500–2.000 UI SC 3x/semana por 3–6 meses (estimula testosterona endógena)
- Se sem espermatozoides após 6 meses → adicionar FSH recombinante 75–150 UI SC 3x/semana
- Clomifeno 25–50 mg/dia (alternativa oral, off-label)
- Anastrozol 1 mg/dia (se relação E2/T elevada)

**Monitoramento:** testosterona, FSH, LH, espermograma a cada 3 meses.

**Atenção:** NUNCA usar testosterona exógena em homens que desejam fertilidade — suprime a espermatogênese.

*[AUA/ASRM 2024, EAU 2025]*`,
};

const CONDUTA_AO: FlowNode = {
  id: "conduta_ao",
  label: "Azoospermia Obstrutiva — Conduta",
  sublabel: "Reconstrução ou recuperação espermática",
  status: "critical",
  detail: `**Opções terapêuticas:**

1. **Reversão de vasectomia** (vasovasostomia/vasoepididimostomia)
   - Taxa de gravidez: 30–75% (inversamente proporcional ao tempo desde a vasectomia)
   - Melhor resultado: < 3 anos após vasectomia
   
2. **Recuperação espermática cirúrgica + FIV/ICSI**
   - PESA (aspiração percutânea do epidídimo)
   - MESA (aspiração microcirúrgica do epidídimo)
   - TESA/micro-TESE (biópsia testicular)

3. **CBAVD (ausência congênita dos vasos deferentes)**
   - Recuperação espermática + FIV/ICSI obrigatório
   - Aconselhamento genético do casal (mutação CFTR)
   - Parceira deve ser testada para mutação CFTR antes do tratamento

*[EAU 2025, AUA/ASRM 2024]*`,
};

const CONDUTA_ANO: FlowNode = {
  id: "conduta_ano",
  label: "Azoospermia Não-Obstrutiva — Conduta",
  sublabel: "Avaliação genética + micro-TESE",
  status: "critical",
  detail: `**Investigação obrigatória antes de qualquer procedimento:**
- Cariótipo (bandamento G)
- Microdeleção do cromossomo Y (AZFa, AZFb, AZFc)

**Prognóstico por deleção Y:**
- **AZFa ou AZFb:** prognóstico muito ruim — micro-TESE não indicada (< 1% de sucesso)
- **AZFc:** micro-TESE viável — taxa de recuperação ~50%
- **Sem deleção:** micro-TESE com taxa de recuperação 50–60%

**Síndrome de Klinefelter (47,XXY):**
- Micro-TESE com taxa de sucesso 40–50%
- Aconselhamento genético obrigatório

**Hipogonadismo hipogonadotrófico + ANO:**
- Estimulação com FSH + hCG por 6–12 meses antes da micro-TESE
- Melhora significativa das chances de recuperação

*[EAU 2025, AUA/ASRM 2024]*`,
};

const CONDUTA_NORMAL: FlowNode = {
  id: "conduta_normal",
  label: "Espermograma Normal",
  sublabel: "Normozoospermia — investigar fator feminino",
  status: "normal",
  detail: `**Conduta:**
- Confirmar com 2º espermograma (se 1ª análise)
- Investigar fator feminino: histerossalpingografia, reserva ovariana (AMH, FSH D3), ultrassom pélvico
- Avaliar frequência e timing das relações (janela fértil)
- Considerar fragmentação de DNA espermático se infertilidade inexplicada persistente (DFI > 25% em 15–25% dos homens com espermograma normal)
- Avaliação do casal por especialista em reprodução assistida se sem gravidez após 12 meses de tentativa (6 meses se parceira > 35 anos)

**Nota:** espermograma normal não exclui infertilidade masculina — 15% dos homens inférteis têm parâmetros normais. Considerar DFI e avaliação clínica completa.

*[EAU 2025, AUA/ASRM 2024]*`,
};

// ─── Árvore de decisão ───────────────────────────────────────────────────────
const ROOT: FlowNode = {
  id: "root",
  label: "Espermograma Recebido",
  sublabel: "Verificar coleta: abstinência 2–7 dias, coleta completa, análise ≤ 60 min",
  status: "info",
  children: [
    {
      label: "Coleta inadequada",
      sublabel: "Abstinência incorreta, amostra incompleta ou tempo excedido",
      next: {
        id: "repetir_coleta",
        label: "Repetir Coleta",
        sublabel: "Orientar e reagendar",
        status: "warning",
        detail: `**Orientações para nova coleta:**
- Abstinência sexual: **3–5 dias** (mínimo 2, máximo 7)
- Coleta completa (o primeiro jato é o mais rico em espermatozoides)
- Entregar ao laboratório em até 60 minutos
- Temperatura de transporte: 20–37°C (próximo ao corpo)
- Evitar lubrificantes espermicidas
- Informar uso de medicamentos, febre recente ou estresse intenso

*[OMS 2021]*`,
      },
    },
    {
      label: "Coleta adequada",
      sublabel: "Prosseguir com interpretação",
      next: {
        id: "avaliar_volume",
        label: "Avaliar Volume",
        sublabel: "Referência: ≥ 1,4 mL (OMS 2021)",
        status: "info",
        children: [
          {
            label: "Volume < 1,4 mL (Hipospermia)",
            next: {
              id: "hipospermia",
              label: "Hipospermia — Investigar",
              sublabel: "Volume < 1,4 mL",
              status: "warning",
              detail: `**Diagnóstico diferencial:**
- Ejaculação retrógrada (checar urina pós-ejaculação para espermatozoides)
- Obstrução dos ductos ejaculatórios (USG transretal)
- Hipogonadismo (FSH, LH, testosterona)
- CBAVD — ausência congênita dos vasos deferentes (mutação CFTR)
- Coleta incompleta (repetir)

**Exames:**
- Urina pós-ejaculação (centrifugar e pesquisar espermatozoides)
- USG transretal
- FSH, LH, testosterona total
- Mutação CFTR se ausência de vasos deferentes ao exame físico

*[EAU 2025]*`,
            },
          },
          {
            label: "Volume ≥ 1,4 mL",
            next: {
              id: "avaliar_concentracao",
              label: "Avaliar Concentração",
              sublabel: "Referência: ≥ 16 × 10⁶/mL (OMS 2021)",
              status: "info",
              children: [
                {
                  label: "Ausência de espermatozoides",
                  sublabel: "Mesmo após centrifugação",
                  next: {
                    id: "azoospermia",
                    label: "Azoospermia",
                    sublabel: "Confirmar com 2ª amostra centrifugada",
                    status: "critical",
                    children: [
                      {
                        label: "FSH elevado + testículos pequenos",
                        sublabel: "Falência testicular primária",
                        next: CONDUTA_ANO,
                      },
                      {
                        label: "FSH normal + testículos normais",
                        sublabel: "Suspeita de obstrução",
                        next: CONDUTA_AO,
                      },
                      {
                        label: "FSH normal + ausência de vasos deferentes",
                        sublabel: "CBAVD — mutação CFTR",
                        next: CONDUTA_AO,
                      },
                      {
                        label: "FSH baixo + testosterona baixa",
                        sublabel: "Hipogonadismo hipogonadotrófico",
                        next: CONDUTA_HORMONAL,
                      },
                    ],
                  },
                },
                {
                  label: "< 16 × 10⁶/mL (Oligozoospermia)",
                  next: {
                    id: "oligospermia",
                    label: "Oligozoospermia",
                    sublabel: "Classificar gravidade",
                    status: "warning",
                    children: [
                      {
                        label: "Leve-moderada (5–15,9 × 10⁶/mL)",
                        next: {
                          id: "oligo_leve",
                          label: "Oligozoospermia Leve-Moderada",
                          sublabel: "5–15,9 × 10⁶/mL",
                          status: "warning",
                          children: [
                            {
                              label: "Varicocele clínica presente",
                              next: CONDUTA_VARICOCELE,
                            },
                            {
                              label: "Sem varicocele / após correção",
                              next: CONDUTA_MEV,
                            },
                            {
                              label: "Sem melhora após 3–6 meses",
                              next: CONDUTA_IIU,
                            },
                          ],
                        },
                      },
                      {
                        label: "Grave (< 5 × 10⁶/mL) ou OAT",
                        next: {
                          id: "oligo_grave",
                          label: "Oligozoospermia Grave / OAT",
                          sublabel: "< 5 × 10⁶/mL",
                          status: "critical",
                          children: [
                            {
                              label: "Investigação hormonal + genética",
                              sublabel: "FSH, LH, T, cariótipo, microdeleção Y",
                              next: {
                                id: "investigacao_grave",
                                label: "Resultado da Investigação",
                                sublabel: "Definir etiologia",
                                status: "info",
                                children: [
                                  {
                                    label: "Hipogonadismo hipogonadotrófico",
                                    next: CONDUTA_HORMONAL,
                                  },
                                  {
                                    label: "Varicocele clínica",
                                    next: CONDUTA_VARICOCELE,
                                  },
                                  {
                                    label: "Idiopático / sem causa identificada",
                                    next: CONDUTA_FIV_ICSI,
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  label: "≥ 16 × 10⁶/mL (Concentração normal)",
                  next: {
                    id: "concentracao_normal",
                    label: "Concentração Normal",
                    sublabel: "Avaliar motilidade e morfologia",
                    status: "normal",
                    children: [
                      {
                        label: "Motilidade progressiva < 30% (Asthenozoospermia)",
                        next: {
                          id: "asthenospermia",
                          label: "Asthenozoospermia",
                          sublabel: "Motilidade progressiva < 30%",
                          status: "warning",
                          detail: `**Investigação:**
- Vitalidade (se > 60% imóveis → descartar necrozoospermia)
- Varicocele (Doppler escrotal)
- Leucocitospermia (infecção/inflamação)
- Anticorpos antiespermatozóides
- Síndrome dos cílios imóveis (se bronquiectasias, sinusite crônica)
- Fragmentação de DNA espermático (DFI)

**Conduta:**
- MEV + antioxidantes + L-carnitina 2–3 g/dia
- Tratar infecção se leucocitospermia (doxiciclina 100 mg 2x/dia × 14 dias)
- Correção de varicocele se presente
- Se DFI > 25%: considerar ICSI com espermatozoides testiculares
- Reavaliação após 3 meses

*[EAU 2025]*`,
                        },
                      },
                      {
                        label: "Morfologia normal < 4% (Teratozoospermia)",
                        next: {
                          id: "teratospermia",
                          label: "Teratozoospermia",
                          sublabel: "Morfologia normal < 4% (Tygerberg)",
                          status: "warning",
                          detail: `**Investigação:**
- Varicocele (principal causa tratável)
- Exposição a toxinas ambientais (pesticidas, solventes, calor)
- Febre recente (espermograma alterado por 3 meses após febre alta)
- Fragmentação de DNA (DFI)

**Conduta:**
- Teratozoospermia isolada raramente causa infertilidade absoluta
- MEV + antioxidantes
- Correção de varicocele se presente
- FIV + ICSI se teratozoospermia grave ou associada a outras alterações
- Reavaliação após 3 meses

*[EAU 2025]*`,
                        },
                      },
                      {
                        label: "Todos os parâmetros normais",
                        next: CONDUTA_NORMAL,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

// ─── Componente de nó do fluxograma ─────────────────────────────────────────
const statusColors: Record<NodeStatus, string> = {
  normal: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  warning: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
  critical: "border-red-500 bg-red-50 dark:bg-red-950/30",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
};

const statusIcons: Record<NodeStatus, React.ReactNode> = {
  normal: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
  critical: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
};

const statusBadge: Record<NodeStatus, string> = {
  normal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const statusLabel: Record<NodeStatus, string> = {
  normal: "Normal",
  warning: "Atenção",
  critical: "Alterado",
  info: "Avaliação",
};

function DetailPanel({ node, onClose }: { node: FlowNode; onClose: () => void }) {
  if (!node.detail) return null;
  return (
    <div className="mt-4 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-foreground">{node.label}</h4>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">×</Button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
        {node.detail.split("\n").map((line, i) => {
          if (line.startsWith("**") && line.endsWith("**")) {
            return <p key={i} className="font-semibold text-foreground mt-2 mb-1">{line.replace(/\*\*/g, "")}</p>;
          }
          if (line.startsWith("- ")) {
            return <li key={i} className="text-muted-foreground ml-4">{line.replace(/^- /, "").replace(/\*\*([^*]+)\*\*/g, (_, t) => t)}</li>;
          }
          if (line.startsWith("*[") && line.endsWith("]*")) {
            return <p key={i} className="text-xs text-muted-foreground mt-2 italic">{line.replace(/\*\[|\]\*/g, "")}</p>;
          }
          if (line.trim() === "") return <div key={i} className="h-1" />;
          return <p key={i} className="text-muted-foreground">{line.replace(/\*\*([^*]+)\*\*/g, (_, t) => t)}</p>;
        })}
      </div>
    </div>
  );
}

function FlowNodeCard({
  node,
  depth = 0,
}: {
  node: FlowNode;
  depth?: number;
}) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const isTerminal = !node.children || node.children.length === 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Linha conectora acima (exceto para o root) */}
      {depth > 0 && (
        <div className="w-0.5 h-6 bg-border" />
      )}

      {/* Card do nó */}
      <div className={`w-full max-w-lg rounded-xl border-2 p-4 ${statusColors[node.status]} transition-all`}>
        <div className="flex items-start gap-3">
          {statusIcons[node.status]}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{node.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[node.status]}`}>
                {statusLabel[node.status]}
              </span>
            </div>
            {node.sublabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{node.sublabel}</p>
            )}
          </div>
          {node.detail && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs shrink-0"
              onClick={() => setShowDetail(!showDetail)}
            >
              {showDetail ? "Fechar" : "Ver conduta"}
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showDetail ? "rotate-180" : ""}`} />
            </Button>
          )}
        </div>

        {showDetail && node.detail && (
          <DetailPanel node={node} onClose={() => setShowDetail(false)} />
        )}

        {/* Opções de escolha */}
        {!isTerminal && node.children && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selecione a condição:</p>
            {node.children.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChoice(selectedChoice === idx ? null : idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-center justify-between gap-2
                  ${selectedChoice === idx
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:border-primary/50 hover:bg-muted text-foreground"
                  }`}
              >
                <span className="flex-1">
                  <span className="block">{choice.label}</span>
                  {choice.sublabel && (
                    <span className="text-xs text-muted-foreground">{choice.sublabel}</span>
                  )}
                </span>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedChoice === idx ? "rotate-90 text-primary" : ""}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nó filho selecionado */}
      {selectedChoice !== null && node.children && (
        <FlowNodeCard
          node={node.children[selectedChoice].next}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function SpermogramFlowchart() {
  const [key, setKey] = useState(0);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/protocolo/espermograma_fertilidade">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Protocolo
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Fluxograma de Conduta</h1>
            <p className="text-sm text-muted-foreground">Espermograma — Interpretação Passo a Passo</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setKey(k => k + 1)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </Button>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["normal", "warning", "critical", "info"] as NodeStatus[]).map(s => (
            <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[s]}`}>
              {statusLabel[s]}
            </span>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-1">— clique nas opções para navegar</span>
        </div>

        {/* Referência rápida */}
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Valores de Referência OMS 2021 (P5)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {[
                ["Volume", "≥ 1,4 mL"],
                ["Concentração", "≥ 16 × 10⁶/mL"],
                ["N° total", "≥ 39 × 10⁶/ejac."],
                ["Motilidade total", "≥ 42%"],
                ["Motilidade prog.", "≥ 30%"],
                ["Morfologia (Tygerberg)", "≥ 4%"],
                ["Vitalidade", "≥ 54%"],
                ["pH", "≥ 7,2"],
              ].map(([param, val]) => (
                <div key={param} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{param}</span>
                  <span className="font-medium text-foreground">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Sempre repetir o exame após 2–3 meses antes de decisões terapêuticas definitivas. [OMS 2021, EAU 2025]
            </p>
          </CardContent>
        </Card>

        {/* Fluxograma interativo */}
        <div key={key}>
          <FlowNodeCard node={ROOT} depth={0} />
        </div>

        {/* Rodapé com referências */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground text-sm mb-2">Referências</p>
          <p>1. WHO Laboratory Manual for the Examination and Processing of Human Semen, 6th ed. Geneva: WHO, 2021.</p>
          <p>2. EAU Guidelines on Sexual and Reproductive Health — Male Infertility, 2025. <a href="https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/male-infertility" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">uroweb.org <ExternalLink className="w-3 h-3" /></a></p>
          <p>3. Brannigan RE, et al. Updates to Male Infertility: AUA/ASRM Guideline (2024). <em>J Urol.</em> 2024. DOI: 10.1097/JU.0000000000004180</p>
          <p>4. Chung E, et al. WHO 6th edition semen analysis manual updates. <em>Arab J Urol.</em> 2024;22(2):71–74. PMID: 38481407</p>
        </div>
      </div>
    </Layout>
  );
}
