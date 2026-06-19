import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronRight,
  Info,
} from "lucide-react";
import { CATEGORY_LABELS } from "@shared/analyteCategories";
import type { AnalyteCategory } from "@shared/analyteCategories";

// ---- Color palette consistent with brand ----------------------------------
const BRAND_NAVY = "#1C3D5A";
const BRAND_COPPER = "#B87333";
const BRAND_TEAL = "#2E7D6F";
const BRAND_PURPLE = "#8E5BB5";

const CATEGORY_COLORS: Record<string, string> = {
  prostata: BRAND_NAVY,
  hormonal: BRAND_COPPER,
  metabolico: BRAND_TEAL,
  renal: "#3B82F6",
  hematologico: "#EF4444",
  seminal: BRAND_PURPLE,
  outro: "#94A3B8",
};

const FLAG_COLORS: Record<string, string> = {
  normal: "#10B981",
  high: "#EF4444",
  low: "#F59E0B",
  unknown: "#94A3B8",
};

// ---- Helper: format month label -------------------------------------------
function fmtMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(m, 10) - 1]}/${y.slice(2)}`;
}

// ---- Empty state component ------------------------------------------------
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
      <FlaskConical className="w-10 h-10 opacity-30" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-center max-w-xs">
        Os dados aparecerão aqui assim que pacientes enviarem exames pela ficha pré-consulta.
      </p>
    </div>
  );
}

// ---- Header summary cards -------------------------------------------------
function SummaryCards({
  totalFiles,
  totalResults,
  criticalCount,
}: {
  totalFiles: number;
  totalResults: number;
  criticalCount: number;
}) {
  const cards = [
    {
      label: "Exames processados",
      value: totalFiles,
      icon: <FileText className="w-5 h-5 text-[#B87333]" />,
      color: "bg-amber-50",
    },
    {
      label: "Resultados extraídos",
      value: totalResults,
      icon: <FlaskConical className="w-5 h-5 text-[#2E7D6F]" />,
      color: "bg-teal-50",
    },
    {
      label: "Alertas críticos",
      value: criticalCount,
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      color: criticalCount > 0 ? "bg-red-50" : "bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className={`border-0 shadow-sm ${c.color}`}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="shrink-0">{c.icon}</div>
            <div>
              <div className="text-2xl font-bold text-[#1C3D5A]">{c.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{c.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---- Distribution bar chart -----------------------------------------------
function DistributionChart({
  data,
}: {
  data: {
    analyteKey: string;
    label: string;
    total: number;
    normalCount: number;
    lowCount: number;
    highCount: number;
    unknownCount: number;
    category: string;
    categoryLabel: string;
  }[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(data.map((d) => d.category)));
    return ["all", ...cats];
  }, [data]);

  const filtered = useMemo(() => {
    const base = activeCategory === "all" ? data : data.filter((d) => d.category === activeCategory);
    return base.slice(0, 15);
  }, [data, activeCategory]);

  if (data.length === 0) {
    return <EmptyState message="Nenhum resultado de exame ainda." />;
  }

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              cat === activeCategory
                ? "bg-[#1C3D5A] text-white border-[#1C3D5A]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#B87333]/50"
            }`}
          >
            {cat === "all" ? "Todos" : CATEGORY_LABELS[cat as AnalyteCategory] ?? cat}
          </button>
        ))}
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filtered}
            margin={{ top: 8, right: 16, bottom: 60, left: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  normalCount: "Normal",
                  highCount: "Alto",
                  lowCount: "Baixo",
                  unknownCount: "Sem referência",
                };
                return [value, labels[name] ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  normalCount: "Normal",
                  highCount: "Alto",
                  lowCount: "Baixo",
                  unknownCount: "Sem referência",
                };
                return labels[value] ?? value;
              }}
            />
            <Bar dataKey="normalCount" stackId="a" fill={FLAG_COLORS.normal} radius={[0, 0, 0, 0]} />
            <Bar dataKey="highCount" stackId="a" fill={FLAG_COLORS.high} />
            <Bar dataKey="lowCount" stackId="a" fill={FLAG_COLORS.low} />
            <Bar dataKey="unknownCount" stackId="a" fill={FLAG_COLORS.unknown} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-400">
        Mostrando até 15 analitos. Barras empilhadas: verde = normal, vermelho = alto, amarelo = baixo, cinza = sem referência.
      </p>
    </div>
  );
}

// ---- Volume over time chart ------------------------------------------------
function VolumeChart({ data }: { data: { month: string; count: number }[] }) {
  if (data.length === 0) {
    return <EmptyState message="Nenhum exame processado ainda." />;
  }

  const formatted = data.map((d) => ({ ...d, label: fmtMonth(d.month) }));

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BRAND_NAVY} stopOpacity={0.15} />
              <stop offset="95%" stopColor={BRAND_NAVY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(v: number) => [v, "Exames processados"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={BRAND_NAVY}
            strokeWidth={2.5}
            fill="url(#volumeGrad)"
            dot={{ r: 4, fill: BRAND_NAVY }}
            activeDot={{ r: 6 }}
            animationDuration={250}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Labs pie chart -------------------------------------------------------
function LabsPieChart({ data }: { data: { labName: string; count: number }[] }) {
  if (data.length === 0) {
    return <EmptyState message="Nenhum laboratório identificado ainda." />;
  }

  const PIE_COLORS = [BRAND_NAVY, BRAND_COPPER, BRAND_TEAL, BRAND_PURPLE, "#3B82F6", "#EF4444", "#F59E0B", "#10B981"];

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="labName"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ labName, percent }) => `${labName} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            formatter={(v: number, name: string) => [v, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Critical alerts table ------------------------------------------------
function CriticalAlertsTable({
  alerts,
}: {
  alerts: {
    id: number;
    patientId: number | null;
    examFileId: number;
    label: string;
    valueNum: number | null;
    unit: string | null;
    refRange: string | null;
    abnormalFlag: string | null;
    measuredAt: string | null;
    createdAt: Date;
  }[];
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
        <AlertTriangle className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">Nenhum alerta crítico</p>
        <p className="text-xs">Resultados fora do intervalo de referência aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Analito</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Referência</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-medium text-[#1C3D5A]">{a.label}</td>
              <td className="py-2.5 px-3 font-semibold">
                {a.valueNum != null ? `${a.valueNum}${a.unit ? ` ${a.unit}` : ""}` : a.unit ?? "—"}
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-xs">{a.refRange ?? "—"}</td>
              <td className="py-2.5 px-3">
                <Badge
                  className={`text-xs border-0 ${
                    a.abnormalFlag === "high"
                      ? "bg-red-100 text-red-700"
                      : a.abnormalFlag === "low"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {a.abnormalFlag === "high" ? "▲ Alto" : a.abnormalFlag === "low" ? "▼ Baixo" : a.abnormalFlag ?? "—"}
                </Badge>
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-xs">{a.measuredAt ?? new Date(a.createdAt).toLocaleDateString("pt-BR")}</td>
              <td className="py-2.5 px-3 text-slate-500 text-xs">
                {a.patientId ? (
                  <a
                    href={`/fichas?patientId=${a.patientId}`}
                    className="text-[#1C3D5A] hover:text-[#B87333] flex items-center gap-0.5 transition-colors"
                  >
                    #{a.patientId} <ChevronRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-300">Anônimo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Vinculation guide panel ----------------------------------------------
function VinculationGuide() {
  return (
    <Card className="border border-amber-100 bg-amber-50/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <Info className="w-4 h-4" />
          Como vincular exames a pacientes reais
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#1C3D5A] text-white text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <p className="font-semibold text-[#1C3D5A]">Envio via ficha pré-consulta (automático)</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Quando o paciente envia um PDF pelo link <code className="bg-slate-100 px-1 rounded">/ficha/:token</code>, o sistema
                vincula automaticamente o exame ao <code className="bg-slate-100 px-1 rounded">intakeFormId</code> e ao{" "}
                <code className="bg-slate-100 px-1 rounded">patientId</code> se o paciente já tiver conta. Os resultados aparecem
                na aba "Exames" dentro da ficha.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#B87333] text-white text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <p className="font-semibold text-[#1C3D5A]">Paciente sem conta (ficha anônima)</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Se o paciente não criou senha, o exame fica com <code className="bg-slate-100 px-1 rounded">patientId = NULL</code> mas
                vinculado ao <code className="bg-slate-100 px-1 rounded">intakeFormId</code>. Você ainda consegue ver o exame abrindo
                a ficha em <strong>/fichas/:id</strong>. Para vincular ao paciente, basta o paciente criar conta no portal.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#2E7D6F] text-white text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <p className="font-semibold text-[#1C3D5A]">Upload direto pelo médico (futuro)</p>
              <p className="text-xs text-slate-500 mt-0.5">
                O endpoint <code className="bg-slate-100 px-1 rounded">exams.uploadByDoctor</code> (a implementar) permitirá que você
                faça upload de um exame diretamente na ficha de um paciente, passando o <code className="bg-slate-100 px-1 rounded">intakeFormId</code>.
                Isso vinculará o exame ao paciente automaticamente.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#8E5BB5] text-white text-xs font-bold flex items-center justify-center">4</span>
            <div>
              <p className="font-semibold text-[#1C3D5A]">Alertas críticos e analytics</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Os dados desta página são populados automaticamente conforme os exames são processados. Cada resultado é classificado
                como <strong>normal</strong>, <strong>alto</strong> ou <strong>baixo</strong> pelo LLM com base no intervalo de
                referência do laboratório. Resultados sem referência ficam como "sem referência".
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Main page ------------------------------------------------------------
export default function ExamAnalytics() {
  const summaryQ = trpc.exams.analyticsSummary.useQuery();
  const distributionQ = trpc.exams.analyticsDistribution.useQuery();
  const alertsQ = trpc.exams.analyticsCriticalAlerts.useQuery();
  const volumeQ = trpc.exams.analyticsVolumeByMonth.useQuery();

  const isLoading = summaryQ.isLoading || distributionQ.isLoading || alertsQ.isLoading || volumeQ.isLoading;

  const summary = summaryQ.data ?? { totalFiles: 0, totalResults: 0, criticalCount: 0, labsDistribution: [] };
  const distribution = distributionQ.data ?? [];
  const alerts = alertsQ.data ?? [];
  const volume = volumeQ.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1C3D5A] flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1C3D5A]">Analytics de Exames</h1>
          <p className="text-sm text-slate-500">Padrões e alertas dos exames enviados pelos pacientes</p>
        </div>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <SummaryCards
          totalFiles={summary.totalFiles}
          totalResults={summary.totalResults}
          criticalCount={summary.criticalCount}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="distribution">
        <TabsList className="bg-slate-100 rounded-xl">
          <TabsTrigger value="distribution" className="rounded-lg text-xs">
            Distribuição de Analitos
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg text-xs">
            Alertas Críticos
            {summary.criticalCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {summary.criticalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="volume" className="rounded-lg text-xs">
            Volume Mensal
          </TabsTrigger>
          <TabsTrigger value="labs" className="rounded-lg text-xs">
            Laboratórios
          </TabsTrigger>
          <TabsTrigger value="guide" className="rounded-lg text-xs">
            Como vincular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1C3D5A]">Analitos mais solicitados</CardTitle>
              <p className="text-xs text-slate-500">Quantidade de resultados por marcador, classificados por status.</p>
            </CardHeader>
            <CardContent>
              {distributionQ.isLoading ? (
                <div className="h-64 bg-slate-50 animate-pulse rounded-lg" />
              ) : (
                <DistributionChart data={distribution} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1C3D5A] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Resultados fora do intervalo
              </CardTitle>
              <p className="text-xs text-slate-500">Valores classificados como alto ou baixo pelo sistema de leitura automática.</p>
            </CardHeader>
            <CardContent>
              {alertsQ.isLoading ? (
                <div className="h-48 bg-slate-50 animate-pulse rounded-lg" />
              ) : (
                <CriticalAlertsTable alerts={alerts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1C3D5A]">Exames processados por mês</CardTitle>
              <p className="text-xs text-slate-500">Últimos 12 meses — apenas exames com leitura automática concluída.</p>
            </CardHeader>
            <CardContent>
              {volumeQ.isLoading ? (
                <div className="h-56 bg-slate-50 animate-pulse rounded-lg" />
              ) : (
                <VolumeChart data={volume} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#1C3D5A]">Distribuição por laboratório</CardTitle>
              <p className="text-xs text-slate-500">Laboratórios identificados automaticamente nos laudos enviados.</p>
            </CardHeader>
            <CardContent>
              {summaryQ.isLoading ? (
                <div className="h-48 bg-slate-50 animate-pulse rounded-lg" />
              ) : (
                <LabsPieChart data={summary.labsDistribution} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="mt-4">
          <VinculationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
