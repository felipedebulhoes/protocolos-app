import React, { useState } from "react";
import { Calculator, ClipboardList, Scale, Info, Check, RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";
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
  const [trtWeight, setTrtWeight] = useState("");
  const [trtHematocrit, setTrtHematocrit] = useState("");
  const [trtPSA, setTrtPSA] = useState("");
  const [trtEstradiol, setTrtEstradiol] = useState("");
  const [trtFertilityGoal, setTrtFertilityGoal] = useState("no"); // "no" | "yes" (HCG para preservação de fertilidade)
  const [trtResult, setTrtResult] = useState<{
    currentDose: string;
    suggestedDose: string;
    frequency: string;
    hcgDose?: string; // Dosagem recomendada de HCG se fertilidade ativa
    clinicalTip: string;
    safetyAlert?: { type: "warning" | "critical"; text: string }; // Alertas críticos de exames
    followUp: string;
  } | null>(null);

  // --- ESTADO CLEARANCE CREATININA (COCKCROFT-GAULT) ---
  const [crAge, setCrAge] = useState<string>("");
  const [crWeight, setCrWeight] = useState<string>("");
  const [crCreatinine, setCrCreatinine] = useState<string>("");
  const [crGender, setCrGender] = useState<"male" | "female">("male");
  const [crResult, setCrResult] = useState<{ clearance: number; classification: string; color: string; tip: string } | null>(null);

  const calculateClearance = () => {
    const age = parseFloat(crAge);
    const weight = parseFloat(crWeight);
    const creatinine = parseFloat(crCreatinine);

    if (isNaN(age) || isNaN(weight) || isNaN(creatinine) || creatinine <= 0) {
      alert("Por favor, preencha todos os campos com valores válidos.");
      return;
    }

    // Fórmula de Cockcroft-Gault: ((140 - idade) * peso) / (72 * creatinina)
    let clearance = ((140 - age) * weight) / (72 * creatinine);
    
    // Ajuste para o sexo feminino (multiplicar por 0.85)
    if (crGender === "female") {
      clearance *= 0.85;
    }

    clearance = Math.round(clearance * 10) / 10; // Arredondar para 1 casa decimal

    let classification = "";
    let color = "";
    let tip = "";

    if (clearance >= 90) {
      classification = "Função Renal Normal (Estágio G1)";
      color = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      tip = "Nenhum ajuste de dose de antibióticos ou contraste é necessário por função renal.";
    } else if (clearance >= 60) {
      classification = "Disfunção Renal Leve (Estágio G2)";
      color = "bg-blue-500/10 text-blue-600 border-blue-500/20";
      tip = "Geralmente seguro para a maioria dos antibióticos e contraste. Monitore se uso prolongado.";
    } else if (clearance >= 30) {
      classification = "Disfunção Renal Moderada (Estágio G3a/G3b)";
      color = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      tip = "ATENÇÃO: Requer ajuste de dose para diversos antibióticos (ex: Quinolonas, Beta-lactâmicos) e hidratação vigorosa se for usar contraste iodado.";
    } else if (clearance >= 15) {
      classification = "Disfunção Renal Grave (Estágio G4)";
      color = "bg-orange-500/10 text-orange-600 border-orange-500/20";
      tip = "CRÍTICO: Redução drástica de dose ou espaçamento de dose obrigatório para a maioria dos fármacos. Evitar contraste iodado.";
    } else {
      classification = "Falência Renal / Estágio Terminal (Estágio G5)";
      color = "bg-destructive/10 text-destructive border-destructive/20";
      tip = "URGENTE: Ajuste extremo de doses. Contraindicação absoluta para contrastes nefrotóxicos comuns sem diálise planejada.";
    }

    setCrResult({ clearance, classification, color, tip });
  };

  const resetClearance = () => {
    setCrAge("");
    setCrWeight("");
    setCrCreatinine("");
    setCrResult(null);
  };

  const calculateTRT = () => {
    const serum = parseFloat(trtSerumTesto);
    const target = parseFloat(trtTargetTesto);
    const weight = parseFloat(trtWeight);
    const hematocrit = parseFloat(trtHematocrit);
    const psa = parseFloat(trtPSA);
    const estradiol = parseFloat(trtEstradiol);

    if (isNaN(serum) || serum <= 0) {
      alert("Por favor, insira um valor válido de Testosterona Total sérica.");
      return;
    }

    let currentDose = "";
    let suggestedDose = "";
    let frequency = "";
    let hcgDose = "";
    let clinicalTip = "";
    let safetyAlert: { type: "warning" | "critical"; text: string } | undefined = undefined;
    let followUp = "Realizar nova coleta de Testosterona Total, Livre, SHBG, Estradiol, Prolactina e Hemograma completo em 6 semanas.";

    // 1. Alertas de Segurança Laboratorial Críticos (Baseado em Diretrizes da AUA/EAU)
    if (!isNaN(hematocrit) && hematocrit > 54) {
      safetyAlert = {
        type: "critical",
        text: `CRÍTICO: Hematócrito elevado em ${hematocrit}%. Risco grave de hiperviscosidade sanguínea e eventos tromboembólicos. Suspender imediatamente a TRT, realizar sangria terapêutica terapêutica (flebotomia de 500mL) e investigar causas associadas antes de reintroduzir dose menor.`
      };
    } else if (!isNaN(hematocrit) && hematocrit > 52) {
      safetyAlert = {
        type: "warning",
        text: `ALERTA: Hematócrito limítrofe em ${hematocrit}%. Recomenda-se fracionar a dose da testosterona (ex: injeções semanais em vez de quinzenais) ou migrar para via transdérmica (Gel), além de aumentar a ingestão hídrica.`
      };
    }

    if (!isNaN(psa) && psa > 4.0) {
      safetyAlert = {
        type: "critical",
        text: `CRÍTICO: PSA elevado em ${psa} ng/mL. Contraindicação absoluta para manutenção ou aumento de TRT. Suspender a terapia imediatamente e encaminhar o paciente para investigação de neoplasia prostática (toque retal e Ressonância Magnética Multiparamétrica).`
      };
    }

    if (!isNaN(estradiol) && estradiol > 50) {
      const ginecoTip = " Estradiol elevado (>50 pg/mL). Monitorar sintomas de ginecomastia, mastalgia e retenção hídrica. Se houver sintomas clínicos, considerar o uso de inibidores de aromatase em doses ultra-baixas (ex: Anastrozol 0.25mg a 0.5mg 1x a 2x por semana). Evitar o uso empírico sem sintomas.";
      clinicalTip += ginecoTip;
    }

    // 2. Cálculo da Dose de Testosterona com Base no Peso e Tipo
    if (trtType === "gel") {
      currentDose = "Gel Transdérmico 5% (50mg/g)";
      frequency = "Aplicação diária pela manhã nos ombros/braços ou abdômen.";
      
      // Ajuste de dose por peso (pacientes obesos > 100kg necessitam de mais área/absorção)
      const weightFactor = !isNaN(weight) && weight > 100 ? " Devido ao peso corporal elevado (>100kg), a absorção transdérmica pode requerer maior área de aplicação." : "";

      if (serum < 350) {
        suggestedDose = "Gel 5% - 2 pumps (50mg de testosterona) por dia";
        clinicalTip = "Nível sérico abaixo da meta fisiológica. Recomenda-se aumentar a dose para 2 pumps diários (ou 1g de gel a 5%). Certificar-se de que o paciente está aplicando na pele limpa e seca, sem tomar banho por pelo menos 6 horas após a aplicação." + weightFactor;
      } else if (serum > 900) {
        suggestedDose = "Gel 5% - Reduzir para 1 pump (25mg de testosterona) por dia";
        clinicalTip = "Níveis séricos supra-fisiológicos. Recomenda-se redução de dose para evitar efeitos colaterais como policitemia ou aromatização excessiva." + weightFactor;
      } else {
        suggestedDose = "Gel 5% - Manter dose atual (1 pump ou 2 pumps)";
        clinicalTip = "Paciente está dentro da faixa terapêutica fisiológica ideal (350-900 ng/dL). Manter a aplicação diária regular e monitorar a resposta clínica de libido, disposição e cognição." + weightFactor;
      }
    } else if (trtType === "cipionato") {
      currentDose = "Cipionato de Testosterona (Deposteron 200mg/2mL)";
      
      // Ajuste de dose por peso (pacientes magros ou obesos têm volumes de distribuição diferentes)
      let intervalDays = 14;
      if (!isNaN(weight) && weight > 95) {
        intervalDays = 10; // Metabolismo e volume de distribuição aumentados
      } else if (!isNaN(weight) && weight < 65) {
        intervalDays = 16; // Menor volume de distribuição
      }

      if (serum < 400) {
        suggestedDose = `Deposteron 200mg (1 ampola) a cada ${intervalDays - 4} ou ${intervalDays - 2} dias`;
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível de vale (pré-dose) muito baixo. Pacientes frequentemente queixam-se de flutuação de humor e libido no final do intervalo. Recomenda-se encurtar o intervalo de aplicação em vez de aumentar a dose única para evitar picos suprafisiológicos.";
      } else if (serum > 1000) {
        suggestedDose = `Deposteron 200mg (1 ampola) a cada ${intervalDays + 4} ou ${intervalDays + 6} dias`;
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível sérico de vale está supra-fisiológico ou no limite superior. Risco aumentado de hematócrito > 54% e ginecomastia. Recomenda-se aumentar o intervalo de aplicação ou fracionar a dose (ex: 100mg por semana subcutâneo).";
      } else {
        suggestedDose = `Deposteron 200mg (1 ampola) a cada ${intervalDays} dias`;
        frequency = "Injeção intramuscular profunda.";
        clinicalTip = "Nível sérico estável e na faixa terapêutica ideal de vale (400-800 ng/dL). Excelente estabilidade clínica. Monitorar hematócrito e PSA anualmente.";
      }
    } else if (trtType === "undecanato") {
      currentDose = "Undecanato de Testosterona (Nebido / Hormus 1000mg/4mL)";
      frequency = "Injeção intramuscular profunda ultra-lenta (durante 2 minutos).";
      
      let intervalWeeks = 12;
      if (!isNaN(weight) && weight > 100) {
        intervalWeeks = 10; // Maior peso corporal pode requerer intervalos menores
      }

      if (serum < 350) {
        suggestedDose = `Nebido 1000mg a cada ${intervalWeeks - 2} semanas (antecipar o intervalo)`;
        clinicalTip = "Nível de vale está abaixo do esperado para testosterona de ação lenta. Recomenda-se encurtar o intervalo regular para estabilizar os níveis e evitar a queda de performance no final do ciclo.";
      } else if (serum > 850) {
        suggestedDose = `Nebido 1000mg a cada ${intervalWeeks + 2} semanas (postergar o intervalo)`;
        clinicalTip = "Nível de vale excelente, no limite superior. Nebido possui uma meia-vida longa de ~90 dias. É seguro estender o intervalo de aplicação para manutenção segura.";
      } else {
        suggestedDose = `Nebido 1000mg a cada ${intervalWeeks} semanas (manter intervalo padrão)`;
        clinicalTip = "Níveis de vale altamente estáveis (geralmente entre 400-700 ng/dL). Esta é a terapia mais estável em termos de flutuações hormonais. Manter a aplicação regular.";
      }
    }

    // 3. Conduta de Preservação de Fertilidade com HCG (Flukkahormo)
    if (trtFertilityGoal === "yes") {
      // Dose padrão baseada nas diretrizes de preservação testicular durante TRT
      hcgDose = "HCG 500 UI por via subcutânea, 2x a 3x por semana (Total: 1.000 a 1.500 UI/semana)";
      clinicalTip += " IMPORTANTE (Preservação de Fertilidade): O uso concomitante de HCG (Gonadotrofina Coriônica Humana) mimetiza o LH, estimulando a produção de testosterona intratesticular para preservar a espermatogênese e o volume testicular durante a TRT exógena, prevenindo a atrofia testicular secundária.";
    }

    setTrtResult({
      currentDose,
      suggestedDose,
      frequency,
      hcgDose: trtFertilityGoal === "yes" ? hcgDose : undefined,
      clinicalTip,
      safetyAlert,
      followUp
    });
  };

  const resetTRT = () => {
    setTrtSerumTesto("");
    setTrtWeight("");
    setTrtHematocrit("");
    setTrtPSA("");
    setTrtEstradiol("");
    setTrtFertilityGoal("no");
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
          <TabsList className="grid grid-cols-2 md:grid-cols-6 bg-secondary rounded-xl p-1 h-auto gap-1">
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
            <TabsTrigger value="clearance" className="rounded-lg py-2 w-full text-[10px] sm:text-xs font-semibold gap-1">
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              ClCr (Função Renal)
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trt-serum" className="text-xs font-bold text-primary uppercase tracking-wider">
                          Testosterona Total (ng/dL)
                        </Label>
                        <div className="relative">
                          <Input
                            id="trt-serum"
                            type="number"
                            placeholder="Ex: 280"
                            value={trtSerumTesto}
                            onChange={(e) => setTrtSerumTesto(e.target.value)}
                            className="pr-14 h-11 rounded-xl"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-bold text-muted-foreground">ng/dL</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trt-weight" className="text-xs font-bold text-primary uppercase tracking-wider">
                          Peso Corporal (kg)
                        </Label>
                        <div className="relative">
                          <Input
                            id="trt-weight"
                            type="number"
                            placeholder="Ex: 80"
                            value={trtWeight}
                            onChange={(e) => setTrtWeight(e.target.value)}
                            className="pr-10 h-11 rounded-xl"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-bold text-muted-foreground">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="trt-ht" className="text-xs font-bold text-primary uppercase tracking-wider">
                          Hematócrito (%)
                        </Label>
                        <div className="relative">
                          <Input
                            id="trt-ht"
                            type="number"
                            placeholder="Ex: 45"
                            value={trtHematocrit}
                            onChange={(e) => setTrtHematocrit(e.target.value)}
                            className="pr-8 h-11 rounded-xl text-xs"
                          />
                          <span className="absolute right-2 top-3 text-[10px] font-bold text-muted-foreground">%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trt-psa" className="text-xs font-bold text-primary uppercase tracking-wider">
                          PSA (ng/mL)
                        </Label>
                        <div className="relative">
                          <Input
                            id="trt-psa"
                            type="number"
                            step="0.1"
                            placeholder="Ex: 1.2"
                            value={trtPSA}
                            onChange={(e) => setTrtPSA(e.target.value)}
                            className="pr-12 h-11 rounded-xl text-xs"
                          />
                          <span className="absolute right-2 top-3 text-[10px] font-bold text-muted-foreground">ng/ml</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trt-e2" className="text-xs font-bold text-primary uppercase tracking-wider">
                          Estradiol (pg/mL)
                        </Label>
                        <div className="relative">
                          <Input
                            id="trt-e2"
                            type="number"
                            placeholder="Ex: 28"
                            value={trtEstradiol}
                            onChange={(e) => setTrtEstradiol(e.target.value)}
                            className="pr-12 h-11 rounded-xl text-xs"
                          />
                          <span className="absolute right-2 top-3 text-[10px] font-bold text-muted-foreground">pg/ml</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary uppercase tracking-wider">Preservar Fertilidade / Volume Testicular?</Label>
                      <RadioGroup value={trtFertilityGoal} onValueChange={setTrtFertilityGoal} className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 rounded-lg border border-border/50 p-2.5 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value="no" id="fert-no" />
                          <Label htmlFor="fert-no" className="text-xs font-medium cursor-pointer w-full">
                            Não (Apenas TRT)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border border-border/50 p-2.5 hover:bg-secondary/40 transition-all cursor-pointer">
                          <RadioGroupItem value="yes" id="fert-yes" />
                          <Label htmlFor="fert-yes" className="text-xs font-medium cursor-pointer w-full flex items-center gap-1">
                            Sim (HCG + TRT)
                          </Label>
                        </div>
                      </RadioGroup>
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
                        Analisar Dosagem e Segurança de TRT
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
                          {trtResult.safetyAlert && (
                            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              trtResult.safetyAlert.type === "critical" 
                                ? "bg-destructive/10 border-destructive/20 text-destructive font-semibold" 
                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 font-semibold"
                            }`}>
                              {trtResult.safetyAlert.text}
                            </div>
                          )}

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

                          {trtResult.hcgDose && (
                            <div>
                              <span className="font-bold text-emerald-600 block">Dosagem de HCG Recomendada (Flukkahormo):</span>
                              <p className="text-foreground font-semibold bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10 text-emerald-700">
                                {trtResult.hcgDose}
                              </p>
                            </div>
                          )}

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

                        {(() => {
                          const activePatientName = localStorage.getItem("protoUro_active_patient");
                          if (!activePatientName) return null;
                          
                          return (
                            <Button 
                              onClick={() => {
                                try {
                                  const dbStr = localStorage.getItem("protouro_pacientes_db");
                                  if (!dbStr) {
                                    toast.error("Banco de dados de pacientes não encontrado.");
                                    return;
                                  }
                                  
                                  const pacientes = JSON.parse(dbStr);
                                  const matchedIdx = pacientes.findIndex((p: any) => p.nome === activePatientName);
                                  
                                  if (matchedIdx === -1) {
                                    toast.error(`Paciente "${activePatientName}" não encontrado no CRM.`);
                                    return;
                                  }
                                  
                                  const p = pacientes[matchedIdx];
                                  
                                  // 1. Atualizar exames laboratoriais no prontuário do paciente com os inputs da calculadora
                                  p.testosterona = trtSerumTesto;
                                  if (trtHematocrit) p.hematocrito = trtHematocrit;
                                  if (trtPSA) p.psa = trtPSA;
                                  if (trtEstradiol) p.estradiol = trtEstradiol;
                                  
                                  // 2. Registrar um ponto no histórico hormonal do paciente
                                  if (!p.historicoHormonal) p.historicoHormonal = [];
                                  
                                  const dataPonto = new Date().toLocaleDateString("pt-BR").substring(0, 5);
                                  const intervencaoTexto = trtResult.hcgDose 
                                    ? `TRT: ${trtResult.suggestedDose} + HCG: ${trtResult.hcgDose}`
                                    : `TRT: ${trtResult.suggestedDose}`;
                                    
                                  p.historicoHormonal.push({
                                    data: dataPonto,
                                    total: parseFloat(trtSerumTesto),
                                    livre: p.testoLivre ? parseFloat(p.testoLivre) : undefined,
                                    shbg: p.shbg ? parseFloat(p.shbg) : undefined,
                                    hematocrito: trtHematocrit ? parseFloat(trtHematocrit) : undefined,
                                    intervencao: intervencaoTexto
                                  });
                                  
                                  // 3. Adicionar notas clínicas de sincronização de TRT
                                  const notaSinc = `[Sincronização TRT ${dataPonto}] Conduta Calculada: ${trtResult.suggestedDose}.${trtResult.hcgDose ? ` HCG Calculado: ${trtResult.hcgDose}.` : ""} Exames: Testo: ${trtSerumTesto} ng/dL, Ht: ${trtHematocrit || "N/A"}%, PSA: ${trtPSA || "N/A"} ng/mL, Estradiol: ${trtEstradiol || "N/A"} pg/mL.`;
                                  p.notas = p.notas ? `${p.notas}\n\n${notaSinc}` : notaSinc;
                                  
                                  // 4. Salvar de volta no localStorage
                                  pacientes[matchedIdx] = p;
                                  localStorage.setItem("protouro_pacientes_db", JSON.stringify(pacientes));
                                  
                                  // 5. Salvar payload temporário para auto-preenchimento do modelo de receita Flukkahormo
                                  const payloadSinc = {
                                    pacienteNome: p.nome,
                                    trtDose: trtResult.suggestedDose,
                                    hcgDose: trtResult.hcgDose || null,
                                    frequencia: trtResult.frequency,
                                    data: dataPonto
                                  };
                                  localStorage.setItem("protoUro_trt_sync_payload", JSON.stringify(payloadSinc));
                                  
                                  toast.success(`Dados sincronizados com sucesso no prontuário de ${p.nome}! O modelo de receita Flukkahormo foi atualizado.`);
                                } catch (err) {
                                  console.error(err);
                                  toast.error("Erro ao sincronizar dados com o CRM.");
                                }
                              }}
                              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl mt-2 font-bold shadow-sm"
                            >
                              <Activity className="w-3.5 h-3.5 animate-pulse" />
                              Sincronizar com {activePatientName}
                            </Button>
                          );
                        })()}

                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={resetTRT} className="flex-1 gap-2 border-border hover:bg-secondary rounded-xl">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Limpar
                          </Button>
                        </div>
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

          {/* ABA CLEARANCE CREATININA */}
          <TabsContent value="clearance" className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-serif font-bold text-primary">Clearance de Creatinina (Cockcroft-Gault)</CardTitle>
                <CardDescription className="text-xs">
                  Estimativa da taxa de filtração glomerular para ajuste de dose de medicamentos e avaliação pré-contraste.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-primary uppercase tracking-wider">Idade (anos)</Label>
                        <Input 
                          type="number" 
                          placeholder="Ex: 65" 
                          value={crAge} 
                          onChange={(e) => setCrAge(e.target.value)}
                          className="rounded-xl border-border bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-primary uppercase tracking-wider">Peso (kg)</Label>
                        <Input 
                          type="number" 
                          placeholder="Ex: 80" 
                          value={crWeight} 
                          onChange={(e) => setCrWeight(e.target.value)}
                          className="rounded-xl border-border bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary uppercase tracking-wider">Creatinina Sérica (mg/dL)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Ex: 1.1" 
                        value={crCreatinine} 
                        onChange={(e) => setCrCreatinine(e.target.value)}
                        className="rounded-xl border-border bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary uppercase tracking-wider">Sexo Biológico</Label>
                      <div className="flex gap-4">
                        <Button 
                          type="button"
                          variant={crGender === "male" ? "default" : "outline"}
                          onClick={() => setCrGender("male")}
                          className="w-full rounded-xl"
                        >
                          Masculino
                        </Button>
                        <Button 
                          type="button"
                          variant={crGender === "female" ? "default" : "outline"}
                          onClick={() => setCrGender("female")}
                          className="w-full rounded-xl"
                        >
                          Feminino
                        </Button>
                      </div>
                    </div>

                    {crResult && (
                      <Button onClick={resetClearance} variant="outline" className="w-full py-6 rounded-xl text-sm font-semibold border-border">
                        Limpar Dados
                      </Button>
                    )}

                    {!crResult && (
                      <Button onClick={calculateClearance} className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md">
                        Calcular Clearance
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    {crResult ? (
                      <div className={`p-6 rounded-xl border space-y-4 ${crResult.color}`}>
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Clearance de Creatinina Estimado</p>
                          <h3 className="text-3xl font-serif font-bold leading-none">{crResult.clearance} <span className="text-sm font-sans font-normal opacity-80">mL/min</span></h3>
                        </div>
                        
                        <div className="space-y-1 border-t border-current/10 pt-3">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Classificação</p>
                          <p className="text-sm font-semibold">{crResult.classification}</p>
                        </div>

                        <div className="p-3 bg-white/40 dark:bg-black/20 rounded-lg text-xs space-y-1 border border-current/10">
                          <p className="font-bold uppercase tracking-wider opacity-90 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" /> Conduta e Ajuste de Dose
                          </p>
                          <p className="opacity-90 leading-relaxed">{crResult.tip}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-xl p-8 text-center space-y-2">
                        <Calculator className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                        <h4 className="text-sm font-semibold text-muted-foreground">Aguardando dados de entrada</h4>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          Insira a idade, peso, creatinina sérica e sexo do paciente para estimar a taxa de filtração glomerular.
                        </p>
                      </div>
                    )}
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
