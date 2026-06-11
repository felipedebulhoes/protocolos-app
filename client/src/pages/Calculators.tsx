import React, { useState } from "react";
import { Calculator, ClipboardList, Scale, Info, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";

export default function Calculators() {
  // --- ESTADO IIEF-5 ---
  const [iiefAnswers, setIiefAnswers] = useState<Record<number, number>>({});
  const [iiefResult, setIiefResult] = useState<{ score: number; severity: string; color: string } | null>(null);

  const iiefQuestions = [
    {
      id: 1,
      q: "Como você classifica a sua confiança em obter e manter uma ereção?",
      options: [
        { val: 1, text: "Muito baixa" },
        { val: 2, text: "Baixa" },
        { val: 3, text: "Moderada" },
        { val: 4, text: "Alta" },
        { val: 5, text: "Muito alta" }
      ]
    },
    {
      id: 2,
      q: "Quando você teve ereções com estimulação sexual, com que frequência a sua ereção foi suficientemente rígida para penetração?",
      options: [
        { val: 0, text: "Sem atividade sexual" },
        { val: 1, text: "Quase nunca ou nunca" },
        { val: 2, text: "Poucas vezes (menos da metade das vezes)" },
        { val: 3, text: "Algumas vezes (cerca de metade das vezes)" },
        { val: 4, text: "A maioria das vezes (muito mais da metade das vezes)" },
        { val: 5, text: "Quase sempre ou sempre" }
      ]
    },
    {
      id: 3,
      q: "Durante a relação sexual, com que frequência você foi capaz de manter a ereção após penetrar o(a) parceiro(a)?",
      options: [
        { val: 0, text: "Sem atividade sexual" },
        { val: 1, text: "Quase nunca ou nunca" },
        { val: 2, text: "Poucas vezes (menos da metade das vezes)" },
        { val: 3, text: "Algumas vezes (cerca de metade das vezes)" },
        { val: 4, text: "A maioria das vezes (muito mais da metade das vezes)" },
        { val: 5, text: "Quase sempre ou sempre" }
      ]
    },
    {
      id: 4,
      q: "Durante a relação sexual, quão difícil foi manter a ereção até a conclusão da relação?",
      options: [
        { val: 0, text: "Sem atividade sexual" },
        { val: 1, text: "Extremamente difícil" },
        { val: 2, text: "Muito difícil" },
        { val: 3, text: "Difícil" },
        { val: 4, text: "Pouco difícil" },
        { val: 5, text: "Nada difícil" }
      ]
    },
    {
      id: 5,
      q: "Quando você tentou a relação sexual, com que frequência ela foi satisfatória para você?",
      options: [
        { val: 0, text: "Sem atividade sexual" },
        { val: 1, text: "Quase nunca ou nunca" },
        { val: 2, text: "Poucas vezes (menos da metade das vezes)" },
        { val: 3, text: "Algumas vezes (cerca de metade das vezes)" },
        { val: 4, text: "A maioria das vezes (muito mais da metade das vezes)" },
        { val: 5, text: "Quase sempre ou sempre" }
      ]
    }
  ];

  const calculateIIEF = () => {
    const answeredCount = Object.keys(iiefAnswers).length;
    if (answeredCount < 5) {
      alert("Por favor, responda a todas as 5 perguntas.");
      return;
    }
    const score = Object.values(iiefAnswers).reduce((a, b) => a + b, 0);
    let severity = "";
    let color = "";

    if (score <= 7) { severity = "Disfunção Erétil Grave"; color = "bg-destructive/10 text-destructive border-destructive/20"; }
    else if (score <= 11) { severity = "Disfunção Erétil Moderada"; color = "bg-orange-500/10 text-orange-600 border-orange-500/20"; }
    else if (score <= 16) { severity = "Disfunção Erétil Leve a Moderada"; color = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"; }
    else if (score <= 21) { severity = "Disfunção Erétil Leve"; color = "bg-blue-500/10 text-blue-600 border-blue-500/20"; }
    else { severity = "Função Erétil Normal"; color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"; }

    setIiefResult({ score, severity, color });
  };

  const resetIIEF = () => {
    setIiefAnswers({});
    setIiefResult(null);
  };

  // --- ESTADO PAD TEST 24H ---
  const [dryWeight, setDryWeight] = useState("");
  const [wetWeight, setDryWetWeight] = useState("");
  const [padResult, setPadResult] = useState<{ loss: number; severity: string; color: string } | null>(null);

  const calculatePadTest = () => {
    const dry = parseFloat(dryWeight);
    const wet = parseFloat(wetWeight);

    if (isNaN(dry) || isNaN(wet) || wet < dry) {
      alert("Por favor, insira valores válidos. O peso úmido deve ser maior que o seco.");
      return;
    }

    const loss = wet - dry;
    let severity = "";
    let color = "";

    if (loss < 10) { severity = "Perda Insignificante / Continência"; color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"; }
    else if (loss <= 100) { severity = "Incontinência Urinária Leve"; color = "bg-blue-500/10 text-blue-600 border-blue-500/20"; }
    else if (loss <= 400) { severity = "Incontinência Urinária Moderada"; color = "bg-orange-500/10 text-orange-600 border-orange-500/20"; }
    else { severity = "Incontinência Urinária Grave"; color = "bg-destructive/10 text-destructive border-destructive/20"; }

    setPadResult({ loss, severity, color });
  };

  const resetPadTest = () => {
    setDryWeight("");
    setDryWetWeight("");
    setPadResult(null);
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-primary">Calculadoras Médicas</h2>
          <p className="text-muted-foreground text-sm">
            Ferramentas de quantificação clínica para suporte à decisão durante o atendimento.
          </p>
        </div>

        <Tabs defaultValue="iief" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-secondary rounded-xl p-1">
            <TabsTrigger value="iief" className="rounded-lg py-2.5 text-xs font-semibold gap-2">
              <Calculator className="w-4 h-4" />
              IIEF-5 (Disfunção Erétil)
            </TabsTrigger>
            <TabsTrigger value="padtest" className="rounded-lg py-2.5 text-xs font-semibold gap-2">
              <Scale className="w-4 h-4" />
              Pad Test 24h (Incontinência)
            </TabsTrigger>
          </TabsList>

          {/* ABA IIEF-5 */}
          <TabsContent value="iief" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Índice Internacional de Função Erétil (IIEF-5)</CardTitle>
                <CardDescription className="text-xs">Mapeamento e estratificação de gravidade da disfunção erétil.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {iiefQuestions.map((q) => (
                  <div key={q.id} className="space-y-3 border-b border-border/40 pb-5 last:border-0 last:pb-0">
                    <Label className="text-sm font-semibold text-foreground leading-snug">
                      {q.id}. {q.q}
                    </Label>
                    <RadioGroup 
                      value={iiefAnswers[q.id]?.toString()} 
                      onValueChange={(val) => setIiefAnswers({ ...iiefAnswers, [q.id]: parseInt(val) })}
                      className="space-y-2 pt-1"
                    >
                      {q.options.map((opt) => (
                        <div key={opt.val} className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value={opt.val.toString()} id={`q${q.id}-o${opt.val}`} />
                          <Label htmlFor={`q${q.id}-o${opt.val}`} className="text-xs font-medium cursor-pointer w-full">
                            {opt.val} - {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                {/* Resultado IIEF */}
                {iiefResult && (
                  <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${iiefResult.color}`}>
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">Resultado da Avaliação</p>
                      <h4 className="text-xl font-serif font-bold leading-none">{iiefResult.severity}</h4>
                      <p className="text-xs opacity-90">Escore Total: <strong>{iiefResult.score} / 25</strong> pontos</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetIIEF} className="gap-2 border-current/20 hover:bg-black/5 rounded-xl">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refazer
                    </Button>
                  </div>
                )}

                {!iiefResult && (
                  <Button onClick={calculateIIEF} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
                    Calcular Escore IIEF-5
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA PAD TEST */}
          <TabsContent value="padtest" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Pad Test de 24 Horas</CardTitle>
                <CardDescription className="text-xs">Quantificação objetiva da gravidade da perda urinária.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dry" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peso dos Absorventes Secos (g)</Label>
                    <Input
                      id="dry"
                      type="number"
                      placeholder="Ex: 50"
                      value={dryWeight}
                      onChange={(e) => setDryWeight(e.target.value)}
                      className="py-5 bg-card border-border rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wet" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peso dos Absorventes Usados (g)</Label>
                    <Input
                      id="wet"
                      type="number"
                      placeholder="Ex: 250"
                      value={wetWeight}
                      onChange={(e) => setDryWetWeight(e.target.value)}
                      className="py-5 bg-card border-border rounded-xl"
                    />
                  </div>
                </div>

                {/* Resultado Pad Test */}
                {padResult && (
                  <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${padResult.color}`}>
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">Resultado do Pad Test</p>
                      <h4 className="text-xl font-serif font-bold leading-none">{padResult.severity}</h4>
                      <p className="text-xs opacity-90">Perda Estimada: <strong>{padResult.loss.toFixed(1)} g</strong> em 24h</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetPadTest} className="gap-2 border-current/20 hover:bg-black/5 rounded-xl">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Limpar
                    </Button>
                  </div>
                )}

                {!padResult && (
                  <Button onClick={calculatePadTest} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
                    Calcular Perda Urinária
                  </Button>
                )}

                {/* Tabela de Referência */}
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tabela de Referência (ICS)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-center">
                    <div className="p-2 bg-card rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground font-semibold">Continência</p>
                      <p className="text-xs font-bold text-emerald-600">&lt; 10g / 24h</p>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground font-semibold">Leve</p>
                      <p className="text-xs font-bold text-blue-600">10g a 100g</p>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground font-semibold">Moderada</p>
                      <p className="text-xs font-bold text-orange-600">100g a 400g</p>
                    </div>
                    <div className="p-2 bg-card rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground font-semibold">Grave</p>
                      <p className="text-xs font-bold text-destructive">&gt; 400g / 24h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
