import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { analyteLabel } from "@shared/analyteCategories";
import { buildEvolutionSeries, type EvolutionResultInput } from "@shared/examEvolution";

export type EvolutionResult = EvolutionResultInput;

const COLORS = ["#1C3D5A", "#B87333", "#2E7D6F", "#8E5BB5"];

export function ExamEvolutionChart({ results }: { results: EvolutionResult[] }) {
  // Group numeric results by analyte; keep only analytes with >= 2 dated points.
  const series = useMemo(() => buildEvolutionSeries(results), [results]);

  const [active, setActive] = useState(0);

  if (series.length === 0) return null;

  const current = series[Math.min(active, series.length - 1)];
  const color = COLORS[Math.min(active, COLORS.length - 1)];
  const first = current.points[0].value;
  const last = current.points[current.points.length - 1].value;
  const delta = last - first;
  const deltaPct = first !== 0 ? (delta / first) * 100 : 0;

  return (
    <Card className="border border-slate-100">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-[#1C3D5A] font-bold">
          <TrendingUp className="w-5 h-5 text-[#B87333]" />
          Evolução dos exames
        </div>

        {/* Analyte selector */}
        {series.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {series.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActive(i)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  i === active
                    ? "bg-[#1C3D5A] text-white border-[#1C3D5A]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#B87333]/50"
                }`}
              >
                {analyteLabel(s.key)}
              </button>
            ))}
          </div>
        )}

        {/* Header with current value + trend */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-[#1C3D5A]">{analyteLabel(current.key)}</div>
            <div className="text-2xl font-bold text-[#1C3D5A]">
              {last}
              {current.unit ? <span className="text-sm font-medium text-slate-400 ml-1">{current.unit}</span> : null}
            </div>
          </div>
          <Badge
            className={`border-0 text-xs ${
              delta > 0
                ? "bg-red-50 text-red-600"
                : delta < 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "■"} {delta > 0 ? "+" : ""}
            {delta.toFixed(2)} ({deltaPct > 0 ? "+" : ""}
            {deltaPct.toFixed(0)}%) desde {current.points[0].label}
          </Badge>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={current.points} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={44}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v}${current.unit ? ` ${current.unit}` : ""}`, analyteLabel(current.key)]}
              />
              {current.key === "psa_total" && <ReferenceLine y={4} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "4,0", fontSize: 10, fill: "#ef4444" }} />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={250}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Mostra apenas marcadores com duas ou mais medições datadas. A linha tracejada no PSA total indica o limite de
          referência usual de 4,0 ng/mL.
        </p>
      </CardContent>
    </Card>
  );
}

export default ExamEvolutionChart;
