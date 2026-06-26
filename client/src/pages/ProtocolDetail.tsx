import React, { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, 
  Heart, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Scissors, 
  TrendingUp, 
  Zap, 
  Link as LinkIcon, 
  PlusCircle, 
  Flame, 
  ShieldAlert, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  FileText, 
  Users, 
  User,
  Clock, 
  Hourglass, 
  AlertTriangle, 
  HeartCrack, 
  FolderHeart, 
  HeartPulse, 
  ZapOff, 
  CheckSquare, 
  Droplet, 
  Moon, 
  Gem, 
  Droplets,
  Bookmark,
  Share2,
  Share,
  PhoneCall,
  Image as ImageIcon,
  MessageSquare,
  PlayCircle,
  Video,
  Printer,
  Trash2,
  MapPin,
  GitBranch,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import Layout from "@/components/Layout";
import protocolsData from "@/data/protocols.json";
import { trpc } from "@/lib/trpc";
import { buildPatientSections, isCareJourneySection } from "@shared/pdfPatientFilter";

// Mapeamento dinâmico de ícones do Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  Activity, Scissors, TrendingUp, Zap, Link: LinkIcon, Search: FileText,
  PlusCircle, Flame, ShieldAlert, RefreshCw, Layers, Sparkles,
  FileText, Users, Clock, Hourglass, AlertTriangle, HeartCrack,
  FolderHeart, HeartPulse, ZapOff, CheckSquare, Droplet, Moon,
  Gem, Droplets
};

export default function ProtocolDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/protocolo/:id");
  const protocolId = params?.id;

  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientHistory, setPatientHistory] = useState<string[]>([]);
  const [certCopied, setCertCopied] = useState<number | null>(null);
  const [laudoCopied, setLaudoCopied] = useState<number | null>(null);
  const [whatsappCopied, setWhatsappCopied] = useState<number | null>(null);
  const [useSignature, setUseSignature] = useState(true);
  const [useQrCode, setUseQrCode] = useState(true);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  
  // Estados para as novas funcionalidades (Medicamentos Adjuvantes, Checklist de Alta, Cópia MEV)
  const [selectedAdjuvants, setSelectedAdjuvants] = useState<Record<string, string[]>>({});
  const [checklistItems, setChecklistItems] = useState<Record<string, { id: string; text: string; checked: boolean }[]>>({});
  const [mevCopied, setMevCopied] = useState<boolean>(false);
  
  // Catálogo de medicamentos adjuvantes customizados
  const [customAdjuvants, setCustomAdjuvants] = useState<{ id: string; name: string; desc: string }[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDesc, setNewMedDesc] = useState("");
  const [isAddingMed, setIsAddingMed] = useState(false);
  
  // Tom selecionado para a mensagem MEV (formal, acolhedor, pratico)
  const [mevTone, setMevTone] = useState<"formal" | "acolhedor" | "pratico">("acolhedor");
  
  // Local de atendimento para o cabeçalho do receituário customizável
  const [localAtendimento, setLocalAtendimento] = useState<"clinovi_paulista" | "clinovi_moema" | "campinas_day" | "sem_logo">("clinovi_paulista");

  // Estado para a fila de mensagens de pós-operatório agendado (D+1, D+7, D+30)
  const [selectedPostOpDay, setSelectedPostOpDay] = useState<"D1" | "D7" | "D30">("D1");
  const [postOpCopied, setPostOpCopied] = useState(false);

  // Estado para a data do procedimento cirúrgico (Automação de Retornos)
  const [procedureDate, setProcedureDate] = useState("");
  // Estados do modal de geração de PDF (independentes dos demais campos)
  // Inicializados a partir do sessionStorage para reaproveitar o paciente na mesma sessão
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfPatientName, setPdfPatientName] = useState(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pdf_patient_name") || "" : "")
  );
  const [pdfProcedureDate, setPdfProcedureDate] = useState(
    () => (typeof window !== "undefined" ? sessionStorage.getItem("pdf_procedure_date") || "" : "")
  );
  const [pdfObservations, setPdfObservations] = useState("");

  // Buscar dados do protocolo atual
  const protocol = protocolsData.find(p => p.id === protocolId);
  
  // Guard clause para protocol
  if (!protocol) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Protocolo não encontrado</h1>
            <Button onClick={() => setLocation("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Converte markdown simples (negrito, listas, links) em HTML para impressão
  const mdToHtml = (md: string): string => {
    if (!md) return "";
    const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lines = md.split(/\r?\n/);
    let html = "";
    let inList = false;
    const inline = (t: string) =>
      escapeHtml(t)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    const splitRow = (row: string) =>
      row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map(c => c.trim());
    const isTableSep = (row: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(row);
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trimEnd();
      // Detecta tabela Markdown: linha de cabeçalho com '|' seguida de linha separadora
      if (
        /\|/.test(line) &&
        i + 1 < lines.length &&
        isTableSep(lines[i + 1])
      ) {
        if (inList) { html += "</ul>"; inList = false; }
        const headers = splitRow(line);
        let table = "<table><thead><tr>" + headers.map(h => `<th>${inline(h)}</th>`).join("") + "</tr></thead><tbody>";
        i += 2; // pula cabeçalho e separador
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") {
          const cells = splitRow(lines[i]);
          table += "<tr>" + cells.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>";
          i++;
        }
        i--; // compensa o incremento do for
        table += "</tbody></table>";
        html += table;
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      } else if (/^#{1,6}\s+/.test(line)) {
        if (inList) { html += "</ul>"; inList = false; }
        const level = (line.match(/^#+/) || ["#"])[0].length;
        html += `<h${Math.min(level + 2, 6)}>${inline(line.replace(/^#{1,6}\s+/, ""))}</h${Math.min(level + 2, 6)}>`;
      } else if (line.trim() === "") {
        if (inList) { html += "</ul>"; inList = false; }
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p>${inline(line)}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  };

  const handleDownloadPdf = async () => {
    if (!protocol) return;

    // Allow-list de segurança: somente seções voltadas ao paciente entram no PDF.
    // Pipeline puro (testado em shared/pdfPatientFilter.ts): exclui secretaria, referências,
    // prescrição e títulos internos; higieniza a CPP removendo rapport/scripts/objeções.
    const clinicalSections = buildPatientSections(protocol.sections as any);

    const logoUrl = `${window.location.origin}/images/logo_landscape.svg`;
    const dateStr = new Date().toLocaleDateString("pt-BR");
    const procDateStr = pdfProcedureDate
      ? new Date(pdfProcedureDate + "T00:00:00").toLocaleDateString("pt-BR")
      : "";
    const escapeHtml = (v: string) =>
      v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const patientBlock =
      pdfPatientName.trim() || procDateStr
        ? `<div class="patient">${
            pdfPatientName.trim()
              ? `<span><strong>Paciente:</strong> ${escapeHtml(pdfPatientName.trim())}</span>`
              : ""
          }${
            procDateStr
              ? `<span><strong>Data do procedimento:</strong> ${procDateStr}</span>`
              : ""
          }</div>`
        : "";
    const observationsBlock = pdfObservations.trim()
      ? `<section class="sec obs"><h2>Observações do Médico</h2><div class="sec-body">${mdToHtml(
          pdfObservations.trim()
        )}</div></section>`
      : "";

    const sectionsHtml = clinicalSections
      .map((s: any) => {
        const highlight = isCareJourneySection(s.title || "");
        return `
        <section class="sec${highlight ? " care" : ""}">
          <h2>${highlight ? "✨ " : ""}${s.title}</h2>
          <div class="sec-body">${mdToHtml(s.content)}</div>
        </section>`;
      })
      .join("");

    const printHtml = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>${protocol.title}</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 22mm 16mm;
    @bottom-right { content: "Página " counter(page) " de " counter(pages); font-family: Arial, sans-serif; font-size: 9px; color: #8b97a1; }
  }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1C3D5A; line-height: 1.55; margin: 0; counter-reset: page; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #B87333; padding-bottom: 12px; margin-bottom: 18px; }
  .header img { height: 56px; object-fit: contain; }
  .header .meta { text-align: right; font-size: 11px; color: #6b7a86; font-family: Arial, sans-serif; }
  h1 { font-size: 22px; color: #1C3D5A; margin: 0 0 4px; break-after: avoid; page-break-after: avoid; }
  .cat { display: inline-block; background: #1C3D5A; color: #fff; font-size: 10px; letter-spacing: .5px; text-transform: uppercase; padding: 3px 10px; border-radius: 3px; font-family: Arial, sans-serif; }
  .intro { font-size: 13px; color: #34505f; margin: 12px 0 12px; font-style: italic; break-inside: avoid; page-break-inside: avoid; }
  .anchor { font-size: 12.5px; color: #1C3D5A; background: #eef1f4; border-left: 4px solid #1C3D5A; padding: 8px 12px; margin: 0 0 20px; font-family: Arial, sans-serif; break-inside: avoid; page-break-inside: avoid; }
  .anchor strong { color: #B87333; }
  .patient { display: flex; gap: 28px; flex-wrap: wrap; background: #f4f1ec; border-left: 4px solid #B87333; padding: 8px 12px; margin: 12px 0 18px; font-size: 12px; font-family: Arial, sans-serif; color: #1C3D5A; break-inside: avoid; page-break-inside: avoid; }
  .sec.obs { background: #f4f1ec; padding: 10px 12px; border-left: 4px solid #B87333; margin-top: 18px; }
  .sec { margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
  .sec h2 { font-size: 15px; color: #B87333; border-left: 4px solid #B87333; padding-left: 8px; margin: 0 0 6px; font-family: Arial, sans-serif; break-after: avoid; page-break-after: avoid; }
  /* Destaque da Linha de Cuidado Integral / Acompanhamento Premium */
  .sec.care { background: #f7f3ee; border: 1px solid #e3d4c2; border-left: 5px solid #B87333; border-radius: 4px; padding: 14px 16px; margin: 20px 0; }
  .sec.care h2 { font-size: 16px; color: #1C3D5A; border-left: none; padding-left: 0; }
  .sec.care .sec-body { color: #34505f; }
  .sec.care .sec-body strong { color: #B87333; }
  .sec.care .sec-body table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 8px 0; }
  .sec.care .sec-body th, .sec.care .sec-body td { border: 1px solid #e3d4c2; padding: 4px 6px; text-align: left; vertical-align: top; }
  .sec.care .sec-body th { background: #1C3D5A; color: #fff; font-family: Arial, sans-serif; }
  .sec-body table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 8px 0; }
  .sec-body th, .sec-body td { border: 1px solid #d8dde1; padding: 4px 6px; text-align: left; vertical-align: top; }
  .sec-body th { background: #eef1f4; color: #1C3D5A; font-family: Arial, sans-serif; }
  .sec-body { font-size: 12.5px; }
  .sec-body p { margin: 4px 0; orphans: 3; widows: 3; break-inside: avoid; page-break-inside: avoid; }
  .sec-body ul { margin: 4px 0 4px 18px; padding: 0; break-inside: avoid; page-break-inside: avoid; }
  .sec-body li { margin: 2px 0; break-inside: avoid; page-break-inside: avoid; }
  .sec-body a { color: #1C3D5A; text-decoration: underline; word-break: break-all; }
  .footer { margin-top: 24px; border-top: 1px solid #d8dde1; padding-top: 6px; font-size: 9.5px; color: #8b97a1; display: flex; justify-content: space-between; font-family: Arial, sans-serif; break-inside: avoid; page-break-inside: avoid; }
</style></head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="Dr. Felipe de Bulhões" />
    <div class="meta">Documento gerado em ${dateStr}<br/>Orientações ao Paciente</div>
  </div>
  <span class="cat">${protocol.category}</span>
  <h1>${protocol.title}</h1>
  ${patientBlock}
  <div class="intro">${protocol.intro || ""}</div>
  <div class="anchor">Mais do que um procedimento, você recebe uma <strong>linha de cuidado completa</strong> &mdash; com acompanhamento antes, durante e depois, e acesso direto ao Dr.&nbsp;Felipe e sua equipe multidisciplinar.</div>
  ${sectionsHtml}
  ${observationsBlock}
  <div class="footer">
    <span>Dr. Felipe de Bulhões — Urologia &amp; Andrologia</span>
    <span>Este material é educativo e não substitui a consulta médica.</span>
  </div>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=820,height=1000");
    if (!printWindow) {
      toast.error("Permita pop-ups para gerar o PDF.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    // Aguardar carregamento do logo antes de imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };
    // Memorizar paciente e data na sessão para reuso em outros protocolos
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pdf_patient_name", pdfPatientName);
      sessionStorage.setItem("pdf_procedure_date", pdfProcedureDate);
    }
    toast.success("Use 'Salvar como PDF' na janela de impressão.");
    setPdfDialogOpen(false);
  };

  // Função para calcular datas de retorno (D+7 e D+30) com dias da semana em português
  const calculateReturnDates = (dateStr: string) => {
    if (!dateStr) return null;
    
    try {
      // Ajustar string de data local para evitar problemas de fuso horário
      const parts = dateStr.split("-");
      if (parts.length !== 3) return null;
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const baseDate = new Date(year, month, day);
      
      const d7 = new Date(baseDate);
      d7.setDate(baseDate.getDate() + 7);
      
      const d30 = new Date(baseDate);
      d30.setDate(baseDate.getDate() + 30);
      
      const formatOption: Intl.DateTimeFormatOptions = { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric",
        weekday: "long"
      };
      
      const formatter = new Intl.DateTimeFormat("pt-BR", formatOption);
      
      return {
        d7: formatter.format(d7),
        d30: formatter.format(d30),
        d7Short: d7.toLocaleDateString("pt-BR"),
        d30Short: d30.toLocaleDateString("pt-BR")
      };
    } catch (e) {
      console.error("Erro ao calcular datas de retorno", e);
      return null;
    }
  };

  const returnDates = calculateReturnDates(procedureDate);

  // Inicializar o checklist específico deste protocolo se houver
  useEffect(() => {
    if (protocol) {
      const savedChecklist = localStorage.getItem(`protoUro_checklist_${protocol.id}`);
      if (savedChecklist) {
        setChecklistItems(prev => ({ ...prev, [protocol.id]: JSON.parse(savedChecklist) }));
      } else {
        // Itens de auditoria padrão CPP + específicos se aplicável
        const defaultItems = [
          { id: "receita", text: "Receituário impresso/assinado digitalmente (incluindo adjuvantes se selecionados)", checked: false },
          { id: "atestado", text: "Atestado de afastamento gerado e impresso com QR Code", checked: false },
          { id: "mev", text: "Orientações de Estilo de Vida (MEV) enviadas via WhatsApp", checked: false },
          { id: "retorno", text: "Consulta de retorno agendada e registrada no CRM", checked: false },
          { id: "contato", text: "Contato de emergência pós-operatório salvo no celular do paciente", checked: false },
          { id: "financeiro", text: "Faturamento real do procedimento registrado no CRM", checked: false }
        ];
        setChecklistItems(prev => ({ ...prev, [protocol.id]: defaultItems }));
      }
    }
  }, [protocolId]);

  // Salvar checklist no LocalStorage ao alterar e vincular ao CRM do paciente ativo se houver
  const handleToggleChecklistItem = (itemId: string) => {
    if (!protocol) return;
    const currentList = checklistItems[protocol.id] || [];
    const updated = currentList.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setChecklistItems(prev => ({ ...prev, [protocol.id]: updated }));
    localStorage.setItem(`protoUro_checklist_${protocol.id}`, JSON.stringify(updated));
    
    // Se houver um paciente ativo, salvar o estado do checklist de alta no prontuário dele no CRM
    if (patientName.trim()) {
      const cleanName = patientName.trim();
      const stored = localStorage.getItem("protouro_pacientes_db");
      if (stored) {
        try {
          const pacientesList = JSON.parse(stored);
          const paciente = pacientesList.find((p: any) => p.nome.toLowerCase() === cleanName.toLowerCase());
          if (paciente) {
            // Inicializar ou atualizar o histórico de auditoria de checklists
            if (!paciente.auditorias_alta) {
              paciente.auditorias_alta = {};
            }
            paciente.auditorias_alta[protocol.id] = updated;
            localStorage.setItem("protouro_pacientes_db", JSON.stringify(pacientesList));
          }
        } catch (e) {
          console.error("Erro ao vincular auditoria de alta ao paciente:", e);
        }
      }
    }
    
    const item = updated.find(i => i.id === itemId);
    if (item?.checked) {
      toast.success(`Checklist: "${item.text}" auditado com sucesso!`);
    }
  };

  // Resetar checklist e remover do CRM do paciente se houver
  const handleResetChecklist = () => {
    if (!protocol) return;
    const currentList = checklistItems[protocol.id] || [];
    const updated = currentList.map(item => ({ ...item, checked: false }));
    setChecklistItems(prev => ({ ...prev, [protocol.id]: updated }));
    localStorage.setItem(`protoUro_checklist_${protocol.id}`, JSON.stringify(updated));
    
    if (patientName.trim()) {
      const cleanName = patientName.trim();
      const stored = localStorage.getItem("protouro_pacientes_db");
      if (stored) {
        try {
          const pacientesList = JSON.parse(stored);
          const paciente = pacientesList.find((p: any) => p.nome.toLowerCase() === cleanName.toLowerCase());
          if (paciente && paciente.auditorias_alta) {
            paciente.auditorias_alta[protocol.id] = updated;
            localStorage.setItem("protouro_pacientes_db", JSON.stringify(pacientesList));
          }
        } catch (e) {
          console.error("Erro ao limpar auditoria do paciente:", e);
        }
      }
    }
    toast.info("Auditoria de alta reiniciada.");
  };

  // Gerenciar seleção de medicamentos adjuvantes
  const handleToggleAdjuvant = (sectionTitle: string, adjuvantText: string) => {
    const current = selectedAdjuvants[sectionTitle] || [];
    const updated = current.includes(adjuvantText)
      ? current.filter(t => t !== adjuvantText)
      : [...current, adjuvantText];
    
    setSelectedAdjuvants(prev => ({ ...prev, [sectionTitle]: updated }));
    toast.success(current.includes(adjuvantText) ? "Medicamento removido da receita." : "Medicamento adicionado à receita!");
  };

  // Cadastrar novo medicamento customizado
  const handleAddCustomAdjuvant = () => {
    if (!newMedName.trim() || !newMedDesc.trim()) {
      toast.error("Preencha o nome e a posologia do medicamento!");
      return;
    }
    const newMed = {
      id: "med_" + Date.now(),
      name: newMedName.trim(),
      desc: newMedDesc.trim()
    };
    const updated = [...customAdjuvants, newMed];
    setCustomAdjuvants(updated);
    localStorage.setItem("protoUro_custom_adjuvants", JSON.stringify(updated));
    
    setNewMedName("");
    setNewMedDesc("");
    setIsAddingMed(false);
    toast.success(`Medicamento "${newMed.name}" adicionado ao catálogo!`);
  };

  // Remover medicamento customizado
  const handleRemoveCustomAdjuvant = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar disparar o toggle de seleção
    const updated = customAdjuvants.filter(m => m.id !== id);
    setCustomAdjuvants(updated);
    localStorage.setItem("protoUro_custom_adjuvants", JSON.stringify(updated));
    toast.info("Medicamento removido do catálogo.");
  };

  // Carregar favoritos, histórico de pacientes e assinatura do LocalStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem("protoUro_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedHistory = localStorage.getItem("protoUro_patient_history");
    if (savedHistory) {
      setPatientHistory(JSON.parse(savedHistory));
    }
    const savedCustomMeds = localStorage.getItem("protoUro_custom_adjuvants");
    if (savedCustomMeds) {
      setCustomAdjuvants(JSON.parse(savedCustomMeds));
    }
    // Carregar o último paciente ativo se houver
    const activePatient = localStorage.getItem("protoUro_active_patient");
    if (activePatient) {
      setPatientName(activePatient);
    }
    const storedSig = localStorage.getItem("protoUro_signature_data");
    if (storedSig) {
      setSignatureUrl(storedSig);
    }
  }, []);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSignatureUrl(base64String);
        localStorage.setItem("protoUro_signature_data", base64String);
        toast.success("Assinatura digitalizada carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    setSignatureUrl("");
    localStorage.removeItem("protoUro_signature_data");
    toast.info("Assinatura digitalizada removida.");
  };

  // --- LÓGICA DO CANVAS DE ASSINATURA ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1C3D5A"; // Azul do Nilo para a assinatura
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Pegar coordenadas corretas
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ("touches" in e) {
      // Prevenir rolagem da tela no mobile ao assinar
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Verificar se o canvas está vazio
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let isEmpty = true;
    for (let i = 0; i < imageData.data.length; i++) {
      if (imageData.data[i] !== 0) {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      toast.error("Por favor, assine no campo antes de salvar.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    setSignatureUrl(dataUrl);
    localStorage.setItem("protoUro_signature_data", dataUrl);
    toast.success("Assinatura salva com sucesso!");
  };

  // Função para copiar texto para a área de transferência
  const copyToClipboard = (text: string, type: string, index: number | null = null) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(type);
      if (type === "cert") setCertCopied(index);
      if (type === "laudo") setLaudoCopied(index);
      if (type === "whatsapp") setWhatsappCopied(index);
      if (type === "mev") setMevCopied(true);
      if (type === "postop") setPostOpCopied(true);
      toast.success(`${type === "cert" ? "Atestado" : type === "laudo" ? "Laudo" : type === "whatsapp" ? "Mensagem WhatsApp" : type === "mev" ? "Orientações MEV" : "Mensagem Pós-Op"} copiado!`);
      setTimeout(() => {
        setCopiedText(null);
        setCertCopied(null);
        setLaudoCopied(null);
        setWhatsappCopied(null);
        setMevCopied(false);
        setPostOpCopied(false);
      }, 2000);
    }).catch(err => {
      console.error("Erro ao copiar: ", err);
      toast.error("Falha ao copiar. Tente novamente.");
    });
  };

  // Função para gerar o texto do receituário
  const generateReceituarioText = (protocol: any) => {
    let text = `DR. FELIPE DE BULHÕES\nUrologista | CRM-SP XXXXXX\n\n`;
    if (localAtendimento === "clinovi_paulista") {
      text += `CLINOVI PAULISTA\nRua Peixoto Gomide, 1887 - 10º andar\nJardins, São Paulo - SP\nTel: (11) 3884-7000\n\n`;
    } else if (localAtendimento === "clinovi_moema") {
      text += `CLINOVI MOEMA\nAv. Ibirapuera, 2907 - Conj. 141\nMoema, São Paulo - SP\nTel: (11) 5096-0000\n\n`;
    } else if (localAtendimento === "campinas_day") {
      text += `CAMPINAS DAY HOSPITAL\nRua Barreto Leme, 1200 - Centro\nCampinas - SP\nTel: (19) 3737-3000\n\n`;
    }

    text += `Paciente: ${patientName}\nData: ${new Date().toLocaleDateString("pt-BR")}\n\n`;
    text += `**ORIENTAÇÕES PÓS-OPERATÓRIAS - ${protocol.title.toUpperCase()}**\n\n`;

    protocol.sections.forEach((section: any) => {
      if (!section.is_secretary && !section.is_references) {
        text += `**${section.title.toUpperCase()}**\n`;
        text += `${section.content.replace(/<[^>]*>?/gm, '')}\n\n`; // Remover tags HTML
      }
    });

    // Adicionar medicamentos adjuvantes selecionados
    const allSelectedAdjuvants = Object.values(selectedAdjuvants).flat();
    if (allSelectedAdjuvants.length > 0) {
      text += `**MEDICAMENTOS ADJUVANTES**\n`;
      allSelectedAdjuvants.forEach(adjuvant => {
        text += `- ${adjuvant}\n`;
      });
      text += `\n`;
    }

    text += `Atenciosamente,\n\n`;
    if (useSignature && signatureUrl) {
      text += `[IMAGEM DA ASSINATURA DIGITAL]\n`;
    }
    text += `Dr. Felipe de Bulhões\nUrologista | CRM-SP XXXXXX\n`;

    return text;
  };

  // Função para gerar o texto do atestado
  const generateAtestadoText = (protocol: any) => {
    let text = `DR. FELIPE DE BULHÕES\nUrologista | CRM-SP XXXXXX\n\n`;
    if (localAtendimento === "clinovi_paulista") {
      text += `CLINOVI PAULISTA\nRua Peixoto Gomide, 1887 - 10º andar\nJardins, São Paulo - SP\nTel: (11) 3884-7000\n\n`;
    } else if (localAtendimento === "clinovi_moema") {
      text += `CLINOVI MOEMA\nAv. Ibirapuera, 2907 - Conj. 141\nMoema, São Paulo - SP\nTel: (11) 5096-0000\n\n`;
    } else if (localAtendimento === "campinas_day") {
      text += `CAMPINAS DAY HOSPITAL\nRua Barreto Leme, 1200 - Centro\nCampinas - SP\nTel: (19) 3737-3000\n\n`;
    }

    text += `ATESTADO MÉDICO\n\n`;
    text += `Atesto para os devidos fins que o(a) paciente **${patientName}** esteve sob meus cuidados no dia ${new Date().toLocaleDateString("pt-BR")}, necessitando de afastamento de suas atividades por ${protocol.days_off || "X"} dias, a partir desta data, devido a ${protocol.title.toLowerCase()}.\n\n`;
    text += `Atenciosamente,\n\n`;
    if (useSignature && signatureUrl) {
      text += `[IMAGEM DA ASSINATURA DIGITAL]\n`;
    }
    text += `Dr. Felipe de Bulhões\nUrologista | CRM-SP XXXXXX\n`;
    if (useQrCode) {
      text += `[QR CODE DE VALIDAÇÃO]\n`;
    }

    return text;
  };

  // Função para gerar o texto do laudo
  const generateLaudoText = (protocol: any) => {
    let text = `DR. FELIPE DE BULHÕES\nUrologista | CRM-SP XXXXXX\n\n`;
    if (localAtendimento === "clinovi_paulista") {
      text += `CLINOVI PAULISTA\nRua Peixoto Gomide, 1887 - 10º andar\nJardins, São Paulo - SP\nTel: (11) 3884-7000\n\n`;
    } else if (localAtendimento === "clinovi_moema") {
      text += `CLINOVI MOEMA\nAv. Ibirapuera, 2907 - Conj. 141\nMoema, São Paulo - SP\nTel: (11) 5096-0000\n\n`;
    } else if (localAtendimento === "campinas_day") {
      text += `CAMPINAS DAY HOSPITAL\nRua Barreto Leme, 1200 - Centro\nCampinas - SP\nTel: (19) 3737-3000\n\n`;
    }

    text += `LAUDO MÉDICO\n\n`;
    text += `Paciente: ${patientName}\nData: ${new Date().toLocaleDateString("pt-BR")}\n\n`;
    text += `**PROCEDIMENTO:** ${protocol.title.toUpperCase()}\n\n`;
    text += `**DESCRIÇÃO:**\n${protocol.description.replace(/<[^>]*>?/gm, '')}\n\n`; // Remover tags HTML
    text += `**ORIENTAÇÕES:**\n`;
    protocol.sections.forEach((section: any) => {
      if (!section.is_secretary && !section.is_references) {
        text += `**${section.title.toUpperCase()}**\n`;
        text += `${section.content.replace(/<[^>]*>?/gm, '')}\n\n`; // Remover tags HTML
      }
    });

    text += `Atenciosamente,\n\n`;
    if (useSignature && signatureUrl) {
      text += `[IMAGEM DA ASSINATURA DIGITAL]\n`;
    }
    text += `Dr. Felipe de Bulhões\nUrologista | CRM-SP XXXXXX\n`;

    return text;
  };

  // Função para gerar a mensagem MEV (Mudanças de Estilo de Vida)
  const generateMevMessage = (protocol: any) => {
    let message = "";
    const mevSection = protocol.sections.find((s: any) => s.id === "mev");

    if (!mevSection) {
      return "Não há orientações de Mudanças de Estilo de Vida (MEV) para este protocolo.";
    }

    const mevContent = mevSection.content.replace(/<[^>]*>?/gm, '').trim();

    switch (mevTone) {
      case "formal":
        message = `Prezado(a) ${patientName},\n\nEm complemento às orientações pós-operatórias, apresento recomendações importantes para a manutenção de sua saúde e bem-estar, conforme discutido em sua consulta referente ao protocolo de ${protocol.title.toLowerCase()}.\n\n${mevContent}\n\nPara quaisquer dúvidas, permaneço à disposição.\n\nAtenciosamente,\nDr. Felipe de Bulhões`;
        break;
      case "acolhedor":
        message = `Olá ${patientName},\n\nEspero que esteja se recuperando bem! Para te ajudar ainda mais na sua jornada de saúde após o procedimento de ${protocol.title.toLowerCase()}, separei algumas dicas importantes de Mudanças de Estilo de Vida.\n\n${mevContent}\n\nQualquer dúvida, pode me chamar!\n\nCom carinho,\nDr. Felipe de Bulhões`;
        break;
      case "pratico":
        message = `E aí, ${patientName}!\n\nBora focar na recuperação? Pra turbinar seu pós-operatório de ${protocol.title.toLowerCase()}, se liga nessas dicas rápidas de MEV:\n\n${mevContent}\n\nSe precisar, só chamar!\n\nAbs,\nDr. Felipe de Bulhões`;
        break;
      default:
        message = mevContent;
    }

    return message;
  };

  // Função para gerar a mensagem de pós-operatório agendado
  const generatePostOpMessage = (protocol: any) => {
    if (!returnDates) return "";

    let message = `Olá ${patientName},\n\n`;

    if (selectedPostOpDay === "D1") {
      message += `Espero que esteja se recuperando bem do procedimento de ${protocol.title.toLowerCase()} realizado ontem.\n\n`;
      message += `Lembre-se de seguir todas as orientações pós-operatórias que conversamos. Qualquer dúvida ou intercorrência, não hesite em entrar em contato com a equipe.\n\n`;
      message += `Estou à disposição!\nDr. Felipe de Bulhões`;
    } else if (selectedPostOpDay === "D7") {
      message += `Passou uma semana desde o seu procedimento de ${protocol.title.toLowerCase()}! Como você está se sentindo?\n\n`;
      message += `Seu retorno está agendado para ${returnDates.d7}. Por favor, confirme sua presença ou reagende se necessário.\n\n`;
      message += `Qualquer dúvida, estou à disposição!\nDr. Felipe de Bulhões`;
    } else if (selectedPostOpDay === "D30") {
      message += `Chegamos a um mês do seu procedimento de ${protocol.title.toLowerCase()}! Espero que a recuperação esteja progredindo conforme o esperado.\n\n`;
      message += `Seu retorno está agendado para ${returnDates.d30}. Por favor, confirme sua presença ou reagende se necessário.\n\n`;
      message += `Estou à disposição!\nDr. Felipe de Bulhões`;
    }

    return message;
  };

  if (!protocol) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-red-500">Protocolo não encontrado.</h1>
          <Link href="/protocolos">
            <Button className="mt-4">Voltar para a lista de protocolos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isFavorite = favorites.includes(protocol.id);

  const toggleFavorite = () => {
    let updatedFavorites = [];
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav !== protocol.id);
      toast.info("Protocolo removido dos favoritos.");
    } else {
      updatedFavorites = [...favorites, protocol.id];
      toast.success("Protocolo adicionado aos favoritos!");
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("protoUro_favorites", JSON.stringify(updatedFavorites));
  };

  const filteredSections = protocol.sections.filter((section: any) => !section.is_secretary && !section.is_references);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/protocolos">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={isFavorite ? "text-red-500" : "text-gray-500"}
          >
            <Heart className={isFavorite ? "fill-current" : ""} />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">{protocol.title}</h1>
              <p className="text-sm text-muted-foreground">ID: {protocol.id}</p>
              <Button onClick={() => setPdfDialogOpen(true)} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Download className="mr-2 h-4 w-4" /> Baixar PDF
              </Button>
              <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Gerar PDF do Protocolo</DialogTitle>
                    <DialogDescription>
                      Preencha os dados abaixo (opcionais) para personalizar o documento entregue ao paciente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="pdfPatientName">Nome do paciente</Label>
                      <Input
                        id="pdfPatientName"
                        placeholder="Ex.: João da Silva"
                        value={pdfPatientName}
                        onChange={(e) => setPdfPatientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pdfProcedureDate">Data do procedimento</Label>
                      <Input
                        id="pdfProcedureDate"
                        type="date"
                        value={pdfProcedureDate}
                        onChange={(e) => setPdfProcedureDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pdfObservations">Observações personalizadas</Label>
                      <Textarea
                        id="pdfObservations"
                        placeholder="Parágrafo livre que aparecerá ao final do documento (opcional)"
                        value={pdfObservations}
                        onChange={(e) => setPdfObservations(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfPatientName("");
                        setPdfProcedureDate("");
                        setPdfObservations("");
                        if (typeof window !== "undefined") {
                          sessionStorage.removeItem("pdf_patient_name");
                          sessionStorage.removeItem("pdf_procedure_date");
                        }
                        toast.success("Dados do paciente limpos.");
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Limpar paciente
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleDownloadPdf} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Download className="mr-2 h-4 w-4" /> Gerar PDF
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-4">{protocol.intro}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary">{protocol.category}</Badge>
            </div>

            {/* Seção de Acompanhamento Premium */}
            {false && (
              <Card className="mb-6 border-red-500 shadow-lg">
                <CardHeader className="bg-red-500 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Gem className="mr-2" /> Acompanhamento Premium — Jornada Completa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-red-600">Pré-operatório Extenso: Preparo Otimizado</h3>
                      <p className="text-sm text-gray-700">Para garantir a melhor recuperação e cicatrização, indicamos um protocolo de suplementação com vitaminas e minerais essenciais, baseados em evidências científicas:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                        <li><strong>Vitamina C (500mg/dia):</strong> Essencial para a síntese de colágeno e função imunológica. <a href="https://pubmed.ncbi.nlm.nih.gov/27829276/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(Fonte)</a></li>
                        <li><strong>Zinco (30mg/dia):</strong> Fundamental para a cicatrização de feridas e resposta imune. <a href="https://pubmed.ncbi.nlm.nih.gov/28230157/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(Fonte)</a></li>
                        <li><strong>Selênio (100mcg/dia):</strong> Antioxidante que protege as células e apoia a função tireoidiana. <a href="https://pubmed.ncbi.nlm.nih.gov/29071629/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(Fonte)</a></li>
                        <li><strong>Ômega-3 (1000mg/dia):</strong> Propriedades anti-inflamatórias, importantes na recuperação tecidual. <a href="https://pubmed.ncbi.nlm.nih.gov/26937719/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(Fonte)</a></li>
                        <li><strong>Vitamina D (2000UI/dia):</strong> Crucial para a saúde óssea e modulação imunológica. <a href="https://pubmed.ncbi.nlm.nih.gov/30678587/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(Fonte)</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-red-600">Durante o Procedimento: Segurança e Precisão</h3>
                      <p className="text-sm text-gray-700">Seu procedimento será realizado com as técnicas mais avançadas e minimamente invasivas disponíveis, visando sua segurança, conforto e uma recuperação mais rápida. Utilizamos equipamentos de última geração e seguimos rigorosos protocolos de esterilização e segurança.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-red-600">Pós-operatório (6 meses): Suporte Contínuo e Personalizado</h3>
                      <p className="text-sm text-gray-700">
                        <strong className="text-red-700">Você não estará sozinho(a)!</strong> Durante 6 meses após o procedimento, você terá acesso direto a mim e à minha equipe, 24 horas por dia, 7 dias por semana, através do meu contato pessoal. Estarei ao seu lado, oferecendo todo o suporte necessário para uma recuperação tranquila e eficaz.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">Nosso acompanhamento inclui:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                        <li><strong>Acesso Direto:</strong> Meu contato pessoal para dúvidas e emergências.</li>
                        <li><strong>Equipe Multidisciplinar:</strong> Suporte de fisioterapeuta, nutricionista e educador físico para otimizar sua recuperação e bem-estar geral.</li>
                        <li><strong>Retornos Programados:</strong> Consultas de acompanhamento para monitorar seu progresso e ajustar o plano de cuidados conforme necessário.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredSections.map((section: any, index: number) => (
              <Accordion type="single" collapsible key={index} className="w-full mb-4">
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold text-primary-foreground hover:no-underline">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    <Streamdown>{section.content}</Streamdown>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}

            {/* Seção de Medicamentos Adjuvantes - DESABILITADA */}
            {false && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <PlusCircle className="mr-2" /> Medicamentos Adjuvantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Selecione os medicamentos que deseja incluir no receituário:</p>
                  <p className="text-muted-foreground">Nenhum medicamento adjuvante disponível</p>
                  <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="custom-meds">
                      <AccordionTrigger className="text-md font-semibold text-primary-foreground hover:no-underline">
                        Adicionar Medicamento Customizado
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newMedName" className="text-right">Nome</Label>
                            <Input id="newMedName" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newMedDesc" className="text-right">Posologia</Label>
                            <Input id="newMedDesc" value={newMedDesc} onChange={(e) => setNewMedDesc(e.target.value)} className="col-span-3" />
                          </div>
                          <Button onClick={handleAddCustomAdjuvant} className="w-full">Adicionar ao Catálogo</Button>
                        </div>
                        {customAdjuvants.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Meus Medicamentos Customizados:</h4>
                            {customAdjuvants.map((med) => (
                              <div key={med.id} className="flex items-center justify-between space-x-2 mb-1">
                                <label className="text-sm font-medium leading-none">
                                  <strong>{med.name}</strong>: {med.desc}
                                </label>
                                <Button variant="destructive" size="sm" onClick={(e) => handleRemoveCustomAdjuvant(med.id, e)}>
                                  Remover
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Seção de Checklist de Alta */}
            {false && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <CheckSquare className="mr-2" /> Auditoria de Alta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Marque os itens auditados antes da alta do paciente:</p>
                  <p className="text-muted-foreground">Carregando auditoria...</p>
                  <Button onClick={handleResetChecklist} variant="outline" className="mt-4">Reiniciar Auditoria</Button>
                </CardContent>
              </Card>
            )}

            {/* Seção de Automação de Retornos */}
            {false && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <RefreshCw className="mr-2" /> Automação de Retornos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Calcule as datas de retorno e envie mensagens automáticas:</p>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="procedureDate" className="text-right">Data do Procedimento</Label>
                      <Input
                        id="procedureDate"
                        type="date"
                        value={procedureDate}
                        onChange={(e) => setProcedureDate(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    {returnDates && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Retornos</Label>
                        <div className="col-span-3 space-y-2">
                          <p className="text-sm"><strong>D+7:</strong> {returnDates?.d7}</p>
                          <p className="text-sm"><strong>D+30:</strong> {returnDates?.d30}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="postOpDay" className="text-right">Mensagem Pós-Op</Label>
                      <div className="col-span-3 flex space-x-2">
                        <Button
                          variant={selectedPostOpDay === "D1" ? "default" : "outline"}
                          onClick={() => setSelectedPostOpDay("D1")}
                        >D+1</Button>
                        <Button
                          variant={selectedPostOpDay === "D7" ? "default" : "outline"}
                          onClick={() => setSelectedPostOpDay("D7")}
                        >D+7</Button>
                        <Button
                          variant={selectedPostOpDay === "D30" ? "default" : "outline"}
                          onClick={() => setSelectedPostOpDay("D30")}
                        >D+30</Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(generatePostOpMessage(protocol), "postop")}
                      className="w-full"
                      disabled={!procedureDate || postOpCopied}
                    >
                      {postOpCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copiar Mensagem {selectedPostOpDay}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seção de Geração de Receituário */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <FileText className="mr-2" /> Gerar Receituário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientName" className="text-right">Nome do Paciente</Label>
                    <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="localAtendimento" className="text-right">Local de Atendimento</Label>
                    <select
                      id="localAtendimento"
                      value={localAtendimento}
                      onChange={(e) => setLocalAtendimento(e.target.value as "clinovi_paulista" | "clinovi_moema" | "campinas_day" | "sem_logo")}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="clinovi_paulista">Clinovi Paulista</option>
                      <option value="clinovi_moema">Clinovi Moema</option>
                      <option value="campinas_day">Campinas Day Hospital</option>
                      <option value="sem_logo">Sem Logo/Endereço</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useSignature"
                      checked={useSignature}
                      onChange={(e) => setUseSignature(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="useSignature" className="text-sm font-medium leading-none">Incluir Assinatura Digital</label>
                  </div>
                  {useSignature && (
                    <div className="flex flex-col items-center space-y-2">
                      {signatureUrl ? (
                        <div className="border p-2 rounded-md">
                          <img src={signatureUrl} alt="Assinatura" className="max-h-24 w-auto" />
                          <Button variant="destructive" size="sm" onClick={handleClearSignature} className="mt-2">Remover Assinatura</Button>
                        </div>
                      ) : (
                        <>
                          <Label htmlFor="signatureUpload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            Carregar Assinatura (Imagem)
                          </Label>
                          <Input id="signatureUpload" type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                          <p className="text-sm text-muted-foreground">ou</p>
                          <div className="border border-dashed border-gray-300 rounded-md w-full max-w-xs h-32 flex items-center justify-center relative">
                            <canvas
                              ref={canvasRef}
                              width={300}
                              height={120}
                              className="absolute top-0 left-0 w-full h-full"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                            ></canvas>
                            {!isDrawing && !signatureUrl && <span className="text-muted-foreground">Desenhe sua assinatura aqui</span>}
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={saveCanvasSignature}>Salvar Assinatura</Button>
                            <Button onClick={clearCanvas} variant="outline">Limpar</Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={() => copyToClipboard(generateReceituarioText(protocol), "receita")}
                    className="w-full"
                    disabled={!patientName.trim()}
                  >
                    {copiedText === "receita" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copiar Receituário
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Geração de Atestado */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <FileText className="mr-2" /> Gerar Atestado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientNameAtestado" className="text-right">Nome do Paciente</Label>
                    <Input id="patientNameAtestado" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="localAtendimentoAtestado" className="text-right">Local de Atendimento</Label>
                    <select
                      id="localAtendimentoAtestado"
                      value={localAtendimento}
                      onChange={(e) => setLocalAtendimento(e.target.value as "clinovi_paulista" | "clinovi_moema" | "campinas_day" | "sem_logo")}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="clinovi_paulista">Clinovi Paulista</option>
                      <option value="clinovi_moema">Clinovi Moema</option>
                      <option value="campinas_day">Campinas Day Hospital</option>
                      <option value="sem_logo">Sem Logo/Endereço</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useSignatureAtestado"
                      checked={useSignature}
                      onChange={(e) => setUseSignature(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="useSignatureAtestado" className="text-sm font-medium leading-none">Incluir Assinatura Digital</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useQrCodeAtestado"
                      checked={useQrCode}
                      onChange={(e) => setUseQrCode(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="useQrCodeAtestado" className="text-sm font-medium leading-none">Incluir QR Code de Validação</label>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generateAtestadoText(protocol), "cert")}
                    className="w-full"
                    disabled={!patientName.trim()}
                  >
                    {certCopied !== null ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copiar Atestado
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Geração de Laudo */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <FileText className="mr-2" /> Gerar Laudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientNameLaudo" className="text-right">Nome do Paciente</Label>
                    <Input id="patientNameLaudo" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="localAtendimentoLaudo" className="text-right">Local de Atendimento</Label>
                    <select
                      id="localAtendimentoLaudo"
                      value={localAtendimento}
                      onChange={(e) => setLocalAtendimento(e.target.value as "clinovi_paulista" | "clinovi_moema" | "campinas_day" | "sem_logo")}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="clinovi_paulista">Clinovi Paulista</option>
                      <option value="clinovi_moema">Clinovi Moema</option>
                      <option value="campinas_day">Campinas Day Hospital</option>
                      <option value="sem_logo">Sem Logo/Endereço</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useSignatureLaudo"
                      checked={useSignature}
                      onChange={(e) => setUseSignature(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="useSignatureLaudo" className="text-sm font-medium leading-none">Incluir Assinatura Digital</label>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generateLaudoText(protocol), "laudo")}
                    className="w-full"
                    disabled={!patientName.trim()}
                  >
                    {laudoCopied !== null ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copiar Laudo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Orientações MEV */}
            {false && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <TrendingUp className="mr-2" /> Orientações de Estilo de Vida (MEV)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Envie orientações personalizadas ao paciente:</p>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="mevTone" className="text-right">Tom da Mensagem</Label>
                      <select
                        id="mevTone"
                        value={mevTone}
                        onChange={(e) => setMevTone(e.target.value as "formal" | "acolhedor" | "pratico")}
                        className="col-span-3 p-2 border rounded-md"
                      >
                        <option value="acolhedor">Acolhedor</option>
                        <option value="formal">Formal</option>
                        <option value="pratico">Prático</option>
                      </select>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(generateMevMessage(protocol), "mev")}
                      className="w-full"
                      disabled={mevCopied}
                    >
                      {mevCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copiar Orientações MEV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}





            {/* Seção de Referências Científicas */}
            {protocol.sections.some((s: any) => s.is_references) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Layers className="mr-2" /> Referências Científicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {protocol.sections.map((section: any, index: number) => (
                    section.is_references && (
                      <div key={index} className="mb-4">
                        <Streamdown>{section.content}</Streamdown>
                      </div>
                    )
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Seção de Informações para a Secretária */}
            {protocol.sections.some((s: any) => s.is_secretary) && (
              <Card className="mb-6 bg-yellow-50 border-yellow-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center text-yellow-800">
                    <User className="mr-2" /> Informações para a Secretária
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-yellow-700">
                  {protocol.sections.map((section: any, index: number) => (
                    section.is_secretary && (
                      <div key={index} className="mb-4">
                        <Streamdown>{section.content}</Streamdown>
                      </div>
                    )
                  ))}
                </CardContent>
              </Card>
            )}

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
