import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  FileText, 
  Search, 
  Trash2, 
  Printer, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  ChevronRight,
  User,
  PlusCircle,
  FileCheck,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { toast } from "sonner";

interface DocumentoVinculado {
  id: string;
  titulo: string;
  tipo: "receita" | "atestado" | "laudo";
  data: string;
  conteudo: string;
}

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  dataCadastro: string;
  documentos?: DocumentoVinculado[];
  faturamentoReal?: number;
  custoHospitalarReal?: number;
}

interface OrcamentoMapeado {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  pacienteIdade: string;
  titulo: string;
  data: string;
  conteudo: string;
  status?: "pendente" | "aprovado" | "recusado";
  faturamentoReal?: number;
  custoHospitalarReal?: number;
}

export default function Budgets() {
  const [, setLocation] = useLocation();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Carregar pacientes do LocalStorage para mapear todos os orçamentos
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

  // Extrair e mapear todos os orçamentos salvos nos prontuários dos pacientes
  const todosOrçamentos = React.useMemo(() => {
    const orcamentos: OrcamentoMapeado[] = [];
    pacientes.forEach(p => {
      const docs = p.documentos || [];
      docs.forEach(doc => {
        // No gerador de orçamentos, salvamos com o título começando com "Orçamento CPP" ou tipo "laudo" com conteúdo de orçamento
        if (doc.titulo.startsWith("Orçamento CPP") || doc.conteudo.includes("Orçamento Cirúrgico CPP")) {
          // Extrair ou definir status padrão do localStorage se houver, senão "pendente"
          const savedStatus = localStorage.getItem(`protouro_status_orcamento_${doc.id}`) as any || "pendente";
          orcamentos.push({
            id: doc.id,
            pacienteId: p.id,
            pacienteNome: p.nome,
            pacienteIdade: p.idade,
            titulo: doc.titulo,
            data: doc.data,
            conteudo: doc.conteudo,
            status: savedStatus,
            faturamentoReal: p.faturamentoReal,
            custoHospitalarReal: p.custoHospitalarReal
          });
        }
      });
    });
    // Ordenar por data (mais recentes primeiro)
    return orcamentos.sort((a, b) => {
      const parseData = (dStr: string) => {
        const parts = dStr.split("/");
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      };
      try {
        return parseData(b.data) - parseData(a.data);
      } catch {
        return 0;
      }
    });
  }, [pacientes]);

  // Filtrar orçamentos baseados na busca
  const orçamentosFiltrados = todosOrçamentos.filter(orc => 
    orc.pacienteNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    orc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    orc.conteudo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular métricas consolidadas
  const metricas = React.useMemo(() => {
    let totalValorOrcado = 0;
    let totalAprovado = 0;
    let totalCustosReais = 0;
    let totalLucroLiquido = 0;
    let countTotal = todosOrçamentos.length;
    let countAprovado = 0;

    todosOrçamentos.forEach(orc => {
      // 1. Obter valor orçado
      const matchTotal = orc.conteudo.match(/Valor Total:\s*R\$\s*([\d.,]+)/i);
      const valClean = matchTotal && matchTotal[1] ? matchTotal[1].replace(/\./g, "").replace(",", ".") : "0";
      const valorOrcado = parseFloat(valClean) || 0;
      totalValorOrcado += valorOrcado;

      // 2. Extrair estimativas de custos do orçamento se dados reais estiverem ausentes
      const matchHospital = orc.conteudo.match(/Hospital:\s*R\$\s*([\d.,]+)/i);
      const matchMateriais = orc.conteudo.match(/Materiais.*?:\s*R\$\s*([\d.,]+)/i);
      
      const hospEst = matchHospital && matchHospital[1] ? parseFloat(matchHospital[1].replace(/\./g, "").replace(",", ".")) : 0;
      const matEst = matchMateriais && matchMateriais[1] ? parseFloat(matchMateriais[1].replace(/\./g, "").replace(",", ".")) : 0;
      const custoOrcadoEstimado = hospEst + matEst;

      // 3. Determinar faturamento e custo real (prioriza preenchimento real do CRM, senão usa dados do orçamento)
      const faturamentoReal = orc.faturamentoReal !== undefined ? orc.faturamentoReal : (orc.status === "aprovado" ? valorOrcado : 0);
      const custoReal = orc.custoHospitalarReal !== undefined ? orc.custoHospitalarReal : (orc.status === "aprovado" ? custoOrcadoEstimado : 0);

      if (orc.status === "aprovado") {
        totalAprovado += faturamentoReal;
        totalCustosReais += custoReal;
        totalLucroLiquido += (faturamentoReal - custoReal);
        countAprovado++;
      }
    });

    return {
      totalValorOrcado,
      totalAprovado,
      totalCustosReais,
      totalLucroLiquido,
      countTotal,
      countAprovado
    };
  }, [todosOrçamentos]);

  // Agrupar dados por procedimento para o gráfico de barras de margem por procedimento
  const dadosGraficoMargem = React.useMemo(() => {
    const agrupamento: Record<string, { faturamento: number; custo: number; count: number }> = {};

    todosOrçamentos.forEach(orc => {
      if (orc.status !== "aprovado") return;

      const procedimentoRaw = orc.titulo.replace("Orçamento CPP: ", "");
      // Normalizar nome do procedimento
      let procedimento = "Outros";
      if (procedimentoRaw.toLowerCase().includes("holep") || procedimentoRaw.toLowerCase().includes("enucleação")) {
        procedimento = "HoLEP (Laser Próstata)";
      } else if (procedimentoRaw.toLowerCase().includes("sling")) {
        procedimento = "Sling Uretral";
      } else if (procedimentoRaw.toLowerCase().includes("botox") || procedimentoRaw.toLowerCase().includes("toxina")) {
        procedimento = "Toxina Botulínica";
      } else if (procedimentoRaw.toLowerCase().includes("prótese") || procedimentoRaw.toLowerCase().includes("implante")) {
        procedimento = "Implante de Prótese";
      } else if (procedimentoRaw.toLowerCase().includes("peyronie")) {
        procedimento = "Cirurgia Peyronie";
      } else if (procedimentoRaw.toLowerCase().includes("ondas de choque") || procedimentoRaw.toLowerCase().includes("eswt")) {
        procedimento = "Ondas de Choque";
      } else if (procedimentoRaw.trim()) {
        procedimento = procedimentoRaw.trim();
      }

      // 1. Obter valor orçado
      const matchTotal = orc.conteudo.match(/Valor Total:\s*R\$\s*([\d.,]+)/i);
      const valClean = matchTotal && matchTotal[1] ? matchTotal[1].replace(/\./g, "").replace(",", ".") : "0";
      const valorOrcado = parseFloat(valClean) || 0;

      // 2. Extrair estimativas de custos do orçamento se dados reais estiverem ausentes
      const matchHospital = orc.conteudo.match(/Hospital:\s*R\$\s*([\d.,]+)/i);
      const matchMateriais = orc.conteudo.match(/Materiais.*?:\s*R\$\s*([\d.,]+)/i);
      const hospEst = matchHospital && matchHospital[1] ? parseFloat(matchHospital[1].replace(/\./g, "").replace(",", ".")) : 0;
      const matEst = matchMateriais && matchMateriais[1] ? parseFloat(matchMateriais[1].replace(/\./g, "").replace(",", ".")) : 0;
      const custoOrcadoEstimado = hospEst + matEst;

      // 3. Determinar faturamento e custo real (prioriza preenchimento real do CRM, senão usa dados do orçamento)
      const faturamentoReal = orc.faturamentoReal !== undefined ? orc.faturamentoReal : valorOrcado;
      const custoReal = orc.custoHospitalarReal !== undefined ? orc.custoHospitalarReal : custoOrcadoEstimado;

      if (!agrupamento[procedimento]) {
        agrupamento[procedimento] = { faturamento: 0, custo: 0, count: 0 };
      }

      agrupamento[procedimento].faturamento += faturamentoReal;
      agrupamento[procedimento].custo += custoReal;
      agrupamento[procedimento].count += 1;
    });

    return Object.keys(agrupamento).map(proc => {
      const { faturamento, custo, count } = agrupamento[proc];
      const lucroTotal = faturamento - custo;
      const margemMedia = count > 0 ? lucroTotal / count : 0;
      const faturamentoMedio = count > 0 ? faturamento / count : 0;
      const custoMedio = count > 0 ? custo / count : 0;
      const percentualMargem = faturamento > 0 ? (lucroTotal / faturamento) * 100 : 0;

      return {
        procedimento: proc,
        lucroMedio: Math.round(margemMedia),
        faturamentoMedio: Math.round(faturamentoMedio),
        custoMedio: Math.round(custoMedio),
        margemPercentual: Math.round(percentualMargem),
        casos: count
      };
    }).sort((a, b) => b.lucroMedio - a.lucroMedio);
  }, [todosOrçamentos]);

  // Função para alterar o status de um orçamento
  const handleChangeStatus = (orcamentoId: string, novoStatus: "pendente" | "aprovado" | "recusado") => {
    localStorage.setItem(`protouro_status_orcamento_${orcamentoId}`, novoStatus);
    
    // Forçar atualização do estado dos pacientes para refletir a mudança
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      setPacientes(JSON.parse(stored));
    }
    toast.success(`Status do orçamento atualizado para: ${novoStatus.toUpperCase()}`);
  };

  // Função para exportar os orçamentos em formato CSV
  const handleExportCSV = () => {
    if (todosOrçamentos.length === 0) {
      toast.error("Nenhum orçamento para exportar.");
      return;
    }

    const headers = ["Data", "Paciente", "Idade", "Procedimento", "Modalidade", "Valor Total", "Status"];
    const rows = todosOrçamentos.map(orc => {
      const match = orc.conteudo.match(/Valor Total:\s*R\$\s*([\d.,]+)/i);
      const valor = match ? match[1].replace(/\./g, "").replace(",", ".") : "0";
      const modalidade = orc.conteudo.includes("Particular Total") ? "Particular Total" : "Honorários Médicos";
      const statusStr = (orc.status || "pendente").toUpperCase();
      
      return [
        orc.data,
        `"${orc.pacienteNome}"`,
        orc.pacienteIdade,
        `"${orc.titulo.replace("Orçamento CPP: ", "")}"`,
        `"${modalidade}"`,
        valor,
        statusStr
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Orcamentos_ProtoUro_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório de orçamentos exportado com sucesso!");
  };

  // Função para disparar o lembrete no WhatsApp com script de alta conversão
  const handleSendWhatsAppLembrete = (orc: OrcamentoMapeado) => {
    const procedimento = orc.titulo.replace("Orçamento CPP: ", "");
    
    // Identificar script de acordo com o procedimento urológico
    let scriptPersuasivo = "";
    if (procedimento.toLowerCase().includes("botox") || procedimento.toLowerCase().includes("toxina")) {
      scriptPersuasivo = `Olá, tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Passando para saber se ficou com alguma dúvida em relação ao planejamento da Aplicação de Toxina Botulínica Intravesical. Esse procedimento é extremamente seguro e traz um alívio fantástico para a bexiga hiperativa e incontinência, devolvendo a sua liberdade no dia a dia. Deseja agendar a data do seu procedimento para as próximas semanas?`;
    } else if (procedimento.toLowerCase().includes("sling")) {
      scriptPersuasivo = `Olá, tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Passando para dar um retorno sobre o seu orçamento para a cirurgia de Sling Uretral. O Dr. Felipe desenhou esse planejamento de forma personalizada para tratar a sua perda urinária com o que há de mais moderno e seguro. Como estão as suas datas? Gostaria de reservar o seu horário cirúrgico no hospital?`;
    } else if (procedimento.toLowerCase().includes("holep") || procedimento.toLowerCase().includes("enucleação")) {
      scriptPersuasivo = `Olá, tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Gostaríamos de saber se ficou com alguma dúvida sobre o orçamento do HoLEP (Enucleação a Laser da Próstata). Essa tecnologia é o padrão-ouro mundial para o tratamento do crescimento da próstata, oferecendo uma recuperação muito mais rápida, sem cortes e com alta precoce. O Dr. Felipe tem poucas datas disponíveis para este mês. Gostaria de garantir a sua vaga?`;
    } else if (procedimento.toLowerCase().includes("prótese") || procedimento.toLowerCase().includes("implante")) {
      scriptPersuasivo = `Olá, tudo bem? Aqui é da equipe de atendimento exclusivo do Dr. Felipe de Bulhões. Entramos em contato para dar seguimento ao seu planejamento para o implante da Prótese Peniana. Entendemos a importância desse passo para a sua qualidade de vida e intimidade, e por isso oferecemos um acompanhamento completo de 6 meses. Ficou com alguma dúvida comercial ou gostaria de alinhar a data da cirurgia?`;
    } else {
      scriptPersuasivo = `Olá, tudo bem? Aqui é da equipe do Dr. Felipe de Bulhões. Gostaríamos de saber se você recebeu direitinho o orçamento timbrado para o procedimento de ${procedimento} e se ficou com alguma dúvida sobre as condições de pagamento ou o acompanhamento de 6 meses pós-operatório. Estamos à disposição para ajudar você a agendar a sua cirurgia com toda a comodidade.`;
    }

    const textoCodificado = encodeURIComponent(scriptPersuasivo);
    // Como não temos o telefone salvo diretamente na interface compacta de orçamento mapeado, vamos abrir o WhatsApp para envio
    const url = `https://wa.me/5511981124455?text=${textoCodificado}`;
    window.open(url, "_blank");
    toast.success("Script de lembrete personalizado aberto no WhatsApp!");
  };

  // Função para deletar um orçamento do prontuário do paciente
  const handleDeleteOrcamento = (pacienteId: string, orcamentoId: string) => {
    const confirmacao = window.confirm("Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita.");
    if (!confirmacao) return;

    const pacientesAtualizados = pacientes.map(p => {
      if (p.id === pacienteId) {
        return {
          ...p,
          documentos: (p.documentos || []).filter(doc => doc.id !== orcamentoId)
        };
      }
      return p;
    });

    setPacientes(pacientesAtualizados);
    localStorage.setItem("protouro_pacientes_db", JSON.stringify(pacientesAtualizados));
    toast.success("Orçamento excluído com sucesso!");
  };

  // Função para reimprimir o orçamento
  const handlePrintOrcamento = (orc: OrcamentoMapeado) => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const docToday = orc.data;
    const validadeDate = new Date();
    validadeDate.setDate(validadeDate.getDate() + 30);
    const validadeStr = validadeDate.toLocaleDateString("pt-BR");

    // Extrair os valores do conteúdo textual para reconstruir o PDF timbrado premium
    const getValor = (regex: RegExp) => {
      const match = orc.conteudo.match(regex);
      if (match && match[1]) {
        return parseFloat(match[1].replace(/\./g, "").replace(",", ".")) || 0;
      }
      return 0;
    };

    const vHonorarios = getValor(/Honorários:\s*R\$\s*([\d.,]+)/i) || 15000;
    const vAcompanhamento = getValor(/Acompanhamento:\s*R\$\s*([\d.,]+)/i) || 3000;
    const vHospital = getValor(/Hospital:\s*R\$\s*([\d.,]+)/i);
    const vMateriais = getValor(/Materiais:\s*R\$\s*([\d.,]+)/i);
    const vTotal = getValor(/Valor Total:\s*R\$\s*([\d.,]+)/i) || (vHonorarios + vAcompanhamento + vHospital + vMateriais);

    const isParticularTotal = vHospital > 0 || vMateriais > 0;

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
            border-bottom: 2px solid #B87333;
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
            color: #F3A847;
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
            Validade da Proposta: 30 dias
          </div>
        </div>
        
        <div class="title">Proposta de Planejamento Cirúrgico Premium</div>
        
        <div class="section-title">Dados do Paciente e Planejamento</div>
        <table>
          <tr>
            <td style="width: 20%; font-weight: bold; color: #1C3D5A;">Paciente:</td>
            <td style="width: 45%;">${orc.pacienteNome}</td>
            <td style="width: 15%; font-weight: bold; color: #1C3D5A;">Idade:</td>
            <td style="width: 20%;">${orc.pacienteIdade} anos</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #1C3D5A;">Procedimento:</td>
            <td colspan="3" style="font-weight: bold; color: #B87333;">${orc.titulo.replace("Orçamento CPP: ", "")}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #1C3D5A;">Modalidade:</td>
            <td colspan="3">${isParticularTotal ? "Particular Total (All-Inclusive)" : "Apenas Honorários Médicos"}</td>
          </tr>
        </table>
        
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
            ${isParticularTotal ? `
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
        
        <div class="total-box">
          <span>Valor Total do Planejamento Cirúrgico</span>
          <strong>${formatMoeda(vTotal)}</strong>
        </div>
        
        <div class="section-title">Condições Comerciais e Termos de Garantia</div>
        <div class="clauses">
          <p><strong>1. Formas de Pagamento:</strong> À vista com 5% de desconto no valor de ${formatMoeda(vTotal * 0.95)} ou parcelado em até 6x de ${formatMoeda(vTotal / 6)} sem juros no cartão de crédito corporativo ou boleto bancário (sujeito a análise).</p>
          <p><strong>2. Programação de Equipe:</strong> O pagamento deverá ser efetuado em até 20 dias corridos antes da data cirúrgica agendada para fins de reserva e garantia da programação da equipe e insumos tecnológicos.</p>
          <p><strong>3. Política de Reagendamento:</strong> A cirurgia poderá ser reagendada uma única vez sem custos adicionais. Cancelamentos ou desistências em menos de 15 dias úteis da data cirúrgica acarretarão multa de 15% do valor total para cobertura de custos operacionais da equipe médica reservada.</p>
          <p><strong>4. Garantia de Revisão:</strong> Caso seja necessária uma segunda abordagem cirúrgica complementar ou revisão direta relacionada ao procedimento principal dentro de 6 meses pós-operatórios, os honorários médicos do Dr. Felipe de Bulhões não serão cobrados.</p>
          ${!isParticularTotal ? `<p><strong>5. Observação de Custos Hospitalares:</strong> Custos de hospital e materiais não estão inclusos neste orçamento e são de inteira responsabilidade do paciente diretamente com a instituição de saúde escolhida.</p>` : ""}
        </div>
        
        <div class="signature-container">
          <div class="signature-box">
            <div class="signature-line"></div>
            <span style="font-weight: bold;">${orc.pacienteNome}</span><br>
            <span style="font-size: 8px; color: #64748B;">Contratante / Paciente</span>
          </div>
          <div class="signature-box">
            ${useSignature && signatureUrl ? `<img src="${signatureUrl}" style="height: 45px; margin-bottom: -15px;" />` : `<div style="height: 30px;"></div>`}
            <div class="signature-line"></div>
            <span style="font-weight: bold; color: #1C3D5A;">Dr. Felipe de Bulhões Ojeda</span><br>
            <span style="font-size: 8px; color: #64748B;">Urologista • CRM-SP 241.135 | RQE 112.445</span>
          </div>
        </div>
        
        <div class="footer">
          <span>Orçamento de Procedimento Particular • Reemitido via ProtoUro App</span>
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

      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);

      toast.success("Orçamento enviado para a impressora!");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-primary">Painel Central de Orçamentos</h2>
            <p className="text-muted-foreground text-sm">
              Monitore, consulte, re-imprima e gerencie todos os orçamentos cirúrgicos premium gerados para seus pacientes.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="h-11 rounded-xl text-xs font-bold gap-1.5 border-border text-primary hover:bg-secondary/40"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
            <Button 
              onClick={() => setLocation("/pacientes")} 
              className="h-11 rounded-xl text-xs font-bold gap-1.5 copper-gradient text-white border-0 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Orçamento (Aba Pacientes)
            </Button>
          </div>
        </div>

        {/* Cards de Métricas Consolidadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border border-border/40 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-[#B87333]" />
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Volume Total</span>
              <TrendingUp className="w-4 h-4 text-[#B87333]" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <h3 className="text-3xl font-serif font-bold text-primary">{metricas.countTotal}</h3>
              <p className="text-xs text-muted-foreground mt-1">{metricas.countAprovado} aprovados ({metricas.countTotal > 0 ? Math.round((metricas.countAprovado / metricas.countTotal) * 100) : 0}%)</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-amber-500" />
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Valor Total Proposto</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <h3 className="text-3xl font-serif font-bold text-primary">
                {metricas.totalValorOrcado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Potencial financeiro em negociação</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-emerald-500" />
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faturamento Aprovado</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <h3 className="text-3xl font-serif font-bold text-emerald-600">
                {metricas.totalAprovado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Faturamento real convertido de orçamentos</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-[#1C3D5A]" />
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lucro Líquido Real</span>
              <TrendingUp className="w-4 h-4 text-[#1C3D5A]" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <h3 className={`text-3xl font-serif font-bold ${metricas.totalLucroLiquido >= 0 ? 'text-[#1C3D5A]' : 'text-destructive'}`}>
                {metricas.totalLucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Custos reais: {metricas.totalCustosReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Visual de Margem por Procedimento */}
        {dadosGraficoMargem.length > 0 && (
          <Card className="bg-card border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-serif font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#B87333] animate-pulse" />
                  Margem de Lucro Líquido Médio por Procedimento (Casos Aprovados)
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Comparativo de retorno financeiro líquido real por tipo de cirurgia/tratamento
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] font-bold uppercase border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                Análise de ROI
              </Badge>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Gráfico Recharts */}
                <div className="lg:col-span-2 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dadosGraficoMargem}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="procedimento" 
                        tick={{ fill: "#64748B", fontSize: 9, fontWeight: "bold" }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tickFormatter={(v) => `R$ ${v >= 1000 ? `${v/1000}k` : v}`}
                        tick={{ fill: "#1C3D5A", fontSize: 9, fontWeight: "bold" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip 
                        formatter={(value: any, name: any) => {
                          if (name === "lucroMedio") return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Lucro Médio"];
                          if (name === "faturamentoMedio") return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Faturamento Médio"];
                          if (name === "custoMedio") return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Custo Médio"];
                          return [value, name];
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#1C3D5A", fontSize: "11px" }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "11px" }}
                      />
                      <Bar 
                        dataKey="lucroMedio" 
                        name="Lucro Médio (R$)" 
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      >
                        {dadosGraficoMargem.map((entry, index) => {
                          // Cores alternadas ou degradê premium
                          const cores = ["#1C3D5A", "#B87333", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
                          return <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela de Dados e Insights */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    Ranking de Rentabilidade Média:
                  </span>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {dadosGraficoMargem.map((item, idx) => (
                      <div 
                        key={`rank_${idx}`} 
                        className="bg-secondary/10 border border-border/40 p-2.5 rounded-xl flex flex-col gap-1 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary truncate max-w-[180px]">{item.procedimento}</span>
                          <Badge variant="outline" className="text-[8px] font-bold py-0 px-1.5 border-accent/20 text-accent bg-accent/5">
                            {item.casos} {item.casos === 1 ? "caso" : "casos"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/30 mt-1">
                          <div>
                            Margem Líquida: <strong className="text-emerald-600 block text-xs">{item.lucroMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                          </div>
                          <div className="text-right">
                            Faturamento Médio: <strong className="text-primary block">{item.faturamentoMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-0.5">
                          <span>Custo Hosp. Médio: <strong>{item.custoMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                          <span className="font-bold text-[#B87333] bg-[#B87333]/5 px-1.5 py-0.5 rounded">Margem: {item.margemPercentual}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome do paciente, procedimento ou valores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-xl border-border bg-card shadow-sm"
          />
        </div>

        {/* Lista de Orçamentos */}
        {orçamentosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border max-w-xl mx-auto">
            <FileCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-foreground mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Vá até a aba de **Pacientes**, selecione o paciente desejado no prontuário expandido e clique em **Orçamento CPP Premium** para gerar o primeiro.
            </p>
            <Button onClick={() => setLocation("/pacientes")} className="rounded-xl">
              Ir para Pacientes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orçamentosFiltrados.map((orc) => {
              // Extrair valor do conteúdo para mostrar no card
              const match = orc.conteudo.match(/Valor Total:\s*R\$\s*([\d.,]+)/i);
              const valorFormatado = match ? `R$ ${match[1]}` : "N/A";

              return (
                <Card 
                  key={orc.id}
                  className="bg-card border border-border/40 hover:border-[#B87333]/20 shadow-sm transition-all duration-200"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-[#B87333]/20 text-[#B87333] bg-[#B87333]/5">
                          {orc.conteudo.includes("Particular Total") ? "Particular Total" : "Honorários Médicos"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          Gerado em: {orc.data}
                        </span>
                        
                        {/* Seletor de Status Interativo */}
                        <select
                          value={orc.status || "pendente"}
                          onChange={(e) => handleChangeStatus(orc.id, e.target.value as any)}
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border outline-none cursor-pointer transition-colors ${
                            orc.status === "aprovado" 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : orc.status === "recusado" 
                                ? "bg-red-50 border-red-200 text-red-700" 
                                : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          <option value="pendente">⏳ Pendente</option>
                          <option value="aprovado">✅ Aprovado</option>
                          <option value="recusado">❌ Recusado</option>
                        </select>
                      </div>
                      <h4 className="font-serif font-bold text-base text-primary truncate">
                        {orc.titulo.replace("Orçamento CPP: ", "")}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-accent" />
                        Paciente: <strong className="text-primary">{orc.pacienteNome}</strong> ({orc.pacienteIdade} anos)
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border/40 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Valor Proposto</span>
                        <strong className="text-lg font-bold text-emerald-600 block">{valorFormatado}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Botão Lembrete do WhatsApp */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendWhatsAppLembrete(orc)}
                          className="h-9 w-9 p-0 rounded-xl border-emerald-200/40 text-emerald-600 hover:bg-emerald-50/40"
                          title="Enviar Lembrete WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintOrcamento(orc)}
                          className="h-9 w-9 p-0 rounded-xl border-border text-primary hover:bg-secondary/40"
                          title="Imprimir Orçamento"
                        >
                          <Printer className="w-4 h-4 text-[#B87333]" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOrcamento(orc.pacienteId, orc.id)}
                          className="h-9 w-9 p-0 rounded-xl border-red-200/40 text-red-600 hover:bg-red-50/40"
                          title="Excluir Orçamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
