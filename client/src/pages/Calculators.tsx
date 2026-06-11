import React, { useState } from "react";
import { Calculator, ClipboardList, Scale, Info, Check, RefreshCw, Activity } from "lucide-react";
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

  // --- ESTADO QUESTIONÁRIO ADAM ---
  const [adamAnswers, setAdamAnswers] = useState<Record<number, boolean>>({});
  const [adamResult, setAdamResult] = useState<{ positive: boolean; severity: string; color: string } | null>(null);

  const adamQuestions = [
    { id: 1, q: "Você notou diminuição do desejo sexual (libido)?" },
    { id: 2, q: "Você notou falta de energia ou fadiga constante?" },
    { id: 3, q: "Você notou diminuição da força muscular ou da resistência física?" },
    { id: 4, q: "Você perdeu altura (está ficando mais baixo)?" },
    { id: 5, q: "Você notou uma diminuição da sua 'alegria de viver' ou se sente triste/rabugento?" },
    { id: 6, q: "Suas ereções estão menos rígidas ou menos frequentes?" },
    { id: 7, q: "Você notou uma piora recente no seu desempenho esportivo ou atividades físicas?" },
    { id: 8, q: "Você costuma dormir logo após o jantar?" },
    { id: 9, q: "Você notou uma piora recente no seu desempenho no trabalho ou concentração?" },
    { id: 10, q: "Você se sente mais cansado ou sonolento durante o dia?" }
  ];

  const calculateADAM = () => {
    const answeredCount = Object.keys(adamAnswers).length;
    if (answeredCount < 10) {
      alert("Por favor, responda a todas as 10 perguntas.");
      return;
    }

    // Critério positivo de ADAM:
    // - Resposta SIM para a pergunta 1 (libido) OU pergunta 6 (ereção)
    // - OU resposta SIM para quaisquer outras 3 perguntas
    const yes1 = adamAnswers[1] === true;
    const yes6 = adamAnswers[6] === true;
    
    const otherYesCount = Object.entries(adamAnswers)
      .filter(([id, val]) => id !== "1" && id !== "6" && val === true)
      .length;

    const positive = yes1 || yes6 || otherYesCount >= 3;
    let severity = "";
    let color = "";

    if (positive) {
      severity = "Rastreamento Positivo para Deficiência Androgênica (DAEM)";
      color = "bg-orange-500/10 text-orange-600 border-orange-500/20";
    } else {
      severity = "Rastreamento Negativo para Deficiência Androgênica";
      color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }

    setAdamResult({ positive, severity, color });
  };

  const resetADAM = () => {
    setAdamAnswers({});
    setAdamResult(null);
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

  // --- ESTADO REEMBOLSO ---
  const [surgicalValue, setSurgicalValue] = useState("");
  const [reimbursementLimit, setReimbursementValue] = useState("");
  const [reimbursementPercent, setReimbursementPercent] = useState("100");
  const [reimbursementResult, setReimbursementResult] = useState<{
    covered: number;
    patientPart: number;
    patientPartPercent: number;
    isFullyCovered: boolean;
  } | null>(null);

  const calculateReimbursement = () => {
    const total = parseFloat(surgicalValue);
    const limit = parseFloat(reimbursementLimit);
    const percent = parseFloat(reimbursementPercent) / 100;

    if (isNaN(total) || isNaN(limit) || total <= 0 || limit <= 0) {
      alert("Por favor, insira valores numéricos válidos e maiores que zero.");
      return;
    }

    // O reembolso real é o limite do plano multiplicado pelo percentual de cobertura contratado (geralmente 100% da prévia, mas pode variar)
    const realReimbursement = limit * percent;
    
    // O valor coberto nunca pode exceder o valor total da cirurgia
    const covered = Math.min(total, realReimbursement);
    const patientPart = Math.max(0, total - covered);
    const patientPartPercent = (patientPart / total) * 100;
    const isFullyCovered = patientPart === 0;

    setReimbursementResult({
      covered,
      patientPart,
      patientPartPercent,
      isFullyCovered
    });
  };

  const resetReimbursement = () => {
    setSurgicalValue("");
    setReimbursementValue("");
    setReimbursementPercent("100");
    setReimbursementResult(null);
  };

  // --- ESTADO CALCULADORA DE TRT ---
  const [trtType, setTrtType] = useState("gel");
  const [trtSerumTesto, setTrtSerumTesto] = useState("");
  const [trtTargetTesto, setTrtTargetTesto] = useState("600");
  const [trtResult, setTrtResult] = useState<{
    currentDose: string;
    suggestedDose: string;
    frequency: string;
    clinicalTip: string;
    followUp: string;
  } | null>(null);

  const calculateTRT = () => {
    const serum = parseFloat(trtSerumTesto);
    const target = parseFloat(trtTargetTesto);

    if (isNaN(serum) || serum <= 0) {
      alert("Por favor, insira um valor válido de Testosterona Total sérica.");
      return;
    }

    let currentDose = "";
    let suggestedDose = "";
    let frequency = "";
    let clinicalTip = "";
    let followUp = "Realizar nova coleta de Testosterona Total, Livre, SHBG, Estradiol, Prolactina e Hemograma completo em 6 semanas.";

    if (trtType === "gel") {
      currentDose = "Gel Transdérmico 5% (50mg/g)";
      frequency = "Aplicação diária pela manhã nos ombros/braços ou abdômen.";
      if (serum < 350) {
        suggestedDose = "Gel 5% - 2 pumps (50mg de testosterona) por dia";
        clinicalTip = "Nível sérico abaixo da meta fisiológica. Recomenda-se aumentar a dose para 2 pumps diários (ou 1g de gel a 5%). Certificar-se de que o paciente está aplicando na pele limpa e seca, sem tomar banho por pelo menos 6 horas após a aplicação.";
      } else if (serum > 900) {
        suggestedDose = "Gel 5% - Reduzir para 1 pump (25mg de testosterona) por dia";
        clinicalTip = "Níveis séricos supra-fisiológicos. Recomenda-se redução de dose para evitar efeitos colaterais como policitemia (elevação do hematócrito) ou aromatização excessiva (estradiol elevado).";
      } else {
        suggestedDose = "Gel 5% - Manter dose atual (1 pump ou 2 pumps)";
        clinicalTip = "Paciente está dentro da faixa terapêutica fisiológica ideal (350-900 ng/dL). Manter a aplicação diária regular e monitorar a resposta clínica de libido, disposição e cognição.";
      }
    } else if (trtType === "cipionato") {
      currentDose = "Cipionato de Testosterona (Deposteron 200mg/2mL)";
      if (serum < 400) {
        suggestedDose = "Deposteron 200mg (1 ampola) a cada 10 ou 12 dias";
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível de vale (pré-dose) muito baixo. Pacientes frequentemente queixam-se de flutuação de humor e libido no final do intervalo. Recomenda-se encurtar o intervalo de aplicação de 14 para 10 ou 12 dias em vez de aumentar a dose única.";
      } else if (serum > 1000) {
        suggestedDose = "Deposteron 200mg (1 ampola) a cada 14 ou 18 dias";
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível sérico de vale está supra-fisiológico ou no limite superior. Risco aumentado de hematócrito > 54% e ginecomastia. Recomenda-se aumentar o intervalo de aplicação ou fracionar a dose (ex: 100mg por semana).";
      } else {
        suggestedDose = "Deposteron 200mg (1 ampola) a cada 14 dias";
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível sérico estável e na faixa terapêutica ideal de vale (400-800 ng/dL). Excelente estabilidade clínica. Monitorar hematócrito e PSA anualmente.";
      }
    } else if (trtType === "undecanato") {
      currentDose = "Undecanato de Testosterona (Nebido / Hormus 1000mg/4mL)";
      frequency = "Injeção intramuscular profunda ultra-lenta (durante 2 minutos).";
      if (serum < 350) {
        suggestedDose = "Nebido 1000mg a cada 10 semanas (antecipar o intervalo)";
        clinicalTip = "Nível de vale está abaixo do esperado para testosterona de ação lenta. Recomenda-se encurtar o intervalo regular de 12 semanas para 10 semanas para estabilizar os níveis e evitar a queda de performance no final do ciclo.";
      } else if (serum > 850) {
        suggestedDose = "Nebido 1000mg a cada 14 semanas (postergar o intervalo)";
        clinicalTip = "Nível de vale excelente, no limite superior. Nebido possui uma meia-vida longa de ~90 dias. É seguro estender o intervalo de aplicação para 14 semanas para monitoramento seguro e manutenção da faixa terapêutica.";
      } else {
        suggestedDose = "Nebido 1000mg a cada 12 semanas (manter intervalo padrão)";
        clinicalTip = "Níveis de vale altamente estáveis (geralmente entre 400-700 ng/dL). Esta é a terapia mais estável em termos de flutuações hormonais. Manter a aplicação a cada 12 semanas e monitorar exames de segurança.";
      }
    }

    setTrtResult({
      currentDose,
      suggestedDose,
      frequency,
      clinicalTip,
      followUp
    });
  };

  const resetTRT = () => {
    setTrtSerumTesto("");
    setTrtResult(null);
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-primary">Calculadoras Médicas</h2>
          <p className="text-muted-foreground text-sm">
            Ferramentas de quantificação clínica e simulações de consultório para suporte à decisão.
          </p>
        </div>

        <Tabs defaultValue="iief" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-secondary rounded-xl p-1 h-auto gap-1">
            <TabsTrigger value="iief" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              IIEF-5 (Ereção)
            </TabsTrigger>
            <TabsTrigger value="adam" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              ADAM (Rastreio)
            </TabsTrigger>
            <TabsTrigger value="trt" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              TRT (Ajuste)
            </TabsTrigger>
            <TabsTrigger value="padtest" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              Pad Test 24h
            </TabsTrigger>
            <TabsTrigger value="reimbursement" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              Reembolso
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

          {/* ABA CALCULADORA DE TRT */}
          <TabsContent value="trt" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Calculadora de Ajuste de TRT</CardTitle>
                <CardDescription className="text-xs">
                  Apoio clínico para ajuste de dosagem e intervalos de Terapia de Reposição de Testosterona com base nos níveis séricos medidos (vale/vale pré-dose).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary uppercase tracking-wider">Tipo de Testosterona Utilizada</Label>
                      <RadioGroup value={trtType} onValueChange={setTrtType} className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value="gel" id="trt-gel" />
                          <Label htmlFor="trt-gel" className="text-xs font-medium cursor-pointer w-full">
                            Gel Transdérmico 5% (pumps diários)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value="cipionato" id="trt-cipionato" />
                          <Label htmlFor="trt-cipionato" className="text-xs font-medium cursor-pointer w-full">
                            Cipionato (Deposteron 200mg - ação média)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value="undecanato" id="trt-undecanato" />
                          <Label htmlFor="trt-undecanato" className="text-xs font-medium cursor-pointer w-full">
                            Undecanato (Nebido / Hormus 1000mg - ação lenta)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trt-serum" className="text-xs font-bold text-primary uppercase tracking-wider">
                        Testosterona Total Sérica Medida (ng/dL)
                      </Label>
                      <div className="relative">
                        <Input
                          id="trt-serum"
                          type="number"
                          placeholder="Ex: 280"
                          value={trtSerumTesto}
                          onChange={(e) => setTrtSerumTesto(e.target.value)}
                          className="pr-16 h-11 rounded-xl"
                        />
                        <span className="absolute right-4 top-3 text-xs font-bold text-muted-foreground">ng/dL</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        *Para injetáveis, coletar preferencialmente no dia da próxima aplicação (nível de vale).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trt-target" className="text-xs font-bold text-primary uppercase tracking-wider">
                        Meta Terapêutica Alvo (ng/dL)
                      </Label>
                      <select
                        id="trt-target"
                        value={trtTargetTesto}
                        onChange={(e) => setTrtTargetTesto(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-medium"
                      >
                        <option value="500">Fisiológica Moderada (~500 ng/dL)</option>
                        <option value="600">Fisiológica Ideal (~600 ng/dL)</option>
                        <option value="800">Fisiológica Alta (~800 ng/dL)</option>
                      </select>
                    </div>

                    {!trtResult && (
                      <Button onClick={calculateTRT} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
                        Analisar Ajuste de TRT
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {trtResult ? (
                      <div className="bg-secondary/10 border border-border/60 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                          <h4 className="text-sm font-serif font-bold text-primary">Análise e Conduta Sugerida</h4>
                          <Badge variant="outline" className="border-accent/20 text-accent bg-accent/5 text-[10px] font-bold">
                            TRT Clin-Guide
                          </Badge>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="font-bold text-primary block">Terapia Atual:</span>
                            <p className="text-foreground/80">{trtResult.currentDose}</p>
                          </div>

                          <div>
                            <span className="font-bold text-[#B87333] block">Conduta / Dose Sugerida:</span>
                            <p className="text-foreground font-semibold bg-accent/5 p-2.5 rounded-lg border border-accent/10">
                              {trtResult.suggestedDose}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-primary block">Frequência e Via:</span>
                            <p className="text-foreground/80">{trtResult.frequency}</p>
                          </div>

                          <div>
                            <span className="font-bold text-primary block">Diretriz e Dica Clínica:</span>
                            <p className="text-foreground/80 leading-relaxed bg-card p-3 rounded-lg border border-border/40 text-justify">
                              {trtResult.clinicalTip}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-border/40">
                            <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">Próximos Passos de Segurança:</span>
                            <p className="text-muted-foreground leading-relaxed text-[11px] mt-1">
                              {trtResult.followUp}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={resetTRT} className="w-full gap-2 border-border hover:bg-secondary rounded-xl mt-2">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Limpar e Nova Análise
                        </Button>
                      </div>
                    ) : (
                      <div className="h-full min-h-[250px] border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-secondary/[0.05]">
                        <Activity className="w-8 h-8 text-muted-foreground/60 mb-3" />
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Aguardando Dados</h4>
                        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                          Insira o nível de testosterona sérica medida e selecione a via terapêutica para receber a conduta sugerida.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA QUESTIONÁRIO ADAM */}
          <TabsContent value="adam" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Questionário ADAM (Androgen Deficiency in the Aging Male)</CardTitle>
                <CardDescription className="text-xs">Triagem clínica rápida de sintomas de deficiência androgênica (DAEM / Distúrbio Androgênico do Envelhecimento Masculino).</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {adamQuestions.map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <Label className="text-xs font-semibold text-foreground leading-snug max-w-xl">
                        {q.id}. {q.q}
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          variant={adamAnswers[q.id] === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAdamAnswers({ ...adamAnswers, [q.id]: true })}
                          className={`h-8 w-16 rounded-lg text-xs font-bold transition-all ${
                            adamAnswers[q.id] === true 
                              ? "bg-[#B87333] text-white hover:bg-[#B87333]/90" 
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          Sim
                        </Button>
                        <Button
                          variant={adamAnswers[q.id] === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAdamAnswers({ ...adamAnswers, [q.id]: false })}
                          className={`h-8 w-16 rounded-lg text-xs font-bold transition-all ${
                            adamAnswers[q.id] === false 
                              ? "bg-[#1C3D5A] text-white hover:bg-[#1C3D5A]/90" 
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          Não
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resultado ADAM */}
                {adamResult && (
                  <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${adamResult.color}`}>
                    <div className="space-y-1.5 text-center md:text-left max-w-lg">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Resultado do Rastreamento</p>
                      <h4 className="text-base font-serif font-bold leading-snug">{adamResult.severity}</h4>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {adamResult.positive 
                          ? "O questionário sugere a presença de sintomas relacionados à queda de testosterona. Recomenda-se prosseguir com a investigação laboratorial solicitando Testosterona Total, Livre e SHBG colhidos em jejum pela manhã." 
                          : "O rastreamento clínico não sugere deficiência androgênica significativa com base nos sintomas relatados."}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetADAM} className="gap-2 border-current/20 hover:bg-black/5 rounded-xl shrink-0">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refazer
                    </Button>
                  </div>
                )}

                {!adamResult && (
                  <Button onClick={calculateADAM} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
                    Analisar Questionário ADAM
                  </Button>
                )}

                {/* Critério de Positividade */}
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="w-4 h-4 text-[#B87333]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87333]">Critério de Positividade (ADAM)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    O teste é considerado positivo se houver resposta <strong>Sim</strong> para a pergunta <strong>1 (Libido)</strong> ou <strong>6 (Ereção)</strong>, ou resposta <strong>Sim</strong> para quaisquer outras <strong>3 perguntas</strong> do questionário.
                  </p>
                </div>
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

          {/* ABA REEMBOLSO */}
          <TabsContent value="reimbursement" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Simulador de Reembolso de Honorários</CardTitle>
                <CardDescription className="text-xs">Cálculo de coparticipação, cobertura do plano e saldo particular residual para cirurgias eletivas.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_value" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valor Particular da Equipe (R$)</Label>
                    <Input
                      id="total_value"
                      type="number"
                      placeholder="Ex: 15000"
                      value={surgicalValue}
                      onChange={(e) => setSurgicalValue(e.target.value)}
                      className="py-5 bg-card border-border rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit_value" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Limite Prévio do Plano (R$)</Label>
                    <Input
                      id="limit_value"
                      type="number"
                      placeholder="Ex: 12000"
                      value={reimbursementLimit}
                      onChange={(e) => setReimbursementValue(e.target.value)}
                      className="py-5 bg-card border-border rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percent_coverage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Percentual de Cobertura (%)</Label>
                    <Input
                      id="percent_coverage"
                      type="number"
                      placeholder="Ex: 100"
                      value={reimbursementPercent}
                      onChange={(e) => setReimbursementPercent(e.target.value)}
                      className="py-5 bg-card border-border rounded-xl"
                    />
                  </div>
                </div>

                {/* Resultado do Reembolso */}
                {reimbursementResult && (
                  <div className={`p-5 rounded-xl border space-y-4 ${reimbursementResult.isFullyCovered ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-50" : "bg-primary/5 border-border text-foreground"}`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resultado da Simulação</p>
                        <h4 className="text-lg font-serif font-bold leading-none">
                          {reimbursementResult.isFullyCovered ? "Cobertura Total pelo Plano" : "Coparticipação Particular Necessária"}
                        </h4>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetReimbursement} className="gap-2 border-border hover:bg-secondary rounded-xl text-xs">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Limpar Simulação
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-card rounded-lg border border-border/40">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Reembolso do Plano</p>
                        <p className="text-base font-bold text-emerald-600">R$ {reimbursementResult.covered.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border/40">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Diferença Particular</p>
                        <p className={`text-base font-bold ${reimbursementResult.isFullyCovered ? "text-emerald-600" : "text-amber-600"}`}>
                          R$ {reimbursementResult.patientPart.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border/40">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Sua Participação (%)</p>
                        <p className="text-base font-bold text-primary">{reimbursementResult.patientPartPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {!reimbursementResult && (
                  <Button onClick={calculateReimbursement} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
                    Simular Reembolso
                  </Button>
                )}

                {/* Nota Explicativa */}
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Como funciona o Reembolso de Honorários?</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O reembolso é um direito garantido por lei para planos com livre escolha de prestadores. O cálculo baseia-se na multiplicação da <strong>UCO (Unidade de Custo Operacional)</strong> ou tabela de coeficientes específica do seu plano de saúde. Esta calculadora simula o valor final que o paciente receberá de volta com base na prévia oficial de reembolso fornecida pelo aplicativo do convênio.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
