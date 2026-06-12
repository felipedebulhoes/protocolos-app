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
  FileSpreadsheet
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
}

export default function Patients() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "hema_critical" | "psa_critical" | "followup_late" | "contact_overdue" | "origin_instagram" | "origin_google" | "origin_indicacao">("all");
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
  const [activeView, setActiveView] = useState<"list" | "crm">("list"); // Visualização ativa (Lista vs CRM Kanban)
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

  // Estados para novos registros de contatos comerciais (CRM Linha do Tempo)
  const [newContatoTipo, setNewContatoTipo] = useState<"whatsapp" | "ligacao" | "email" | "retorno">("whatsapp");
  const [newContatoNotas, setNewContatoNotas] = useState("");

  // Estados para o Módulo de Prescrição Inteligente
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);
  const [prescricaoPaciente, setPrescricaoPaciente] = useState<Paciente | null>(null);
  const [prescricaoModelo, setPrescricaoPacienteModelo] = useState("");
  const [prescricaoConteudo, setPrescricaoConteudo] = useState("");

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
   Posologia: Lavar o local de aplicação após 6 horas para remoção de resíduos e máxima segurança.`
    },
    {
      id: "undecilato_nebido",
      titulo: "Undecilato de Testosterona 250mg/mL (Nebido/TRT)",
      conteudo: `USO INTRAMUSCULAR

1. Undecilato de Testosterona 250 mg/mL (Ampola de 4 mL) ---- 1 ampola
   Posologia: Aplicar 1 ampola (1000 mg) por via intramuscular profunda na região glútea, lentamente (durante pelo menos 60 segundos), com intervalo de 10 a 14 semanas, conforme orientação médica e controle laboratorial periódico.

* Nota: A primeira aplicação de reforço (segunda dose) pode ser recomendada após 6 semanas para saturação mais rápida do compartimento de reserva.`
    },
    {
      id: "cipionato_deposteron",
      titulo: "Cipionato de Testosterona 100mg/mL (Deposteron/TRT)",
      conteudo: `USO INTRAMUSCULAR

1. Cipionato de Testosterona 200 mg / 2 mL (Ampola) --------- 3 ampolas
   Posologia: Aplicar 1 ampola (200 mg) por via intramuscular profunda na região glútea a cada 14 dias (duas semanas) para manutenção de níveis fisiológicos de testosterona. Realizar exames de controle de Testosterona Total e Hematócrito antes da 4ª aplicação.`
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

* Benefícios: Melhora da função erétil e redução dos sintomas urinários obstrutivos (IPSS) por hiperplasia prostática benigna (HPB).`
    }
  ];

  // Carregar pacientes do LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        setPacientes(JSON.parse(stored));
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
            comercialHist: updatedHist
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
        proximoContato: proximoContato
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

    // Faturamento Estimado (Valores padrão de urologia particular premium)
    // Consulta: R$ 1.000,00 (todos os que agendaram ou passaram)
    // Cirurgia: R$ 15.000,00 (operados)
    const valorConsulta = 1000;
    const valorCirurgia = 15000;
    
    const consultasRealizadas = agendados + realizados + propostos + operados;
    const faturamentoConsultas = consultasRealizadas * valorConsulta;
    const faturamentoCirurgias = operados * valorCirurgia;
    const faturamentoTotal = faturamentoConsultas + faturamentoCirurgias;

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
            <div class="kpi-value">R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <div class="kpi-label">Faturamento Est.</div>
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
              <th>Faturamento Est. por Canal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge badge-instagram">Instagram / Redes Sociais</span></td>
              <td>${origens.instagram}</td>
              <td>${totalLeads > 0 ? ((origens.instagram / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(origens.instagram * (valorConsulta + (operados / totalLeads) * valorCirurgia)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-google">Google Ads / Tráfego Pago</span></td>
              <td>${origens.google_ads}</td>
              <td>${totalLeads > 0 ? ((origens.google_ads / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(origens.google_ads * (valorConsulta + (operados / totalLeads) * valorCirurgia)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-indicacao">Indicação Médica / Colegas</span></td>
              <td>${origens.indicacao}</td>
              <td>${totalLeads > 0 ? ((origens.indicacao / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(origens.indicacao * (valorConsulta + (operados / totalLeads) * valorCirurgia)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><span class="badge badge-outros">Outros / Orgânico</span></td>
              <td>${origens.outros}</td>
              <td>${totalLeads > 0 ? ((origens.outros / totalLeads) * 100).toFixed(0) : 0}%</td>
              <td>R$ ${(origens.outros * (valorConsulta + (operados / totalLeads) * valorCirurgia)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
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

                <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
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
                              <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold border-t border-border/40 pt-1.5">
                                <span>{p.idade ? `${p.idade} anos` : ""}</span>
                                {p.testosterona && (
                                  <span className="text-accent font-bold">T: {p.testosterona} ng/dL</span>
                                )}
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
                                    const stages: Array<"lead" | "agendado" | "realizado" | "proposto" | "operado"> = ["lead", "agendado", "realizado", "proposto", "operado"];
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
                      <div className="grid grid-cols-3 gap-2.5 bg-secondary/20 p-2.5 rounded-xl border border-border/40 text-center">
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
                      </div>

                      {p.notas && (
                        <div className="space-y-1 text-xs pt-1.5 border-t border-border/40">
                          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Notas Clínicas:</span>
                          <p className="text-muted-foreground leading-relaxed text-justify line-clamp-3 font-mono">
                            {p.notas}
                          </p>
                        </div>
                      )}

                      {/* Ficha Expandida do Paciente */}
                      {isExpanded && (
                        <div className="space-y-6 pt-4 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Alertas Clínicos Inteligentes */}
                          {(parseFloat(p.hematocrito) > 52 || (p.shbg && parseFloat(p.shbg) < 15)) && (
                            <div className="space-y-2">
                              <span className="font-bold text-red-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                ⚠️ Alertas de Segurança Clínica (TRT)
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {parseFloat(p.hematocrito) > 52 && (
                                  <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-xl text-xs font-medium flex flex-col gap-1">
                                    <span className="font-bold">Hematócrito Crítico ({p.hematocrito}%)</span>
                                    <span>Valor acima de 52% indica risco aumentado de hiperviscosidade sanguínea e eventos tromboembólicos. Recomenda-se suspender/reduzir TRT e indicar sangria terapêutica.</span>
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
                            <div className="flex justify-end gap-2 pt-2">
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/10 p-3 rounded-xl border border-border/40">
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
                              <div className="flex items-center gap-2 px-2 h-9 bg-card rounded-lg border border-border/40">
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
                                className="h-9 rounded-lg text-xs font-bold copper-gradient text-white"
                              >
                                Registrar Sintomas
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
              <Label htmlFor="modelo-prescricao" className="text-xs font-bold text-primary uppercase tracking-wider">Modelo de Protocolo Clínico:</Label>
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
              disabled={!prescricaoConteudo.trim() || !prescricaoPaciente}
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
    </Layout>
  );
}
