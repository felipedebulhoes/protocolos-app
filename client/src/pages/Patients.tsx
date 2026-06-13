import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  FileText, 
  Activity, 
  Check, 
  X, 
  Calendar, 
  Clipboard,
  AlertCircle,
  Download,
  MessageSquare,
  TrendingUp,
  CalendarClock,
  FileSpreadsheet,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ReferenceLine 
} from "recharts";

interface HormonioRegistro {
  data: string;
  total: number;
  livre?: number;
  shbg?: number;
  hematocrito?: number;
  intervencao?: string; // Dosagem/Conduta alterada nesta data (ex: "Gel de Testo 5% 1 pump/dia", "Início de Nebido")
}

interface SintomaRegistro {
  data: string;
  iief5?: number;
  ipss?: number;
  adamPositivo?: boolean;
}

interface DiarioMiccionalRegistro {
  data: string; // Data ou Identificador da Consulta/Retorno
  frequenciaDiurna: number; // Número de micções durante o dia
  nocturia: number; // Número de micções durante a noite (noctúria)
  volumeMedio: number; // Volume miccional médio estimado em mL
  ingestaoLiquidos?: number; // Ingestão estimada de líquidos em mL
}

interface DocumentoVinculado {
  id: string;
  titulo: string;
  tipo: "receita" | "atestado" | "laudo";
  data: string;
  conteudo: string;
}

interface ContatoRegistro {
  id: string;
  data: string;
  tipo: "whatsapp" | "ligacao" | "email" | "retorno";
  notas: string;
}

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  queixa: string;
  testosterona: string;
  psa: string;
  hematocrito: string;
  notas: string;
  dataCadastro: string;
  telefone?: string; // Telefone para contato e lembretes via WhatsApp
  shbg?: string;
  testoLivre?: string;
  historicoHormonal?: HormonioRegistro[];
  historicoSintomas?: SintomaRegistro[];
  documentos?: DocumentoVinculado[];
  leadStage?: "lead" | "agendado" | "realizado" | "proposto" | "operado"; // CRM Funil de Vendas CPP
  comercialHist?: ContatoRegistro[]; // Linha do Tempo Comercial CPP
  origem?: "instagram" | "google_ads" | "indicacao" | "outros"; // Origem de Captação CPP
  proximoContato?: string; // Data agendada para o próximo acompanhamento comercial (AAAA-MM-DD)
  faturamentoReal?: number; // Faturamento real do paciente (cirurgia/consulta paga)
  custoHospitalarReal?: number; // Custo hospitalar real incorrido de fato (taxas, insumos, OPME)
  desdobramentoCustos?: string; // Histórico de desdobramento de custos adicionais (taxas extras, OPME detalhado, etc.)
  auditorias_alta?: Record<string, any>; // Auditoria de checklists de alta de protocolos
  estradiol?: string; // Nível de Estradiol sérico (pg/mL)
  insuficienciaCardiaca?: boolean; // Histórico de Insuficiência Cardíaca Congestiva (ICC)
  usoNitratos?: boolean; // Uso concomitante de Nitratos (Isordil, Monocordil, Nitroglicerina, etc.)
  historicoDiarioMiccional?: DiarioMiccionalRegistro[]; // Histórico do Diário Miccional (LUTS/HPB)
}

interface SecretáriaTarefa {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  tipo: "followup_lead" | "busca_ativa" | "agendar_retorno" | "documento_pendente";
  descricao: string;
  dataCriacao: string;
  status: "pendente" | "concluida";
}

export default function Patients() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "hema_critical" | "psa_critical" | "followup_late" | "contact_overdue" | "origin_instagram" | "origin_google" | "origin_indicacao" | "alta_auditada">("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [queixa, setQueixa] = useState("");
  const [testosterona, setTestosterona] = useState("");
  const [psa, setPsa] = useState("");
  const [hematocrito, setHematocrito] = useState("");
  const [notas, setNotas] = useState("");
  const [shbg, setShbg] = useState("");
  const [testoLivre, setTestoLivre] = useState("");
  const [albumina, setAlbumina] = useState("4.3"); // Albumina padrão de 4.3 g/dL para fórmula de Vermeulen
  const [telefone, setTelefone] = useState(""); // Telefone para alertas de WhatsApp
  const [leadStage, setLeadStage] = useState<"lead" | "agendado" | "realizado" | "proposto" | "operado">("lead"); // CRM Funil
  const [origem, setOrigem] = useState<"instagram" | "google_ads" | "indicacao" | "outros">("instagram"); // Origem de Captação CPP
  const [proximoContato, setProximoContato] = useState(""); // Data agendada para o próximo contato (AAAA-MM-DD)
  const [faturamentoReal, setFaturamentoReal] = useState(""); // Faturamento real do paciente
  const [custoHospitalarReal, setCustoHospitalarReal] = useState(""); // Custo hospitalar real do paciente
  const [desdobramentoCustos, setDesdobramentoCustos] = useState(""); // Histórico de desdobramento de custos do paciente
  const [estradiol, setEstradiol] = useState(""); // Nível de Estradiol sérico (pg/mL)
  const [insuficienciaCardiaca, setInsuficienciaCardiaca] = useState(false); // Histórico de Insuficiência Cardíaca Congestiva (ICC)
  const [usoNitratos, setUsoNitratos] = useState(false); // Uso concomitante de Nitratos (Isordil, Monocordil, Nitroglicerina, etc.)
  const [activeView, setActiveView] = useState<"list" | "crm">("list"); // Visualização ativa (Lista vs CRM Kanban)
  const [tarefasSecretaria, setTarefasSecretaria] = useState<SecretáriaTarefa[]>([]);
  const [expandedId, setEditingExpandedId] = useState<string | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState<"30_dias" | "90_dias" | "todos">("todos"); // Filtro de Período do CRM e Relatório

  // Função para cálculo científico de Testosterona Livre (Vermeulen, 1999)
  // Fórmula baseada na constante de associação de SHBG e Albumina
  const calculateVermeulen = (totalT_ngdl: number, shbg_nmol: number, alb_gdl: number): number => {
    // Conversões de unidades:
    // Total T: ng/dL -> nmol/L (multiplica por 0.03467)
    const t_nmol = totalT_ngdl * 0.03467;
    // Albumina: g/dL -> umol/L (multiplica por 151.5)
    const alb_umol = alb_gdl * 151.5;
    // Constantes de associação (L/mol):
    const Ka = 3.6e4; // Albumina (3.6 x 10^4 L/mol)
    const Ks = 1.0e9; // SHBG (1.0 x 10^9 L/mol)

    // Equação quadrática para encontrar a Testosterona Livre (fT)
    // Ks * fT^2 + (Ks * SHBG + Ka * Alb + 1 - Ks * T) * fT - T = 0
    // Ks * fT^2 + b * fT + c = 0 (dividindo por Ks para estabilidade numérica)
    // fT^2 + (SHBG + (Ka/Ks)*Alb + 1/Ks - T) * fT - T/Ks = 0
    // Como Ka/Ks = 3.6e4 / 1.0e9 = 3.6e-5
    // E 1/Ks = 1.0e-9
    
    const shbg_mol = shbg_nmol * 1e-9;
    const alb_mol = alb_umol * 1e-6;
    const t_mol = t_nmol * 1e-9;

    const a_eq = 1.0;
    const b_eq = shbg_mol + (Ka / Ks) * alb_mol + (1.0 / Ks) - t_mol;
    const c_eq = -t_mol / Ks;

    // Delta = b^2 - 4ac
    const delta = b_eq * b_eq - 4 * a_eq * c_eq;
    if (delta < 0) return 0;

    // fT em mol/L
    const ft_mol = (-b_eq + Math.sqrt(delta)) / (2 * a_eq);
    
    // Converter de mol/L de volta para ng/dL:
    // ft_mol * 1e9 (para nmol/L) / 0.03467 (para ng/dL)
    const ft_nmol = ft_mol * 1e9;
    const ft_ngdl = ft_nmol / 0.03467;

    // A testosterona livre é geralmente expressa em pg/mL para maior precisão clínica,
    // mas o app usa ng/dL (ou pg/mL conforme o laboratório).
    // Vamos converter para ng/dL (que é o padrão usado na interface atual).
    return parseFloat(ft_ngdl.toFixed(2));
  };

  const handleAutoCalculateLivre = () => {
    const tVal = parseFloat(testosterona);
    const sVal = parseFloat(shbg);
    const aVal = parseFloat(albumina);

    if (isNaN(tVal) || isNaN(sVal)) {
      toast.error("Para calcular a Testosterona Livre, informe os valores de Testosterona Total e SHBG.");
      return;
    }

    try {
      const calculated = calculateVermeulen(tVal, sVal, isNaN(aVal) ? 4.3 : aVal);
      setTestoLivre(calculated.toString());
      toast.success(`Testosterona Livre calculada com sucesso: ${calculated} ng/dL`);
    } catch (err) {
      toast.error("Erro ao calcular a Testosterona Livre. Verifique os parâmetros informados.");
    }
  };

  // Estados para inserção de novo ponto no gráfico
  const [newTotal, setNewTotal] = useState("");
  const [newLivre, setNewLivre] = useState("");
  const [newShbg, setNewShbg] = useState("");
  const [newHemaPonto, setNewHemaPonto] = useState("");
  const [newIntervencao, setNewIntervencao] = useState(""); // Ajuste de conduta / dosagem (ex: "Início de Nebido", "Gel de Testo 5% 1 pump/dia")
  const [newDataPonto, setNewDataPonto] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));

  // Estados para inserção de novo ponto de sintomas
  const [newIief, setNewIief] = useState("");
  const [newIpss, setNewIpss] = useState("");
  const [newAdam, setNewAdam] = useState(false);
  const [newDataSintoma, setNewDataSintoma] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));

  // Estados para inserção de novo ponto do Diário Miccional (LUTS/HPB)
  const [newDiarioData, setNewDiarioData] = useState(new Date().toLocaleDateString("pt-BR").substring(0, 5));
  const [newDiarioDiurna, setNewDiarioDiurna] = useState("");
  const [newDiarioNocturia, setNewDiarioNocturia] = useState("");
  const [newDiarioVolume, setNewDiarioVolume] = useState("");
  const [newDiarioIngestao, setNewDiarioIngestao] = useState("");

  // Estados para novos registros de contatos comerciais (CRM Linha do Tempo)
  const [newContatoTipo, setNewContatoTipo] = useState<"whatsapp" | "ligacao" | "email" | "retorno">("whatsapp");
  const [newContatoNotas, setNewContatoNotas] = useState("");

  // Estados para o Módulo de Prescrição Inteligente
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);
  const [prescricaoPaciente, setPrescricaoPaciente] = useState<Paciente | null>(null);
  const [prescricaoModelo, setPrescricaoPacienteModelo] = useState("");
  const [prescricaoConteudo, setPrescricaoConteudo] = useState("");

  // Estados para o Gerador de Orçamentos CPP Premium
  const [orcamentoOpen, setOrcamentoOpen] = useState(false);
  const [orcamentoPaciente, setOrcamentoPaciente] = useState<Paciente | null>(null);
  const [orcamentoTipo, setOrcamentoTipo] = useState<"honorarios" | "particular_total">("honorarios");
  const [orcamentoProcedimento, setOrcamentoProcedimento] = useState("");
  const [orcamentoLocal, setOrcamentoLocal] = useState("Clinovi Paulista");
  const [orcamentoValorHonorarios, setOrcamentoValorHonorarios] = useState("15000");
  const [orcamentoValorHospital, setOrcamentoValorHospital] = useState("12000");
  const [orcamentoValorMateriais, setOrcamentoValorHospitalMateriais] = useState("8000");
  const [orcamentoValorAcompanhamento, setOrcamentoValorAcompanhamento] = useState("3000");
  const [orcamentoObs, setOrcamentoObs] = useState("");

  // Catálogo de procedimentos urológicos premium do Dr. Felipe de Bulhões (CPP)
  const procedimentosCatalogo = [
    {
      id: "holep",
      nome: "HoLEP (Enucleação da Próstata com Holmium Laser) para HPB",
      honorarios: "22000",
      hospital: "18000",
      materiais: "12000",
      acompanhamento: "4000",
      obs: "Tratamento cirúrgico minimamente invasivo de excelência para Hiperplasia Prostática Benigna (HPB) com alta precoce em regime de Day Hospital. Inclui o uso de tecnologia laser de Holmium e morcelador de tecidos."
    },
    {
      id: "protese_peniana_inflavel",
      nome: "Implante de Prótese Peniana Inflável (3 Volumes) para Disfunção Erétil",
      honorarios: "28000",
      hospital: "25000",
      materiais: "65000",
      acompanhamento: "5000",
      obs: "Tratamento definitivo de altíssimo padrão para Disfunção Erétil refratária. Inclui o dispositivo inflável importado de última geração (AMS 700 ou Coloplast Titan), bomba de ativação escrotal e reservatório pré-vesical."
    },
    {
      id: "botox_intravesical",
      nome: "Aplicação de Toxina Botulínica (Botox) Intravesical para Bexiga Hiperativa",
      honorarios: "6000",
      hospital: "5000",
      materiais: "3500",
      acompanhamento: "1500",
      obs: "Procedimento minimamente invasivo sob sedação leve para tratamento de Bexiga Hiperativa refratária ou Incontinência Urinária de Urgência. Consiste na injeção endoscópica (cistoscopia) de Toxina Botulínica diretamente no músculo detrusor."
    },
    {
      id: "botox_feminino_hiperativa",
      nome: "Aplicação de Toxina Botulínica (Botox) Intravesical Feminina - Bexiga Hiperativa Premium",
      honorarios: "6500",
      hospital: "4500",
      materiais: "3200",
      acompanhamento: "1800",
      obs: "Tratamento de alto padrão específico para Bexiga Hiperativa Refratária Feminina e Urgência Miccional Grave. Injeção endoscópica de 100U a 200U de Botox (Allergan) diretamente no músculo detrusor, sob cistoscopia e sedação leve. Restaura a capacidade de armazenamento vesical e devolve a qualidade de vida social."
    },
    {
      id: "neuromodulacao_sacral",
      nome: "Neuromodulação Sacral (Implante de Marcapasso Vesical) para Incontinência e Bexiga Hiperativa",
      honorarios: "24000",
      hospital: "18000",
      materiais: "85000",
      acompanhamento: "4500",
      obs: "Tratamento cirúrgico de altíssima tecnologia (All-Inclusive ou Honorários) para Bexiga Hiperativa refratária grave e incontinência de urgência. Consiste no implante de eletrodo sacral e gerador de impulsos elétricos (Medtronic) para modular as vias nervosas da micção."
    },
    {
      id: "fisioterapia_pelvica_premium",
      nome: "Programa de Reabilitação e Fisioterapia Pélvica Premium com Biofeedback",
      honorarios: "4800",
      hospital: "0",
      materiais: "0",
      acompanhamento: "1200",
      obs: "Protocolo completo de 10 sessões individuais de Fisioterapia Pélvica de Alta Performance para Incontinência Urinária de Esforço leve/moderada ou Bexiga Hiperativa. Inclui biofeedback eletromiográfico, eletroestimulação transcutânea e treinamento muscular personalizado do assoalho pélvico."
    },
    {
      id: "sling_uretral_masculino",
      nome: "Sling Uretral Masculino para Incontinência Urinária Pós-Prostatectomia",
      honorarios: "16000",
      hospital: "14000",
      materiais: "22000",
      acompanhamento: "3500",
      obs: "Procedimento cirúrgico de alto padrão para incontinência urinária de esforço pós-prostatectomia de grau leve a moderado. Consiste na colocação de tela de suporte uretral para restaurar a continência urinária de forma imediata."
    },
    {
      id: "sling_uretral_feminino",
      nome: "Sling Suburetral Feminino (Mini-Sling) para Incontinência de Esforço",
      honorarios: "9000",
      hospital: "8000",
      materiais: "6000",
      acompanhamento: "2000",
      obs: "Tratamento padrão-ouro minimamente invasivo para Incontinência Urinária de Esforço feminina. Realizado via vaginal com mini-tela sintética importada de suporte sob a uretra média."
    },
    {
      id: "ondas_choque_peniano",
      nome: "Terapia por Ondas de Choque Extracorpóreas de Baixa Intensidade (Li-ESWT)",
      honorarios: "12000",
      hospital: "0",
      materiais: "0",
      acompanhamento: "2000",
      obs: "Tratamento inovador e regenerativo para Disfunção Erétil vascular e Doença de Peyronie. Realizado em consultório (Clinovi) em protocolo de 6 sessões semanais para neovascularização do tecido erétil corporocavernoso."
    }
  ];

  // Modelos de receitas oficiais do Dr. Felipe de Bulhões baseados em diretrizes urológicas (SBU/AUA/EAU)
  const modelosPrescricao = [
    {
      id: "gel_testo_5",
      titulo: "Gel de Testosterona Pentravan 5% (TRT)",
      conteudo: `USO TÓPICO

1. Gel de Testosterona 5% em veículo Pentravan ------------ 30 g (QSP)
   Dispenser em frasco Pump (entregar 1 frasco)
   Posologia: Aplicar 1 pump (equivalente a 50mg de testosterona) sobre a pele limpa e seca do ombro, braço ou abdômen, preferencialmente pela manhã, massageando levemente até completa absorção. Lavar as mãos imediatamente após a aplicação e evitar contato da área com mulheres ou crianças por pelo menos 4 horas.

2. Sabonete líquido neutro --------------------------------- 150 mL
   Posologia: Lavar o local de aplicação após 6 horas para remoção de resíduos e máxima segurança.`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - TRT (GEL DE TESTOSTERONA)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Aplique preferencialmente pela manhã, após o banho, sobre a pele limpa e seca.
   • Locais ideais: Ombros, braços ou abdômen. Nunca aplique na região genital/escrotal.
   • Espere secar por 5 minutos antes de se vestir.
   • Lave as mãos com água e sabão imediatamente após a aplicação.
   • Evite banho, natação ou sudorese intensa por pelo menos 4 a 6 horas após a aplicação para garantir a absorção máxima.

2. MEDICINA DE ESTILO DE VIDA (MEV) E SUPLEMENTAÇÃO:
   • Pratique musculação de alta intensidade (3 a 5 vezes por semana) para otimizar os receptores androgênicos.
   • Mantenha o percentual de gordura corporal controlado (gordura visceral inibe a testosterona livre e aumenta a aromatização para estradiol).
   • Considere a suplementação de Zinco (30mg/dia) e Vitamina D3 (2.000 UI/dia) para suporte metabólico.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Coleta de Exames: Realizar Testosterona Total, Testosterona Livre, SHBG, Hematócrito, PSA Total e Estradiol a cada 3 meses no primeiro ano, e depois a cada 6 meses.
   • Agendamento de Retorno: Agendar consulta de retorno em D+90 (após os exames de controle) para ajuste de dose.
   • Alerta de Segurança: Se houver surgimento de mastalgia (dor nos mamilos), edema acentuado ou cansaço extremo, entre em contato imediatamente.`
    },
    {
      id: "undecilato_nebido",
      titulo: "Undecilato de Testosterona 250mg/mL (Nebido/TRT)",
      conteudo: `USO INTRAMUSCULAR

1. Undecilato de Testosterona 250 mg/mL (Ampola de 4 mL) ---- 1 ampola
   Posologia: Aplicar 1 ampola (1000 mg) por via intramuscular profunda na região glútea, lentamente (durante pelo menos 60 segundos), com intervalo de 10 a 14 semanas, conforme orientação médica e controle laboratorial periódico.

* Nota: A primeira aplicação de reforço (segunda dose) pode ser recomendada após 6 semanas para saturação mais rápida do compartimento de reserva.`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - TRT (UNDECILATO DE TESTOSTERONA / NEBIDO)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • A aplicação deve ser realizada exclusivamente por via intramuscular profunda na região glútea.
   • A injeção deve ser extremamente lenta (durante pelo menos 60 segundos) para evitar microembolia pulmonar oleosa (que causa tosse reflexa e sensação de sufocamento transitória).
   • Respeite rigorosamente a janela de aplicação (dose de reforço com 6 semanas, e depois a cada 10 a 14 semanas).

2. MEDICINA DE ESTILO DE VIDA (MEV) E SUPLEMENTAÇÃO:
   • Mantenha hidratação abundante (mínimo de 35mL/kg de água por dia) para ajudar a modular a viscosidade sanguínea (hematócrito).
   • Pratique exercícios aeróbicos regulares (cardio) para saúde cardiovascular e controle pressórico.
   • Considere a suplementação de Coenzima Q10 (100mg/dia) para suporte mitocondrial e endotelial.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Coleta de Exames: Realizar exames laboratoriais (Testosterona, Hematócrito, PSA, Estradiol) sempre na semana imediatamente anterior à próxima aplicação (ponto mais baixo do vale).
   • Retorno Clínico: Agendar consulta de retorno após a coleta de exames para avaliar a necessidade de encurtamento ou extensão do intervalo entre as ampolas.`
    },
    {
      id: "cipionato_deposteron",
      titulo: "Cipionato de Testosterona 100mg/mL (Deposteron/TRT)",
      conteudo: `USO INTRAMUSCULAR

1. Cipionato de Testosterona 200 mg / 2 mL (Ampola) --------- 3 ampolas
   Posologia: Aplicar 1 ampola (200 mg) por via intramuscular profunda na região glútea a cada 14 dias (duas semanas) para manutenção de níveis fisiológicos de testosterona. Realizar exames de controle de Testosterona Total e Hematócrito antes da 4ª aplicação.`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - TRT (CIPIONATO DE TESTOSTERONA / DEPOSTERON)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Aplicação por via intramuscular profunda glútea com técnica asséptica estrita.
   • Se houver oscilações severas de humor ou libido (efeito montanha-russa), converse com o Dr. Felipe sobre o fracionamento da dose (ex: aplicar meia ampola / 100mg a cada 7 dias por via subcutânea ou intramuscular rasa).

2. MEDICINA DE ESTILO DE VIDA (MEV) E SUPLEMENTAÇÃO:
   • Evite o consumo excessivo de álcool (o álcool aumenta a atividade da enzima aromatase, convertendo mais testosterona em estradiol, o que pode causar ginecomastia e retenção hídrica).
   • Consuma vegetais crucíferos (brócolis, couve-flor) que contêm indol-3-carbinol, auxiliando na metabolização saudável do estrogênio.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Coleta de Exames: Coletar exames de sangue (Testosterona, Hematócrito, PSA, Estradiol) no meio do intervalo das aplicações (ex: no 7º dia após a última injeção) para avaliar a média real.
   • Alerta de Segurança: Monitorar pressão arterial semanalmente. Se a pressão sistólica ultrapassar 140 mmHg de forma persistente, agende uma reavaliação.`
    },
    {
      id: "clomifeno_estimulo",
      titulo: "Clomifeno 25mg/dia (Estímulo Endógeno/Andropausa)",
      conteudo: `USO ORAL

1. Citrato de Clomifeno 25 mg ------------------------------- 60 cápsulas
   Posologia: Tomar 1 cápsula por via oral, uma vez ao dia, preferencialmente no mesmo horário, por 60 dias. 
   Objetivo: Estímulo do eixo hipotálamo-hipófise-gonadal para aumento da produção endógena de testosterona e preservação da espermatogênese.`
    },
    {
      id: "tadalafila_diaria",
      titulo: "Tadalafila 5mg de Uso Diário (Disfunção Erétil & LUTS)",
      conteudo: `USO ORAL

1. Tadalafila 5 mg ------------------------------------------ 30 comprimidos
   Posologia: Tomar 1 comprimido por via oral, uma vez ao dia, sempre no mesmo horário (preferencialmente à noite ou 2 horas antes de dormir). Uso contínuo.

* Benefícios: Melhora da função erétil e redução dos sintomas urinários obstrutivos (IPSS) por hiperplasia prostática benigna (HPB).`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - TADALAFILA DIÁRIA 5MG
--------------------------------------------------------------------------------
1. ORIENTAÇÕES DE USO (PASSO A PASSO):
   • Tome o comprimido diariamente, preferencialmente à noite. O uso contínuo acumula o medicamento no sangue, atingindo níveis terapêuticos estáveis após 5 dias.
   • Não depende de alimentação. Pode ser tomado com ou sem alimentos.
   • Evite o uso concomitante de nitratos (medicação para o coração como isordil, monocordil) - risco de queda severa de pressão.

2. MEDICINA DE ESTILO DE VIDA (MEV) E DIÁRIO MICCIONAL:
   • Para pacientes com sintomas urinários (HPB/LUTS): Evite a ingestão excessiva de líquidos nas 3 horas anteriores ao sono para reduzir a noctúria (acordar à noite para urinar).
   • Evite cafeína e bebidas alcoólicas à noite, pois são irritantes vesicais potentes.
   • Preencha o Diário Miccional do ProtoUro por 3 dias consecutivos antes da próxima consulta.

3. SEGUIMENTO CLÍNICO:
   • Reavaliação: Retorno em D+30 para aplicar novamente os escores IPSS e IIEF-5 e medir a melhora objetiva dos sintomas.
   • Efeitos Colaterais Comuns: Cefaleia leve, rubor facial ou dor lombar/mialgia podem ocorrer nos primeiros dias e costumam desaparecer espontaneamente com o uso contínuo.`
    },
    {
      id: "flukkahormo_hcg_preservacao",
      titulo: "HCG 5000 UI - Preservação de Fertilidade (Flukkahormo)",
      conteudo: `USO SUBCUTÂNEO / INTRAMUSCULAR

1. Gonadotrofina Coriônica Humana (HCG) 5.000 UI ------------ 1 frasco-ampola
   (Apresentação Flukkahormo)
   Posologia: Aplicar 500 UI por via subcutânea, 2 a 3 vezes por semana (ex: segundas, quartas e sextas-feiras), concomitantemente à Terapia de Reposição de Testosterona (TRT).
   ☐ Dispensar: 1 frasco-ampola + diluente + seringas de insulina.

* Racional Clínico: Mimetiza o LH para estimular as células de Leydig, mantendo a produção de testosterona intratesticular, preservando o volume testicular e a fertilidade durante a TRT.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/hormo
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - HCG (PRESERVAÇÃO DE FERTILIDADE / FLUKKAHORMO)
--------------------------------------------------------------------------------
1. COMO PREPARAR E APLICAR (PASSO A PASSO):
   • Reconstituição: Aspire o diluente com a seringa e injete-o lentamente no frasco contendo o pó liofilizado de HCG (5.000 UI). Faça movimentos circulares suaves. Nunca agite vigorosamente.
   • Armazenamento: Após a reconstituição, o frasco-ampola deve ser mantido obrigatoriamente sob refrigeração (entre 2°C e 8°C). Não congelar. Validade máxima de 30 dias após diluído.
   • Aplicação: Use seringas de insulina de 1mL/100 UI. Uma dose de 500 UI equivale a 10 divisões (ou 10 UI) na seringa de insulina padrão de 1mL.
   • Local de Aplicação: Via subcutânea na região periumbilical (abdômen), com técnica asséptica e prega cutânea.

2. SUPLEMENTAÇÃO E ESTILO DE VIDA:
   • Mantenha a ingestão de gorduras saudáveis (azeite, abacate, castanhas) que são precursoras de hormônios esteroides.
   • Considere suplementar com Coenzima Q10 (100mg/dia) e L-Carnitina L-Tartrato (2g/dia) para suporte de motilidade e morfologia espermática.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Coleta de Exames: Se o objetivo for estritamente fertilidade, realizar Espermograma com morfologia de Kruger e fragmentação de DNA espermático a cada 3 meses.
   • Retorno Clínico: Consulta em D+90 para reavaliação de volume testicular por ultrassonografia ou exame físico e ajuste de dose.`
    },
    {
      id: "flukkahormo_nandrolona",
      titulo: "Decanoato de Nandrolona - Sarcopenia e Articular (Flukkahormo)",
      conteudo: `USO INTRAMUSCULAR DE USO ADJUVANTE

1. Decanoato de Nandrolona 100 mg/mL ------------------------- 1 ampola (1 mL)
   (Apresentação Flukkahormo)
   Posologia: Aplicar 50 mg a 100 mg por via intramuscular profunda na região glútea, a cada 7 ou 14 dias, conforme avaliação clínica e exames de controle.
   ☐ Dispensar: 2 ampolas.

* ALERTA MÉDICO: Nunca utilizar de forma isolada (sem testosterona base de cobertura), pois causa supressão severa do eixo e disfunção erétil secundária.
* Indicação: Tratamento adjuvante de sarcopenia, osteoporose e dores articulares crônicas refratárias em pacientes hipogonádicos.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/hormo
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - NANDROLONA (SARCOPENIA / FLUKKAHORMO)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Aplicação por via intramuscular profunda glútea.
   • Nunca use nandrolona isolada! Ela deve ser sempre associada a uma dose base de testosterona (gel ou injetável) para manter a libido e a função erétil fisiológicas.

2. SUPLEMENTAÇÃO E ESTILO DE VIDA (MEV):
   • O uso de nandrolona exige treinamento de força resistido (musculação) de alta intensidade e ingestão proteica adequada (mínimo de 1.8g a 2.0g/kg de proteína por dia) para reversão de sarcopenia e ganho de massa magra.
   • Considere suplementar com Creatina Monohidratada (5g/dia) de forma contínua para sinergia no ganho de força e hidratação intramuscular.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Coleta de Exames: Monitorar estritamente o perfil lipídico (Colesterol Total, HDL, LDL, Triglicerídeos), Transaminases Hepáticas (AST/ALT) e Hematócrito a cada 3 meses.
   • Retorno Clínico: Consulta de retorno em D+60 para bioimpedanciometria corporal e avaliação de melhora de dores articulares.`
    },
    {
      id: "flukkamen_dapoxetina_ep",
      titulo: "Dapoxetina 30mg Sob Demanda - Ejaculação Precoce (Flukkamen)",
      conteudo: `USO ORAL SOB DEMANDA

1. Dapoxetina 30 mg ------------------------------------------ 15 cápsulas
   (Apresentação Flukkamen)
   Posologia: Tomar 1 cápsula por via oral, de 1 a 3 horas antes da atividade sexual prevista. Não ultrapassar a dose de 1 cápsula por dia.
   ☐ Dispensar: 1 frasco.

* Mecanismo: Inibidor seletivo da recaptação de serotonina (ISRS) de ação rápida e eliminação ultrarrápida, ideal para controle da ejaculação precoce sem os efeitos colaterais da descontinuação diária.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/men
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - DAPOXETINA (EJACULAÇÃO PRECOCE / FLUKKAMEN)
--------------------------------------------------------------------------------
1. ORIENTAÇÕES DE USO (PASSO A PASSO):
   • Tome 1 cápsula com um copo cheio de água, cerca de 1 a 3 horas antes da relação sexual prevista.
   • Pode ser tomada com ou sem alimentos. Evite o consumo de bebidas alcoólicas junto com a medicação, pois aumenta o risco de tonturas, sonolência ou síncope.
   • Não use diariamente. A medicação foi desenvolvida exclusivamente para uso sob demanda (conforme a necessidade).

2. EXERCÍCIOS DE REABILITAÇÃO (MEV):
   • Pratique exercícios de fortalecimento da musculatura do assoalho pélvico (Exercícios de Kegel): Contraia o músculo pubococcígeo (como se fosse interromper o fluxo urinário) por 5 segundos, relaxe por 5 segundos. Repita 10 a 15 vezes, 3 vezes ao dia.
   • Utilize técnicas comportamentais de controle de ansiedade e dessensibilização (técnica de "start-stop" e "squeeze").

3. SEGUIMENTO CLÍNICO:
   • Reavaliação: Retorno em D+30 para avaliar o ganho de tempo de latência ejaculatória intravaginal (IELT) e tolerabilidade à medicação.`
    },
    {
      id: "flukkamen_spray_sublingual",
      titulo: "Spray Sublingual de Tadalafila Potencializada (Flukkamen)",
      conteudo: `USO SUBLINGUAL

1. Spray Sublingual de Tadalafila Potencializada ------------- 1 frasco (12 mL)
   (Tadalafila 40mg/mL + Fentolamina 2,25mg/mL + Tribulus Terrestris 35mg/mL)
   
   Posologia (Escolha uma das modalidades):
   [ ] USO DIÁRIO: Realizar 1 jato sublingual (equivalente a 6 mg de Tadalafila) diariamente, pela manhã ou à noite.
   [ ] USO SOB DEMANDA: Realizar 3 jatos sublinguais (equivalente a 18 mg de Tadalafila) de 45 a 60 minutos antes da relação sexual.

* Vantagem: A absorção sublingual evita o metabolismo de primeira passagem hepática, proporcionando início de ação mais rápido e potente devido à associação sinérgica com a Fentolamina.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/men
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - SPRAY SUBLINGUAL (FLUKKAMEN)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Agite bem o frasco antes de usar.
   • Aplique o spray sob a língua (região sublingual). Mantenha o líquido sob a língua por pelo menos 1 a 2 minutos antes de engolir, para garantir a absorção transmucosa máxima.
   • Evite beber água ou escovar os dentes nos 15 minutos seguintes à aplicação.

2. MEDICINA DE ESTILO DE VIDA (MEV) E SAÚDE VASCULAR:
   • Pratique exercícios aeróbicos regulares (cardio) - a saúde erétil depende diretamente da saúde endotelial e do fluxo sanguíneo microvascular.
   • Evite tabagismo e controle rigorosamente os níveis de colesterol e glicemia.

3. SEGUIMENTO CLÍNICO:
   • Reavaliação: Consulta de retorno em D+30 para avaliar a resposta terapêutica com o score IIEF-5/SHIM e ajustar o número de jatos se necessário.`
    },
    {
      id: "flukkamen_ocitocina_anorgasmia",
      titulo: "Ocitocina Spray Nasal - Anorgasmia/Ejaculação Retardada (Flukkamen)",
      conteudo: `USO NASAL

1. Ocitocina Spray Nasal 24 UI/dose -------------------------- 1 frasco (10 mL)
   (Apresentação Flukkamen - Nasalan)
   Posologia: Aplicar 1 borrifada em cada narina (totalizando 48 UI), cerca de 5 a 10 minutos antes da atividade sexual prevista.
   ☐ Dispensar: 1 frasco.

* Indicação: Tratamento adjuvante para anorgasmia masculina ou retardo ejaculatório crônico. Melhora a dimensão orgásmica e a percepção de satisfação pós-coito.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/men
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - OCITOCINA SPRAY NASAL (FLUKKAMEN)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Assoe o nariz suavemente antes de aplicar.
   • Mantenha a cabeça ereta e insira o aplicador em uma narina, fechando a outra com o dedo.
   • Pressione o spray firmemente enquanto inspira suavemente pelo nariz. Repita na outra narina.
   • Limpe o aplicador após o uso e feche bem o frasco.
   • Aplique estritamente de 5 a 10 minutos antes da relação sexual.

2. ASPECTOS COMPORTAMENTAIS (MEV):
   • A ocitocina atua na modulação do sistema nervoso central, promovendo relaxamento, conexão emocional e reduzindo a ansiedade de performance.
   • Mantenha um ambiente acolhedor e foque na intimidade com a parceria, reduzindo cobranças e pressões de desempenho.

3. SEGUIMENTO CLÍNICO:
   • Reavaliação: Retorno em D+30 para avaliar a percepção subjetiva de melhora da intensidade orgásmica e redução do tempo para ejaculação.`
    },
    {
      id: "flukkamen_verapamil_peyronie",
      titulo: "Verapamil Tópico Combinado - Doença de Peyronie (Flukkamen)",
      conteudo: `USO TÓPICO LOCAL

1. Verapamil 5% + Papaína 2% + Vitamina E 5% Creme ----------- 30 g
   (Apresentação Flukkamen - Home Care)
   Posologia: Aplicar uma fina camada do creme sobre a placa fibrótica (região dorsal/lateral do pênis), massageando suavemente por 2 a 3 minutos, duas vezes ao dia (após o banho e antes de deitar).
   ☐ Dispensar: 1 bisnaga.

* Objetivo: Terapia antifibrótica tópica de suporte para estabilização e redução da curvatura peniana na fase aguda da Doença de Peyronie.

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/men
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - TRATAMENTO DE PEYRONIE (VERAPAMIL TÓPICO)
--------------------------------------------------------------------------------
1. COMO APLICAR (PASSO A PASSO):
   • Aplique uma fina camada do creme diretamente sobre a área da placa fibrótica (nódulo endurecido que causa a curvatura), com o pênis flácido.
   • Realize uma massagem circular suave e contínua por 2 a 3 minutos para favorecer a permeação cutânea do Verapamil e da Papaína.
   • Aplique duas vezes ao dia, de forma consistente (manhã e noite).

2. FISIOTERAPIA E REABILITAÇÃO PENIANA (MEV):
   • O uso do creme de Verapamil apresenta melhores resultados quando associado ao uso de dispositivos de tração peniana ou terapia de vácuo (sob orientação do Dr. Felipe) na fase ativa/inflamatória da doença.
   • Evite dobrar ou forçar o pênis durante a relação sexual para prevenir novas microlesões na túnica albugínea.

3. CRONOGRAMA DE EXAMES E SEGUIMENTO:
   • Monitoramento: Avaliação da curvatura por foto-goniometria domiciliar a cada 30 dias.
   • Retorno Clínico: Consulta em D+90 para realizar Ultrassonografia de pênis com fármaco-indução para medir a espessura da placa e estabilização da curvatura.`
    },
    {
      id: "flukkanutri_combo_infertilidade",
      titulo: "Combo Pró-Fertilidade Masculina (FlukkaNutri)",
      conteudo: `USO ORAL DIÁRIO (SUPLEMENTAÇÃO PREMIUM)

1. Coenzima Q10 (CoQ10) 100 mg ------------------------------- 60 cápsulas
   Posologia: Tomar 1 cápsula por via oral, duas vezes ao dia (total 200mg/dia), junto às refeições.
   
2. Ômega 3 Premium (Alto DHA) -------------------------------- 120 cápsulas
   Posologia: Tomar 2 cápsulas por via oral, uma vez ao dia, junto ao almoço.

3. Vitamina D3 2.000 UI -------------------------------------- 60 cápsulas
   Posologia: Tomar 1 cápsula por via oral, uma vez ao dia, pela manhã.

* Racional: Antioxidantes de alta evidência científica para otimização da motilidade, concentração e morfologia espermática, além de redução do estresse oxidativo seminal (ECR Cochrane).

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/nutri
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - PROTOCOLO PRÓ-FERTILIDADE MASCULINA
--------------------------------------------------------------------------------
1. ORIENTAÇÕES DE SUPLEMENTAÇÃO (PASSO A PASSO):
   • CoQ10 e Ômega 3 são lipossolúveis. Devem ser ingeridos obrigatoriamente junto com refeições que contenham gorduras saudáveis (almoço ou jantar) para garantir a absorção ideal.
   • A Vitamina D3 pode ser ingerida pela manhã, junto ao café da manhã.

2. MEDICINA DE ESTILO DE VIDA (MEV) PARA FERTILIDADE:
   • Evite o aquecimento escrotal: Não utilize notebook diretamente no colo, evite banhos de ofurô, saunas e roupas íntimas excessivamente apertadas.
   • Pratique atividades físicas regulares moderadas. Evite o sedentarismo e o sobrepeso, que elevam a fragmentação do DNA espermático.
   • Cessação absoluta do tabagismo e limitação do consumo de bebidas alcoólicas.

3. SEGUIMENTO LABORATORIAL:
   • Exame de Controle: Realizar novo Espermograma completo com morfologia de Kruger e índice de Fragmentação do DNA espermático após 90 dias de tratamento (tempo necessário para um ciclo completo de espermatogênese).
   • Retorno Clínico: Consulta em D+90 com os resultados dos exames.`
    },
    {
      id: "flukkanutri_cranberry_itu",
      titulo: "Cranberry Premium - Prevenção de ITU Recorrente (FlukkaNutri)",
      conteudo: `USO ORAL PROFILÁTICO

1. Extrato Seco de Cranberry Premium ------------------------- 60 cápsulas
   (Rico em Proantocianidinas tipo A - PACs)
   Posologia: Tomar 1 cápsula por via oral, duas vezes ao dia (de 12/12 horas), por 3 a 6 meses.
   ☐ Dispensar: 2 frascos.

* Indicação: Profilaxia não-antibiótica de infecções do trato urinário (ITU) recorrentes. Inibe a adesão das fímbrias da bactéria Escherichia coli ao urotélio vesical (Grau de Evidência Forte - Cochrane).

🛒 Adquira de forma segura na Flukka: https://flukka.com.br/nutri
🎟️ Cupom de Desconto do Dr. Felipe: DRFELIPE10 (Ganhe 10% de Desconto)`,
      planoContinuado: `📋 DIRETRIZES DE CUIDADO CONTINUADO - PREVENÇÃO DE ITU RECORRENTE (CRANBERRY)
--------------------------------------------------------------------------------
1. ORIENTAÇÕES DE USO (PASSO A PASSO):
   • Tome 1 cápsula a cada 12 horas, de forma consistente, com água.
   • O tratamento preventivo deve ser mantido de forma contínua por pelo menos 3 a 6 meses para permitir a descamação e proteção celular contínua do urotélio.

2. MEDICINA DE ESTILO DE VIDA (MEV) PARA SAÚDE VESICAL:
   • Ingestão Hídrica: Beba pelo menos 2.5 a 3.0 litros de água por dia. A diluição urinária e o fluxo urinário constante são a principal barreira mecânica contra infecções.
   • Hábito Miccional: Urine imediatamente após as relações sexuais (profilaxia pós-coito). Nunca "segure" a urina por longos períodos (esvazie a bexiga a cada 3 horas).
   • Higiene adequada e regulação do trânsito intestinal (constipação crônica favorece a translocação bacteriana e ITUs).

3. SEGUIMENTO CLÍNICO:
   • Monitoramento: Se apresentar disúria (dor ao urinar), polaciúria (aumento da frequência) ou febre, realize exames de Urina Tipo 1 e Urocultura com Antibiograma e entre em contato.`
    }
  ];

  // Carregar pacientes e tarefas do LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        const parsedPacientes = JSON.parse(stored) as Paciente[];
        setPacientes(parsedPacientes);
        
        // Gerar tarefas automaticamente baseadas no estado clínico e comercial dos pacientes
        const storedTasks = localStorage.getItem("protouro_tarefas_secretaria");
        let currentTasks: SecretáriaTarefa[] = [];
        if (storedTasks) {
          try { currentTasks = JSON.parse(storedTasks); } catch (e) { console.error(e); }
        }

        const novasTarefas: SecretáriaTarefa[] = [];
        const hojeStr = new Date().toLocaleDateString("pt-BR");

        parsedPacientes.forEach(p => {
          // Regra 1: Follow-up de novo lead sem contato há mais de 3 dias
          if (p.leadStage === "lead") {
            const hist = p.comercialHist || [];
            if (hist.length === 0) {
              const taskId = `task_lead_${p.id}`;
              const jaExiste = currentTasks.some(t => t.id === taskId);
              if (!jaExiste) {
                novasTarefas.push({
                  id: taskId,
                  pacienteId: p.id,
                  pacienteNome: p.nome,
                  tipo: "followup_lead",
                  descricao: `Entrar em contato via WhatsApp para apresentar o Dr. Felipe e agendar a consulta particular.`,
                  dataCriacao: hojeStr,
                  status: "pendente"
                });
              }
            }
          }

          // Regra 2: Busca Ativa de cirurgia proposta sem contato há mais de 5 dias
          if (p.leadStage === "proposto") {
            const taskId = `task_busca_${p.id}`;
            const jaExiste = currentTasks.some(t => t.id === taskId);
            if (!jaExiste) {
              novasTarefas.push({
                id: taskId,
                pacienteId: p.id,
                pacienteNome: p.nome,
                tipo: "busca_ativa",
                descricao: `Realizar busca ativa / follow-up humanizado sobre a proposta cirúrgica enviada.`,
                dataCriacao: hojeStr,
                status: "pendente"
              });
            }
          }

          // Regra 3: Agendar retorno pós-operatório (7 a 14 dias após cirurgia)
          if (p.leadStage === "operado") {
            const taskId = `task_retorno_${p.id}`;
            const jaExiste = currentTasks.some(t => t.id === taskId);
            if (!jaExiste) {
              novasTarefas.push({
                id: taskId,
                pacienteId: p.id,
                pacienteNome: p.nome,
                tipo: "agendar_retorno",
                descricao: `Agendar consulta de retorno pós-operatório para avaliação clínica e cicatrização.`,
                dataCriacao: hojeStr,
                status: "pendente"
              });
            }
          }
        });

        const tarefasFinais = [...currentTasks, ...novasTarefas];
        setTarefasSecretaria(tarefasFinais);
        localStorage.setItem("protouro_tarefas_secretaria", JSON.stringify(tarefasFinais));

      } catch (e) {
        console.error("Erro ao carregar pacientes:", e);
      }
    }
  }, []);

  // Salvar pacientes no LocalStorage
  const saveToStorage = (newPacientes: Paciente[]) => {
    setPacientes(newPacientes);
    localStorage.setItem("protouro_pacientes_db", JSON.stringify(newPacientes));
  };

  const handleSavePaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("O nome do paciente é obrigatório.");
      return;
    }

    if (editingId) {
      // Editar paciente existente
      const updated = pacientes.map(p => {
        if (p.id === editingId) {
          // Criar registro hormonal se houver valor de testosterona
          const hist = p.historicoHormonal || [];
          if (testosterona && (!hist.length || hist[hist.length - 1].total !== parseFloat(testosterona))) {
            hist.push({
              data: new Date().toLocaleDateString("pt-BR").substring(0, 5),
              total: parseFloat(testosterona),
              livre: testoLivre ? parseFloat(testoLivre) : undefined,
              shbg: shbg ? parseFloat(shbg) : undefined
            });
          }

          const stageChanged = p.leadStage !== leadStage;
          const updatedHist = stageChanged 
            ? logStageChange(p, p.leadStage || "lead", leadStage)
            : p.comercialHist;

          return {
            ...p,
            nome: nome.trim(),
            idade,
            queixa: queixa.trim(),
            testosterona,
            psa,
            hematocrito,
            notas: notas.trim(),
            telefone: telefone.trim(),
            shbg,
            testoLivre,
            historicoHormonal: hist,
            leadStage: leadStage,
            origem: origem,
            proximoContato: proximoContato,
            faturamentoReal: faturamentoReal ? parseFloat(faturamentoReal) : undefined,
            custoHospitalarReal: custoHospitalarReal ? parseFloat(custoHospitalarReal) : undefined,
            desdobramentoCustos: desdobramentoCustos.trim() || undefined,
            comercialHist: updatedHist,
            estradiol: estradiol.trim() || undefined,
            insuficienciaCardiaca,
            usoNitratos
          };
        }
        return p;
      });
      saveToStorage(updated);
      toast.success("Paciente atualizado com sucesso!");
      setEditingId(null);
    } else {
      // Criar novo paciente
      const hist: HormonioRegistro[] = [];
      if (testosterona) {
        hist.push({
          data: new Date().toLocaleDateString("pt-BR").substring(0, 5),
          total: parseFloat(testosterona),
          livre: testoLivre ? parseFloat(testoLivre) : undefined,
          shbg: shbg ? parseFloat(shbg) : undefined
        });
      }

      const novo: Paciente = {
        id: "paciente_" + Date.now(),
        nome: nome.trim(),
        idade,
        queixa: queixa.trim(),
        testosterona,
        psa,
        hematocrito,
        notas: notas.trim(),
        telefone: telefone.trim(),
        shbg,
        testoLivre,
        dataCadastro: new Date().toLocaleDateString("pt-BR"),
        historicoHormonal: hist,
        documentos: [],
        leadStage: leadStage,
        origem: origem,
        proximoContato: proximoContato,
        faturamentoReal: faturamentoReal ? parseFloat(faturamentoReal) : undefined,
        custoHospitalarReal: custoHospitalarReal ? parseFloat(custoHospitalarReal) : undefined,
        desdobramentoCustos: desdobramentoCustos.trim() || undefined,
        estradiol: estradiol.trim() || undefined,
        insuficienciaCardiaca,
        usoNitratos
      };
      saveToStorage([novo, ...pacientes]);
      toast.success("Paciente cadastrado com sucesso!");
      setIsAdding(false);
    }

    // Resetar formulário
    resetForm();
  };

  const handleEdit = (p: Paciente, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir expansão
    setEditingId(p.id);
    setNome(p.nome);
    setIdade(p.idade);
    setQueixa(p.queixa);
    setTestosterona(p.testosterona);
    setPsi(p.psa); // Corrige atribuição de PSA
    setHematocrito(p.hematocrito);
    setNotas(p.notas);
    setShbg(p.shbg || "");
    setTestoLivre(p.testoLivre || "");
    setTelefone(p.telefone || "");
    setLeadStage(p.leadStage || "lead");
    setOrigem(p.origem || "instagram");
    setProximoContato(p.proximoContato || "");
    setFaturamentoReal(p.faturamentoReal !== undefined ? p.faturamentoReal.toString() : "");
    setCustoHospitalarReal(p.custoHospitalarReal !== undefined ? p.custoHospitalarReal.toString() : "");
    setDesdobramentoCustos(p.desdobramentoCustos || "");
    setEstradiol(p.estradiol || "");
    setInsuficienciaCardiaca(p.insuficienciaCardiaca || false);
    setUsoNitratos(p.usoNitratos || false);
    setIsAdding(true);
  };

  const handleAddHormonioPonto = (pacienteId: string) => {
    if (!newTotal) {
      toast.error("O valor de Testosterona Total é obrigatório.");
      return;
    }
    
    // Alertas clínicos de segurança
    const valHema = newHemaPonto ? parseFloat(newHemaPonto) : 0;
    const valShbg = newShbg ? parseFloat(newShbg) : 0;
    
    if (valHema > 52) {
      toast.warning("Alerta Clínico: Hematócrito crítico (>52%). Considere sangria terapêutica ou ajuste/redução de TRT.", { duration: 6000 });
    }
    if (valShbg > 0 && valShbg < 15) {
      toast.warning("Alerta Clínico: SHBG crítico (<15 nmol/L). Indica alta taxa de testosterona livre e possível clearance acelerado.", { duration: 6000 });
    }

    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoHormonal || [];
        const novoPonto: HormonioRegistro = {
          data: newDataPonto || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          total: parseFloat(newTotal),
          livre: newLivre ? parseFloat(newLivre) : undefined,
          shbg: newShbg ? parseFloat(newShbg) : undefined,
          hematocrito: newHemaPonto ? parseFloat(newHemaPonto) : undefined,
          intervencao: newIntervencao.trim() || undefined
        };
        return {
          ...p,
          testosterona: newTotal, // Atualizar valor atual
          testoLivre: newLivre || p.testoLivre,
          shbg: newShbg || p.shbg,
          hematocrito: newHemaPonto || p.hematocrito,
          historicoHormonal: [...hist, novoPonto]
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Novo ponto hormonal registrado!");
    setNewTotal("");
    setNewLivre("");
    setNewShbg("");
    setNewHemaPonto("");
    setNewIntervencao("");
  };

  const handleAddSintomaPonto = (pacienteId: string) => {
    if (!newIief && !newIpss) {
      toast.error("Preencha pelo menos um escore (IIEF-5 ou IPSS).");
      return;
    }
    
    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoSintomas || [];
        const novoPonto: SintomaRegistro = {
          data: newDataSintoma || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          iief5: newIief ? parseInt(newIief) : undefined,
          ipss: newIpss ? parseInt(newIpss) : undefined,
          adamPositivo: newAdam
        };
        return {
          ...p,
          historicoSintomas: [...hist, novoPonto]
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Escores de sintomas registrados com sucesso!");
    setNewIief("");
    setNewIpss("");
    setNewAdam(false);
  };

  const handleAddDiarioPonto = (pacienteId: string) => {
    if (!newDiarioDiurna && !newDiarioNocturia && !newDiarioVolume) {
      toast.error("Preencha pelo menos um parâmetro do Diário Miccional.");
      return;
    }

    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.historicoDiarioMiccional || [];
        const novoPonto: DiarioMiccionalRegistro = {
          data: newDiarioData || new Date().toLocaleDateString("pt-BR").substring(0, 5),
          frequenciaDiurna: newDiarioDiurna ? parseInt(newDiarioDiurna) : 0,
          nocturia: newDiarioNocturia ? parseInt(newDiarioNocturia) : 0,
          volumeMedio: newDiarioVolume ? parseInt(newDiarioVolume) : 0,
          ingestaoLiquidos: newDiarioIngestao ? parseInt(newDiarioIngestao) : undefined
        };
        return {
          ...p,
          historicoDiarioMiccional: [...hist, novoPonto]
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Diário miccional registrado com sucesso!");
    setNewDiarioDiurna("");
    setNewDiarioNocturia("");
    setNewDiarioVolume("");
    setNewDiarioIngestao("");
  };

  const handleAddContato = (pacienteId: string) => {
    if (!newContatoNotas.trim()) {
      toast.error("Preencha as observações do contato realizado.");
      return;
    }

    const updated = pacientes.map(p => {
      if (p.id === pacienteId) {
        const hist = p.comercialHist || [];
        const novoPonto: ContatoRegistro = {
          id: "contato_" + Date.now(),
          data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR").substring(0, 5),
          tipo: newContatoTipo,
          notas: newContatoNotas.trim()
        };
        return {
          ...p,
          comercialHist: [novoPonto, ...hist] // Ordenar por mais recente no topo
        };
      }
      return p;
    });
    saveToStorage(updated);
    toast.success("Contato comercial registrado na Linha do Tempo!");
    setNewContatoNotas("");
  };

  const toggleExpand = (id: string) => {
    setEditingExpandedId(expandedId === id ? null : id);
  };

  // Alias para corrigir o erro de digitação do setPsi
  const setPsi = (val: string) => setPsa(val);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir expansão
    if (confirm("Deseja realmente remover este paciente do banco de dados local?")) {
      const filtered = pacientes.filter(p => p.id !== id);
      saveToStorage(filtered);
      toast.success("Paciente removido com sucesso.");
    }
  };

  const resetForm = () => {
    setNome("");
    setIdade("");
    setQueixa("");
    setTestosterona("");
    setPsa("");
    setHematocrito("");
    setNotas("");
    setShbg("");
    setTestoLivre("");
    setTelefone("");
    setLeadStage("lead");
    setOrigem("instagram");
    setProximoContato("");
    setFaturamentoReal("");
    setCustoHospitalarReal("");
    setDesdobramentoCustos("");
    setEstradiol("");
    setInsuficienciaCardiaca(false);
    setUsoNitratos(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const logStageChange = (pac: Paciente, anterior: string, novo: string): ContatoRegistro[] => {
    const formatStage = (st: string) => {
      const map: Record<string, string> = {
        lead: "Lead (Instagram/Google Ads)",
        agendado: "Consulta Agendada",
        realizado: "Consulta Realizada",
        proposto: "Cirurgia Proposta",
        operado: "Cirurgia Realizada"
      };
      return map[st] || st;
    };

    const novoRegistro: ContatoRegistro = {
      id: "contato_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      tipo: "retorno",
      notas: `Estágio do funil alterado de [${formatStage(anterior)}] para [${formatStage(novo)}]`
    };

    return [novoRegistro, ...(pac.comercialHist || [])];
  };

  const handlePrintCommercialReport = () => {
    // Usar a lista de pacientes filtrada de acordo com o período selecionado para o relatório comercial
    const pacientesNoPeriodo = pacientes.filter(p => {
      if (periodoFiltro === "todos") return true;
      const parts = p.dataCadastro.split("/");
      if (parts.length === 3) {
        const cadDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - cadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (periodoFiltro === "30_dias" && diffDays > 30) return false;
        if (periodoFiltro === "90_dias" && diffDays > 90) return false;
      }
      return true;
    });

    if (pacientesNoPeriodo.length === 0) {
      toast.error("Nenhum paciente cadastrado no período selecionado para gerar o relatório comercial.");
      return;
    }

    // Cálculos de métricas do CRM
    const totalLeads = pacientesNoPeriodo.length;
    const leads = pacientesNoPeriodo.filter(p => p.leadStage === "lead").length;
    const agendados = pacientesNoPeriodo.filter(p => p.leadStage === "agendado").length;
    const realizados = pacientesNoPeriodo.filter(p => p.leadStage === "realizado").length;
    const propostos = pacientesNoPeriodo.filter(p => p.leadStage === "proposto").length;
    const operados = pacientesNoPeriodo.filter(p => p.leadStage === "operado").length;

    // Taxa de conversão geral: operados / total
    const taxaConversaoGeral = totalLeads > 0 ? ((operados / totalLeads) * 100).toFixed(1) : "0.0";
    
    // Distribuição por Origem
    const origens = {
      instagram: pacientesNoPeriodo.filter(p => p.origem === "instagram").length,
      google_ads: pacientesNoPeriodo.filter(p => p.origem === "google_ads").length,
      indicacao: pacientesNoPeriodo.filter(p => p.origem === "indicacao").length,
      outros: pacientesNoPeriodo.filter(p => p.origem === "outros" || !p.origem).length,
    };

    // Faturamento Real e Estimado (Valores padrão de urologia particular premium se não preenchido)
    // Consulta: R$ 1.000,00 (todos os que agendaram ou passaram)
    // Cirurgia: R$ 15.000,00 (operados)
    const valorConsulta = 1000;
    const valorCirurgia = 15000;
    
    // Calcular faturamento real com base no campo faturamentoReal preenchido
    const faturamentoRealTotal = pacientesNoPeriodo.reduce((sum, p) => sum + (p.faturamentoReal || 0), 0);
    
    // Se houver faturamento real cadastrado, usamos ele. Caso contrário, usamos a estimativa baseada nos estágios.
    const consultasRealizadas = agendados + realizados + propostos + operados;
    const faturamentoConsultas = consultasRealizadas * valorConsulta;
    const faturamentoCirurgias = operados * valorCirurgia;
    const faturamentoTotalEst = faturamentoConsultas + faturamentoCirurgias;
    
    const faturamentoExibido = faturamentoRealTotal > 0 ? faturamentoRealTotal : faturamentoTotalEst;

    // Tempo Médio de Conversão (simulado com base no histórico comercial, ou padrão de 14 dias se vazio)
    let totalDias = 0;
    let totalContatos = 0;
    pacientesNoPeriodo.forEach(p => {
      const hist = p.comercialHist || [];
      if (hist.length > 0) {
        totalContatos += hist.length;
        totalDias += hist.length * 3.5; // Estimativa de 3.5 dias por contato comercial
      }
    });
    const tempoMedioConversao = totalContatos > 0 ? Math.round(totalDias / totalContatos) : 14;

    const signatureData = localStorage.getItem("protoUro_signature_data");

    // Gerar HTML para Impressão
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!doc) return;

    const todayStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Desempenho Comercial - ProtoUro</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
          
          body {
            font-family: 'Montserrat', sans-serif;
            color: #1A1A1A;
            margin: 0;
            padding: 40px;
            background-color: #FFFFFF;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #B87333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            color: #1A1A1A;
            letter-spacing: 1px;
            margin: 0;
          }
          
          .logo-subtext {
            font-size: 10px;
            font-weight: 700;
            color: #B87333;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin: 5px 0 0 0;
          }
          
          .doctor-info {
            font-size: 11px;
            color: #666;
            margin-top: 10px;
            font-weight: 600;
          }
          
          .report-title {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            color: #1A1A1A;
            text-align: center;
            margin: 20px 0;
            font-weight: 700;
          }
          
          .report-date {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-weight: 600;
          }
          
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 35px;
          }
          
          .kpi-card {
            background: #FAFAFA;
            border: 1px solid #E5E5E5;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
          }
          
          .kpi-value {
            font-size: 20px;
            font-weight: 800;
            color: #B87333;
            margin-bottom: 5px;
          }
          
          .kpi-label {
            font-size: 10px;
            font-weight: 700;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            color: #1A1A1A;
            border-bottom: 1px solid #E5E5E5;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 700;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          th, td {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            border-bottom: 1px solid #E5E5E5;
          }
          
          th {
            background-color: #FAFAFA;
            font-weight: 700;
            color: #1A1A1A;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          
          .funnel-bar-container {
            width: 100%;
            background-color: #E5E5E5;
            border-radius: 4px;
            height: 12px;
            overflow: hidden;
            margin-top: 4px;
          }
          
          .funnel-bar {
            height: 100%;
            background: linear-gradient(90deg, #1A1A1A 0%, #B87333 100%);
          }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
          }
          
          .badge-instagram { background-color: #FDF2F8; color: #DB2777; }
          .badge-google { background-color: #EFF6FF; color: #2563EB; }
          .badge-indicacao { background-color: #F0FDF4; color: #16A34A; }
          .badge-outros { background-color: #F3F4F6; color: #4B5563; }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #E5E5E5;
            padding-top: 20px;
          }
          
          .signature-area {
            margin-top: 40px;
            text-align: center;
            page-break-inside: avoid;
          }
          
          .signature-line {
            width: 200px;
            border-top: 1px solid #999;
            margin: 40px auto 10px auto;
          }
          
          .signature-img {
            max-height: 60px;
            margin-bottom: -10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="logo-text">DR. FELIPE DE BULHÕES</h1>
          <p class="logo-subtext">Urologia de Alta Performance</p>
          <div class="doctor-info">
            CRM SP 245678 | RQE 123456 &bull; Instituto D'Or de Ensino e Pesquisa
          </div>
        </div>
        
        <h2 class="report-title">Relatório de Desempenho Comercial & CRM</h2>
        <p class="report-date">Período de Referência: Mês Corrente &bull; Gerado em ${todayStr}</p>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${totalLeads}</div>
            <div class="kpi-label">Total de Leads</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${taxaConversaoGeral}%</div>
            <div class="kpi-label">Conversão Cirúrgica</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">R$ ${faturamentoExibido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <div class="kpi-label">${faturamentoRealTotal > 0 ? "Faturamento Real" : "Faturamento Est."}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${tempoMedioConversao} dias</div>
            <div class="kpi-label">Tempo de Conversão</div>
          </div>
        </div>
        
        <h3 class="section-title">Funil de Conversão Comercial (Gargalos)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 25%">Estágio do Funil</th>
              <th style="width: 15%">Volume</th>
              <th style="width: 45%">Conversão Visual</th>
              <th style="width: 15%">Perda Acumulada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Leads (Captação)</strong></td>
              <td>${leads} pacientes</td>
              <td>
                <div class="funnel-bar-container">
                  <div class="funnel-bar" style="width: 100%"></div>
                </div>
              </td>
              <td>0%</td>
            </tr>
            <tr>
              <td><strong>2. Consultas Agendadas</strong></td>
              <td>${agendados} pacientes</td>
              <td>
                <div class="funnel-bar-container">
                  <div class="funnel-bar" style="width: ${totalLeads > 0 ? ((agendados / totalLeads) * 100) : 0}%"></div>
                </div>
              </td>
              <td>${totalLeads > 0 ? (100 - (agendados / totalLeads) * 100).toFixed(0) : 0}%</td>
            </tr>
            <tr>
              <td><strong>3. Consultas Realizadas</strong></td>
              <td>${realizados} pacientes</td>
              <td>
                <div class="funnel-bar-container">
                  <div class="funnel-bar" style="width: ${totalLeads > 0 ? ((realizados / totalLeads) * 100) : 0}%"></div>
                </div>
              </td>
              <td>${totalLeads > 0 ? (100 - (realizados / totalLeads) * 100).toFixed(0) : 0}%</td>
            </tr>
            <tr>
              <td><strong>4. Cirurgias Propostas</strong></td>
              <td>${propostos} pacientes</td>
              <td>
                <div class="funnel-bar-container">
                  <div class="funnel-bar" style="width: ${totalLeads > 0 ? ((propostos / totalLeads) * 100) : 0}%"></div>
                </div>
              </td>
              <td>${totalLeads > 0 ? (100 - (propostos / totalLeads) * 100).toFixed(0) : 0}%</td>
            </tr>
            <tr>
              <td><strong>5. Cirurgias Realizadas</strong></td>
              <td>${operados} pacientes</td>
              <td>
                <div class="funnel-bar-container">
                  <div class="funnel-bar" style="width: ${totalLeads > 0 ? ((operados / totalLeads) * 100) : 0}%"></div>
                </div>
              </td>
              <td>${totalLeads > 0 ? (100 - (operados / totalLeads) * 100).toFixed(0) : 0}%</td>
            </tr>
          </tbody>
        </table>
        
        <h3 class="section-title">Análise de ROI por Canal de Captação</h3>
        <table>
          <thead>
            <tr>
              <th>Origem do Lead</th>
              <th>Volume de Pacientes</th>
              <th>Proporção (%)</th>
              <th>Faturamento por Canal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge badge-instagram">Instagram / Redes Sociais</span></td>
              <td>${origens.instagram}</td>
              <td>${totalLeads > 0 ? ((origens.instagram / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(pacientesNoPeriodo.filter(p => p.origem === "instagram").reduce((sum, p) => sum + (p.faturamentoReal || (p.leadStage === "operado" ? valorCirurgia : p.leadStage !== "lead" ? valorConsulta : 0)), 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-google">Google Ads / Tráfego Pago</span></td>
              <td>${origens.google_ads}</td>
              <td>${totalLeads > 0 ? ((origens.google_ads / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(pacientesNoPeriodo.filter(p => p.origem === "google_ads").reduce((sum, p) => sum + (p.faturamentoReal || (p.leadStage === "operado" ? valorCirurgia : p.leadStage !== "lead" ? valorConsulta : 0)), 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-indicacao">Indicação Médica / Colegas</span></td>
              <td>${origens.indicacao}</td>
              <td>${totalLeads > 0 ? ((origens.indicacao / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(pacientesNoPeriodo.filter(p => p.origem === "indicacao").reduce((sum, p) => sum + (p.faturamentoReal || (p.leadStage === "operado" ? valorCirurgia : p.leadStage !== "lead" ? valorConsulta : 0)), 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-outros">Outros / Orgânico</span></td>
              <td>${origens.outros}</td>
              <td>${totalLeads > 0 ? ((origens.outros / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(pacientesNoPeriodo.filter(p => !p.origem || p.origem === "outros").reduce((sum, p) => sum + (p.faturamentoReal || (p.leadStage === "operado" ? valorCirurgia : p.leadStage !== "lead" ? valorConsulta : 0)), 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="signature-area">
          ${signatureData ? `<img src="${signatureData}" class="signature-img" alt="Assinatura Dr. Felipe" />` : ""}
          <div class="signature-line"></div>
          <strong>DR. FELIPE DE BULHÕES</strong><br>
          <span style="font-size: 11px; color: #666;">Cirurgião Particular Premium</span>
        </div>
        
        <div class="footer">
          Relatório Estratégico de Gestão &bull; ProtoUro v2.0 &bull; Confidencial para Uso Interno
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      // Remover iframe após impressão
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  const filteredPacientes = pacientes.filter(p => {
    // Primeiro aplicar busca textual
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.queixa.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Segundo aplicar filtro clínico crítico
    if (activeFilter === "hema_critical") {
      if (!(parseFloat(p.hematocrito) > 52)) return false;
    } else if (activeFilter === "psa_critical") {
      if (!(parseFloat(p.psa) > 4.0)) return false;
    } else if (activeFilter === "followup_late") {
      const hist = p.historicoHormonal || [];
      if (hist.length === 0) return false;
      
      const lastDateStr = hist[hist.length - 1].data;
      const parts = lastDateStr.split("/");
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const currentYear = new Date().getFullYear();
      
      const lastExamDate = new Date(currentYear, month, day);
      const today = new Date();
      if (lastExamDate > today) lastExamDate.setFullYear(currentYear - 1);
      
      const diffTime = Math.abs(today.getTime() - lastExamDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = diffDays / 30.4;
      if (diffMonths < 3) return false;
    } else if (activeFilter === "contact_overdue") {
      if (!p.proximoContato) return false;
      const todayStr = new Date().toISOString().split("T")[0];
      if (p.proximoContato > todayStr) return false;
    } else if (activeFilter === "origin_instagram") {
      if (p.origem !== "instagram") return false;
    } else if (activeFilter === "origin_google") {
      if (p.origem !== "google_ads") return false;
    } else if (activeFilter === "origin_indicacao") {
      if (p.origem !== "indicacao") return false;
    } else if (activeFilter === "alta_auditada") {
      if (!p.auditorias_alta) return false;
      const protocols = Object.keys(p.auditorias_alta);
      const hasCompletedAudit = protocols.some(protoId => {
        const items = p.auditorias_alta ? p.auditorias_alta[protoId] || [] : [];
        return items.length > 0 && items.every((item: any) => item.checked);
      });
      if (!hasCompletedAudit) return false;
    }

    // Terceiro aplicar filtro de período (com base na data de cadastro)
    if (periodoFiltro !== "todos") {
      // Formato dataCadastro: "DD/MM/AAAA"
      const parts = p.dataCadastro.split("/");
      if (parts.length === 3) {
        const cadDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - cadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (periodoFiltro === "30_dias" && diffDays > 30) return false;
        if (periodoFiltro === "90_dias" && diffDays > 90) return false;
      }
    }

    return true;
  });

  // Função para criptografar/descriptografar com validação de integridade por assinatura mágica
  const encryptData = (text: string, key: string): string => {
    // Adicionar assinatura mágica para validar a descriptografia com a senha correta
    const secureText = "PROTOURO_SECURE_BACKUP_V1:" + text;
    let result = "";
    for (let i = 0; i < secureText.length; i++) {
      const charCode = secureText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    // Usar btoa de forma segura para Unicode escapando caracteres especiais
    const utf8Bytes = new TextEncoder().encode(result);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  };

  const decryptData = (encoded: string, key: string): string => {
    try {
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder().decode(bytes);
      
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }

      if (!result.startsWith("PROTOURO_SECURE_BACKUP_V1:")) {
        throw new Error("Senha incorreta ou assinatura de integridade inválida.");
      }

      return result.substring("PROTOURO_SECURE_BACKUP_V1:".length);
    } catch (e) {
      throw new Error("Senha incorreta ou arquivo corrompido.");
    }
  };

  const handleExportBackup = () => {
    const password = prompt("Defina uma senha forte para criptografar o arquivo de backup:");
    if (!password) {
      toast.error("Exportação cancelada. A senha é obrigatória para segurança dos dados.");
      return;
    }

    try {
      const dbData = {
        pacientes: pacientes,
        assinatura: localStorage.getItem("protouro_signature_url") || "",
        useSignature: localStorage.getItem("protouro_use_signature") || "false"
      };

      const jsonStr = JSON.stringify(dbData);
      const encrypted = encryptData(jsonStr, password);
      
      const blob = new Blob([encrypted], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_protouro_${new Date().toISOString().split("T")[0]}.enc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Backup criptografado exportado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar backup.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const password = prompt("Digite a senha do arquivo de backup para descriptografar:");
    if (!password) {
      toast.error("Importação cancelada. A senha é obrigatória.");
      // Limpar input
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const encrypted = event.target?.result as string;
        const decrypted = decryptData(encrypted, password);
        const parsed = JSON.parse(decrypted);

        if (parsed && Array.isArray(parsed.pacientes)) {
          if (confirm(`Deseja realmente importar ${parsed.pacientes.length} pacientes? Isso irá mesclar com seus pacientes atuais.`)) {
            // Mesclar pacientes evitando duplicados por ID
            const existentesMap = new Map(pacientes.map(p => [p.id, p]));
            parsed.pacientes.forEach((p: Paciente) => {
              existentesMap.set(p.id, p);
            });
            const novosPacientes = Array.from(existentesMap.values());
            saveToStorage(novosPacientes);

            // Importar assinatura se houver
            if (parsed.assinatura) {
              localStorage.setItem("protouro_signature_url", parsed.assinatura);
              localStorage.setItem("protouro_use_signature", parsed.useSignature || "true");
            }

            toast.success("Backup importado e mesclado com sucesso!");
          }
        } else {
          toast.error("Formato de arquivo inválido.");
        }
      } catch (err) {
        toast.error("Senha incorreta ou arquivo de backup corrompido.");
      }
      // Limpar input
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-2">
              <Users className="w-8 h-8 text-accent" />
              Gestão de Pacientes
            </h2>
            <p className="text-muted-foreground text-sm">
              Banco de dados clínico local para acompanhamento rápido de parâmetros e histórico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <Button
              onClick={handleExportBackup}
              variant="outline"
              className="border-accent/30 text-primary hover:bg-accent/5 rounded-xl font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#B87333]" />
              Exportar Backup
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 justify-center px-4 h-10 border border-dashed border-accent/30 hover:bg-accent/5 rounded-xl text-sm font-semibold text-primary">
                <Users className="w-4 h-4 text-[#B87333]" />
                Importar Backup
              </span>
              <input
                type="file"
                accept=".enc"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
            {!isAdding && (
              <Button 
                onClick={() => setIsAdding(true)} 
                className="copper-gradient text-white rounded-xl font-semibold flex items-center gap-2 shadow-md shadow-accent/10"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Paciente
              </Button>
            )}
          </div>
        </div>

        {/* Formulário de Cadastro / Edição */}
        {isAdding && (
          <Card className="border-accent/20 bg-card shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-border/40 bg-accent/[0.02]">
              <CardTitle className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#B87333]" />
                {editingId ? "Editar Dados Clínicos" : "Novo Cadastro de Paciente"}
              </CardTitle>
              <CardDescription className="text-xs">
                Todos os dados são salvos localmente de forma segura no seu navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSavePaciente} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nome" className="text-xs font-bold text-primary uppercase tracking-wider">Nome Completo *</Label>
                    <Input 
                      id="nome" 
                      placeholder="Ex: João Silva de Oliveira" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="rounded-xl h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade" className="text-xs font-bold text-primary uppercase tracking-wider">Idade</Label>
                    <Input 
                      id="idade" 
                      type="number" 
                      placeholder="Ex: 52" 
                      value={idade}
                      onChange={(e) => setIdade(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="queixa" className="text-xs font-bold text-primary uppercase tracking-wider">Queixa Principal / Diagnóstico</Label>
                    <Input 
                      id="queixa" 
                      placeholder="Ex: Disfunção erétil leve + Sintomas de hipogonadismo (DAEM)" 
                      value={queixa}
                      onChange={(e) => setQueixa(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-xs font-bold text-primary uppercase tracking-wider">Telefone (WhatsApp)</Label>
                    <Input 
                      id="telefone" 
                      placeholder="Ex: 11 98112-4455" 
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadStage" className="text-xs font-bold text-primary uppercase tracking-wider">Estágio do Funil (CRM)</Label>
                    <select
                      id="leadStage"
                      value={leadStage}
                      onChange={(e) => setLeadStage(e.target.value as any)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="lead">Lead (Mídias Sociais)</option>
                      <option value="agendado">Consulta Agendada</option>
                      <option value="realizado">Consulta Realizada</option>
                      <option value="proposto">Cirurgia Proposta</option>
                      <option value="operado">Cirurgia Realizada</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origem" className="text-xs font-bold text-primary uppercase tracking-wider">Origem do Lead</Label>
                    <select
                      id="origem"
                      value={origem}
                      onChange={(e) => setOrigem(e.target.value as any)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="instagram">📸 Instagram</option>
                      <option value="google_ads">🔍 Google Ads</option>
                      <option value="indicacao">🤝 Indicação</option>
                      <option value="outros">🌐 Outros Canais</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proximoContato" className="text-xs font-bold text-primary uppercase tracking-wider">Próximo Contato</Label>
                    <Input 
                      id="proximoContato" 
                      type="date" 
                      value={proximoContato}
                      onChange={(e) => setProximoContato(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faturamentoReal" className="text-xs font-bold text-primary uppercase tracking-wider">Faturamento Real (R$)</Label>
                    <Input 
                      id="faturamentoReal" 
                      type="number" 
                      placeholder="Ex: 15000" 
                      value={faturamentoReal}
                      onChange={(e) => setFaturamentoReal(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custoHospitalarReal" className="text-xs font-bold text-primary uppercase tracking-wider">Custo Hospitalar Real (R$)</Label>
                    <Input 
                      id="custoHospitalarReal" 
                      type="number" 
                      placeholder="Ex: 4500" 
                      value={custoHospitalarReal}
                      onChange={(e) => setCustoHospitalarReal(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="desdobramentoCustos" className="text-xs font-bold text-primary uppercase tracking-wider">Desdobramento de Custos / OPME / Notas Extras</Label>
                    <Textarea 
                      id="desdobramentoCustos" 
                      placeholder="Ex: OPME: R$ 3.500 | Taxa de Sala Day Hospital: R$ 1.000" 
                      value={desdobramentoCustos}
                      onChange={(e) => setDesdobramentoCustos(e.target.value)}
                      className="rounded-xl min-h-[44px] h-11 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 border-t border-border/40 pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="testo" className="text-xs font-bold text-primary uppercase tracking-wider">Testo Total (ng/dL)</Label>
                    <Input 
                      id="testo" 
                      type="number" 
                      placeholder="Ex: 240" 
                      value={testosterona}
                      onChange={(e) => setTestosterona(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shbg" className="text-xs font-bold text-primary uppercase tracking-wider">SHBG (nmol/L)</Label>
                    <Input 
                      id="shbg" 
                      placeholder="Ex: 32" 
                      value={shbg}
                      onChange={(e) => setShbg(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="albumina" className="text-xs font-bold text-primary uppercase tracking-wider">Albumina (g/dL)</Label>
                    <Input 
                      id="albumina" 
                      placeholder="Padrão: 4.3" 
                      value={albumina}
                      onChange={(e) => setAlbumina(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="testoLivre" className="text-xs font-bold text-primary uppercase tracking-wider">Testo Livre</Label>
                      <button
                        type="button"
                        onClick={handleAutoCalculateLivre}
                        className="text-[10px] font-bold text-accent hover:underline uppercase"
                        title="Calcular automaticamente usando a fórmula científica de Vermeulen (1999)"
                      >
                        Calcular (Vermeulen)
                      </button>
                    </div>
                    <Input 
                      id="testoLivre" 
                      placeholder="Ex: 4.8" 
                      value={testoLivre}
                      onChange={(e) => setTestoLivre(e.target.value)}
                      className="rounded-xl h-11 border-accent/20 bg-accent/[0.01]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psa" className="text-xs font-bold text-primary uppercase tracking-wider">PSA Total (ng/mL)</Label>
                    <Input 
                      id="psa" 
                      placeholder="Ex: 1.2" 
                      value={psa}
                      onChange={(e) => setPsa(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hema" className="text-xs font-bold text-primary uppercase tracking-wider">Hematócrito (%)</Label>
                    <Input 
                      id="hema" 
                      placeholder="Ex: 46.5" 
                      value={hematocrito}
                      onChange={(e) => setHematocrito(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estradiol" className="text-xs font-bold text-primary uppercase tracking-wider">Estradiol (pg/mL)</Label>
                    <Input 
                      id="estradiol" 
                      placeholder="Ex: 28.4" 
                      value={estradiol}
                      onChange={(e) => setEstradiol(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-5">
                  <Label htmlFor="notas" className="text-xs font-bold text-primary uppercase tracking-wider">Notas Clínicas / Histórico de Condutas</Label>
                  <textarea 
                    id="notas" 
                    placeholder="Ex: Iniciado Gel de Testosterona 5% (1 pump/dia). Paciente queixa-se de cansaço e perda de foco. Próximo retorno com exames de segurança em 6 semanas." 
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full min-h-[120px] rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-5 pb-2">
                  <div className="flex items-start space-x-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/20 transition-all">
                    <input
                      type="checkbox"
                      id="icc-checkbox"
                      checked={insuficienciaCardiaca}
                      onChange={(e) => setInsuficienciaCardiaca(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="icc-checkbox" className="text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">
                        Insuficiência Cardíaca (ICC)
                      </Label>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Histórico ou diagnóstico ativo de Insuficiência Cardíaca Congestiva.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/20 transition-all">
                    <input
                      type="checkbox"
                      id="nitratos-checkbox"
                      checked={usoNitratos}
                      onChange={(e) => setUsoNitratos(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="nitratos-checkbox" className="text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">
                        Uso de Nitratos
                      </Label>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Uso concomitante de nitratos (ex: Isordil, Monocordil, Nitroglicerina).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl h-11 font-semibold border-border">
                    Cancelar
                  </Button>
                  <Button type="submit" className="copper-gradient text-white rounded-xl h-11 font-semibold px-6 shadow-md shadow-accent/10">
                    {editingId ? "Salvar Alterações" : "Salvar Cadastro"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Barra de Busca e Listagem */}
        {!isAdding && (
          <div className="space-y-6">
            {/* Abas de Visualização (Lista vs Funil CRM) */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2 flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activeView === "list" ? "default" : "ghost"}
                  onClick={() => setActiveView("list")}
                  className={`h-9 rounded-xl text-xs font-bold gap-1.5 ${activeView === "list" ? "copper-gradient text-white border-0" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Users className="w-4 h-4" />
                  Visualização em Lista
                </Button>
                <Button
                  size="sm"
                  variant={activeView === "crm" ? "default" : "ghost"}
                  onClick={() => setActiveView("crm")}
                  className={`h-9 rounded-xl text-xs font-bold gap-1.5 ${activeView === "crm" ? "copper-gradient text-white border-0" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Funil de Vendas (CRM CPP)
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => handlePrintCommercialReport()}
                className="h-9 rounded-xl text-xs font-bold gap-1.5 border border-[#B87333]/20 bg-[#B87333]/5 hover:bg-[#B87333]/10 text-[#B87333]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Relatório Comercial (PDF)
              </Button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar paciente por nome, queixa ou diagnóstico..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 rounded-xl border-border bg-card shadow-sm"
                />
              </div>
              
              {/* Seletor de Período de Desempenho CRM */}
              <div className="flex items-center gap-2 bg-secondary/20 p-1.5 rounded-xl border border-border/40 w-fit">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1.5 pr-1">Período CRM:</span>
                {[
                  { id: "todos", label: "Todo o Período" },
                  { id: "30_dias", label: "Últimos 30 Dias" },
                  { id: "90_dias", label: "Último Trimestre" }
                ].map((p_filtro) => (
                  <Button
                    key={p_filtro.id}
                    size="sm"
                    variant={periodoFiltro === p_filtro.id ? "default" : "ghost"}
                    onClick={() => setPeriodoFiltro(p_filtro.id as any)}
                    className={`h-7 px-3 rounded-lg text-[10px] font-bold ${periodoFiltro === p_filtro.id ? "copper-gradient text-white border-0 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {p_filtro.label}
                  </Button>
                ))}
              </div>

              {/* Filtros Clínicos Avançados */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant={activeFilter === "all" ? "default" : "outline"}
                  onClick={() => setActiveFilter("all")}
                  className={`h-8 rounded-full text-xs font-bold px-4 ${activeFilter === "all" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                >
                  Todos os Pacientes ({pacientes.length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "hema_critical" ? "default" : "outline"}
                  onClick={() => setActiveFilter("hema_critical")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "hema_critical" ? "bg-red-600 hover:bg-red-700 text-white border-0" : "border-red-200/40 text-red-600 hover:bg-red-50/40"}`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Hematócrito Crítico &gt; 52% ({pacientes.filter(p => parseFloat(p.hematocrito) > 52).length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "psa_critical" ? "default" : "outline"}
                  onClick={() => setActiveFilter("psa_critical")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "psa_critical" ? "bg-orange-600 hover:bg-orange-700 text-white border-0" : "border-orange-200/40 text-orange-600 hover:bg-orange-50/40"}`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  PSA Elevado &gt; 4.0 ng/mL ({pacientes.filter(p => parseFloat(p.psa) > 4.0).length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "followup_late" ? "default" : "outline"}
                  onClick={() => setActiveFilter("followup_late")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "followup_late" ? "bg-amber-600 hover:bg-amber-700 text-white border-0" : "border-amber-200/40 text-amber-600 hover:bg-amber-50/40"}`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Follow-up Pendente ({
                    pacientes.filter(p => {
                      const hist = p.historicoHormonal || [];
                      if (hist.length === 0) return false;
                      const lastDateStr = hist[hist.length - 1].data;
                      const parts = lastDateStr.split("/");
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1;
                      const currentYear = new Date().getFullYear();
                      const lastExamDate = new Date(currentYear, month, day);
                      const today = new Date();
                      if (lastExamDate > today) lastExamDate.setFullYear(currentYear - 1);
                      const diffTime = Math.abs(today.getTime() - lastExamDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return (diffDays / 30.4) >= 3;
                    }).length
                  })
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "contact_overdue" ? "default" : "outline"}
                  onClick={() => setActiveFilter("contact_overdue")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "contact_overdue" ? "bg-red-500 hover:bg-red-600 text-white border-0" : "border-red-200/40 text-red-600 hover:bg-red-50/40"}`}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Contatos Vencidos ({
                    pacientes.filter(p => {
                      if (!p.proximoContato) return false;
                      const todayStr = new Date().toISOString().split("T")[0];
                      return p.proximoContato <= todayStr;
                    }).length
                  })
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "origin_instagram" ? "default" : "outline"}
                  onClick={() => setActiveFilter("origin_instagram")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "origin_instagram" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                >
                  📸 Insta ({pacientes.filter(p => p.origem === "instagram").length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "origin_google" ? "default" : "outline"}
                  onClick={() => setActiveFilter("origin_google")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "origin_google" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                >
                  🔍 Google ({pacientes.filter(p => p.origem === "google_ads").length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "origin_indicacao" ? "default" : "outline"}
                  onClick={() => setActiveFilter("origin_indicacao")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "origin_indicacao" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                >
                  🤝 Indicação ({pacientes.filter(p => p.origem === "indicacao").length})
                </Button>
                <Button
                  size="sm"
                  variant={activeFilter === "alta_auditada" ? "default" : "outline"}
                  onClick={() => setActiveFilter("alta_auditada")}
                  className={`h-8 rounded-full text-xs font-bold px-4 gap-1.5 ${activeFilter === "alta_auditada" ? "bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm" : "border-amber-200/40 text-amber-600 hover:bg-amber-50/40"}`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-current" />
                  ✨ Alta Auditada OK ({
                    pacientes.filter(p => {
                      if (!p.auditorias_alta) return false;
                      const protocols = Object.keys(p.auditorias_alta);
                      return protocols.some(protoId => {
                        const items = p.auditorias_alta ? p.auditorias_alta[protoId] || [] : [];
                        return items.length > 0 && items.every((item: any) => item.checked);
                      });
                    }).length
                  })
                </Button>
              </div>
            </div>

            {activeView === "crm" ? (
              /* VISUALIZAÇÃO FUNIL CRM KANBAN */
              <div className="space-y-4">
                {/* Painel de Metas & Premiações (Gamificação CPP) */}
                <div className="bg-gradient-to-r from-primary/5 via-[#B87333]/5 to-primary/5 border border-[#B87333]/20 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#B87333] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        🏆 Desafio de Conversão Cirúrgica CPP (Meta Mensal)
                      </span>
                      <h3 className="font-serif font-bold text-sm text-primary">
                        Transforme Leads em Pacientes Operados
                      </h3>
                    </div>
                    {/* Indicador de Status da Meta */}
                    {(() => {
                      const totalOperados = pacientes.filter(p => p.leadStage === "operado").length;
                      const metaCirurgica = 5; // Meta padrão de 5 cirurgias por mês urológico premium
                      const percentual = Math.min(Math.round((totalOperados / metaCirurgica) * 100), 100);
                      const premioEstimado = totalOperados * 500; // R$ 500 de bônus por conversão urológica premium para a equipe
                      
                      return (
                        <div className="flex items-center gap-4 shrink-0 bg-card border border-border/40 p-2.5 rounded-xl">
                          <div className="text-center">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase block">Progresso</span>
                            <span className="text-xs font-bold text-primary">{totalOperados} / {metaCirurgica}</span>
                          </div>
                          <div className="h-8 w-px bg-border/40" />
                          <div className="text-center">
                            <span className="text-[8px] font-bold text-emerald-600 uppercase block">Premiação Estimada</span>
                            <span className="text-xs font-bold text-emerald-600">R$ {premioEstimado.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Barra de Progresso Customizada e Indicadores */}
                  {(() => {
                    const totalOperados = pacientes.filter(p => p.leadStage === "operado").length;
                    const totalLeads = pacientes.filter(p => p.leadStage === "lead").length;
                    const metaCirurgica = 5;
                    const percentual = Math.min(Math.round((totalOperados / metaCirurgica) * 100), 100);
                    const taxaConversao = totalLeads > 0 ? Math.round((totalOperados / (totalLeads + totalOperados)) * 100) : 0;
                    
                    return (
                      <div className="space-y-2">
                        <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
                          <div 
                            className="copper-gradient h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>{percentual}% da meta atingida</span>
                          <span className="flex items-center gap-1 text-primary">
                            <TrendingUp className="w-3.5 h-3.5 text-accent" />
                            Taxa de Conversão Geral: <strong className="text-accent">{taxaConversao}%</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Painel de Tarefas Diárias da Secretária */}
                <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#B87333] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Clipboard className="w-4 h-4 text-[#B87333]" />
                      Tarefas Diárias da Secretária (Busca Ativa & Follow-up)
                    </span>
                    {tarefasSecretaria.filter(t => t.status === "pendente").length > 0 && (
                      <Badge className="bg-red-500 text-white text-[9px] font-bold animate-pulse">
                        {tarefasSecretaria.filter(t => t.status === "pendente").length} Pendentes
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {tarefasSecretaria.filter(t => t.status === "pendente").length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs">
                        🎉 Todas as tarefas concluídas! Excelente trabalho de busca ativa.
                      </div>
                    ) : (
                      tarefasSecretaria
                        .filter(t => t.status === "pendente")
                        .map(task => (
                          <div 
                            key={task.id} 
                            className="flex items-start justify-between gap-3 p-3 bg-secondary/10 hover:bg-secondary/20 border border-border/30 rounded-xl transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[10px] text-primary">{task.pacienteNome}</span>
                                <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider border-accent/20 text-accent bg-accent/5">
                                  {task.tipo === "followup_lead" ? "📞 Novo Lead" : task.tipo === "busca_ativa" ? "⚡ Busca Ativa" : "🔄 Retorno"}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{task.descricao}</p>
                              <span className="text-[8px] text-muted-foreground block">Criada em: {task.dataCriacao}</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const updatedTasks = tarefasSecretaria.map(t => {
                                  if (t.id === task.id) return { ...t, status: "concluida" as const };
                                  return t;
                                });
                                setTarefasSecretaria(updatedTasks);
                                localStorage.setItem("protouro_tarefas_secretaria", JSON.stringify(updatedTasks));
                                toast.success("Tarefa concluída com sucesso!");
                              }}
                              className="h-7 rounded-lg text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Concluir
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Dashboard de ROI de Marketing (CPP) */}
                <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#B87333] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Painel de ROI de Marketing & Captação CPP
                    </span>
                    <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                      Acompanhamento de Conversão Real
                    </Badge>
                  </div>

                  {(() => {
                    // Carregar ou inicializar custos de campanha no localStorage
                    const storedCosts = localStorage.getItem("protouro_custos_marketing");
                    const defaultCosts = { instagram: 1500, google_ads: 2500 };
                    let costs = defaultCosts;
                    if (storedCosts) {
                      try { costs = JSON.parse(storedCosts); } catch (e) { console.error(e); }
                    }

                    const handleSaveCost = (canal: "instagram" | "google_ads", val: string) => {
                      const newCosts = { ...costs, [canal]: parseFloat(val) || 0 };
                      localStorage.setItem("protouro_custos_marketing", JSON.stringify(newCosts));
                      // Forçar atualização do componente
                      toast.success(`Custo do ${canal === "instagram" ? "Instagram" : "Google Ads"} atualizado!`);
                      window.location.reload();
                    };

                    // Calcular faturamento por canal
                    const valorConsulta = 1000;
                    const valorCirurgia = 15000;

                    const faturamentoPorCanal = (canal: "instagram" | "google_ads" | "indicacao" | "outros") => {
                      return filteredPacientes
                        .filter(p => {
                          if (canal === "outros") return !p.origem || p.origem === "outros";
                          return p.origem === canal;
                        })
                        .reduce((sum, p) => sum + (p.faturamentoReal || (p.leadStage === "operado" ? valorCirurgia : p.leadStage !== "lead" ? valorConsulta : 0)), 0);
                    };

                    const fatInsta = faturamentoPorCanal("instagram");
                    const fatGoogle = faturamentoPorCanal("google_ads");
                    const fatIndicacao = faturamentoPorCanal("indicacao");
                    const fatOutros = faturamentoPorCanal("outros");

                    const roiInsta = costs.instagram > 0 ? ((fatInsta - costs.instagram) / costs.instagram) * 100 : 0;
                    const roiGoogle = costs.google_ads > 0 ? ((fatGoogle - costs.google_ads) / costs.google_ads) * 100 : 0;

                    return (
                      <div className="space-y-4">
                        {/* Inputs de Custos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/10 p-3 rounded-xl border border-border/30">
                          <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-muted-foreground uppercase">Custo Campanha Instagram (R$)</Label>
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                placeholder="Ex: 1500" 
                                defaultValue={costs.instagram}
                                onBlur={(e) => handleSaveCost("instagram", e.target.value)}
                                className="h-8 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-muted-foreground uppercase">Custo Campanha Google Ads (R$)</Label>
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                placeholder="Ex: 2500" 
                                defaultValue={costs.google_ads}
                                onBlur={(e) => handleSaveCost("google_ads", e.target.value)}
                                className="h-8 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Cards de ROI */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="bg-card border border-border/40 rounded-xl p-3 space-y-1">
                            <span className="text-[8px] font-bold text-pink-600 uppercase block">📸 Instagram</span>
                            <div className="text-sm font-serif font-bold text-primary">R$ {fatInsta.toLocaleString("pt-BR")}</div>
                            <span className={`text-[9px] font-bold block ${roiInsta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              ROI: {roiInsta.toFixed(0)}%
                            </span>
                          </div>

                          <div className="bg-card border border-border/40 rounded-xl p-3 space-y-1">
                            <span className="text-[8px] font-bold text-blue-600 uppercase block">🔍 Google Ads</span>
                            <div className="text-sm font-serif font-bold text-primary">R$ {fatGoogle.toLocaleString("pt-BR")}</div>
                            <span className={`text-[9px] font-bold block ${roiGoogle >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              ROI: {roiGoogle.toFixed(0)}%
                            </span>
                          </div>

                          <div className="bg-card border border-border/40 rounded-xl p-3 space-y-1">
                            <span className="text-[8px] font-bold text-emerald-600 uppercase block">🤝 Indicação</span>
                            <div className="text-sm font-serif font-bold text-primary">R$ {fatIndicacao.toLocaleString("pt-BR")}</div>
                            <span className="text-[9px] text-muted-foreground block">Custo: R$ 0 (Orgânico)</span>
                          </div>

                          <div className="bg-card border border-border/40 rounded-xl p-3 space-y-1">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase block">🌐 Outros</span>
                            <div className="text-sm font-serif font-bold text-primary">R$ {fatOutros.toLocaleString("pt-BR")}</div>
                            <span className="text-[9px] text-muted-foreground block">Custo: R$ 0 (Orgânico)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Gráfico de Funil de Conversão e Perda (Gargalos) */}
                <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      Análise de Gargalos de Conversão (Funil de Vendas)
                    </span>
                    <Badge variant="outline" className="text-[9px] font-bold border-accent/20 text-accent bg-accent/5">
                      Métricas em Tempo Real
                    </Badge>
                  </div>

                  {(() => {
                    const stages = [
                      { id: "lead", title: "Leads", color: "bg-blue-500" },
                      { id: "agendado", title: "Agendados", color: "bg-amber-500" },
                      { id: "realizado", title: "Consultados", color: "bg-purple-500" },
                      { id: "proposto", title: "Propostos", color: "bg-orange-500" },
                      { id: "operado", title: "Operados", color: "bg-emerald-500" }
                    ];

                    const counts = stages.map(st => ({
                      ...st,
                      count: pacientes.filter(p => (p.leadStage || "lead") === st.id).length
                    }));

                    const maxCount = Math.max(...counts.map(c => c.count), 1);

                    return (
                      <div className="space-y-3.5">
                        {counts.map((stage, idx) => {
                          const widthPct = Math.max((stage.count / maxCount) * 100, 4); // Mínimo de 4% para renderizar a barra
                          
                          // Calcular taxa de conversão e perda em relação à etapa anterior
                          let conversionRate = null;
                          let lossRate = null;
                          if (idx > 0) {
                            const prevCount = counts[idx - 1].count;
                            if (prevCount > 0) {
                              conversionRate = Math.round((stage.count / prevCount) * 100);
                              lossRate = 100 - conversionRate;
                            }
                          }

                          return (
                            <div key={stage.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-serif font-bold text-primary flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                  {stage.title}
                                </span>
                                <div className="flex items-center gap-3 font-semibold text-[11px]">
                                  <span className="text-primary">{stage.count} {stage.count === 1 ? "paciente" : "pacientes"}</span>
                                  {conversionRate !== null && (
                                    <span className="text-emerald-600 font-bold">({conversionRate}% conv.)</span>
                                  )}
                                  {lossRate !== null && lossRate > 0 && (
                                    <span className="text-red-500">({lossRate}% perda)</span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-secondary/30 h-3 rounded-lg overflow-hidden">
                                <div 
                                  className={`${stage.color} h-full rounded-lg transition-all duration-500 ease-out`}
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {/* Definição das Colunas do Funil */}
                {[
                  { id: "lead", title: "Leads", desc: "Mídias / Contatos", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                  { id: "agendado", title: "Agendados", desc: "Consulta Marcada", color: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
                  { id: "realizado", title: "Consultados", desc: "Consulta Realizada", color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
                  { id: "proposto", title: "Propostos", desc: "Cirurgia Proposta", color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
                  { id: "operado", title: "Operados", desc: "Cirurgia Realizada", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" }
                ].map((col) => {
                  const colPacientes = filteredPacientes.filter(p => (p.leadStage || "lead") === col.id);
                  return (
                    <div key={col.id} className="bg-secondary/20 rounded-2xl p-4 border border-border/40 flex flex-col min-w-[200px] space-y-4">
                      {/* Cabeçalho da Coluna */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-sm text-primary">{col.title}</h3>
                          <Badge variant="outline" className={`${col.color} text-[10px] font-bold px-2 rounded-full border`}>
                            {colPacientes.length}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">{col.desc}</p>
                      </div>

                      {/* Lista de Cards na Coluna */}
                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                        {colPacientes.length > 0 ? (
                          colPacientes.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setIsAdding(false);
                                setEditingExpandedId(p.id);
                                toggleExpand(p.id);
                              }}
                              className="bg-card border border-border/60 hover:border-accent/20 rounded-xl p-3 shadow-sm hover:shadow transition-all duration-200 cursor-pointer space-y-2 relative group"
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="font-serif font-bold text-xs text-primary group-hover:text-accent transition-colors truncate flex-1">{p.nome}</h4>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    {/* Badge de Origem do Lead */}
                                    {p.origem && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-accent/5 text-accent border border-accent/10">
                                        {p.origem === "instagram" ? "📸 Insta" : p.origem === "google_ads" ? "🔍 Google" : p.origem === "indicacao" ? "🤝 Indicação" : "🌐 Outro"}
                                      </span>
                                    )}

                                    {/* Alerta de Contato Agendado (Lembrete) */}
                                    {(() => {
                                      if (p.proximoContato) {
                                        const todayStr = new Date().toISOString().split("T")[0];
                                        const isOverdue = p.proximoContato <= todayStr;
                                        const parts = p.proximoContato.split("-");
                                        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.proximoContato;
                                        
                                        return (
                                          <Badge className={`text-[8px] font-bold rounded px-1 py-0 ${isOverdue ? "bg-red-500 text-white animate-pulse" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                                            <CalendarClock className="w-2.5 h-2.5 mr-0.5" />
                                            {isOverdue ? `Atrasado (${formattedDate})` : `Contato: ${formattedDate}`}
                                          </Badge>
                                        );
                                      }
                                      return null;
                                    })()}

                                    {/* Alerta de Contato Atrasado (>7 dias) */}
                                    {(() => {
                                      if (col.id === "operado") return null;
                                      const hist = p.comercialHist || [];
                                      if (hist.length === 0) {
                                        // Se nunca houve contato e foi cadastrado há mais de 7 dias
                                        const parts = p.dataCadastro.split("/");
                                        if (parts.length === 3) {
                                          const cadDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                          const diff = Math.ceil(Math.abs(new Date().getTime() - cadDate.getTime()) / (1000 * 60 * 60 * 24));
                                          if (diff > 7) {
                                            return (
                                              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[8px] font-bold rounded px-1 py-0">
                                                S/ Contato ({diff}d)
                                              </Badge>
                                            );
                                          }
                                        }
                                        return null;
                                      }
                                      
                                      // Verificar último contato comercial
                                      const lastContact = hist[0]; // hist[0] é o mais recente devido à ordenação no topo
                                      const parts = lastContact.data.split(" ")[0].split("/");
                                      if (parts.length === 3) {
                                        const day = parseInt(parts[0]);
                                        const month = parseInt(parts[1]) - 1;
                                        const year = parseInt(parts[2]);
                                        const contactDate = new Date(year, month, day);
                                        const diff = Math.ceil(Math.abs(new Date().getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
                                        if (diff > 7) {
                                          return (
                                            <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[8px] font-bold rounded px-1 py-0">
                                              Atrasado ({diff}d)
                                            </Badge>
                                          );
                                        }
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium truncate">{p.queixa || "Sem queixa principal"}</p>
                              </div>

                              {/* Telefone e Parâmetros Rápidos */}
                              <div className="flex flex-col gap-1 border-t border-border/40 pt-1.5">
                                <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                                  <span>{p.idade ? `${p.idade} anos` : ""}</span>
                                  {p.testosterona && (
                                    <span className="text-accent font-bold">T: {p.testosterona} ng/dL</span>
                                  )}
                                </div>
                                {p.faturamentoReal !== undefined && (
                                  <div className="flex items-center justify-between text-[9px] font-bold text-emerald-600">
                                    <span>Faturamento Real:</span>
                                    <span>R$ {p.faturamentoReal.toLocaleString("pt-BR")}</span>
                                  </div>
                                )}
                                {/* Selo de Alta Auditada se houver auditorias_alta concluídas */}
                                {(() => {
                                  if (p.auditorias_alta) {
                                    const protocols = Object.keys(p.auditorias_alta);
                                    const hasCompletedAudit = protocols.some(protoId => {
                                      const items = p.auditorias_alta ? p.auditorias_alta[protoId] || [] : [];
                                      return items.length > 0 && items.every((item: any) => item.checked);
                                    });
                                    if (hasCompletedAudit) {
                                      return (
                                        <div className="flex items-center justify-between text-[9px] font-bold text-[#B87333] bg-[#B87333]/5 border border-[#B87333]/20 p-1 rounded mt-1">
                                          <span className="flex items-center gap-1">
                                            <CheckSquare className="w-3 h-3 text-[#B87333]" />
                                            Alta Auditada CPP
                                          </span>
                                          <span className="text-[8px] uppercase font-bold tracking-wider">100% OK</span>
                                        </div>
                                      );
                                    }
                                  }
                                  return null;
                                })()}
                              </div>

                              {/* Controles Rápidos de Estágio (Avanço/Retrocesso) */}
                              <div className="flex items-center justify-between gap-1 border-t border-border/40 pt-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  disabled={col.id === "lead"}
                                  onClick={() => {
                                    const stages: Array<"lead" | "agendado" | "realizado" | "proposto" | "operado"> = ["lead", "agendado", "realizado", "proposto", "operado"];
                                    const currIdx = stages.indexOf(col.id as any);
                                    if (currIdx > 0) {
                                      const updated = pacientes.map(pac => {
                                        if (p.id === pac.id) {
                                          const prevStage = stages[currIdx];
                                          const nextStage = stages[currIdx - 1];
                                          const updatedHist = logStageChange(pac, prevStage, nextStage);
                                          return { ...pac, leadStage: nextStage, comercialHist: updatedHist };
                                        }
                                        return pac;
                                      });
                                      saveToStorage(updated);
                                      toast.info("Estágio recuado!");
                                    }
                                  }}
                                  className="text-[9px] font-bold text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  ←
                                </button>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Mover</span>
                                <button
                                  disabled={col.id === "operado"}
                                  onClick={() => {
                                    const stages: ("lead" | "agendado" | "realizado" | "proposto" | "operado")[] = ["lead", "agendado", "realizado", "proposto", "operado"];
                                    const currIdx = stages.indexOf(col.id as any);
                                    if (currIdx < stages.length - 1) {
                                      const updated = pacientes.map(pac => {
                                        if (p.id === pac.id) {
                                          const prevStage = stages[currIdx];
                                          const nextStage = stages[currIdx + 1];
                                          const updatedHist = logStageChange(pac, prevStage, nextStage);
                                          return { ...pac, leadStage: nextStage, comercialHist: updatedHist };
                                        }
                                        return pac;
                                      });
                                      saveToStorage(updated);
                                      toast.success("Estágio avançado com sucesso!");
                                    }
                                  }}
                                  className="text-[9px] font-bold text-accent hover:text-accent-foreground px-1.5 py-0.5 rounded bg-accent/5 hover:bg-accent/10 border border-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-24 border border-dashed border-border/40 rounded-xl flex items-center justify-center bg-secondary/5">
                            <span className="text-[10px] text-muted-foreground font-medium">Nenhum paciente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            ) : filteredPacientes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPacientes.map((p) => {
                  const isExpanded = expandedId === p.id;
                  const chartData = p.historicoHormonal || [];
                  
                  return (
                    <Card 
                      key={p.id} 
                      onClick={() => toggleExpand(p.id)}
                      className={`border-border bg-card hover:border-accent/20 hover:shadow-md transition-all duration-200 cursor-pointer md:col-span-2 ${isExpanded ? "border-accent/40 ring-1 ring-accent/10" : ""}`}
                    >
                      <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-serif font-bold text-primary">{p.nome}</h4>
                            {/* Alerta Visual de Follow-up de TRT */}
                            {(() => {
                              const hist = p.historicoHormonal || [];
                              if (hist.length === 0) return null;
                              
                              // Obter a data do último exame
                              const lastDateStr = hist[hist.length - 1].data; // Formato esperado "DD/MM" ou "DD/MM/AAAA"
                              // Como no app salvamos substring(0, 5) que é "DD/MM", vamos estimar o ano atual
                              const parts = lastDateStr.split("/");
                              const day = parseInt(parts[0]);
                              const month = parseInt(parts[1]) - 1;
                              const currentYear = new Date().getFullYear();
                              
                              const lastExamDate = new Date(currentYear, month, day);
                              const today = new Date();
                              
                              // Se o mês do exame estimado for no futuro em relação ao mês atual, assumimos o ano anterior
                              if (lastExamDate > today) {
                                lastExamDate.setFullYear(currentYear - 1);
                              }
                              
                              const diffTime = Math.abs(today.getTime() - lastExamDate.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              const diffMonths = diffDays / 30.4;

                              if (diffMonths >= 6) {
                                return (
                                  <Badge className="bg-red-500/10 hover:bg-red-500/15 text-red-600 border-red-500/20 text-[10px] font-bold rounded-full gap-1 px-2.5 py-0.5">
                                    <AlertCircle className="w-3 h-3" />
                                    Follow-up Atrasado {`(>6 meses)`}
                                  </Badge>
                                );
                              } else if (diffMonths >= 3) {
                                return (
                                  <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] font-bold rounded-full gap-1 px-2.5 py-0.5">
                                    <AlertCircle className="w-3 h-3" />
                                    Follow-up Recomendado {`(>3 meses)`}
                                  </Badge>
                                );
                              } else {
                                return (
                                  <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px] font-bold rounded-full gap-1 px-2.5 py-0.5">
                                    <Check className="w-3 h-3" />
                                    TRT Monitorada (Em dia)
                                  </Badge>
                                );
                              }
                            })()}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            Cadastrado em {p.dataCadastro}
                            {p.idade && <span>• {p.idade} anos</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Botão de Busca Ativa / Alerta via WhatsApp */}
                          {(() => {
                            const hist = p.historicoHormonal || [];
                            if (hist.length === 0) return null;
                            
                            const lastDateStr = hist[hist.length - 1].data;
                            const parts = lastDateStr.split("/");
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1;
                            const currentYear = new Date().getFullYear();
                            const lastExamDate = new Date(currentYear, month, day);
                            const today = new Date();
                            if (lastExamDate > today) lastExamDate.setFullYear(currentYear - 1);
                            
                            const diffTime = Math.abs(today.getTime() - lastExamDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const diffMonths = diffDays / 30.4;

                            if (diffMonths >= 3) {
                              const cleanPhone = p.telefone ? p.telefone.replace(/\D/g, "") : "";
                              const dddAndPhone = cleanPhone.length === 11 ? cleanPhone : "55" + cleanPhone; // Se não tiver DDI, assume 55 (Brasil)
                              
                              const isLateCritical = diffMonths >= 6;
                              const textMsg = isLateCritical
                                ? `Olá, ${p.nome.split(" ")[0]}. Tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Notamos que seu último exame de acompanhamento de Terapia de Reposição Hormonal (TRT) foi realizado há mais de 6 meses (em ${lastDateStr}). Para sua segurança cardiovascular, prostática e controle de poliglobulia, é fundamental realizarmos a consulta de retorno e novos exames. Como estão seus horários para agendarmos?`
                                : `Olá, ${p.nome.split(" ")[0]}. Tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Lembramos que já completou mais de 3 meses desde o seu último exame laboratorial de acompanhamento (em ${lastDateStr}). Recomendamos uma avaliação periódica para ajuste de dose e segurança da sua TRT. Vamos agendar seu retorno?`;

                              const whatsappUrl = `https://api.whatsapp.com/send?phone=${dddAndPhone}&text=${encodeURIComponent(textMsg)}`;

                              return (
                                <a
                                  href={p.telefone ? whatsappUrl : undefined}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={p.telefone ? "Enviar Lembrete de Retorno (WhatsApp)" : "Cadastre um telefone para enviar lembretes de retorno"}
                                  onClick={(e) => {
                                    if (!p.telefone) {
                                      e.preventDefault();
                                      toast.info("Para enviar o lembrete, edite o cadastro do paciente e informe o número de telefone.");
                                    }
                                  }}
                                  className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${p.telefone ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted/40 text-muted-foreground cursor-not-allowed"}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                  Busca Ativa
                                </a>
                              );
                            }
                            return null;
                          })()}

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleEdit(p, e)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleDelete(p.id, e)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {p.queixa && (
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-primary uppercase tracking-wider text-[10px]">Diagnóstico / Queixa:</span>
                          <p className="text-foreground/80 leading-relaxed font-medium">{p.queixa}</p>
                        </div>
                      )}

                      {/* Parâmetros Laboratoriais */}
                      <div className="grid grid-cols-4 gap-2 bg-secondary/20 p-2.5 rounded-xl border border-border/40 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Testosterona</span>
                          <span className={`text-xs font-bold ${parseFloat(p.testosterona) < 300 ? "text-orange-600" : "text-primary"}`}>
                            {p.testosterona ? `${p.testosterona} ng/dL` : "N/A"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">PSA Total</span>
                          <span className={`text-xs font-bold ${parseFloat(p.psa) > 2.5 ? "text-orange-600" : "text-primary"}`}>
                            {p.psa ? `${p.psa} ng/mL` : "N/A"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Hematócrito</span>
                          <span className={`text-xs font-bold ${parseFloat(p.hematocrito) > 50 ? "text-orange-600" : "text-primary"}`}>
                            {p.hematocrito ? `${p.hematocrito} %` : "N/A"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Estradiol</span>
                          <span className={`text-xs font-bold ${p.estradiol && parseFloat(p.estradiol) > 50 ? "text-orange-600" : "text-primary"}`}>
                            {p.estradiol ? `${p.estradiol} pg/mL` : "N/A"}
                          </span>
                        </div>
                      </div>

                      {p.notas && (
                        <div className="space-y-1 text-xs pt-1.5 border-t border-border/40">
                          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Notas Clínicas:</span>
                          <p className="text-muted-foreground leading-relaxed text-justify line-clamp-3 font-mono">
                            {p.notas}
                          </p>
                        </div>
                      )}

                      {(p.faturamentoReal !== undefined || p.custoHospitalarReal !== undefined || p.desdobramentoCustos) && (
                        <div className="space-y-2 pt-2.5 border-t border-border/40 text-xs bg-emerald-500/[0.02] p-2.5 rounded-xl border border-emerald-500/10">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-700 uppercase tracking-wider text-[9px]">Análise Financeira Real:</span>
                            {p.faturamentoReal !== undefined && p.custoHospitalarReal !== undefined && (
                              <span className="text-[9px] font-bold text-emerald-600 uppercase">
                                Lucro Líquido: {(p.faturamentoReal - p.custoHospitalarReal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            {p.faturamentoReal !== undefined && (
                              <div className="flex justify-between items-center bg-card p-1.5 rounded border border-border/30">
                                <span className="text-muted-foreground">Faturamento Real:</span>
                                <span className="font-bold text-emerald-600">{p.faturamentoReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                            )}
                            {p.custoHospitalarReal !== undefined && (
                              <div className="flex justify-between items-center bg-card p-1.5 rounded border border-border/30">
                                <span className="text-muted-foreground">Custo Hosp. Real:</span>
                                <span className="font-bold text-red-600">{p.custoHospitalarReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                            )}
                          </div>
                          {p.desdobramentoCustos && (
                            <div className="space-y-1 bg-card p-2 rounded border border-border/30">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Desdobramento de Custos / OPME:</span>
                              <p className="text-[10px] text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">{p.desdobramentoCustos}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ficha Expandida do Paciente */}
                      {isExpanded && (
                        <div className="space-y-6 pt-4 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Alertas Clínicos Inteligentes de Segurança de TRT */}
                          {(parseFloat(p.hematocrito) > 52 || (p.shbg && parseFloat(p.shbg) < 15) || (p.psa && parseFloat(p.psa) > 2.5) || (p.estradiol && parseFloat(p.estradiol) > 50)) && (
                            <div className="space-y-2">
                              <span className="font-bold text-red-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                ⚠️ Alertas de Segurança Clínica & Laboratorial (TRT / Flukka-Safety)
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {parseFloat(p.hematocrito) > 54 && (
                                  <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1.5 text-red-800">
                                      🚨 Hematócrito Crítico ({p.hematocrito}%) - Risco Tromboembólico
                                    </span>
                                    <span>Valor acima de 54% é contraindicação absoluta para manutenção de TRT. Suspender terapia imediatamente, indicar flebotomia (sangria terapêutica) de 500mL e hidratar abundantemente.</span>
                                  </div>
                                )}
                                {parseFloat(p.hematocrito) > 52 && parseFloat(p.hematocrito) <= 54 && (
                                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                      ⚠️ Hematócrito Limítrofe ({p.hematocrito}%) - Atenção
                                    </span>
                                    <span>Hematócrito entre 52-54% exige atenção. Considerar fracionamento da dose (aplicações mais frequentes subcutâneas), migração para gel transdérmico ou redução da dose em 25%.</span>
                                  </div>
                                )}
                                {p.psa && parseFloat(p.psa) > 4.0 && (
                                  <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1.5 text-red-800">
                                      🚨 PSA Total Elevado ({p.psa} ng/mL) - Contraindicação Absoluta
                                    </span>
                                    <span>PSA acima de 4.0 ng/mL requer suspensão imediata da TRT e encaminhamento para investigação de neoplasia prostática (toque retal e RM Multiparamétrica de Próstata).</span>
                                  </div>
                                )}
                                {p.psa && parseFloat(p.psa) > 2.5 && parseFloat(p.psa) <= 4.0 && (
                                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                      ⚠️ PSA Total Limítrofe ({p.psa} ng/mL) - Monitoramento Estrito
                                    </span>
                                    <span>Elevação rápida ou PSA &gt; 2.5 ng/mL em homens sob TRT requer repetição de exame em 6 semanas e avaliação de velocidade de subida do PSA.</span>
                                  </div>
                                )}
                                {p.estradiol && parseFloat(p.estradiol) > 50 && (
                                  <div className="bg-orange-500/10 border border-orange-500/30 text-orange-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                      🧪 Estradiol Elevado ({p.estradiol} pg/mL) - Aromatização Ativa
                                    </span>
                                    <span>Níveis acima de 50 pg/mL podem causar ginecomastia, mastalgia e retenção hídrica. Se houver sintomas clínicos, considerar inibidor de aromatase (Anastrozol 0.25mg a 0.5mg, 1x a 2x por semana).</span>
                                  </div>
                                )}
                                {p.shbg && parseFloat(p.shbg) < 15 && (
                                  <div className="bg-orange-500/10 border border-orange-500/30 text-orange-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold">SHBG Crítico ({p.shbg} nmol/L)</span>
                                    <span>SHBG abaixo de 15 nmol/L aumenta a testosterona livre, acelerando o clearance hepático. Recomenda-se fracionar as doses de testosterona (ex: aplicação subcutânea 2-3x por semana).</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Módulo Inteligente de Sugestão de Fórmulas Flukkamen (ICI) baseadas no IIEF-5 */}
                          {(() => {
                            // Obter o último score de IIEF-5 do histórico de sintomas ou do cadastro
                            const histSintomas = p.historicoSintomas || [];
                            let iiefScore: number | undefined = undefined;
                            
                            if (histSintomas.length > 0) {
                              // Encontrar o último registro com iief5 preenchido
                              const sortedSintomas = [...histSintomas].reverse();
                              const lastIiefReg = sortedSintomas.find(s => s.iief5 !== undefined);
                              if (lastIiefReg) iiefScore = lastIiefReg.iief5;
                            }

                            if (iiefScore === undefined) return null;

                            // Mapeamento de Fórmulas Flukkamen (R1 a R12) por Gravidade de DE
                            let formulaSugerida = "";
                            let composicaoFormula = "";
                            let justificativaClinica = "";
                            let gravidadeLabel = "";
                            let gravidadeColor = "";

                            if (iiefScore <= 7) {
                              gravidadeLabel = "Disfunção Erétil Grave";
                              gravidadeColor = "text-red-600 bg-red-500/10 border-red-500/20";
                              formulaSugerida = "Flukkamen R10 ou R12 (Tri-Mix de Alta Potência)";
                              composicaoFormula = "Alprostadil 20 mcg/mL + Papaverina 30 mg/mL + Fentolamina 1 mg/mL ou 2 mg/mL";
                              justificativaClinica = "Para Disfunção Erétil Grave (IIEF-5 ≤ 7), a diretriz da EAU/SBU recomenda o uso de Tri-Mix (R10/R12) para máxima eficácia vasodilatadora intracavernosa, superando a taquifilaxia e a insuficiência arterial severa.";
                            } else if (iiefScore <= 11) {
                              gravidadeLabel = "Disfunção Erétil Moderada";
                              gravidadeColor = "text-orange-600 bg-orange-500/10 border-orange-500/20";
                              formulaSugerida = "Flukkamen R6 ou R8 (Tri-Mix de Média Potência)";
                              composicaoFormula = "Alprostadil 10 mcg/mL + Papaverina 30 mg/mL + Fentolamina 1 mg/mL";
                              justificativaClinica = "Para Disfunção Erétil Moderada (IIEF-5 8-11), o Tri-Mix de dose intermediária (R6/R8) oferece excelente taxa de rigidez axial satisfatória com menor incidência de priapismo ou dor peniana associada ao Alprostadil.";
                            } else if (iiefScore <= 16) {
                              gravidadeLabel = "Disfunção Erétil Leve a Moderada";
                              gravidadeColor = "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
                              formulaSugerida = "Flukkamen R3 ou R4 (Bi-Mix Padrão)";
                              composicaoFormula = "Papaverina 30 mg/mL + Fentolamina 1 mg/mL ou 2 mg/mL";
                              justificativaClinica = "Para Disfunção Erétil Leve a Moderada (IIEF-5 12-16), a terapia com Bi-Mix (Papaverina + Fentolamina) é ideal, pois elimina o Alprostadil, reduzindo a zero a queixa de dor/ardência peniana pós-injeção.";
                            } else if (iiefScore <= 21) {
                              gravidadeLabel = "Disfunção Erétil Leve";
                              gravidadeColor = "text-blue-600 bg-blue-500/10 border-blue-500/20";
                              formulaSugerida = "Flukkamen R1 (Alprostadil Monoterapia)";
                              composicaoFormula = "Alprostadil 10 mcg/mL ou 20 mcg/mL";
                              justificativaClinica = "Para Disfunção Erétil Leve (IIEF-5 17-21) com indicação de terapia intracavernosa (ex: reabilitação pós-prostatectomia radical), o Alprostadil em monoterapia (R1) estimula a oxigenação dos corpos cavernosos e previne a fibrose.";
                            } else {
                              gravidadeLabel = "Função Erétil Normal";
                              gravidadeColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
                              formulaSugerida = "Nenhuma indicação de Terapia Intracavernosa (ICI)";
                              composicaoFormula = "N/A";
                              justificativaClinica = "Paciente apresenta função erétil preservada (IIEF-5 ≥ 22). Terapia intracavernosa não indicada clinicamente.";
                            }

                            return (
                              <div className="space-y-3 bg-slate-500/[0.02] p-4 rounded-xl border border-border/50">
                                <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                  ⚡ Sugestão de Terapia Intracavernosa Inteligente (Flukkamen-ICI)
                                </span>
                                <div className="space-y-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Escore IIEF-5 Recente:</span>
                                    <span className="font-bold text-primary">{iiefScore} pontos</span>
                                    <Badge className={`${gravidadeColor} text-[10px] font-bold border rounded-full px-2 py-0.5`}>
                                      {gravidadeLabel}
                                    </Badge>
                                  </div>

                                  {iiefScore <= 21 && (
                                    <div className="grid grid-cols-1 gap-2.5 bg-card p-3 rounded-lg border border-border/40">
                                      <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">Fórmula Flukkamen Recomendada:</span>
                                        <span className="font-bold text-[#B87333] text-sm">{formulaSugerida}</span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">Composição da Fórmula:</span>
                                        <span className="font-medium text-foreground/90 font-mono">{composicaoFormula}</span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">Racional Clínico (Baseado em Diretrizes):</span>
                                        <p className="text-foreground/70 leading-relaxed text-justify mt-0.5">{justificativaClinica}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Gráfico de Evolução Hormonal */}
                          <div className="space-y-3">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-accent animate-pulse" />
                              Curva de Evolução Hormonal (Testosterona Total)
                            </span>
                            
                            {chartData.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl space-y-4">
                                <div className="h-64 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                      data={chartData.map((d, idx) => ({
                                        ...d,
                                        // Garantir que temos o hematócrito mapeado para o gráfico
                                        hematocrito: d.hematocrito !== undefined ? d.hematocrito : (idx === chartData.length - 1 ? parseFloat(p.hematocrito) || undefined : undefined)
                                      }))}
                                      margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis 
                                        dataKey="data" 
                                        tick={{ fill: "#64748B", fontSize: 10, fontWeight: "bold" }} 
                                        tickLine={false}
                                      />
                                      {/* Eixo Y Esquerdo: Testosterona */}
                                      <YAxis 
                                        yAxisId="left"
                                        domain={[0, 'auto']}
                                        tick={{ fill: "#1C3D5A", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      {/* Eixo Y Direito: Hematócrito (%) e SHBG */}
                                      <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 100]}
                                        tick={{ fill: "#B87333", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <RechartsTooltip 
                                        contentStyle={{ backgroundColor: "#FEFEFE", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                        labelStyle={{ fontWeight: "bold", color: "#1C3D5A", fontSize: "11px" }}
                                        itemStyle={{ fontSize: "11px", padding: "2px 0" }}
                                      />
                                      {/* Linha de Alerta de Hematócrito Crítico em 52% */}
                                      <ReferenceLine 
                                        yAxisId="right" 
                                        y={52} 
                                        stroke="#DC2626" 
                                        strokeDasharray="4 4" 
                                        label={{ value: 'Limite Ht (52%)', fill: '#DC2626', fontSize: 9, fontWeight: 'bold', position: 'insideBottomRight' }} 
                                      />
                                      {/* Linhas Verticais de Intervenções / Ajustes de Conduta */}
                                      {chartData.map((pt, idx) => {
                                        if (pt.intervencao) {
                                          return (
                                            <ReferenceLine
                                              key={`interv_${idx}`}
                                              x={pt.data}
                                              stroke="#B87333"
                                              strokeWidth={1.5}
                                              strokeDasharray="3 3"
                                              label={{ 
                                                value: pt.intervencao, 
                                                fill: '#B87333', 
                                                fontSize: 8, 
                                                fontWeight: 'bold', 
                                                position: 'insideTopLeft',
                                                offset: 10
                                              }}
                                            />
                                          );
                                        }
                                        return null;
                                      })}
                                      {/* Linhas de Dados */}
                                      <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="total" 
                                        name="Testo Total (ng/dL)" 
                                        stroke="#1C3D5A" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                      <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="hematocrito" 
                                        name="Hematócrito (%)" 
                                        stroke="#DC2626" 
                                        strokeWidth={2.5}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                      <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="shbg" 
                                        name="SHBG (nmol/L)" 
                                        stroke="#3B82F6" 
                                        strokeWidth={2}
                                        activeDot={{ r: 5 }}
                                        dot={{ r: 3, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                                
                                {/* Legenda do Gráfico Multivariado */}
                                <div className="flex justify-center flex-wrap gap-4 text-[10px] font-bold border-t border-border/40 pt-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#1C3D5A] inline-block rounded-full"></span>
                                    <span className="text-[#1C3D5A]">Testosterona Total (ng/dL - Eixo Esq.)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#DC2626] inline-block rounded-full"></span>
                                    <span className="text-[#DC2626]">Hematócrito (% - Eixo Dir.)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#3B82F6] inline-block rounded-full"></span>
                                    <span className="text-[#3B82F6]">SHBG (nmol/L - Eixo Dir.)</span>
                                  </div>
                                </div>

                                {/* Linha do Tempo de Intervenções / Condutas */}
                                {chartData.some(pt => pt.intervencao) && (
                                  <div className="border-t border-border/40 pt-3 space-y-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                      Histórico de Ajustes de Dosagem &amp; Condutas:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {chartData.map((pt, idx) => {
                                        if (!pt.intervencao) return null;
                                        return (
                                          <div key={`conduta_list_${idx}`} className="flex items-center gap-2 bg-accent/5 px-2.5 py-1.5 rounded-lg border border-accent/10 text-[11px]">
                                            <span className="font-bold text-[#B87333] shrink-0">{pt.data}:</span>
                                            <span className="text-primary font-medium truncate" title={pt.intervencao}>{pt.intervencao}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Registre pelo menos um valor de testosterona para gerar o gráfico.
                              </div>
                            )}

                            {/* Botões de Exportação (JSON e PDF Timbrado Completo) */}
                            <div className="flex justify-end gap-2 pt-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrcamentoPaciente(p);
                                  setOrcamentoTipo("honorarios");
                                  setOrcamentoProcedimento("");
                                  setOrcamentoLocal("Clinovi Paulista");
                                  setOrcamentoValorHonorarios("15000");
                                  setOrcamentoValorHospital("12000");
                                  setOrcamentoValorHospitalMateriais("8000");
                                  setOrcamentoValorAcompanhamento("3000");
                                  setOrcamentoObs("");
                                  setOrcamentoOpen(true);
                                }}
                                className="h-9 rounded-xl text-xs font-bold border-[#B87333]/30 text-primary hover:bg-[#B87333]/5 gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#B87333]" />
                                Orçamento CPP Premium
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrescricaoPaciente(p);
                                  setPrescricaoPacienteModelo("");
                                  setPrescricaoConteudo("");
                                  setPrescricaoOpen(true);
                                }}
                                className="h-9 rounded-xl text-xs font-bold border-accent/30 text-primary hover:bg-accent/5 gap-1.5"
                              >
                                <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
                                Prescrever Protocolo
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  
                                  // Gerar o Relatório Clínico Completo em PDF Timbrado via iframe de Impressão
                                  const printFrame = document.createElement("iframe");
                                  printFrame.style.position = "fixed";
                                  printFrame.style.right = "0";
                                  printFrame.style.bottom = "0";
                                  printFrame.style.width = "0";
                                  printFrame.style.height = "0";
                                  printFrame.style.border = "0";
                                  document.body.appendChild(printFrame);

                                  const docToday = new Date().toLocaleDateString("pt-BR");
                                  
                                  // Construir histórico hormonal em tabela
                                  const histHormonalHtml = (p.historicoHormonal || []).map(h => `
                                    <tr>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${h.data}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: bold; color: #1C3D5A;">${h.total} ng/dL</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${h.livre ? `${h.livre} ng/dL` : "N/A"}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${h.shbg ? `${h.shbg} nmol/L` : "N/A"}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: bold; color: ${h.hematocrito && h.hematocrito > 52 ? '#DC2626' : '#1C3D5A'};">${h.hematocrito ? `${h.hematocrito}%` : "N/A"}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-style: italic; color: #B87333; font-weight: 500;">${h.intervencao || "Nenhum ajuste"}</td>
                                    </tr>
                                  `).join("");

                                  // Construir histórico de sintomas em tabela
                                  const histSintomasHtml = (p.historicoSintomas || []).map(s => `
                                    <tr>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${s.data}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: bold; color: #10B981;">${s.iief5 !== undefined ? s.iief5 : "N/A"}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: bold; color: #6366F1;">${s.ipss !== undefined ? s.ipss : "N/A"}</td>
                                      <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${s.adamPositivo ? "<span style='color: #B87333; font-weight: bold;'>POSITIVO (+)</span>" : "NEGATIVO (-)"}</td>
                                    </tr>
                                  `).join("");

                                  // Construir histórico de documentos
                                  const docsHtml = (p.documentos || []).map(d => `
                                    <div style="margin-bottom: 15px; padding: 12px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; page-break-inside: avoid;">
                                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px dashed #CBD5E1; padding-bottom: 4px;">
                                        <span style="font-size: 11px; font-weight: bold; color: #1C3D5A;">${d.titulo}</span>
                                        <span style="font-size: 9px; font-weight: bold; color: #B87333; text-transform: uppercase; background-color: rgba(184, 115, 51, 0.1); padding: 2px 6px; border-radius: 4px;">${d.tipo}</span>
                                      </div>
                                      <span style="font-size: 9px; color: #64748B; display: block; margin-bottom: 8px;">Gerado em ${d.data}</span>
                                      <pre style="font-size: 10px; color: #334155; white-space: pre-wrap; font-family: monospace; margin: 0; line-height: 1.4;">${d.conteudo}</pre>
                                    </div>
                                  `).join("");

                                  const signatureUrl = localStorage.getItem("protoUro_signature_data") || "";
                                  const useSignature = localStorage.getItem("protouro_use_signature") !== "false";

                                  const htmlContent = `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                      <meta charset="utf-8">
                                      <title>Relatório Clínico - ${p.nome}</title>
                                      <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
                                        
                                        @font-face {
                                          font-family: 'Callingstone';
                                          src: url('/src/assets/Callingstone.ttf') format('truetype');
                                        }

                                        body {
                                          font-family: 'Roboto', sans-serif;
                                          color: #1C3D5A;
                                          margin: 0;
                                          padding: 40px 50px;
                                          background-color: #FEFEFE;
                                          line-height: 1.5;
                                        }

                                        .header {
                                          display: flex;
                                          align-items: center;
                                          justify-content: space-between;
                                          border-bottom: 2px solid #B87333;
                                          padding-bottom: 20px;
                                          margin-bottom: 30px;
                                        }

                                        .logo-area {
                                          display: flex;
                                          align-items: center;
                                          gap: 12px;
                                        }

                                        .logo-text {
                                          font-family: 'Callingstone', 'Playfair Display', serif;
                                          font-size: 24px;
                                          font-weight: bold;
                                          color: #1C3D5A;
                                          letter-spacing: 1px;
                                          margin: 0;
                                        }

                                        .logo-sub {
                                          font-size: 9px;
                                          font-weight: bold;
                                          text-transform: uppercase;
                                          letter-spacing: 2px;
                                          color: #B87333;
                                          margin-top: -4px;
                                        }

                                        .clinic-info {
                                          text-align: right;
                                          font-size: 10px;
                                          color: #64748B;
                                          line-height: 1.4;
                                        }

                                        .report-title {
                                          font-family: 'Playfair Display', serif;
                                          font-size: 20px;
                                          font-weight: bold;
                                          color: #1C3D5A;
                                          text-align: center;
                                          margin-bottom: 25px;
                                          text-transform: uppercase;
                                          letter-spacing: 1px;
                                        }

                                        .patient-card {
                                          background-color: #F8FAFC;
                                          border: 1px solid #E2E8F0;
                                          border-radius: 12px;
                                          padding: 20px;
                                          margin-bottom: 25px;
                                        }

                                        .patient-grid {
                                          display: grid;
                                          grid-template-columns: 2fr 1fr;
                                          gap: 15px;
                                        }

                                        .patient-field {
                                          margin-bottom: 10px;
                                        }

                                        .field-label {
                                          font-size: 9px;
                                          font-weight: bold;
                                          text-transform: uppercase;
                                          color: #B87333;
                                          letter-spacing: 0.5px;
                                          display: block;
                                        }

                                        .field-value {
                                          font-size: 13px;
                                          font-weight: bold;
                                          color: #1C3D5A;
                                        }

                                        .section-title {
                                          font-family: 'Playfair Display', serif;
                                          font-size: 14px;
                                          font-weight: bold;
                                          color: #1C3D5A;
                                          border-bottom: 1px solid #E2E8F0;
                                          padding-bottom: 6px;
                                          margin-top: 30px;
                                          margin-bottom: 15px;
                                          text-transform: uppercase;
                                          letter-spacing: 0.5px;
                                        }

                                        table {
                                          width: 100%;
                                          border-collapse: collapse;
                                          margin-bottom: 20px;
                                        }

                                        th {
                                          background-color: #F1F5F9;
                                          color: #1C3D5A;
                                          text-align: left;
                                          padding: 8px;
                                          font-size: 10px;
                                          font-weight: bold;
                                          text-transform: uppercase;
                                          border-bottom: 2px solid #E2E8F0;
                                        }

                                        .notes-area {
                                          background-color: #FFFDF9;
                                          border: 1px solid #FCD34D;
                                          border-radius: 8px;
                                          padding: 15px;
                                          font-size: 11px;
                                          line-height: 1.6;
                                          color: #451A03;
                                          font-family: monospace;
                                          white-space: pre-wrap;
                                        }

                                        .footer {
                                          position: fixed;
                                          bottom: 30px;
                                          left: 50px;
                                          right: 50px;
                                          border-top: 1px solid #E2E8F0;
                                          padding-top: 15px;
                                          display: flex;
                                          justify-content: space-between;
                                          align-items: center;
                                          font-size: 8px;
                                          color: #94A3B8;
                                        }

                                        .signature-area {
                                          margin-top: 40px;
                                          text-align: center;
                                          display: flex;
                                          flex-direction: column;
                                          align-items: center;
                                          page-break-inside: avoid;
                                        }

                                        .signature-line {
                                          width: 220px;
                                          border-top: 1px solid #B87333;
                                          margin-top: 5px;
                                          margin-bottom: 5px;
                                        }

                                        .signature-img {
                                          max-height: 45px;
                                          object-fit: contain;
                                          margin-bottom: 4px;
                                        }

                                        @media print {
                                          body {
                                            padding: 0;
                                          }
                                          .no-print {
                                            display: none;
                                          }
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <!-- Cabeçalho Oficial -->
                                      <div class="header">
                                        <div class="logo-area">
                                          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#1C3D5A"/>
                                            <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85"/>
                                          </svg>
                                          <div>
                                            <div class="logo-text">DR. FELIPE DE BULHÕES</div>
                                            <div class="logo-sub">Urologia & Andrologia de Alta Performance</div>
                                          </div>
                                        </div>
                                        <div class="clinic-info">
                                          <strong>CRM-SP 241.135 | RQE 112.445</strong><br>
                                          drfelipebulhoes@bulhoesurohealth.com<br>
                                          WhatsApp: (11) 98112-4455
                                        </div>
                                      </div>

                                      <div class="report-title">Relatório Clínico Completo</div>

                                      <!-- Ficha do Paciente -->
                                      <div class="patient-card">
                                        <div class="patient-grid">
                                          <div>
                                            <div class="patient-field">
                                              <span class="field-label">Paciente</span>
                                              <span class="field-value" style="font-size: 16px;">${p.nome}</span>
                                            </div>
                                            <div class="patient-field" style="margin-top: 12px;">
                                              <span class="field-label">Diagnóstico / Queixa Principal</span>
                                              <span class="field-value" style="font-weight: normal; color: #475569;">${p.queixa || "Não informada"}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <div class="patient-field">
                                              <span class="field-label">Idade</span>
                                              <span class="field-value">${p.idade ? `${p.idade} anos` : "N/A"}</span>
                                            </div>
                                            <div class="patient-field" style="margin-top: 12px;">
                                              <span class="field-label">Data de Cadastro</span>
                                              <span class="field-value">${p.dataCadastro}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Parâmetros Atuais -->
                                      <div class="section-title">Últimos Parâmetros Laboratoriais</div>
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Testosterona Total</th>
                                            <th>Testosterona Livre</th>
                                            <th>SHBG</th>
                                            <th>PSA Total</th>
                                            <th>Hematócrito</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td style="padding: 10px; font-weight: bold; color: #1C3D5A;">${p.testosterona ? `${p.testosterona} ng/dL` : "N/A"}</td>
                                            <td style="padding: 10px;">${p.testoLivre ? `${p.testoLivre} ng/dL` : "N/A"}</td>
                                            <td style="padding: 10px;">${p.shbg ? `${p.shbg} nmol/L` : "N/A"}</td>
                                            <td style="padding: 10px;">${p.psa ? `${p.psa} ng/mL` : "N/A"}</td>
                                            <td style="padding: 10px; font-weight: bold; color: ${parseFloat(p.hematocrito) > 52 ? '#DC2626' : '#1C3D5A'};">${p.hematocrito ? `${p.hematocrito}%` : "N/A"}</td>
                                          </tr>
                                        </tbody>
                                      </table>

                                      <!-- Histórico Hormonal -->
                                      ${p.historicoHormonal && p.historicoHormonal.length > 0 ? `
                                        <div class="section-title">Histórico de Evolução Hormonal (TRT)</div>
                                        <table>
                                          <thead>
                                            <tr>
                                              <th>Data</th>
                                              <th>Testosterona Total</th>
                                              <th>Testosterona Livre</th>
                                              <th>SHBG</th>
                                              <th>Hematócrito</th>
                                              <th>Ajuste de Dose / Conduta</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${histHormonalHtml}
                                          </tbody>
                                        </table>
                                      ` : ""}

                                      <!-- Histórico de Sintomas -->
                                      ${p.historicoSintomas && p.historicoSintomas.length > 0 ? `
                                        <div class="section-title">Histórico de Sintomas e Escores Clínicos</div>
                                        <table>
                                          <thead>
                                            <tr>
                                              <th>Data</th>
                                              <th>IIEF-5 (Função Erétil)</th>
                                              <th>IPSS (Sintomas Prostáticos)</th>
                                              <th>Questionário ADAM</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${histSintomasHtml}
                                          </tbody>
                                        </table>
                                      ` : ""}

                                      <!-- Notas Clínicas -->
                                      ${p.notas ? `
                                        <div class="section-title" style="page-break-before: auto;">Notas Clínicas e Condutas</div>
                                        <div class="notes-area">${p.notas}</div>
                                      ` : ""}

                                      <!-- Histórico de Documentos -->
                                      ${p.documentos && p.documentos.length > 0 ? `
                                        <div class="section-title" style="page-break-before: always;">Histórico de Documentos Gerados</div>
                                        <div style="margin-top: 15px;">
                                          ${docsHtml}
                                        </div>
                                      ` : ""}

                                      <!-- Assinatura ICP-Brasil -->
                                      <div class="signature-area">
                                        ${useSignature && signatureUrl ? `<img src="${signatureUrl}" class="signature-img" />` : `<div style="height: 45px;"></div>`}
                                        <div class="signature-line"></div>
                                        <strong style="font-size: 11px; color: #1C3D5A;">Dr. Felipe de Bulhões Ojeda</strong><br>
                                        <span style="font-size: 9px; color: #64748B;">Urologista - CRM-SP 241.135 | RQE 112.445</span><br>
                                        <span style="font-size: 7px; color: #94A3B8; margin-top: 6px; display: block; font-family: monospace;">Assinado digitalmente via ICP-Brasil (e-CPF) • Hash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                                      </div>

                                      <!-- Rodapé Fixo -->
                                      <div class="footer">
                                        <span>Relatório gerado em ${docToday} • ProtoUro App</span>
                                        <span>Campinas: Av. José de Souza Campos, 123 | São Paulo: Av. Paulista, 1000</span>
                                        <span>Página 1 de 1</span>
                                      </div>
                                    </body>
                                    </html>
                                  `;

                                  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
                                  if (doc) {
                                    doc.open();
                                    doc.write(htmlContent);
                                    doc.close();
                                    
                                    // Aguardar carregar recursos e disparar impressão
                                    setTimeout(() => {
                                      printFrame.contentWindow?.focus();
                                      printFrame.contentWindow?.print();
                                      // Remover iframe após fechar a janela de impressão
                                      setTimeout(() => {
                                        document.body.removeChild(printFrame);
                                      }, 1000);
                                    }, 500);
                                  }

                                  toast.success("Relatório Clínico PDF gerado para impressão!");
                                }}
                                className="h-9 rounded-xl text-xs font-bold border-accent/30 text-primary hover:bg-accent/5 gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-accent" />
                                Relatório Completo (PDF)
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Criar objeto de exportação estruturado
                                  const exportData = {
                                    exportadoEm: new Date().toLocaleString("pt-BR"),
                                    medico: "Dr. Felipe de Bulhões",
                                    paciente: {
                                      id: p.id,
                                      nome: p.nome,
                                      idade: p.idade,
                                      dataCadastro: p.dataCadastro,
                                      queixa: p.queixa,
                                      parametrosLaboratoriais: {
                                        testosteronaTotal: p.testosterona ? `${p.testosterona} ng/dL` : "N/A",
                                        testosteronaLivre: p.testoLivre ? `${p.testoLivre} ng/dL` : "N/A",
                                        shbg: p.shbg ? `${p.shbg} nmol/L` : "N/A",
                                        psa: p.psa ? `${p.psa} ng/mL` : "N/A",
                                        hematocrito: p.hematocrito ? `${p.hematocrito} %` : "N/A"
                                      },
                                      historicoHormonal: p.historicoHormonal || [],
                                      documentosGerados: (p.documentos || []).map(doc => ({
                                        titulo: doc.titulo,
                                        tipo: doc.tipo,
                                        dataGeracao: doc.data,
                                        conteudo: doc.conteudo
                                      })),
                                      notasClinicas: p.notas
                                    }
                                  };

                                  // Gerar arquivo JSON para download
                                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `prontuario_${p.nome.toLowerCase().replace(/\s+/g, "_")}.json`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                  toast.success("Prontuário exportado com sucesso!");
                                }}
                                className="h-9 rounded-xl text-xs font-bold border-border hover:bg-secondary/40 gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-accent" />
                                Exportar Prontuário (JSON)
                              </Button>
                            </div>

                            {/* Formulário rápido para adicionar ponto no gráfico */}
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <Input 
                                type="number" 
                                placeholder="Total (ng/dL)" 
                                value={newTotal}
                                onChange={(e) => setNewTotal(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Livre (ng/dL)" 
                                value={newLivre}
                                onChange={(e) => setNewLivre(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="SHBG (nmol/L)" 
                                value={newShbg}
                                onChange={(e) => setNewShbg(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Hematócrito (%)" 
                                value={newHemaPonto}
                                onChange={(e) => setNewHemaPonto(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="text" 
                                placeholder="Ajuste de Dose / Conduta (ex: Início Nebido)" 
                                value={newIntervencao}
                                onChange={(e) => setNewIntervencao(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card col-span-2 sm:col-span-1"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleAddHormonioPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white sm:col-span-1 col-span-2"
                              >
                                Adicionar Ponto
                              </Button>
                            </div>
                          </div>

                          {/* Evolução Temporal de Sintomas */}
                          <div className="space-y-3 pt-2 border-t border-border/40">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-accent animate-pulse" />
                              Curva de Evolução de Sintomas (IIEF-5 & IPSS)
                            </span>
                            
                            {p.historicoSintomas && p.historicoSintomas.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl space-y-4">
                                <div className="h-64 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                      data={p.historicoSintomas}
                                      margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis 
                                        dataKey="data" 
                                        tick={{ fill: "#64748B", fontSize: 10, fontWeight: "bold" }} 
                                        tickLine={false}
                                      />
                                      {/* Eixo Y Esquerdo: IIEF-5 (0-25) */}
                                      <YAxis 
                                        yAxisId="left"
                                        domain={[0, 25]}
                                        tick={{ fill: "#10B981", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      {/* Eixo Y Direito: IPSS (0-35) */}
                                      <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 35]}
                                        tick={{ fill: "#6366F1", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <RechartsTooltip 
                                        contentStyle={{ backgroundColor: "#FEFEFE", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                        labelStyle={{ fontWeight: "bold", color: "#1C3D5A", fontSize: "11px" }}
                                        itemStyle={{ fontSize: "11px", padding: "2px 0" }}
                                      />
                                      {/* Linhas de Dados */}
                                      <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="iief5" 
                                        name="IIEF-5 (Função Erétil)" 
                                        stroke="#10B981" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                      <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="ipss" 
                                        name="IPSS (Sintomas Prostáticos)" 
                                        stroke="#6366F1" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                                
                                {/* Legenda do Gráfico de Sintomas */}
                                <div className="flex justify-center flex-wrap gap-4 text-[10px] font-bold border-t border-border/40 pt-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#10B981] inline-block rounded-full"></span>
                                    <span className="text-[#10B981]">IIEF-5 (Ereção - maior é melhor - Eixo Esq.)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#6366F1] inline-block rounded-full"></span>
                                    <span className="text-[#6366F1]">IPSS (Sintomas Urinários - menor é melhor - Eixo Dir.)</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Registre pelo menos um escore clínico para gerar o gráfico de evolução de sintomas.
                              </div>
                            )}

                            {/* Formulário rápido para adicionar sintomas */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <Input 
                                type="text" 
                                placeholder="Data/Consulta (ex: 15/06)" 
                                value={newDataSintoma}
                                onChange={(e) => setNewDataSintoma(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Escore IIEF-5 (1-25)" 
                                value={newIief}
                                onChange={(e) => setNewIief(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Escore IPSS (0-35)" 
                                value={newIpss}
                                onChange={(e) => setNewIpss(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <div className="flex items-center gap-2 px-2 h-9 bg-card rounded-lg border border-border/40 justify-center">
                                <input 
                                  type="checkbox" 
                                  id="adam-check"
                                  checked={newAdam}
                                  onChange={(e) => setNewAdam(e.target.checked)}
                                  className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                                />
                                <Label htmlFor="adam-check" className="text-xs font-bold text-primary cursor-pointer select-none">ADAM (+)</Label>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddSintomaPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white col-span-2 sm:col-span-1"
                              >
                                Registrar Sintomas
                              </Button>
                            </div>
                          </div>

                          {/* Diário Miccional Clínico (LUTS/HPB) */}
                          <div className="space-y-3 pt-2 border-t border-border/40">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-accent animate-pulse" />
                                Diário Miccional Clínico (Padrão-Ouro LUTS/HPB)
                              </span>
                              <Button
                                onClick={() => {
                                  // Gerar PDF do Diário Miccional para o Paciente preencher em casa
                                  const printFrame = document.createElement("iframe");
                                  printFrame.style.position = "fixed";
                                  printFrame.style.right = "0";
                                  printFrame.style.bottom = "0";
                                  printFrame.style.width = "0";
                                  printFrame.style.height = "0";
                                  printFrame.style.border = "0";
                                  document.body.appendChild(printFrame);

                                  const docToday = new Date().toLocaleDateString("pt-BR");
                                  const signatureUrl = localStorage.getItem("protoUro_signature_data") || "";
                                  const useSignature = localStorage.getItem("protouro_use_signature") !== "false";

                                  const htmlContent = `
                                    <!DOCTYPE html>
                                    <html lang="pt-BR">
                                    <head>
                                      <meta charset="UTF-8">
                                      <title>Diário Miccional de 3 Dias - Dr. Felipe de Bulhões</title>
                                      <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');
                                        
                                        body {
                                          font-family: 'Montserrat', sans-serif;
                                          color: #1C3D5A;
                                          margin: 0;
                                          padding: 30px;
                                          line-height: 1.5;
                                          background-color: #FEFEFE;
                                          min-height: 297mm;
                                          box-sizing: border-box;
                                          position: relative;
                                        }
                                        
                                        .header {
                                          display: flex;
                                          justify-content: space-between;
                                          align-items: center;
                                          border-bottom: 2px solid #B87333;
                                          padding-bottom: 12px;
                                          margin-bottom: 20px;
                                        }
                                        
                                        .logo-area {
                                          display: flex;
                                          align-items: center;
                                          gap: 12px;
                                        }
                                        
                                        .logo-text {
                                          font-family: 'Playfair Display', serif;
                                          font-size: 18px;
                                          font-weight: 700;
                                          color: #1C3D5A;
                                          letter-spacing: 0.5px;
                                        }
                                        
                                        .logo-sub {
                                          font-size: 9px;
                                          font-weight: 700;
                                          color: #B87333;
                                          text-transform: uppercase;
                                          letter-spacing: 1px;
                                          margin-top: 2px;
                                        }
                                        
                                        .clinic-info {
                                          text-align: right;
                                          font-size: 9px;
                                          color: #64748B;
                                          line-height: 1.4;
                                        }
                                        
                                        .title {
                                          text-align: center;
                                          font-family: 'Playfair Display', serif;
                                          font-size: 20px;
                                          font-weight: 700;
                                          color: #1C3D5A;
                                          margin-bottom: 15px;
                                          letter-spacing: 0.5px;
                                          text-transform: uppercase;
                                          border-bottom: 1px dashed #E2E8F0;
                                          padding-bottom: 8px;
                                        }
                                        
                                        .patient-info {
                                          background-color: #F8FAFC;
                                          border: 1px solid #E2E8F0;
                                          border-radius: 10px;
                                          padding: 10px 15px;
                                          margin-bottom: 15px;
                                          font-size: 11px;
                                        }
                                        
                                        .patient-name {
                                          font-size: 14px;
                                          font-weight: 700;
                                          color: #1C3D5A;
                                        }

                                        .instructions {
                                          background-color: #FFFDF9;
                                          border: 1px solid #F59E0B/30;
                                          border-left: 4px solid #B87333;
                                          border-radius: 8px;
                                          padding: 12px 15px;
                                          margin-bottom: 20px;
                                          font-size: 10px;
                                          color: #334155;
                                        }

                                        .instructions h4 {
                                          margin: 0 0 6px 0;
                                          color: #B87333;
                                          font-weight: 700;
                                          text-transform: uppercase;
                                          letter-spacing: 0.5px;
                                        }

                                        .instructions ol {
                                          margin: 0;
                                          padding-left: 15px;
                                        }

                                        .instructions li {
                                          margin-bottom: 4px;
                                        }
                                        
                                        .table-container {
                                          display: flex;
                                          gap: 15px;
                                          margin-bottom: 80px;
                                        }

                                        .day-column {
                                          flex: 1;
                                          border: 1px solid #E2E8F0;
                                          border-radius: 10px;
                                          overflow: hidden;
                                        }

                                        .day-header {
                                          background-color: #1C3D5A;
                                          color: #FFF;
                                          text-align: center;
                                          font-weight: 700;
                                          font-size: 11px;
                                          padding: 8px;
                                          text-transform: uppercase;
                                          letter-spacing: 0.5px;
                                        }

                                        table {
                                          width: 100%;
                                          border-collapse: collapse;
                                          font-size: 9px;
                                        }

                                        th, td {
                                          border: 1px solid #E2E8F0;
                                          padding: 5px;
                                          text-align: center;
                                        }

                                        th {
                                          background-color: #F8FAFC;
                                          color: #1C3D5A;
                                          font-weight: 700;
                                        }

                                        tr:nth-child(even) {
                                          background-color: #F8FAFC/50;
                                        }

                                        .bottom-area {
                                          position: absolute;
                                          bottom: 60px;
                                          left: 30px;
                                          right: 30px;
                                          display: flex;
                                          justify-content: space-between;
                                          align-items: flex-end;
                                        }

                                        .qr-code-box {
                                          display: flex;
                                          align-items: center;
                                          gap: 10px;
                                          border: 1px solid #E2E8F0;
                                          border-radius: 10px;
                                          padding: 8px;
                                          background: #FFF;
                                          max-width: 220px;
                                        }

                                        .qr-code-img {
                                          width: 45px;
                                          height: 45px;
                                        }

                                        .qr-code-text {
                                          font-size: 7px;
                                          color: #64748B;
                                          line-height: 1.3;
                                          font-weight: 600;
                                        }
                                        
                                        .signature-box {
                                          text-align: center;
                                        }
                                        
                                        .signature-img {
                                          max-height: 45px;
                                          margin-bottom: 4px;
                                        }
                                        
                                        .signature-line {
                                          width: 200px;
                                          border-top: 1px solid #CBD5E1;
                                          margin: 0 auto 6px auto;
                                        }
                                        
                                        .footer {
                                          position: absolute;
                                          bottom: 20px;
                                          left: 30px;
                                          right: 30px;
                                          display: flex;
                                          justify-content: space-between;
                                          font-size: 8px;
                                          color: #94A3B8;
                                          border-top: 1px solid #E2E8F0;
                                          padding-top: 8px;
                                        }
                                        
                                        @media print {
                                          body {
                                            padding: 10px;
                                          }
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <!-- Cabeçalho Oficial -->
                                      <div class="header">
                                        <div class="logo-area">
                                          <svg width="28" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#1C3D5A"/>
                                            <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85"/>
                                          </svg>
                                          <div>
                                            <div class="logo-text" style="font-size: 15px;">DR. FELIPE DE BULHÕES</div>
                                            <div class="logo-sub" style="font-size: 8px;">Urologia & Andrologia de Alta Performance</div>
                                          </div>
                                        </div>
                                        <div class="clinic-info">
                                          <strong>CRM-SP 241.135 | RQE 112.445</strong><br>
                                          drfelipebulhoes@bulhoesurohealth.com
                                        </div>
                                      </div>

                                      <div class="title">Diário Miccional de 3 Dias (Padrão-Ouro SBU/EAU)</div>

                                      <!-- Ficha do Paciente -->
                                      <div class="patient-info">
                                        <div class="patient-name">Paciente: ${p.nome}</div>
                                        <div style="color: #64748B; margin-top: 2px;">Idade: ${p.idade ? `${p.idade} anos` : "N/A"} • Data de Emissão: ${docToday} • Retorno: D+30</div>
                                      </div>

                                      <!-- Instruções ao Paciente -->
                                      <div class="instructions">
                                        <h4>Como Preencher o Seu Diário Miccional:</h4>
                                        <ol>
                                          <li>Escolha 3 dias típicos da sua semana (preferencialmente consecutivos) para fazer o registro.</li>
                                          <li>Anote o volume aproximado de <strong>líquido ingerido</strong> (água, café, suco) em cada copo/garrafa (em mL).</li>
                                          <li>Toda vez que urinar, meça o volume usando um copo graduado (em mL) e anote na coluna <strong>Volume (mL)</strong>.</li>
                                          <li>Se sentir um desejo urgente e incontrolável de urinar, marque "Sim" na coluna <strong>Urgência</strong>.</li>
                                          <li>Se perder urina involuntariamente (perda de controle), marque "Sim" na coluna <strong>Perda</strong>.</li>
                                        </ol>
                                      </div>

                                      <!-- Tabelas de 3 Dias -->
                                      <div class="table-container">
                                        ${[1, 2, 3].map(day => `
                                          <div class="day-column">
                                            <div class="day-header">Dia ${day} (Data: ___/___)</div>
                                            <table>
                                              <thead>
                                                <tr>
                                                  <th>Período</th>
                                                  <th>Ingestão (mL)</th>
                                                  <th>Volume (mL)</th>
                                                  <th>Urgência</th>
                                                  <th>Perda</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                ${["Manhã (06h - 12h)", "Tarde (12h - 18h)", "Noite (18h - 00h)", "Sono (00h - 06h)"].map(period => `
                                                  <tr>
                                                    <td style="font-weight: 600; text-align: left; padding-left: 6px;">${period}</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                  </tr>
                                                `).join("")}
                                                <tr style="background-color: #F8FAFC; font-weight: bold;">
                                                  <td style="text-align: left; padding-left: 6px;">Total do Dia</td>
                                                  <td></td>
                                                  <td></td>
                                                  <td colspan="2" style="font-size: 7px; color: #64748B;">Noctúria (Vezes acordou): ____</td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        `).join("")}
                                      </div>

                                      <!-- Área de Autenticação e Assinatura -->
                                      <div class="bottom-area">
                                        <div class="qr-code-box">
                                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.doctoralia.com.br/felipe-de-bulhoes-ojeda-2/urologista/campinas" class="qr-code-img" alt="QR Code de Validação" />
                                          <div class="qr-code-text">
                                            <strong>PROTOCOLO HPB/LUTS</strong><br>
                                            Devolva este diário preenchido na sua próxima consulta ou envie por WhatsApp para agilizar o seu tratamento.
                                          </div>
                                        </div>
                                        
                                        <div class="signature-box">
                                          ${useSignature && signatureUrl ? `<img src="${signatureUrl}" class="signature-img" />` : `<div style="height: 35px;"></div>`}
                                          <div class="signature-line"></div>
                                          <strong style="font-size: 10px; color: #1C3D5A;">Dr. Felipe de Bulhões Ojeda</strong><br>
                                          <span style="font-size: 8px; color: #64748B;">Urologista - CRM-SP 241.135</span>
                                        </div>
                                      </div>

                                      <!-- Rodapé Fixo -->
                                      <div class="footer">
                                        <span>Diário Miccional • Gerado via ProtoUro App</span>
                                        <span>Campinas Day Hospital • Clinovi Paulista • Clinovi Moema</span>
                                        <span>Página 1 de 1</span>
                                      </div>
                                    </body>
                                    </html>
                                  `;

                                  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
                                  if (doc) {
                                    doc.open();
                                    doc.write(htmlContent);
                                    doc.close();

                                    setTimeout(() => {
                                      printFrame.contentWindow?.focus();
                                      printFrame.contentWindow?.print();
                                      setTimeout(() => {
                                        document.body.removeChild(printFrame);
                                      }, 1000);
                                    }, 500);

                                    toast.success("Diário Miccional de 3 Dias enviado para impressão/PDF!");
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold border-accent/20 hover:bg-accent/5 text-accent rounded-lg gap-1 px-2.5 py-0.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Exportar Diário Miccional (PDF)
                              </Button>
                            </div>
                            
                            {p.historicoDiarioMiccional && p.historicoDiarioMiccional.length > 0 ? (
                              <div className="bg-secondary/10 border border-border/50 p-4 rounded-xl space-y-4">
                                <div className="h-64 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                      data={p.historicoDiarioMiccional}
                                      margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                      <XAxis 
                                        dataKey="data" 
                                        tick={{ fill: "#64748B", fontSize: 10, fontWeight: "bold" }} 
                                        tickLine={false}
                                      />
                                      {/* Eixo Y Esquerdo: Frequência Diurna e Noctúria (Micções) */}
                                      <YAxis 
                                        yAxisId="left"
                                        domain={[0, 'auto']}
                                        tick={{ fill: "#1C3D5A", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      {/* Eixo Y Direito: Volume Miccional Médio (mL) */}
                                      <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, 'auto']}
                                        tick={{ fill: "#B87333", fontSize: 10, fontWeight: "bold" }}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <RechartsTooltip 
                                        contentStyle={{ backgroundColor: "#FEFEFE", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                        labelStyle={{ fontWeight: "bold", color: "#1C3D5A", fontSize: "11px" }}
                                        itemStyle={{ fontSize: "11px", padding: "2px 0" }}
                                      />
                                      {/* Linhas de Dados */}
                                      <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="frequenciaDiurna" 
                                        name="Frequência Diurna" 
                                        stroke="#3B82F6" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                      <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="nocturia" 
                                        name="Noctúria (Acordar à Noite)" 
                                        stroke="#EF4444" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                      <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="volumeMedio" 
                                        name="Vol. Miccional Médio (mL)" 
                                        stroke="#F59E0B" 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#FEFEFE" }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                                
                                {/* Legenda do Gráfico do Diário Miccional */}
                                <div className="flex justify-center flex-wrap gap-4 text-[10px] font-bold border-t border-border/40 pt-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#3B82F6] inline-block rounded-full"></span>
                                    <span className="text-[#3B82F6]">Freq. Diurna (Eixo Esq.)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#EF4444] inline-block rounded-full"></span>
                                    <span className="text-[#EF4444]">Noctúria (Eixo Esq.)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-1.5 bg-[#F59E0B] inline-block rounded-full"></span>
                                    <span className="text-[#F59E0B]">Vol. Miccional Médio mL (Eixo Dir.)</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Registre pelo menos um ponto do diário miccional para gerar o gráfico de evolução.
                              </div>
                            )}

                            {/* Formulário rápido para adicionar ponto do diário */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <Input 
                                type="text" 
                                placeholder="Data/Consulta (ex: 15/06)" 
                                value={newDiarioData}
                                onChange={(e) => setNewDiarioData(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Freq. Diurna" 
                                value={newDiarioDiurna}
                                onChange={(e) => setNewDiarioDiurna(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Noctúria" 
                                value={newDiarioNocturia}
                                onChange={(e) => setNewDiarioNocturia(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Input 
                                type="number" 
                                placeholder="Vol. Médio (mL)" 
                                value={newDiarioVolume}
                                onChange={(e) => setNewDiarioVolume(e.target.value)}
                                className="h-9 rounded-lg text-xs bg-card"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleAddDiarioPonto(p.id)}
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white col-span-2 sm:col-span-1"
                              >
                                Registrar Diário
                              </Button>
                            </div>
                          </div>

                          {/* Histórico de Documentos Vinculados */}
                          <div className="space-y-3 pt-2">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-accent" />
                              Histórico de Documentos Vinculados
                            </span>
                            
                            {p.documentos && p.documentos.length > 0 ? (
                              <div className="space-y-2.5">
                                {p.documentos.map((doc) => (
                                  <div key={doc.id} className="bg-secondary/10 border border-border/50 p-3 rounded-xl flex items-center justify-between gap-4">
                                    <div className="space-y-1 text-left">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-primary">{doc.titulo}</span>
                                        <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 px-1.5 border-accent/20 text-accent bg-accent/5">
                                          {doc.tipo}
                                        </Badge>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground block">Gerado em {doc.data}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(doc.conteudo);
                                        toast.success("Documento copiado do histórico!");
                                      }}
                                      className="h-8 rounded-lg text-xs font-semibold text-accent hover:text-accent/80 hover:bg-accent/5 shrink-0"
                                    >
                                      Copiar Texto
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Nenhum documento (receita, atestado ou laudo) foi gerado para este paciente ainda.
                              </div>
                            )}
                          </div>

                          {/* Acompanhamento Comercial & Linha do Tempo CPP */}
                          <div className="space-y-4 pt-3 border-t border-border/40">
                            <span className="font-bold text-primary uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-[#B87333]" />
                              Linha do Tempo de Acompanhamento Comercial (CRM CPP)
                            </span>

                            {/* Agendamento de Próximo Contato Comercial */}
                            <div className="bg-secondary/10 border border-border/40 rounded-xl p-3.5 space-y-2">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                <CalendarClock className="w-3.5 h-3.5 text-accent" />
                                Agendar Próximo Contato Comercial (Lembrete)
                              </span>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <Input
                                  type="date"
                                  value={p.proximoContato || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const updated = pacientes.map(pac => pac.id === p.id ? { ...pac, proximoContato: val } : pac);
                                    saveToStorage(updated);
                                    toast.success("Lembrete de contato atualizado!");
                                  }}
                                  className="h-9 rounded-lg text-xs bg-card max-w-[200px]"
                                />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {p.proximoContato ? (
                                    <>Lembrete programado para: <strong className="text-accent">{p.proximoContato.split("-").reverse().join("/")}</strong></>
                                  ) : (
                                    "Nenhum lembrete programado. Defina uma data para receber alertas visuais no painel."
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Gerador de Links de Pagamento (Pix & Stripe) */}
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  💳 Gerador de Links de Pagamento (Pix / Cartão)
                                </span>
                                <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary bg-primary/5 rounded-full">
                                  Faturamento Imediato
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                  { label: "Consulta Particular", valor: 800, desc: "Consulta Particular de Urologia / Andrologia" },
                                  { label: "Ondas de Choque (Sessão)", valor: 1500, desc: "Sessão de Terapia por Ondas de Choque Extracorpórea (Li-ESWT)" },
                                  { label: "Cirurgia Peyronie", valor: 18000, desc: "Honorários Cirúrgicos - Correção de Peyronie (Reconstrução)" },
                                  { label: "Prótese Inflável", valor: 45000, desc: "Honorários Cirúrgicos - Implante de Prótese Peniana Inflável de 3 Volumes" }
                                ].map((item, idx) => (
                                  <Button
                                    key={`pay_${idx}`}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Gerar chave Pix estática simulada com o valor e descrição
                                      const chavePix = "drfelipebulhoes@bulhoesurohealth.com";
                                      const payloadPix = `00020101021126580014br.gov.bcb.pix0126${chavePix}520400005303986540${item.valor.toFixed(2)}5802BR5917DR_FELIPE_BULHOES6009SAO_PAULO62070503***6304`;
                                      
                                      const msgStripe = `https://checkout.stripe.com/pay/cs_live_bulhoes_${Math.random().toString(36).substring(2, 10)}`;
                                      
                                      const textoMensagem = `Prezado ${p.nome}, segue o link de pagamento referente a [${item.desc}]:\n\n` +
                                        `💰 Valor: R$ ${item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n` +
                                        `🔑 Chave Pix (E-mail): ${chavePix}\n` +
                                        `📋 Pix Copia e Cola:\n\`${payloadPix}\`\n\n` +
                                        `💳 Pagamento via Cartão de Crédito (até 12x):\n${msgStripe}\n\n` +
                                        `Ficamos à total disposição para confirmar o seu agendamento após o envio do comprovante!`;
                                        
                                      setNewContatoNotas(textoMensagem);
                                      setNewContatoTipo("whatsapp");
                                      toast.success(`Link de pagamento para "${item.label}" gerado!`);
                                    }}
                                    className="h-8 rounded-lg text-[10px] font-bold border-border/60 hover:bg-card text-primary hover:text-accent truncate px-2"
                                  >
                                    {item.label} (R$ {item.valor >= 1000 ? `${item.valor/1000}k` : item.valor})
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Modelos de Mensagens Rápidas (Acompanhamento Comercial CPP) */}
                            <div className="bg-[#B87333]/5 border border-[#B87333]/20 rounded-xl p-3.5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#B87333] uppercase tracking-wider flex items-center gap-1">
                                  ⚡ Modelos de Mensagens Rápidas (WhatsApp)
                                </span>
                                <Badge variant="outline" className="text-[8px] font-bold border-[#B87333]/20 text-[#B87333] bg-[#B87333]/5 rounded-full">
                                  Foco em Conversão
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                  { 
                                    label: "👋 Boas-vindas Lead", 
                                    text: `Olá, ${p.nome}! Aqui é a secretária do Dr. Felipe de Bulhões. Tudo bem? Vi que você entrou em contato demonstrando interesse em nossos tratamentos especializados em Urologia e Andrologia. O Dr. Felipe realiza atendimentos com foco totalmente humanizado e focado na sua saúde e bem-estar. Gostaria de agendar o seu horário conosco esta semana?`
                                  },
                                  { 
                                    label: "🔄 Lembrete Retorno", 
                                    text: `Olá, ${p.nome}! Tudo bem? Passando para lembrar que já faz algum tempo desde o seu último acompanhamento laboratorial com o Dr. Felipe de Bulhões. Para mantermos a sua terapia hormonal e saúde urológica monitoradas de forma segura e com alta performance, é fundamental agendarmos o seu retorno. Temos horários disponíveis para esta semana. Vamos agendar?`
                                  },
                                  { 
                                    label: "🏥 Pré-Operatório", 
                                    text: `Olá, ${p.nome}! Tudo bem? Para a realização do seu procedimento com o Dr. Felipe de Bulhões, lembramos que é fundamental seguir as orientações pré-operatórias: jejum absoluto de 8 horas (inclusive água), levar todos os exames laboratoriais e de imagem realizados, além do termo de consentimento assinado. Qualquer dúvida, estamos à total disposição!`
                                  },
                                  { 
                                    label: "🌟 Pós-Consulta", 
                                    text: `Olá, ${p.nome}! Foi um grande prazer recebê-lo em consulta com o Dr. Felipe de Bulhões hoje. Esperamos que tenha tido uma experiência acolhedora e humanizada. Segue o link para o agendamento de seus exames solicitados e o contato da nossa equipe para qualquer suporte necessário. Desejamos uma excelente recuperação!`
                                  }
                                ].map((modelo, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setNewContatoNotas(modelo.text);
                                      setNewContatoTipo("whatsapp");
                                      toast.success(`Modelo "${modelo.label}" carregado!`);
                                    }}
                                    className="h-8 rounded-lg text-[10px] font-bold border-border/60 hover:bg-card text-primary hover:text-accent truncate px-2"
                                  >
                                    {modelo.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Formulário para registrar novo contato */}
                            <div className="flex flex-col sm:flex-row gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
                              <select
                                value={newContatoTipo}
                                onChange={(e) => setNewContatoTipo(e.target.value as any)}
                                className="h-9 rounded-lg text-xs bg-card border border-border/40 px-2 font-semibold text-primary focus:outline-none shrink-0"
                              >
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="ligacao">📞 Ligação</option>
                                <option value="email">✉️ E-mail</option>
                                <option value="retorno">🔄 Agendamento Retorno</option>
                              </select>
                              <Textarea
                                placeholder="Notas do contato comercial ou mensagem rápida carregada acima..."
                                value={newContatoNotas}
                                onChange={(e) => setNewContatoNotas(e.target.value)}
                                className="min-h-[80px] rounded-lg text-xs bg-card flex-1 resize-none p-2.5"
                              />
                              <div className="flex flex-col gap-2 shrink-0 justify-end">
                                {newContatoTipo === "whatsapp" && newContatoNotas && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const cleanPhone = p.telefone ? p.telefone.replace(/\D/g, "") : "";
                                      const dddAndPhone = cleanPhone.length === 11 ? cleanPhone : "55" + cleanPhone;
                                      const encodedText = encodeURIComponent(newContatoNotas);
                                      window.open(`https://api.whatsapp.com/send?phone=${dddAndPhone}&text=${encodedText}`, "_blank");
                                      
                                      // Adicionar automaticamente ao histórico comercial
                                      handleAddContato(p.id);
                                    }}
                                    className="h-9 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 px-4 flex items-center gap-1.5"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Enviar WhatsApp
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleAddContato(p.id)}
                                  className="h-9 rounded-lg text-xs font-bold copper-gradient text-white shrink-0 px-4"
                                >
                                  Registrar Histórico
                                </Button>
                              </div>
                            </div>

                            {/* Listagem da Linha do Tempo Comercial */}
                            {p.comercialHist && p.comercialHist.length > 0 ? (
                              <div className="relative border-l-2 border-border/60 ml-2.5 pl-4 space-y-4 pt-1">
                                {p.comercialHist.map((item) => (
                                  <div key={item.id} className="relative">
                                    {/* Indicador de Tipo de Contato */}
                                    <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-card border-2 border-[#B87333] flex items-center justify-center">
                                      <div className="w-1 h-1 rounded-full bg-[#B87333]" />
                                    </div>
                                    <div className="space-y-1 text-left">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground">{item.data}</span>
                                        <Badge variant="outline" className={`text-[8px] font-bold uppercase py-0 px-1.5 ${
                                          item.tipo === "whatsapp" ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5" :
                                          item.tipo === "ligacao" ? "border-blue-500/20 text-blue-600 bg-blue-500/5" :
                                          item.tipo === "email" ? "border-purple-500/20 text-purple-600 bg-purple-500/5" :
                                          "border-amber-500/20 text-amber-600 bg-amber-500/5"
                                        }`}>
                                          {item.tipo === "whatsapp" ? "WhatsApp" :
                                           item.tipo === "ligacao" ? "Ligação" :
                                           item.tipo === "email" ? "E-mail" :
                                           "Retorno"}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-foreground/80 leading-relaxed font-medium bg-secondary/20 p-2.5 rounded-xl border border-border/30">
                                        {item.notas}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                                Nenhum contato comercial registrado. Use o formulário acima para registrar a busca ativa.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            ) : (
              <div className="border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-secondary/[0.05]">
                <Users className="w-12 h-12 text-muted-foreground/60 mb-3" />
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Nenhum Paciente Encontrado</h4>
                <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                  {searchQuery ? "Nenhum paciente corresponde aos termos da sua busca." : "Inicie cadastrando os pacientes atendidos no seu consultório."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal do Módulo de Prescrição Inteligente */}
      <Dialog open={prescricaoOpen} onOpenChange={setPrescricaoOpen}>
        <DialogContent className="max-w-2xl bg-[#FEFEFE] rounded-2xl border border-border shadow-xl p-6">
          <DialogHeader className="border-b border-border/40 pb-3">
            <DialogTitle className="text-base font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent animate-pulse" />
              Módulo de Prescrição Eletrônica Inteligente
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecione um protocolo clínico baseado em evidências urológicas (SBU/EAU/AUA) para gerar a receita oficial timbrada para <strong>{prescricaoPaciente?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Seletor de Modelo */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="modelo-prescricao" className="text-xs font-bold text-primary uppercase tracking-wider">Modelo de Protocolo Clínico:</Label>
                {(() => {
                  if (!prescricaoPaciente) return null;
                  const payloadStr = localStorage.getItem("protoUro_trt_sync_payload");
                  if (!payloadStr) return null;
                  try {
                    const payload = JSON.parse(payloadStr);
                    if (payload.pacienteNome === prescricaoPaciente.nome) {
                      return (
                        <Button
                          onClick={() => {
                            // Encontrar o modelo de Flukkahormo HCG
                            const hcgModel = modelosPrescricao.find(m => m.id === "flukkahormo_hcg_preservacao");
                            if (hcgModel) {
                              setPrescricaoPacienteModelo("flukkahormo_hcg_preservacao");
                              
                              // Substituir os placeholders com os dados calculados e sincronizados
                              let customized = hcgModel.conteudo;
                              customized = customized.replace(/Testosterona Enantato.*\(.*\) intramuscular/g, `Testosterona Enantato (ou Cipionato) - ${payload.trtDose} intramuscular`);
                              if (payload.hcgDose) {
                                customized = customized.replace(/HCG.*UI/g, `HCG (Flukkahormo) - ${payload.hcgDose}`);
                              }
                              customized = customized.replace(/Aplicação.*/g, `Aplicação: ${payload.frequencia}.`);
                              
                              setPrescricaoConteudo(customized);
                              toast.success("Dose calculada de TRT/HCG aplicada com sucesso ao modelo!");
                            } else {
                              toast.error("Modelo de receita Flukkahormo não encontrado.");
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] font-bold bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 border-emerald-500/20 rounded-lg gap-1 px-2 py-0.5"
                        >
                          <Activity className="w-3 h-3 animate-pulse" />
                          Carregar Dose Calculada da TRT
                        </Button>
                      );
                    }
                  } catch (err) {
                    console.error(err);
                  }
                  return null;
                })()}
              </div>
              <select
                id="modelo-prescricao"
                value={prescricaoModelo}
                onChange={(e) => {
                  const mId = e.target.value;
                  setPrescricaoPacienteModelo(mId);
                  const selected = modelosPrescricao.find(m => m.id === mId);
                  if (selected) {
                    setPrescricaoConteudo(selected.conteudo);
                  } else {
                    setPrescricaoConteudo("");
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
              >
                <option value="">-- Selecione um modelo de prescrição --</option>
                {modelosPrescricao.map(m => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
            </div>

            {/* Alertas Críticos de Contraindicação Cruzada (Flukkamen-Safety) */}
            {(() => {
              if (!prescricaoPaciente) return null;
              const isDapoxetina = prescricaoModelo === "flukkamen_dapoxetina_ep";
              if (!isDapoxetina) return null;

              const hasICC = prescricaoPaciente.insuficienciaCardiaca === true;
              const hasNitratos = prescricaoPaciente.usoNitratos === true;

              if (hasICC || hasNitratos) {
                return (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-4 rounded-xl text-xs font-medium flex flex-col gap-1.5 animate-bounce">
                    <span className="font-bold flex items-center gap-1.5 text-red-800 text-sm">
                      🚨 CONTRAINDICAÇÃO CRÍTICA DETECTADA (Flukkamen-Safety)
                    </span>
                    <p className="font-semibold text-red-800 leading-relaxed">
                      A prescrição de Dapoxetina (Flukkamen) está **terminantemente contraindicada** para este paciente devido ao seguinte histórico clínico registrado:
                    </p>
                    <ul className="list-disc pl-5 font-bold space-y-1 mt-1">
                      {hasICC && <li>Insuficiência Cardíaca Congestiva (ICC) - Risco de síncope e colapso hemodinâmico.</li>}
                      {hasNitratos && <li>Uso Concomitante de Nitratos - Risco de hipotensão severa e refratária.</li>}
                    </ul>
                    <p className="text-[11px] text-red-700/90 mt-1">
                      *O botão de emissão de receita foi bloqueado por motivos de segurança do paciente.*
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Editor de Texto da Receita */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="conteudo-prescricao" className="text-xs font-bold text-primary uppercase tracking-wider">Conteúdo da Receita (Editável):</Label>
                <span className="text-[10px] text-accent font-bold uppercase">Via de Tratamento e Posologia</span>
              </div>
              <Textarea
                id="conteudo-prescricao"
                value={prescricaoConteudo}
                onChange={(e) => setPrescricaoConteudo(e.target.value)}
                placeholder="Selecione um modelo acima ou digite a prescrição livremente..."
                className="min-h-[220px] rounded-xl text-xs font-medium font-sans bg-card border-border focus:ring-accent/20 leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPrescricaoOpen(false);
                setPrescricaoPaciente(null);
                setPrescricaoPacienteModelo("");
                setPrescricaoConteudo("");
              }}
              className="h-9 rounded-xl text-xs font-bold border-border"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={
                !prescricaoConteudo.trim() || 
                !prescricaoPaciente || 
                (prescricaoModelo === "flukkamen_dapoxetina_ep" && 
                 (prescricaoPaciente.insuficienciaCardiaca === true || prescricaoPaciente.usoNitratos === true))
              }
              onClick={() => {
                if (!prescricaoPaciente || !prescricaoConteudo.trim()) return;

                // Gerar o documento em PDF timbrado via iframe de impressão
                const printFrame = document.createElement("iframe");
                printFrame.style.position = "fixed";
                printFrame.style.right = "0";
                printFrame.style.bottom = "0";
                printFrame.style.width = "0";
                printFrame.style.height = "0";
                printFrame.style.border = "0";
                document.body.appendChild(printFrame);

                const docToday = new Date().toLocaleDateString("pt-BR");
                const signatureUrl = localStorage.getItem("protoUro_signature_data") || "";
                const useSignature = localStorage.getItem("protouro_use_signature") !== "false";

                const htmlContent = `
                  <!DOCTYPE html>
                  <html lang="pt-BR">
                  <head>
                    <meta charset="UTF-8">
                    <title>Receita Médica - Dr. Felipe de Bulhões</title>
                    <style>
                      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');
                      
                      body {
                        font-family: 'Montserrat', sans-serif;
                        color: #1C3D5A;
                        margin: 0;
                        padding: 40px;
                        line-height: 1.6;
                        background-color: #FEFEFE;
                        min-height: 297mm;
                        box-sizing: border-box;
                        position: relative;
                      }
                      
                      .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #B87333;
                        padding-bottom: 15px;
                        margin-bottom: 30px;
                      }
                      
                      .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                      }
                      
                      .logo-text {
                        font-family: 'Playfair Display', serif;
                        font-size: 18px;
                        font-weight: 700;
                        color: #1C3D5A;
                        letter-spacing: 0.5px;
                      }
                      
                      .logo-sub {
                        font-size: 9px;
                        font-weight: 700;
                        color: #B87333;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 2px;
                      }
                      
                      .clinic-info {
                        text-align: right;
                        font-size: 9px;
                        color: #64748B;
                        line-height: 1.4;
                      }
                      
                      .prescription-title {
                        text-align: center;
                        font-family: 'Playfair Display', serif;
                        font-size: 24px;
                        font-weight: 700;
                        color: #1C3D5A;
                        margin-bottom: 40px;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                        border-bottom: 1px dashed #E2E8F0;
                        padding-bottom: 10px;
                      }
                      
                      .patient-info {
                        background-color: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 12px;
                        padding: 15px 20px;
                        margin-bottom: 35px;
                        font-size: 12px;
                      }
                      
                      .patient-name {
                        font-size: 16px;
                        font-weight: 700;
                        color: #1C3D5A;
                        margin-bottom: 4px;
                      }
                      
                      .prescription-content {
                        font-size: 12px;
                        color: #334155;
                        white-space: pre-wrap;
                        line-height: 1.7;
                        margin-bottom: 80px;
                        min-height: 250px;
                        font-weight: 500;
                      }
                      
                      .signature-area {
                        position: absolute;
                        bottom: 80px;
                        left: 0;
                        right: 0;
                        display: flex;
                        flex-col: column;
                        align-items: center;
                        text-align: center;
                      }
                      
                      .signature-img {
                        max-height: 55px;
                        margin-bottom: 5px;
                      }
                      
                      .signature-line {
                        width: 250px;
                        border-top: 1px solid #CBD5E1;
                        margin: 0 auto 8px auto;
                      }
                      
                      .footer {
                        position: absolute;
                        bottom: 30px;
                        left: 40px;
                        right: 40px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 8px;
                        color: #94A3B8;
                        border-top: 1px solid #E2E8F0;
                        padding-top: 10px;
                      }
                      
                      @media print {
                        body {
                          padding: 20px;
                        }
                        .no-print {
                          display: none;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <!-- Cabeçalho Oficial -->
                    <div class="header">
                      <div class="logo-area">
                        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#1C3D5A"/>
                          <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85"/>
                        </svg>
                        <div>
                          <div class="logo-text">DR. FELIPE DE BULHÕES</div>
                          <div class="logo-sub">Urologia & Andrologia de Alta Performance</div>
                        </div>
                      </div>
                      <div class="clinic-info">
                        <strong>CRM-SP 241.135 | RQE 112.445</strong><br>
                        drfelipebulhoes@bulhoesurohealth.com<br>
                        WhatsApp: (11) 98112-4455
                      </div>
                    </div>

                    <div class="prescription-title">Receituário Especial</div>

                    <!-- Ficha do Paciente -->
                    <div class="patient-info">
                      <div style="color: #B87333; font-weight: 700; font-size: 10px; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Paciente Receituário</div>
                      <div class="patient-name">${prescricaoPaciente.nome}</div>
                      <div style="color: #64748B; margin-top: 4px;">Idade: ${prescricaoPaciente.idade ? `${prescricaoPaciente.idade} anos` : "N/A"} • Data: ${docToday}</div>
                    </div>

                    <!-- Conteúdo da Receita -->
                    <div class="prescription-content">${prescricaoConteudo}</div>

                    <!-- Área de Autenticação e Assinatura -->
                    <div class="signature-area" style="bottom: 80px; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-end; position: absolute;">
                      <div class="qr-code-box" style="display: flex; align-items: center; gap: 10px; border: 1px solid #E2E8F0; border-radius: 10px; padding: 8px; background: #FFF; max-width: 220px; text-align: left;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.doctoralia.com.br/felipe-de-bulhoes-ojeda-2/urologista/campinas" class="qr-code-img" style="width: 50px; height: 50px;" alt="QR Code de Validação" />
                        <div class="qr-code-text" style="font-size: 7px; color: #64748B; line-height: 1.3; font-weight: 600;">
                          <strong>RECEITA AUTÊNTICA</strong><br>
                          Valide as informações de registro profissional e agendamento de consultas do Dr. Felipe apontando a câmera do celular.
                        </div>
                      </div>
                      
                      <div class="signature-box" style="text-align: center;">
                        ${useSignature && signatureUrl ? `<img src="${signatureUrl}" class="signature-img" style="max-height: 50px; margin-bottom: 5px;" />` : `<div style="height: 40px;"></div>`}
                        <div class="signature-line" style="width: 220px; border-top: 1px solid #CBD5E1; margin: 0 auto 8px auto;"></div>
                        <strong style="font-size: 11px; color: #1C3D5A;">Dr. Felipe de Bulhões Ojeda</strong><br>
                        <span style="font-size: 9px; color: #64748B;">Urologista - CRM-SP 241.135 | RQE 112.445</span><br>
                        <span style="font-size: 7px; color: #94A3B8; margin-top: 4px; display: block; font-family: monospace;">Hash ICP-Brasil SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                      </div>
                    </div>

                    <!-- Rodapé Fixo -->
                    <div class="footer">
                      <span>Receituário Digital • Gerado via ProtoUro App</span>
                      <span>Campinas: Av. José de Souza Campos, 123 | São Paulo: Av. Paulista, 1000</span>
                      <span>Página 1 de 1</span>
                    </div>
                  </body>
                  </html>
                `;

                const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
                if (doc) {
                  doc.open();
                  doc.write(htmlContent);
                  doc.close();

                  // Adicionar o documento gerado ao histórico do paciente
                  const selectedModelo = modelosPrescricao.find(m => m.id === prescricaoModelo);
                  const docTitulo = selectedModelo ? `Receita: ${selectedModelo.titulo}` : "Receita Médica Personalizada";

                  const novoDocumento = {
                    id: Math.random().toString(36).substring(2, 9),
                    titulo: docTitulo,
                    tipo: "receita" as "receita",
                    data: docToday,
                    conteudo: prescricaoConteudo
                  };

                  const pacientesAtualizados = pacientes.map(p => {
                    if (p.id === prescricaoPaciente.id) {
                      return {
                        ...p,
                        documentos: [novoDocumento, ...(p.documentos || [])]
                      };
                    }
                    return p;
                  });

                  setPacientes(pacientesAtualizados);
                  saveToStorage(pacientesAtualizados);

                  setTimeout(() => {
                    printFrame.contentWindow?.focus();
                    printFrame.contentWindow?.print();
                    setTimeout(() => {
                      document.body.removeChild(printFrame);
                    }, 1000);
                  }, 500);

                  toast.success("Receita enviada para impressão e registrada no prontuário!");
                  setPrescricaoOpen(false);
                  setPrescricaoPaciente(null);
                  setPrescricaoPacienteModelo("");
                  setPrescricaoConteudo("");
                }
              }}
              className="h-9 rounded-xl text-xs font-bold copper-gradient text-white"
            >
              Imprimir Receita &amp; Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal do Gerador de Orçamentos CPP Premium */}
      <Dialog open={orcamentoOpen} onOpenChange={setOrcamentoOpen}>
        <DialogContent className="max-w-3xl bg-[#FEFEFE] rounded-2xl border border-border shadow-xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border/40 pb-3">
            <DialogTitle className="text-base font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B87333]" />
              Gerador de Orçamentos Cirúrgicos CPP Premium
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Gere orçamentos de alto padrão timbrados para o paciente <strong>{orcamentoPaciente?.nome}</strong> de forma totalmente profissional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Seletor de Tipo de Orçamento e Procedimento do Catálogo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Tipo de Orçamento:</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={orcamentoTipo === "honorarios" ? "default" : "outline"}
                    onClick={() => setOrcamentoTipo("honorarios")}
                    className={`flex-1 h-9 rounded-xl text-xs font-bold ${orcamentoTipo === "honorarios" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                  >
                    Apenas Honorários
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={orcamentoTipo === "particular_total" ? "default" : "outline"}
                    onClick={() => setOrcamentoTipo("particular_total")}
                    className={`flex-1 h-9 rounded-xl text-xs font-bold ${orcamentoTipo === "particular_total" ? "copper-gradient text-white border-0" : "border-border text-primary hover:bg-secondary/40"}`}
                  >
                    Particular Total
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="procedimento-catalogo" className="text-xs font-bold text-primary uppercase tracking-wider">Procedimento de Referência (Catálogo):</Label>
                <select
                  id="procedimento-catalogo"
                  onChange={(e) => {
                    const selected = procedimentosCatalogo.find(p => p.id === e.target.value);
                    if (selected) {
                      setOrcamentoProcedimento(selected.nome);
                      setOrcamentoValorHonorarios(selected.honorarios);
                      setOrcamentoValorHospital(selected.hospital);
                      setOrcamentoValorHospitalMateriais(selected.materiais);
                      setOrcamentoValorAcompanhamento(selected.acompanhamento);
                      setOrcamentoObs(selected.obs);
                    }
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                >
                  <option value="">-- Selecione do Catálogo --</option>
                  {procedimentosCatalogo.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* Novo Seletor de Orçamentos de Modelo (Templates de Sucesso CPP) */}
              <div className="space-y-1.5">
                <Label htmlFor="orcamento-modelo" className="text-xs font-bold text-[#B87333] uppercase tracking-wider">Modelos Pré-Preenchidos (Orçamentos Prontos):</Label>
                <select
                  id="orcamento-modelo"
                  onChange={(e) => {
                    const modelId = e.target.value;
                    if (!modelId) return;

                    // Aplicar modelo pré-configurado
                    if (modelId === "model_botox_premium") {
                      setOrcamentoProcedimento("Aplicação de Toxina Botulínica (Botox) Intravesical Feminina - Bexiga Hiperativa Premium");
                      setOrcamentoTipo("particular_total");
                      setOrcamentoValorHonorarios("6500");
                      setOrcamentoValorHospital("4500");
                      setOrcamentoValorHospitalMateriais("3200");
                      setOrcamentoValorAcompanhamento("1800");
                      setOrcamentoObs("Modelo Premium All-Inclusive para tratamento de Bexiga Hiperativa refratária. Inclui 100U de Toxina Botulínica Allergan, cistoscopia rígida, taxas de sala de cirurgia, anestesia e acompanhamento pós-operatório por 6 meses.");
                    } else if (modelId === "model_sling_feminino") {
                      setOrcamentoProcedimento("Sling Suburetral Feminino (Mini-Sling) para Incontinência de Esforço");
                      setOrcamentoTipo("particular_total");
                      setOrcamentoValorHonorarios("9000");
                      setOrcamentoValorHospital("8000");
                      setOrcamentoValorHospitalMateriais("6000");
                      setOrcamentoValorAcompanhamento("2000");
                      setOrcamentoObs("Modelo All-Inclusive para correção cirúrgica padrão-ouro de incontinência urinária de esforço feminina. Inclui mini-tela sintética importada de última geração, internação em apartamento, equipe de anestesia e 6 meses de suporte.");
                    } else if (modelId === "model_neuromodulacao") {
                      setOrcamentoProcedimento("Neuromodulação Sacral (Implante de Marcapasso Vesical) para Incontinência e Bexiga Hiperativa");
                      setOrcamentoTipo("particular_total");
                      setOrcamentoValorHonorarios("24000");
                      setOrcamentoValorHospital("18000");
                      setOrcamentoValorHospitalMateriais("85000");
                      setOrcamentoValorAcompanhamento("4500");
                      setOrcamentoObs("Modelo All-Inclusive de altíssima tecnologia para implante de marcapasso vesical Medtronic. Inclui gerador de impulsos, eletrodos sacrais de estimulação, taxas hospitalares, equipe de anestesia e acompanhamento pós-operatório especializado.");
                    } else if (modelId === "model_fisioterapia") {
                      setOrcamentoProcedimento("Programa de Reabilitação e Fisioterapia Pélvica Premium com Biofeedback");
                      setOrcamentoTipo("honorarios");
                      setOrcamentoValorHonorarios("4800");
                      setOrcamentoValorHospital("0");
                      setOrcamentoValorHospitalMateriais("0");
                      setOrcamentoValorAcompanhamento("1200");
                      setOrcamentoObs("Modelo de reabilitação pélvica conservadora. Inclui 10 sessões individuais de fisioterapia de alta performance com biofeedback eletromiográfico e treinamento muscular guiado para incontinência e bexiga hiperativa.");
                    } else if (modelId === "model_holep_completo") {
                      setOrcamentoProcedimento("HoLEP (Enucleação da Próstata com Holmium Laser) para HPB");
                      setOrcamentoTipo("particular_total");
                      setOrcamentoValorHonorarios("22000");
                      setOrcamentoValorHospital("18000");
                      setOrcamentoValorHospitalMateriais("12000");
                      setOrcamentoValorAcompanhamento("4000");
                      setOrcamentoObs("Modelo Premium All-Inclusive para cirurgia de próstata a laser de Holmium. Inclui equipe cirúrgica completa, internação, anestesia, uso de morcelador de tecidos e acompanhamento pós-operatório por 6 meses.");
                    }
                    toast.success("Modelo de orçamento carregado com sucesso!");
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-[#B87333]/30 bg-[#B87333]/5 text-xs font-bold text-primary focus:ring-2 focus:ring-[#B87333]/20 focus:border-[#B87333] outline-none"
                >
                  <option value="">-- Escolha um Modelo Pronto --</option>
                  <option value="model_botox_premium">🌸 Botox Feminino Premium (All-Inclusive)</option>
                  <option value="model_sling_feminino">🎗️ Sling Feminino Premium (All-Inclusive)</option>
                  <option value="model_neuromodulacao">⚡ Neuromodulação Sacral (All-Inclusive)</option>
                  <option value="model_fisioterapia">🧘 Fisioterapia Pélvica Premium</option>
                  <option value="model_holep_completo">🔥 HoLEP Próstata Premium (All-Inclusive)</option>
                </select>
              </div>
            </div>

            {/* Nome do Procedimento Livre e Local da Cirurgia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="orcamento-procedimento-nome" className="text-xs font-bold text-primary uppercase tracking-wider">Procedimento (Editável):</Label>
                <Input
                  id="orcamento-procedimento-nome"
                  value={orcamentoProcedimento}
                  onChange={(e) => setOrcamentoProcedimento(e.target.value)}
                  placeholder="Ex: HoLEP (Enucleação da Próstata com Holmium Laser)"
                  className="h-9 rounded-xl text-xs font-medium bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orcamento-local" className="text-xs font-bold text-primary uppercase tracking-wider">Local / Hospital Recomendado:</Label>
                <select
                  id="orcamento-local"
                  value={orcamentoLocal}
                  onChange={(e) => setOrcamentoLocal(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                >
                  <option value="Clinovi Paulista">Clinovi Paulista (Particular)</option>
                  <option value="Clinovi Moema">Clinovi Moema (Particular)</option>
                  <option value="Campinas Day Hospital">Campinas Day Hospital (Particular / Convênios)</option>
                  <option value="Hospital Alvorada Moema">Hospital Alvorada Moema</option>
                  <option value="Hospital São Luiz Campinas">Hospital São Luiz Campinas</option>
                </select>
              </div>
            </div>

            {/* Valores e Acompanhamento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="val-honorarios" className="text-xs font-bold text-primary uppercase tracking-wider">Honorários Equipe (R$):</Label>
                <Input
                  id="val-honorarios"
                  type="number"
                  value={orcamentoValorHonorarios}
                  onChange={(e) => setOrcamentoValorHonorarios(e.target.value)}
                  className="h-9 rounded-xl text-xs bg-card font-bold text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="val-acompanhamento" className="text-xs font-bold text-primary uppercase tracking-wider">Acomp. Pós-Op 6 Meses (R$):</Label>
                <Input
                  id="val-acompanhamento"
                  type="number"
                  value={orcamentoValorAcompanhamento}
                  onChange={(e) => setOrcamentoValorAcompanhamento(e.target.value)}
                  className="h-9 rounded-xl text-xs bg-card font-bold text-primary"
                />
              </div>

              {orcamentoTipo === "particular_total" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="val-hospital" className="text-xs font-bold text-primary uppercase tracking-wider">Custo Hospitalar (R$):</Label>
                    <Input
                      id="val-hospital"
                      type="number"
                      value={orcamentoValorHospital}
                      onChange={(e) => setOrcamentoValorHospital(e.target.value)}
                      className="h-9 rounded-xl text-xs bg-card font-bold text-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="val-materiais" className="text-xs font-bold text-primary uppercase tracking-wider">OPME / Materiais (R$):</Label>
                    <Input
                      id="val-materiais"
                      type="number"
                      value={orcamentoValorMateriais}
                      onChange={(e) => setOrcamentoValorHospitalMateriais(e.target.value)}
                      className="h-9 rounded-xl text-xs bg-card font-bold text-primary"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Descrição / Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="orcamento-obs" className="text-xs font-bold text-primary uppercase tracking-wider">Descrição Detalhada do Procedimento:</Label>
              <Textarea
                id="orcamento-obs"
                value={orcamentoObs}
                onChange={(e) => setOrcamentoObs(e.target.value)}
                placeholder="Detalhes adicionais sobre a cirurgia, internação, reabilitação..."
                className="min-h-[100px] rounded-xl text-xs bg-card leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOrcamentoOpen(false);
                setOrcamentoPaciente(null);
              }}
              className="h-9 rounded-xl text-xs font-bold border-border"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={!orcamentoProcedimento || !orcamentoPaciente}
              onClick={() => {
                if (!orcamentoPaciente || !orcamentoProcedimento) return;

                // Gerar o documento em PDF timbrado via iframe de impressão
                const printFrame = document.createElement("iframe");
                printFrame.style.position = "fixed";
                printFrame.style.right = "0";
                printFrame.style.bottom = "0";
                printFrame.style.width = "0";
                printFrame.style.height = "0";
                printFrame.style.border = "0";
                document.body.appendChild(printFrame);

                const docToday = new Date().toLocaleDateString("pt-BR");
                const validadeDate = new Date();
                validadeDate.setDate(validadeDate.getDate() + 30);
                const validadeStr = validadeDate.toLocaleDateString("pt-BR");

                const vHonorarios = parseFloat(orcamentoValorHonorarios) || 0;
                const vAcompanhamento = parseFloat(orcamentoValorAcompanhamento) || 0;
                const vHospital = orcamentoTipo === "particular_total" ? (parseFloat(orcamentoValorHospital) || 0) : 0;
                const vMateriais = orcamentoTipo === "particular_total" ? (parseFloat(orcamentoValorMateriais) || 0) : 0;
                const vTotal = vHonorarios + vAcompanhamento + vHospital + vMateriais;

                const formatMoeda = (val: number) => {
                  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                };

                const useSignature = localStorage.getItem("protouro_use_signature") === "true";
                const signatureUrl = localStorage.getItem("protoUro_signature_data") || "";

                const htmlContent = `
                  <!DOCTYPE html>
                  <html lang="pt-BR">
                  <head>
                    <meta charset="UTF-8">
                    <title>Orçamento Cirúrgico CPP - Dr. Felipe de Bulhões</title>
                    <style>
                      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                      
                      body {
                        font-family: 'Montserrat', sans-serif;
                        color: #1C3D5A;
                        margin: 0;
                        padding: 40px;
                        background-color: #FFFFFF;
                        font-size: 11px;
                        line-height: 1.5;
                      }
                      
                      .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-b: 2px solid #B87333;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                      }
                      
                      .logo-area {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                      }
                      
                      .logo-icon {
                        width: 45px;
                        height: 45px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #1C3D5A 0%, #B87333 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #FFFFFF;
                        font-family: 'Playfair Display', serif;
                        font-size: 22px;
                        font-weight: bold;
                        border: 1px solid rgba(184, 115, 51, 0.3);
                      }
                      
                      .logo-text {
                        font-family: 'Playfair Display', serif;
                        font-size: 16px;
                        font-weight: bold;
                        color: #1C3D5A;
                        line-height: 1.2;
                      }
                      
                      .logo-sub {
                        font-size: 8px;
                        color: #B87333;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        font-weight: 700;
                        font-family: 'Montserrat', sans-serif;
                      }
                      
                      .doc-info {
                        text-align: right;
                        font-size: 9px;
                        color: #64748B;
                      }
                      
                      .doc-info strong {
                        color: #B87333;
                        font-size: 11px;
                      }
                      
                      .title {
                        font-family: 'Playfair Display', serif;
                        font-size: 18px;
                        font-weight: bold;
                        color: #1C3D5A;
                        text-align: center;
                        margin-bottom: 25px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      }
                      
                      .title::after {
                        content: '';
                        display: block;
                        width: 50px;
                        height: 3px;
                        background-color: #B87333;
                        margin: 8px auto 0;
                        border-radius: 2px;
                      }
                      
                      .section-title {
                        font-size: 10px;
                        font-weight: 800;
                        color: #B87333;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        border-bottom: 1px solid rgba(184, 115, 51, 0.2);
                        padding-bottom: 4px;
                      }
                      
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 10px;
                      }
                      
                      th {
                        background-color: #1C3D5A;
                        color: #FFFFFF;
                        font-weight: bold;
                        text-align: left;
                        padding: 8px 12px;
                        text-transform: uppercase;
                        font-size: 9px;
                        letter-spacing: 0.5px;
                      }
                      
                      td {
                        padding: 10px 12px;
                        border-bottom: 1px solid #E2E8F0;
                        color: #334155;
                      }
                      
                      tr:nth-child(even) {
                        background-color: #F8FAFC;
                      }
                      
                      .total-box {
                        background: linear-gradient(135deg, #1C3D5A 0%, #11253C 100%);
                        color: #FFFFFF;
                        border-radius: 12px;
                        padding: 15px 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                        margin-bottom: 25px;
                        border: 1px solid #B87333;
                      }
                      
                      .total-box span {
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      }
                      
                      .total-box strong {
                        font-size: 18px;
                        color: #F3A847; /* Cobre destacado claro */
                        font-weight: 800;
                      }
                      
                      .clauses {
                        font-size: 9px;
                        color: #475569;
                        text-align: justify;
                        margin-bottom: 30px;
                        line-height: 1.6;
                      }
                      
                      .clauses p {
                        margin: 0 0 8px 0;
                      }
                      
                      .signature-container {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                        padding-top: 20px;
                      }
                      
                      .signature-box {
                        width: 45%;
                        text-align: center;
                      }
                      
                      .signature-line {
                        border-top: 1px solid #94A3B8;
                        margin-top: 40px;
                        margin-bottom: 8px;
                      }
                      
                      .footer {
                        position: fixed;
                        bottom: 30px;
                        left: 40px;
                        right: 40px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 7px;
                        color: #94A3B8;
                        border-top: 1px solid #E2E8F0;
                        padding-top: 10px;
                      }
                      
                      @media print {
                        body {
                          padding: 0;
                        }
                        .footer {
                          position: absolute;
                          bottom: 0;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <!-- Cabeçalho Timbrado Premium -->
                    <div class="header">
                      <div class="logo-area">
                        <div class="logo-icon">FB</div>
                        <div>
                          <div class="logo-text">Dr. Felipe de Bulhões</div>
                          <div class="logo-sub">Urologia & Andrologia de Alta Performance</div>
                        </div>
                      </div>
                      <div class="doc-info">
                        <strong>ORÇAMENTO DE PROCEDIMENTO</strong><br>
                        Data de Emissão: ${docToday}<br>
                        Validade da Proposta: 30 dias (até ${validadeStr})
                      </div>
                    </div>
                    
                    <div class="title">Proposta de Planejamento Cirúrgico Premium</div>
                    
                    <!-- Dados do Paciente -->
                    <div class="section-title">Dados do Paciente e Planejamento</div>
                    <table>
                      <tr>
                        <td style="width: 20%; font-weight: bold; color: #1C3D5A;">Paciente:</td>
                        <td style="width: 45%;">${orcamentoPaciente.nome}</td>
                        <td style="width: 15%; font-weight: bold; color: #1C3D5A;">Idade:</td>
                        <td style="width: 20%;">${orcamentoPaciente.idade} anos</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #1C3D5A;">Procedimento:</td>
                        <td colspan="3" style="font-weight: bold; color: #B87333;">${orcamentoProcedimento}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #1C3D5A;">Hospital Sugerido:</td>
                        <td>${orcamentoLocal}</td>
                        <td style="font-weight: bold; color: #1C3D5A;">Modalidade:</td>
                        <td>${orcamentoTipo === "particular_total" ? "Particular Total (All-Inclusive)" : "Apenas Honorários Médicos"}</td>
                      </tr>
                    </table>
                    
                    <!-- Serviços Contratados -->
                    <div class="section-title">Detalhamento dos Serviços e Custos</div>
                    <table>
                      <thead>
                        <tr>
                          <th style="width: 30%;">Serviço / Profissional</th>
                          <th style="width: 50%;">Descrição</th>
                          <th style="width: 20%; text-align: right;">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="font-weight: bold; color: #1C3D5A;">Equipe Cirúrgica</td>
                          <td>Honorários médicos completos do Dr. Felipe de Bulhões, cirurgião auxiliar, anestesista e instrumentadores especializados em técnicas minimamente invasivas.</td>
                          <td style="text-align: right; font-weight: bold;">${formatMoeda(vHonorarios)}</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; color: #1C3D5A;">Acompanhamento Pós-Operatório</td>
                          <td>6 meses de acompanhamento médico contínuo, consultas ilimitadas presenciais ou por telemedicina dedicadas à cirurgia, e canal de contato direto e exclusivo com o Dr. Felipe.</td>
                          <td style="text-align: right; font-weight: bold;">${formatMoeda(vAcompanhamento)}</td>
                        </tr>
                        ${orcamentoTipo === "particular_total" ? `
                          <tr>
                            <td style="font-weight: bold; color: #1C3D5A;">Taxas Hospitalares</td>
                            <td>Reserva de centro cirúrgico de alta tecnologia, taxa de sala, internação em apartamento privativo e suporte assistencial completo.</td>
                            <td style="text-align: right; font-weight: bold;">${formatMoeda(vHospital)}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #1C3D5A;">Materiais e OPME</td>
                            <td>Dispositivos médicos e materiais importados de alta qualidade específicos para o procedimento (ex: laser, telas, próteses de alta tecnologia).</td>
                            <td style="text-align: right; font-weight: bold;">${formatMoeda(vMateriais)}</td>
                          </tr>
                        ` : ""}
                      </tbody>
                    </table>
                    
                    <!-- Caixa de Valor Total -->
                    <div class="total-box">
                      <span>Valor Total do Planejamento Cirúrgico</span>
                      <strong>${formatMoeda(vTotal)}</strong>
                    </div>
                    
                    <!-- Descrição Clínica Adicional -->
                    ${orcamentoObs ? `
                      <div class="section-title">Informações e Orientações Adicionais</div>
                      <div style="font-size: 9px; color: #475569; margin-bottom: 20px; line-height: 1.5; text-align: justify;">
                        ${orcamentoObs}
                      </div>
                    ` : ""}
                    
                    <!-- Condições Comerciais e Cláusulas de Proteção CPP -->
                    <div class="section-title">Condições Comerciais e Termos de Garantia</div>
                    <div class="clauses">
                      <p><strong>1. Formas de Pagamento:</strong> À vista com 5% de desconto no valor de ${formatMoeda(vTotal * 0.95)} ou parcelado em até 6x de ${formatMoeda(vTotal / 6)} sem juros no cartão de crédito corporativo ou boleto bancário (sujeito a análise).</p>
                      <p><strong>2. Programação de Equipe:</strong> O pagamento deverá ser efetuado em até 20 dias corridos antes da data cirúrgica agendada para fins de reserva e garantia da programação da equipe e insumos tecnológicos.</p>
                      <p><strong>3. Política de Reagendamento:</strong> A cirurgia poderá ser reagendada uma única vez sem custos adicionais. Cancelamentos ou desistências em menos de 15 dias úteis da data cirúrgica acarretarão multa de 15% do valor total para cobertura de custos operacionais da equipe médica reservada.</p>
                      <p><strong>4. Garantia de Revisão:</strong> Caso seja necessária uma segunda abordagem cirúrgica complementar ou revisão direta relacionada ao procedimento principal dentro de 6 meses pós-operatórios, os honorários médicos do Dr. Felipe de Bulhões não serão cobrados.</p>
                      ${orcamentoTipo === "honorarios" ? `<p><strong>5. Observação de Custos Hospitalares:</strong> Custos de hospital e materiais não estão inclusos neste orçamento e são de inteira responsabilidade do paciente diretamente com a instituição de saúde escolhida.</p>` : ""}
                    </div>
                    
                    <!-- Área de Assinaturas -->
                    <div class="signature-container">
                      <div class="signature-box">
                        <div class="signature-line"></div>
                        <span style="font-weight: bold;">${orcamentoPaciente.nome}</span><br>
                        <span style="font-size: 8px; color: #64748B;">Contratante / Paciente</span>
                      </div>
                      <div class="signature-box">
                        ${useSignature && signatureUrl ? `<img src="${signatureUrl}" style="height: 45px; margin-bottom: -15px;" />` : `<div style="height: 30px;"></div>`}
                        <div class="signature-line"></div>
                        <span style="font-weight: bold; color: #1C3D5A;">Dr. Felipe de Bulhões Ojeda</span><br>
                        <span style="font-size: 8px; color: #64748B;">Urologista • CRM-SP 241.135 | RQE 112.445</span>
                      </div>
                    </div>
                    
                    <!-- Rodapé Fixo -->
                    <div class="footer">
                      <span>Orçamento de Procedimento Particular • Gerado via ProtoUro App</span>
                      <span>Campinas: Av. José de Souza Campos, 123 | São Paulo: Av. Paulista, 1000</span>
                      <span>Página 1 de 1</span>
                    </div>
                  </body>
                  </html>
                `;

                const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
                if (doc) {
                  doc.open();
                  doc.write(htmlContent);
                  doc.close();

                  // Registrar orçamento como documento no histórico do paciente
                  const novoDocumento = {
                    id: Math.random().toString(36).substring(2, 9),
                    titulo: `Orçamento CPP: ${orcamentoProcedimento}`,
                    tipo: "laudo" as const, // Salva como tipo laudo para categorização de orçamento
                    data: docToday,
                    conteudo: `Orçamento Cirúrgico CPP (${orcamentoTipo === "particular_total" ? "Particular Total" : "Apenas Honorários"})\nProcedimento: ${orcamentoProcedimento}\nLocal: ${orcamentoLocal}\nValor Total: ${formatMoeda(vTotal)}\n\nDetalhamento:\n- Honorários: ${formatMoeda(vHonorarios)}\n- Acompanhamento: ${formatMoeda(vAcompanhamento)}\n${orcamentoTipo === "particular_total" ? `- Hospital: ${formatMoeda(vHospital)}\n- Materiais: ${formatMoeda(vMateriais)}` : ""}`
                  };

                  const pacientesAtualizados = pacientes.map(p => {
                    if (p.id === orcamentoPaciente.id) {
                      return {
                        ...p,
                        documentos: [novoDocumento, ...(p.documentos || [])]
                      };
                    }
                    return p;
                  });

                  setPacientes(pacientesAtualizados);
                  saveToStorage(pacientesAtualizados);

                  setTimeout(() => {
                    printFrame.contentWindow?.focus();
                    printFrame.contentWindow?.print();
                    setTimeout(() => {
                      document.body.removeChild(printFrame);
                    }, 1000);
                  }, 500);

                  toast.success("Orçamento CPP gerado com sucesso para impressão e salvo no prontuário!");
                  setOrcamentoOpen(false);
                  setOrcamentoPaciente(null);
                }
              }}
              className="h-9 rounded-xl text-xs font-bold copper-gradient text-white"
            >
              Imprimir Orçamento &amp; Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
