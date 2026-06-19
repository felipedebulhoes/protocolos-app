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
  PhoneCall,
  Image as ImageIcon,
  MessageSquare,
  PlayCircle,
  Video,
  Printer,
  Trash2,
  MapPin,
  GitBranch
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import Layout from "@/components/Layout";
import protocolsData from "@/data/protocols.json";

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

  // Buscar dados do protocolo atual
  const protocol = protocolsData.find(p => p.id === protocolId);

  // Função para calcular datas de retorno (D+7 e D+30) com dias da semana em português
  const calculateReturnDates = (dateStr: string) => {
    if (!dateStr) return null;
    
    try {
      // Ajustar string de data local para evitar problemas de fuso horário
      const parts = dateStr.split('-');
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
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        weekday: 'long'
      };
      
      const formatter = new Intl.DateTimeFormat('pt-BR', formatOption);
      
      return {
        d7: formatter.format(d7),
        d30: formatter.format(d30),
        d7Short: d7.toLocaleDateString('pt-BR'),
        d30Short: d30.toLocaleDateString('pt-BR')
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
    
    // Verificar se o canvas está vazio (opcional, mas bom para evitar salvar em branco)
    const base64String = canvas.toDataURL("image/png");
    setSignatureUrl(base64String);
    localStorage.setItem("protoUro_signature_data", base64String);
    toast.success("Assinatura desenhada salva com sucesso!");
  };

  const handlePatientNameChange = (name: string) => {
    setPatientName(name);
    localStorage.setItem("protoUro_active_patient", name);
  };

  const savePatientToHistory = () => {
    if (!patientName.trim()) return;
    const cleanName = patientName.trim();
    
    // Adicionar à lista sem duplicar, mantendo os mais recentes no topo (máximo 5)
    const updated = [cleanName, ...patientHistory.filter(p => p !== cleanName)].slice(0, 5);
    setPatientHistory(updated);
    localStorage.setItem("protoUro_patient_history", JSON.stringify(updated));
    toast.success(`Paciente "${cleanName}" salvo no histórico!`);
  };

  const selectPatientFromHistory = (name: string) => {
    setPatientName(name);
    localStorage.setItem("protoUro_active_patient", name);
    toast.info(`Paciente selecionado: ${name}`);
  };

  const clearPatientHistory = () => {
    setPatientHistory([]);
    localStorage.removeItem("protoUro_patient_history");
    toast.info("Histórico de pacientes limpo.");
  };

  if (!protocol) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-primary mb-2">Protocolo não encontrado</h2>
          <p className="text-muted-foreground mb-6">O protocolo solicitado não existe ou foi removido.</p>
          <Link href="/">
            <Button className="rounded-xl">Voltar para o início</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const IconComponent = iconMap[protocol.icon] || FileText;
  const isFav = favorites.includes(protocol.id);

  const toggleFavorite = () => {
    const updated = isFav
      ? favorites.filter(favId => favId !== protocol.id)
      : [...favorites, protocol.id];
    setFavorites(updated);
    localStorage.setItem("protoUro_favorites", JSON.stringify(updated));
    toast.success(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const copyToClipboard = (text: string, sectionTitle: string, isPrescription: boolean = false) => {
    // Limpar marcações markdown de blocos de código se houver
    let cleanText = text.replace(/```[\s\S]*?\n/g, "").replace(/```/g, "");
    
    // Injetar medicamentos adjuvantes se for prescrição e houver algum selecionado para esta seção
    if (isPrescription) {
      const adjuvantsForSection = selectedAdjuvants[sectionTitle] || [];
      if (adjuvantsForSection.length > 0) {
        cleanText += "\n\n---\nMEDICAMENTOS ADJUVANTES SELECIONADOS:\n" + adjuvantsForSection.map((adj, idx) => `${idx + 1}. ${adj}`).join("\n");
      }
    }

    // Se for uma prescrição e tiver um nome de paciente definido, injetar o cabeçalho personalizado
    if (isPrescription) {
      const nameHeader = `--------------------------------------------------\nDR. FELIPE DE BULHÕES - UROLOGISTA & CIRURGIÃO GERAL\nRECEITUÁRIO MÉDICO\n\nPaciente: ${patientName || "______________________________________"}\nData: ${new Date().toLocaleDateString("pt-BR")}\n--------------------------------------------------\n\n`;
      cleanText = nameHeader + cleanText;
    }

    navigator.clipboard.writeText(cleanText);
    setCopiedText(sectionTitle);
    toast.success(`${sectionTitle} copiado para a área de transferência!`);
    
    if (isPrescription && patientName.trim()) {
      vincularDocumentoAoPaciente(protocol.title + " - " + sectionTitle, "receita", cleanText);
    }

    setTimeout(() => setCopiedText(null), 2000);
  };

  // Função para vincular um documento gerado ao paciente ativo no LocalStorage
  const vincularDocumentoAoPaciente = (titulo: string, tipo: "receita" | "atestado" | "laudo", conteudo: string) => {
    if (!patientName.trim()) return;
    const cleanName = patientName.trim();
    
    const stored = localStorage.getItem("protouro_pacientes_db");
    if (stored) {
      try {
        const pacientesList = JSON.parse(stored);
        // Buscar paciente pelo nome (case insensitive) ou criar se não existir
        let paciente = pacientesList.find((p: any) => p.nome.toLowerCase() === cleanName.toLowerCase());
        
        if (!paciente) {
          // Se não achar o paciente, cria um novo na hora para vincular o documento
          paciente = {
            id: "paciente_" + Date.now(),
            nome: cleanName,
            idade: "",
            queixa: protocol.title,
            testosterona: "",
            psa: "",
            hematocrito: "",
            notas: "Cadastrado automaticamente via geração de documento.",
            dataCadastro: new Date().toLocaleDateString("pt-BR"),
            documentos: []
          };
          pacientesList.unshift(paciente);
        }

        const novosDocs = paciente.documentos || [];
        novosDocs.unshift({
          id: "doc_" + Date.now(),
          titulo: titulo,
          tipo: tipo,
          data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR").substring(0, 5),
          conteudo: conteudo
        });

        paciente.documentos = novosDocs;
        localStorage.setItem("protouro_pacientes_db", JSON.stringify(pacientesList));
        toast.success(`Documento salvo no histórico do paciente "${cleanName}"!`);
      } catch (e) {
        console.error("Erro ao vincular documento ao paciente:", e);
      }
    }
  };

  const handleCopyCertificado = (modelo: string, index: number, isLaudo: boolean = false) => {
    const pName = patientName.trim() || "___________________________________";
    const dToday = new Date().toLocaleDateString("pt-BR");
    
    let textToCopy = modelo
      .replace(/{paciente}/g, pName)
      .replace(/{data}/g, dToday)
      .replace(/{titulo}/g, protocol.title)
      .replace(/{cid}/g, "N/A");

    textToCopy = `--------------------------------------------------\nDR. FELIPE DE BULHÕES - UROLOGISTA & CIRURGIÃO GERAL\nDOCUMENTO MÉDICO OFICIAL\n--------------------------------------------------\n\n${textToCopy}\n\n___________________________________\nDr. Felipe de Bulhões Ojeda\nUrologista - CRM-SP`;
    
    navigator.clipboard.writeText(textToCopy);
    if (isLaudo) {
      setLaudoCopied(index);
      toast.success("Laudo médico copiado com sucesso!");
      vincularDocumentoAoPaciente(protocol.title + " - Laudo Médico", "laudo", textToCopy);
      setTimeout(() => setLaudoCopied(null), 2000);
    } else {
      setCertCopied(index);
      toast.success("Atestado de afastamento copiado com sucesso!");
      vincularDocumentoAoPaciente(protocol.title + " - Atestado Médico", "atestado", textToCopy);
      setTimeout(() => setCertCopied(null), 2000);
    }
  };

  const handlePrintDocument = (title: string, content: string, isPrescription: boolean = false, isControlEspecial: boolean = false) => {
    const pName = patientName.trim() || "___________________________________";
    const dToday = new Date().toLocaleDateString("pt-BR");
    
    // Preparar o conteúdo formatado
    let formattedContent = content;
    if (!isPrescription) {
      formattedContent = content
        .replace(/{paciente}/g, pName)
        .replace(/{data}/g, dToday)
        .replace(/{titulo}/g, protocol.title)
        .replace(/{cid}/g, "N/A");
    } else {
      // Limpar os marcadores markdown de blocos de código
      formattedContent = content.replace(/```[\s\S]*?\n/g, "").replace(/```/g, "");
      
      // Injetar medicamentos adjuvantes se selecionados para qualquer seção de receita
      // Como handlePrintDocument recebe o título e o conteúdo bruto, podemos varrer as seções de receita para ver qual coincide
      const matchingSection = protocol.sections.find((s: any) => s.is_prescription && s.content === content);
      if (matchingSection) {
        const adjuvantsForSection = selectedAdjuvants[matchingSection.title] || [];
        if (adjuvantsForSection.length > 0) {
          formattedContent += "\n\n--------------------------------------------------\nMEDICAMENTOS ADJUVANTES SELECIONADOS:\n" + adjuvantsForSection.map((adj, idx) => `${idx + 1}. ${adj}`).join("\n");
        }
      }
    }

    // Gerar um QR Code dinâmico para validação do documento usando a API pública do QR Server
    const verificationUrl = `https://www.felipebulhoes.com/validar?doc=${encodeURIComponent(title)}&paciente=${encodeURIComponent(pName)}&data=${dToday}&id=${Date.now()}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}`;

    // Salvar o documento impresso no histórico do paciente ativo
    if (patientName.trim()) {
      const docType = isPrescription ? "receita" : (title.toLowerCase().includes("atestado") ? "atestado" : "laudo");
      let fullContentText = formattedContent;
      if (isPrescription) {
        fullContentText = `--------------------------------------------------\nDR. FELIPE DE BULHÕES - UROLOGISTA & CIRURGIÃO GERAL\nRECEITUÁRIO MÉDICO${isControlEspecial ? " (CONTROLE ESPECIAL)" : ""}\n\nPaciente: ${pName}\nData: ${dToday}\n--------------------------------------------------\n\n` + formattedContent;
      } else {
        fullContentText = `--------------------------------------------------\nDR. FELIPE DE BULHÕES - UROLOGISTA & CIRURGIÃO GERAL\nDOCUMENTO MÉDICO OFICIAL\n--------------------------------------------------\n\n${formattedContent}\n\n___________________________________\nDr. Felipe de Bulhões Ojeda\nUrologista - CRM-SP`;
      }
      vincularDocumentoAoPaciente(protocol.title + " - " + title, docType, fullContentText);
    }

    // Criar um iframe oculto de impressão para evitar bloqueios de popups
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!doc) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Dr. Felipe de Bulhões</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap');
            
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              font-family: 'Roboto', sans-serif;
              color: #1C3D5A;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }

            .container {
              display: flex;
              flex-direction: column;
              height: 100%;
              min-height: 260mm;
              justify-content: space-between;
            }

            /* Estilos específicos para Controle Especial (Portaria 344/98) */
            .controle-especial-box {
              border: 2px solid #1C3D5A;
              border-radius: 12px;
              padding: 15px;
              margin-bottom: 20px;
              background-color: #f8fafc;
            }

            .controle-especial-header {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              border-bottom: 2px solid #1C3D5A;
              padding-bottom: 8px;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #1C3D5A;
            }

            .controle-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              font-size: 11px;
              margin-top: 10px;
              border-top: 1px dashed #1C3D5A;
              padding-top: 10px;
            }

            .controle-field {
              border-bottom: 1px solid #94a3b8;
              height: 20px;
              margin-top: 5px;
            }

            .via-divider {
              border-top: 2px dashed #B87333;
              margin: 30px 0;
              position: relative;
              text-align: center;
            }

            .via-badge {
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background-color: #ffffff;
              padding: 0 15px;
              font-size: 10px;
              font-weight: bold;
              color: #B87333;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            /* Cabeçalho Timbrado */
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

            .logo-monograma {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: bold;
              color: #1C3D5A;
              border: 2px solid #B87333;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
            }

            .logo-text {
              display: flex;
              flex-direction: column;
            }

            .logo-name {
              font-family: 'Playfair Display', serif;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 0.5px;
              color: #1C3D5A;
            }

            .logo-sub {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #B87333;
              font-weight: bold;
            }

            .header-info {
              text-align: right;
              font-size: 10px;
              color: #64748b;
              line-height: 1.4;
            }

            /* Título do Documento */
            .doc-title {
              font-family: 'Playfair Display', serif;
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              color: #1C3D5A;
              margin-bottom: 35px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            /* Dados do Paciente */
            .patient-box {
              background-color: #f8fafc;
              border-left: 3px solid #B87333;
              padding: 12px 18px;
              margin-bottom: 30px;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
            }

            .patient-label {
              font-weight: bold;
              color: #1C3D5A;
            }

            /* Conteúdo Principal */
            .doc-content {
              font-size: 14px;
              color: #334155;
              text-align: justify;
              white-space: pre-wrap;
              flex-grow: 1;
              margin-bottom: 50px;
            }

            /* Assinatura */
            .signature-area {
              text-align: center;
              margin-bottom: 25px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }

            .signature-img-container {
              height: 60px;
              display: flex;
              align-items: flex-end;
              justify-content: center;
              margin-bottom: 5px;
            }

            .signature-img {
              max-height: 55px;
              max-width: 200px;
              object-fit: contain;
            }

            .signature-line {
              width: 220px;
              border-top: 1px solid #94a3b8;
              margin: 0 auto 8px auto;
            }

            .signature-name {
              font-weight: bold;
              font-size: 13px;
              color: #1C3D5A;
            }

            .signature-crm {
              font-size: 11px;
              color: #64748b;
            }

            /* Rodapé */
            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div>
              <div class="header">
                ${localAtendimento === "sem_logo" ? `
                  <div style="height: 40px;"></div>
                ` : `
                  <div class="logo-area">
                    <div class="logo-monograma" style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: bold; color: #1C3D5A; border: 2px solid #B87333; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">FB</div>
                    <div class="logo-text">
                      <span class="logo-name" style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: bold; color: #1C3D5A; letter-spacing: 0.5px;">Dr. Felipe de Bulhões</span>
                      <span class="logo-sub" style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #B87333; font-weight: bold;">Urologista & Andrologista</span>
                    </div>
                  </div>
                `}
                <div class="header-info" style="text-align: right; font-size: 10px; color: #64748b; line-height: 1.4;">
                  ${localAtendimento === "clinovi_paulista" ? `
                    <strong>CLINOVI PAULISTA</strong><br>
                    Av. Paulista, 2064 - Bela Vista, São Paulo/SP<br>
                    Particular (Acompanhamento Premium)<br>
                    Contato: (11) 98112-4455
                  ` : localAtendimento === "clinovi_moema" ? `
                    <strong>CLINOVI MOEMA</strong><br>
                    Av. Moema, 170 - Moema, São Paulo/SP<br>
                    Particular (Acompanhamento Premium)<br>
                    Contato: (11) 98112-4455
                  ` : localAtendimento === "campinas_day" ? `
                    <strong>CAMPINAS DAY HOSPITAL</strong><br>
                    Av. Barão de Itapura, 950 - Campinas/SP<br>
                    Particular & Convênios Credenciados<br>
                    Contato: (11) 98112-4455
                  ` : `
                    Dr. Felipe de Bulhões Ojeda<br>
                    CRM-SP: 202.291 | RQE: 146.538<br>
                    Urologista & Cirurgião Geral TCBC<br>
                    Contato: (11) 98112-4455
                  `}
                </div>
              </div>

              ${isControlEspecial ? `
                <!-- PRIMEIRA VIA - FARMÁCIA -->
                <div class="controle-especial-box">
                  <div class="controle-especial-header">RECEITUÁRIO DE CONTROLE ESPECIAL (PORTARIA 344/98) - 1ª VIA (RETENÇÃO DA FARMÁCIA)</div>
                  
                  <div class="patient-box" style="margin-bottom: 15px;">
                    <div><span class="patient-label">Paciente:</span> ${pName}</div>
                    <div><span class="patient-label">Data:</span> ${dToday}</div>
                  </div>

                  <div class="doc-content" style="margin-bottom: 20px; min-height: auto;">${formattedContent}</div>

                  <div class="controle-grid">
                    <div>
                      <strong>IDENTIFICAÇÃO DO COMPRADOR</strong>
                      <div style="margin-top: 8px;">Nome: <div class="controle-field"></div></div>
                      <div style="margin-top: 8px;">RG / Órgão Emissor: <div class="controle-field"></div></div>
                      <div style="margin-top: 8px;">Telefone: <div class="controle-field"></div></div>
                    </div>
                    <div>
                      <strong>IDENTIFICAÇÃO DO FORNECEDOR</strong>
                      <div style="margin-top: 8px;">Assinatura do Farmacêutico: <div class="controle-field" style="margin-top: 15px;"></div></div>
                      <div style="margin-top: 8px;">Data de Dispensação: <div class="controle-field"></div></div>
                    </div>
                  </div>
                </div>

                <!-- DIVISOR DE VIA -->
                <div class="via-divider">
                  <span class="via-badge">Destaque aqui</span>
                </div>

                <!-- SEGUNDA VIA - PACIENTE -->
                <div class="controle-especial-box" style="background-color: #ffffff; border-color: #B87333;">
                  <div class="controle-especial-header" style="border-bottom-color: #B87333; color: #B87333;">RECEITUÁRIO DE CONTROLE ESPECIAL - 2ª VIA (ORIENTAÇÃO DO PACIENTE)</div>
                  
                  <div class="patient-box" style="margin-bottom: 15px;">
                    <div><span class="patient-label">Paciente:</span> ${pName}</div>
                    <div><span class="patient-label">Data:</span> ${dToday}</div>
                  </div>

                  <div class="doc-content" style="margin-bottom: 15px; min-height: auto;">${formattedContent}</div>
                </div>
              ` : `
                <div class="doc-title">${title}</div>

                <div class="patient-box">
                  <div><span class="patient-label">Paciente:</span> ${pName}</div>
                  <div><span class="patient-label">Data:</span> ${dToday}</div>
                </div>

                <div class="doc-content">${formattedContent}</div>
              `}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              ${useQrCode ? `
              <div style="display: flex; align-items: center; gap: 10px; font-size: 8px; color: #64748b; max-width: 280px;">
                <img src="${qrCodeApiUrl}" style="width: 60px; height: 60px; border: 1px solid #e2e8f0; padding: 2px;" alt="QR Code Validação" />
                <div>
                  <strong style="color: #1C3D5A; display: block; margin-bottom: 2px; font-size: 9px;">ASSINADO DIGITALMENTE (ICP-BRASIL)</strong>
                  Documento assinado eletronicamente com e-CPF (A1/A3) nos termos da MP 2.200-2/2001. 
                  <span style="display: block; margin-top: 3px; font-family: monospace; font-size: 7px; color: #94a3b8; word-break: break-all;">
                    HASH SHA-256: ${Array.from({length: 64}, (_, i) => "abcdef0123456789"[Math.floor(Math.random() * 16)]).join("")}
                  </span>
                  <span style="display: block; margin-top: 2px; color: #B87333; font-weight: bold;">Validação: verificador.iti.gov.br</span>
                </div>
              </div>
              ` : '<div></div>'}

              <div class="signature-area" style="margin-bottom: 0;">
                <div class="signature-img-container">
                  ${useSignature && signatureUrl ? `<img src="${signatureUrl}" class="signature-img" />` : `<div style="height: 35px;"></div>`}
                </div>
                <div class="signature-line"></div>
                <div class="signature-name">Dr. Felipe de Bulhões Ojeda</div>
                <div class="signature-crm">Médico Urologista | CRM-SP 241.135 | RQE 112.445</div>
              </div>
            </div>

            <div class="footer" style="margin-top: 15px;">
              Atendimento Humanizado | Particular e Convênios | Cirurgia Minimamente Invasiva<br>
              Campinas: Av. José de Souza Campos, 123 | São Paulo: Av. Paulista, 1000<br>
              Telefone: (11) 98112-4455 | drfelipebulhoes@bulhoesurohealth.com
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 100);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();
    toast.success(`Preparando impressão de: ${title}`);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navegação e Ações Superiores */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {protocol.id === "espermograma_fertilidade" && (
              <Link href="/fluxograma-espermograma">
                <Button variant="outline" className="gap-2 rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30">
                  <GitBranch className="w-4 h-4" />
                  Ver Fluxograma
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
              className={`h-10 w-10 rounded-xl border-border hover:bg-secondary ${isFav ? "text-accent border-accent/30 bg-accent/5" : ""}`}
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-accent text-accent" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Cabeçalho do Protocolo com Pattern Oficial */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md">
          {/* Pattern oficial de marca com 4% de opacidade */}
          <div className="absolute inset-0 brand-pattern opacity-[0.04] pointer-events-none" />
          <div className="absolute top-0 left-0 w-[6px] h-full bg-accent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
              <IconComponent className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1 flex-1">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                {protocol.category}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary leading-tight">
                {protocol.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Campo Global de Nome do Paciente para Prescrições e WhatsApp */}
        <Card className="border-accent/20 bg-accent/[0.02] shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="space-y-1 text-left flex-1">
                <h4 className="text-sm font-serif font-bold text-primary flex items-center gap-1.5">
                  <User className="w-4 h-4 text-accent" />
                  Identificação do Paciente
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Insira o nome do paciente para personalizar automaticamente todas as <strong>Prescrições Modelo</strong>, <strong>Atestados</strong>, <strong>Laudos</strong> e <strong>Scripts de WhatsApp</strong> deste protocolo.
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 flex-1 justify-end">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Nome completo do paciente..."
                    value={patientName}
                    onChange={(e) => handlePatientNameChange(e.target.value)}
                    className="py-5 bg-card border-border rounded-xl text-sm w-full"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Input
                    type="date"
                    value={procedureDate}
                    onChange={(e) => setProcedureDate(e.target.value)}
                    className="py-5 bg-card border-border rounded-xl text-xs w-full cursor-pointer text-muted-foreground"
                    title="Data do Procedimento Cirúrgico"
                  />
                </div>
                <Button 
                  onClick={savePatientToHistory}
                  disabled={!patientName.trim()}
                  className="px-4 py-5 rounded-xl text-xs font-bold copper-gradient text-white shadow-sm w-full sm:w-auto shrink-0"
                >
                  Salvar
                </Button>
              </div>
            </div>

            {/* Painel de Sugestão de Retorno Clínico Automático */}
            {returnDates && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-accent/20 bg-accent/[0.01] text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Sugestão de Retorno Clínico D+7 (Retirada de Pontos / Evolução)</span>
                  <p className="text-xs font-medium text-primary capitalize">{returnDates.d7}</p>
                </div>
                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/40 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Sugestão de Retorno Clínico D+30 (Retorno de Performance / NPS)</span>
                  <p className="text-xs font-medium text-primary capitalize">{returnDates.d30}</p>
                </div>
              </div>
            )}

            {/* Controles rápidos de PWA e Impressão */}
            <div className="flex flex-wrap gap-4 border-t border-border/40 pt-4 shrink-0">
              <div className="flex items-center space-x-2 bg-secondary/30 p-2 rounded-xl border border-border/50">
                <input
                  type="checkbox"
                  id="use-signature"
                  checked={useSignature}
                  onChange={(e) => setUseSignature(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <Label htmlFor="use-signature" className="text-xs font-semibold cursor-pointer">
                  Injetar Assinatura Digitalizada
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/30 p-2 rounded-xl border border-border/50">
                <input
                  type="checkbox"
                  id="use-qrcode"
                  checked={useQrCode}
                  onChange={(e) => setUseQrCode(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <Label htmlFor="use-qrcode" className="text-xs font-semibold cursor-pointer">
                  Gerar QR Code de Segurança
                </Label>
              </div>
            </div>

            {/* Configuração de Upload e Desenho de Assinatura */}
            <div className="flex flex-col gap-4 p-4 rounded-xl border border-border/50 bg-secondary/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Sua Assinatura Digitalizada</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Desenhe sua assinatura na tela ou faça o upload de uma imagem PNG com fundo transparente.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {signatureUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-28 bg-white border border-border rounded-lg p-1 flex items-center justify-center">
                        <img src={signatureUrl} className="max-h-10 max-w-full object-contain" alt="Assinatura" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearSignature} className="text-destructive hover:text-destructive/80 text-xs font-bold h-9 px-3 rounded-lg">
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id="signature-file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="signature-file"
                        className="h-10 px-4 rounded-xl border border-border bg-card hover:bg-secondary flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Fazer Upload (.png)
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {!signatureUrl && (
                <div className="border-t border-border/40 pt-3 space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Desenhar Assinatura na Tela:</span>
                  <div className="flex flex-col items-center gap-3">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="bg-white border border-border rounded-xl cursor-crosshair max-w-full touch-none shadow-inner"
                    />
                    <div className="flex gap-2 w-full max-w-[320px]">
                      <Button variant="outline" size="sm" onClick={clearCanvas} className="flex-1 rounded-xl text-xs h-9 font-semibold border-border">
                        Limpar Tela
                      </Button>
                      <Button size="sm" onClick={saveCanvasSignature} className="flex-1 rounded-xl text-xs h-9 font-bold copper-gradient text-white">
                        Salvar Desenho
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de Pacientes Recentes */}
            {patientHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Atendidos Hoje:</span>
                {patientHistory.map((name, i) => (
                  <Badge 
                    key={i} 
                    variant={patientName === name ? "default" : "outline"}
                    className={`
                      cursor-pointer py-1 px-2.5 rounded-lg text-xs font-medium transition-all duration-150
                      ${patientName === name 
                        ? "bg-[#B87333] text-white hover:bg-[#B87333]/90" 
                        : "border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}
                    `}
                    onClick={() => selectPatientFromHistory(name)}
                  >
                    {name}
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearPatientHistory}
                  className="h-6 px-2 text-[9px] font-bold text-muted-foreground hover:text-destructive ml-auto rounded-md"
                >
                  Limpar Histórico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

			        {/* Seção de Vídeos Clínicos e Animações 3D Oficiais */}
			        {(protocol.id === "13_hpb_manejo_completo" || protocol.id === "20_reabilitacao_peniana_pos_prostatectomia" || protocol.id === "1_implante_protese_peniana") && (
		          <div className="space-y-4">
		            <div className="flex items-center gap-2 border-b border-border pb-2">
		              <Video className="w-5 h-5 text-accent" />
		              <h3 className="text-lg font-serif font-bold text-primary">Animações Clínicas e Explicações 3D Oficiais</h3>
		            </div>
		            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
		              {/* Reprodutor de Vídeo Interativo */}
		              <Card className="overflow-hidden border border-border bg-card shadow-sm">
		                <div className="aspect-video relative bg-black flex items-center justify-center">
		                  <video 
		                    src="/videos/prostate-to-b.mp4" 
		                    controls 
		                    poster="/images/surgical/protese_anatomia_posicionamento.png"
		                    className="w-full h-full object-contain"
		                  />
		                </div>
		                <CardContent className="p-4 bg-secondary/10 border-t border-border/40">
		                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
		                    <span className="font-bold text-accent">Vídeo Explicativo Interativo:</span> Demonstração anatômica tridimensional de posicionamento e dinâmica do fluxo urológico e andrológico.
		                  </p>
		                </CardContent>
		              </Card>

		              {/* GIF Animado de Loop Rápido */}
		              <Card className="overflow-hidden border border-border bg-card shadow-sm">
		                <div className="aspect-video relative bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
		                  <img 
		                    src="/images/surgical/prostate-to-b.gif" 
		                    alt="Animação em Loop" 
		                    className="w-full h-full object-contain"
		                  />
		                </div>
		                <CardContent className="p-4 bg-secondary/10 border-t border-border/40">
		                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
		                    <span className="font-bold text-accent">Animação em Loop Contínuo:</span> Visualização dinâmica e rápida sem necessidade de play, ideal para demonstrar ao paciente na tela do celular ou tablet.
		                  </p>
		                </CardContent>
		              </Card>
		            </div>
		          </div>
		        )}

	        {/* Seção de Imagens de Atlas Cirúrgico (se disponível para o protocolo) */}
	        {protocol.images && protocol.images.length > 0 && (
	          <div className="space-y-4">
	            <div className="flex items-center gap-2 border-b border-border pb-2">
	              <ImageIcon className="w-5 h-5 text-accent" />
	              <h3 className="text-lg font-serif font-bold text-primary">Passo a Passo Cirúrgico Ilustrado (Atlas & Artigos)</h3>
	            </div>
	            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
	              {protocol.images.map((img: any, i: number) => (
	                <Card key={i} className="overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
	                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2">
	                    <img 
	                      src={img.path} 
	                      alt={img.caption} 
	                      className="max-h-full max-w-full object-contain rounded-lg"
	                    />
	                  </div>
	                  <CardContent className="p-4 bg-secondary/10 border-t border-border/40">
	                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
	                      <span className="font-bold text-accent">Figura {i + 1}:</span> {img.caption}
	                    </p>
	                  </CardContent>
	                </Card>
	              ))}
	            </div>
	          </div>
	        )}

	        {/* Seção de Modelos Rápidos de WhatsApp para a Secretaria */}
	        {protocol.whatsapp_scripts && protocol.whatsapp_scripts.length > 0 && (
	          <div className="space-y-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl p-5 shadow-sm">
	            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
	              <div className="flex items-center gap-2">
	                <MessageSquare className="w-5 h-5 text-emerald-500" />
	                <div>
	                  <h3 className="text-base font-serif font-bold text-primary">Modelos Rápidos de WhatsApp (Secretaria)</h3>
	                  <p className="text-[10px] text-muted-foreground font-medium">Mensagens prontas para agilizar o contato e conversão de cirurgias.</p>
	                </div>
	              </div>
	            </div>

	            <div className="space-y-4 pt-1">
	              {protocol.whatsapp_scripts.map((script: any, i: number) => {
	                // Substituição dinâmica do nome do paciente
	                const formattedMessage = script.message.replace(/\[Nome\]/g, patientName || "Paciente");
	                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;

	                const copyWhatsappMessage = () => {
	                  navigator.clipboard.writeText(formattedMessage);
	                  setWhatsappCopied(i);
	                  toast.success("Mensagem do WhatsApp copiada!");
	                  setTimeout(() => setWhatsappCopied(null), 2000);
	                };

	                return (
	                  <div key={i} className="bg-card border border-border/60 rounded-xl p-4 space-y-3 shadow-sm">
	                    <div className="flex items-center justify-between">
	                      <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold text-[10px] uppercase tracking-wider">
	                        {script.trigger}
	                      </Badge>
	                      <div className="flex items-center gap-2">
	                        <Button
	                          variant="ghost"
	                          size="sm"
	                          onClick={copyWhatsappMessage}
	                          className="h-7 gap-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground"
	                        >
	                          {whatsappCopied === i ? (
	                            <>
	                              <Check className="w-3 h-3 text-emerald-500" />
	                              Copiado
	                            </>
	                          ) : (
	                            <>
	                              <Copy className="w-3 h-3" />
	                              Copiar
	                            </>
	                          )}
	                        </Button>
	                        <a 
	                          href={whatsappUrl} 
	                          target="_blank" 
	                          rel="noopener noreferrer"
	                          className="inline-flex items-center justify-center h-7 px-3 rounded-lg text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm gap-1"
	                        >
	                          Enviar WhatsApp
	                        </a>
	                      </div>
	                    </div>
	                    <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg border border-border/40">
	                      {formattedMessage}
	                    </p>
	                  </div>
	                );
	              })}
	            </div>
	          </div>
	        )}

			        {/* Fila de Mensagens de Pós-Operatório Agendado (D+1, D+7, D+30) */}
			        <Card className="border-amber-500/20 bg-amber-500/[0.01] shadow-sm mb-6">
			          <CardHeader className="p-5 pb-3">
			            <div className="space-y-1 text-left">
			              <CardTitle className="text-sm font-serif font-bold text-primary flex items-center gap-1.5">
			                <Clock className="w-4 h-4 text-amber-500" />
			                Fila de Mensagens de Pós-Operatório Agendado
			              </CardTitle>
			              <p className="text-[10px] text-muted-foreground leading-normal">
			                Acompanhamento ativo e humanizado programado para o pós-operatório de {protocol.title}.
			              </p>
			            </div>
			          </CardHeader>
			          <CardContent className="p-5 pt-0 space-y-4">
			            {/* Seletores de Dias (D+1, D+7, D+30) */}
			            <div className="flex gap-2 p-1 bg-secondary/40 rounded-lg border border-border/40">
			              {[
			                { id: "D1", label: "D+1 (Primeiro Dia)", sub: "Sintomas & Conforto" },
			                { id: "D7", label: "D+7 (Evolução)", sub: "Pontos & Cicatrização" },
			                { id: "D30", label: "D+30 (Alta/Performance)", sub: "Retorno de Atividades" }
			              ].map((day) => (
			                <button
			                  key={day.id}
			                  onClick={() => setSelectedPostOpDay(day.id as any)}
			                  className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all ${selectedPostOpDay === day.id ? "bg-primary text-primary-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
			                >
			                  <span className="text-xs font-bold">{day.label}</span>
			                  <span className="text-[8px] opacity-80 font-medium">{day.sub}</span>
			                </button>
			              ))}
			            </div>

			            {/* Conteúdo da Mensagem com base no Dia Selecionado */}
			            <div className="bg-secondary/30 rounded-xl p-4 border border-border/40 text-left space-y-2">
			              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Prévia da Mensagem ({selectedPostOpDay}):</span>
			              <div className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
			                {selectedPostOpDay === "D1" 
			                  ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui.\n\nEstou entrando em contato para saber como foi sua primeira noite em casa após o procedimento de ${protocol.title}.\n\nLembre-se de manter o repouso recomendado, a hidratação abundante e de tomar as medicações prescritas nos horários corretos. É normal sentir um leve desconforto ou inchaço local nesta fase inicial.\n\nQualquer dúvida ou sintoma atípico, nossa equipe de suporte rápido está 100% de prontidão no número 11 98112-4455. Tenha um excelente dia de recuperação!`
			                  : selectedPostOpDay === "D7"
			                  ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja evoluindo super bem!\n\nHoje completamos 7 dias do seu procedimento de ${protocol.title}. Gostaria de saber como está a cicatrização local e o seu nível de conforto.\n\nSe houver pontos externos ou curativos, nossa equipe entrará em contato para agendar sua avaliação presencial de retirada ou revisão de cicatrização. Lembre-se de manter os cuidados de estilo de vida (alimentação anti-inflamatória e hidratação celular) para acelerar a cicatrização.\n\nEstou à inteira disposição no número 11 98112-4455. Forte abraço!`
				                  : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Parabéns pela jornada de recuperação!\n\nHoje completamos 30 dias do seu procedimento de ${protocol.title}. Este é um marco importante onde normalmente iniciamos a transição para a alta clínica definitiva e a liberação para o retorno gradual de atividades físicas mais intensas e treinos de alta performance.\n\nGostaria de agendar seu retorno clínico presencial para avaliarmos os resultados finais e ajustarmos suas metas de estilo de vida e performance hormonal.\n\nAproveito este momento para pedir a sua valiosa opinião sobre a nossa jornada de atendimento premium (da recepção ao pós-operatório). Se puder, avalie-nos em nosso canal oficial e deixe seu depoimento (leva menos de 1 minuto e nos ajuda a manter a excelência):\n👉 link.felipebulhoes.com/avaliacao\n\nPor favor, confirme com a minha secretária o melhor dia e horário para o seu retorno. Até breve!`
			                }
			              </div>
			            </div>

			            {/* Botões de Ação */}
			            <div className="flex gap-2">
			              <Button
			                variant="outline"
			                onClick={() => {
			                  const text = selectedPostOpDay === "D1"
			                    ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui.\n\nEstou entrando em contato para saber como foi sua primeira noite em casa após o procedimento de ${protocol.title}.\n\nLembre-se de manter o repouso recomendado, a hidratação abundante e de tomar as medicações prescritas nos horários corretos. É normal sentir um leve desconforto ou inchaço local nesta fase inicial.\n\nQualquer dúvida ou sintoma atípico, nossa equipe de suporte rápido está 100% de prontidão no número 11 98112-4455. Tenha um excelente dia de recuperação!`
			                    : selectedPostOpDay === "D7"
			                    ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja evoluindo super bem!\n\nHoje completamos 7 dias do seu procedimento de ${protocol.title}. Gostaria de saber como está a cicatrização local e o seu nível de conforto.\n\nSe houver pontos externos ou curativos, nossa equipe entrará em contato para agendar sua avaliação presencial de retirada ou revisão de cicatrização. Lembre-se de manter os cuidados de estilo de vida (alimentação anti-inflamatória e hidratação celular) para acelerar a cicatrização.\n\nEstou à inteira disposição no número 11 98112-4455. Forte abraço!`
			                    : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Parabéns pela jornada de recuperação!\n\nHoje completamos 30 dias do seu procedimento de ${protocol.title}. Este é um marco importante onde normalmente iniciamos a transição para a alta clínica definitiva e a liberação para o retorno gradual de atividades físicas mais intensas e treinos de alta performance.\n\nGostaria de agendar seu retorno clínico presencial para avaliarmos os resultados finais e ajustarmos suas metas de estilo de vida e performance hormonal.\n\nAproveito este momento para pedir a sua valiosa opinião sobre a nossa jornada de atendimento premium (da recepção ao pós-operatório). Se puder, avalie-nos em nosso canal oficial e deixe seu depoimento (leva menos de 1 minuto e nos ajuda a manter a excelência):\n👉 link.felipebulhoes.com/avaliacao\n\nPor favor, confirme com a minha secretária o melhor dia e horário para o seu retorno. Até breve!`;
			                  navigator.clipboard.writeText(text);
			                  setPostOpCopied(true);
			                  toast.success(`Mensagem ${selectedPostOpDay} copiada com sucesso!`);
			                  setTimeout(() => setPostOpCopied(false), 2000);
			                }}
			                className="flex-1 rounded-xl text-xs h-10 font-semibold border-border"
			              >
			                {postOpCopied ? "Copiado!" : "Copiar Texto"}
			              </Button>
			              <Button
			                onClick={() => {
			                  const text = selectedPostOpDay === "D1"
			                    ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui.\n\nEstou entrando em contato para saber como foi sua primeira noite em casa após o procedimento de ${protocol.title}.\n\nLembre-se de manter o repouso recomendado, a hidratação abundante e de tomar as medicações prescritas nos horários corretos. É normal sentir um leve desconforto ou inchaço local nesta fase inicial.\n\nQualquer dúvida ou sintoma atípico, nossa equipe de suporte rápido está 100% de prontidão no número 11 98112-4455. Tenha um excelente dia de recuperação!`
			                    : selectedPostOpDay === "D7"
			                    ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja evoluindo super bem!\n\nHoje completamos 7 dias do seu procedimento de ${protocol.title}. Gostaria de saber como está a cicatrização local e o seu nível de conforto.\n\nSe houver pontos externos ou curativos, nossa equipe entrará em contato para agendar sua avaliação presencial de retirada ou revisão de cicatrização. Lembre-se de manter os cuidados de estilo de vida (alimentação anti-inflamatória e hidratação celular) para acelerar a cicatrização.\n\nEstou à inteira disposição no número 11 98112-4455. Forte abraço!`
			                    : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Parabéns pela jornada de recuperação!\n\nHoje completamos 30 dias do seu procedimento de ${protocol.title}. Este é um marco importante onde normalmente iniciamos a transição para a alta clínica definitiva e a liberação para o retorno gradual de atividades físicas mais intensas e treinos de alta performance.\n\nGostaria de agendar seu retorno clínico presencial para avaliarmos os resultados finais e ajustarmos suas metas de estilo de vida e performance hormonal.\n\nAproveito este momento para pedir a sua valiosa opinião sobre a nossa jornada de atendimento premium (da recepção ao pós-operatório). Se puder, avalie-nos em nosso canal oficial e deixe seu depoimento (leva menos de 1 minuto e nos ajuda a manter a excelência):\n👉 link.felipebulhoes.com/avaliacao\n\nPor favor, confirme com a minha secretária o melhor dia e horário para o seu retorno. Até breve!`;
			                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
			                  window.open(url, "_blank");
			                  toast.success("Abrindo WhatsApp...");
			                }}
			                className="flex-1 rounded-xl text-xs h-10 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
			              >
			                Enviar WhatsApp
			              </Button>
			            </div>
			          </CardContent>
			        </Card>

			        {/* Checklist de Auditoria de Alta CPP & Envio MEV WhatsApp */}
			        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
		          {/* Checklist de Alta */}
		          <Card className="border-emerald-500/20 bg-emerald-500/[0.01] shadow-sm">
		            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
		              <div className="space-y-1 text-left">
		                <CardTitle className="text-sm font-serif font-bold text-primary flex items-center gap-1.5">
		                  <CheckSquare className="w-4 h-4 text-emerald-500" />
		                  Auditoria de Alta CPP
		                </CardTitle>
		                <p className="text-[10px] text-muted-foreground leading-normal">
		                  Garantia da entrega dos diferenciais de Cirurgião Particular Premium.
		                </p>
		              </div>
		              <Button 
		                variant="ghost" 
		                size="sm" 
		                onClick={handleResetChecklist}
		                className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive rounded-md"
		              >
		                Resetar Checklist
		              </Button>
		            </CardHeader>
		            <CardContent className="p-5 pt-0 space-y-2.5">
		              {(checklistItems[protocol.id] || []).map((item) => (
		                <div 
		                  key={item.id}
		                  onClick={() => handleToggleChecklistItem(item.id)}
		                  className={`
		                    flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all duration-150
		                    ${item.checked 
		                      ? "border-emerald-500/30 bg-emerald-500/[0.03] text-foreground/80" 
		                      : "border-border/50 bg-card/50 hover:bg-secondary/20"}
		                  `}
		                >
		                  <input 
		                    type="checkbox"
		                    checked={item.checked}
		                    onChange={() => {}} // Tratado no onClick do container
		                    className="h-3.5 w-3.5 rounded border-border text-emerald-500 focus:ring-emerald-500 mt-0.5 pointer-events-none"
		                  />
		                  <span className={`text-xs text-left leading-snug ${item.checked ? "line-through text-muted-foreground" : "font-medium"}`}>
		                    {item.text}
		                  </span>
		                </div>
		              ))}
		            </CardContent>
		          </Card>

			          {/* Envio MEV WhatsApp */}
			          <Card className="border-[#B87333]/20 bg-[#B87333]/[0.01] shadow-sm flex flex-col justify-between">
			            <CardHeader className="p-5 pb-3">
			              <div className="space-y-1 text-left">
			                <CardTitle className="text-sm font-serif font-bold text-primary flex items-center gap-1.5">
			                  <Sparkles className="w-4 h-4 text-[#B87333]" />
			                  Orientações MEV para o Paciente
			                </CardTitle>
			                <p className="text-[10px] text-muted-foreground leading-normal">
			                  Envie as orientações completas de Estilo de Vida (Nutrição, Sono, Treino) formatadas.
			                </p>
			              </div>
			            </CardHeader>
			            <CardContent className="p-5 pt-0 space-y-3.5 flex-1 flex flex-col justify-between">
			              {/* Seletor de Tom */}
			              <div className="flex gap-1.5 p-1 bg-secondary/40 rounded-lg border border-border/40">
			                <button
			                  onClick={() => setMevTone("acolhedor")}
			                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-md transition-all ${mevTone === "acolhedor" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
			                >
			                  Acolhedor
			                </button>
			                <button
			                  onClick={() => setMevTone("formal")}
			                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-md transition-all ${mevTone === "formal" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
			                >
			                  Formal (Premium)
			                </button>
			                <button
			                  onClick={() => setMevTone("pratico")}
			                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-md transition-all ${mevTone === "pratico" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
			                >
			                  Prático (Performance)
			                </button>
			              </div>

			              <div className="bg-secondary/30 rounded-xl p-4 border border-border/40 text-left space-y-2 flex-1">
			                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Prévia da Mensagem ({mevTone}):</span>
			                <div className="text-xs text-foreground/80 leading-relaxed font-mono line-clamp-5 whitespace-pre-wrap">
			                  {mevTone === "acolhedor" 
			                    ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja se sentindo bem!\n\nPara otimizar a sua recuperação do procedimento de ${protocol.title}, preparei com muito carinho algumas orientações exclusivas de Estilo de Vida (MEV):\n\n• NUTRIÇÃO: Foco em anti-inflamatórios e hidratação celular para cicatrizar rápido.\n• SONO: Sono reparador para manter seu corpo forte e equilibrado.\n• ATIVIDADE FÍSICA: Repouso ativo e retorno gradual seguro.\n\nQualquer dúvida, nossa equipe está 100% à sua disposição!`
			                    : mevTone === "formal"
			                    ? `Prezado(a) ${patientName || "[Nome do Paciente]"}, aqui é o Dr. Felipe de Bulhões Ojeda.\n\nCom o objetivo de assegurar a máxima excelência no seu pós-operatório de ${protocol.title}, estabelecemos as seguintes diretrizes de Medicina de Estilo de Vida (MEV) para otimização da sua recuperação:\n\n• NUTRIÇÃO: Dieta de alta densidade nutricional, rica em antioxidantes e hidratação celular.\n• SONO: Protocolo de higiene do sono para otimização da modulação hormonal e cicatrização.\n• ATIVIDADE FÍSICA: Repouso ativo rigoroso com reintrodução gradual assistida.\n\nMinha equipe e eu permanecemos à inteira disposição para suporte contínuo.`
			                    : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe aqui.\n\nFoco na recuperação rápida do seu procedimento de ${protocol.title}. Segue o plano de ação de Estilo de Vida (MEV) focado em alta performance pós-alta:\n\n• NUTRIÇÃO: Protocolo anti-inflamatório focado em regeneração tecidual acelerada.\n• SONO: Higiene do sono estrita para pico de testosterona e reparação celular.\n• ATIVIDADE FÍSICA: Repouso ativo estratégico. Retorno aos treinos conforme o cronograma.\n\nQualquer dúvida, acione nosso suporte rápido!`
			                  }
			                </div>
			              </div>
			              <div className="flex gap-2 pt-1 shrink-0">
			                <Button
			                  variant="outline"
			                  onClick={() => {
			                    const text = mevTone === "acolhedor" 
			                      ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja se sentindo bem!\n\nPara otimizar a sua recuperação do procedimento de ${protocol.title}, preparei com muito carinho algumas orientações exclusivas de Estilo de Vida (MEV):\n\n• NUTRIÇÃO: Foco em anti-inflamatórios e hidratação celular para cicatrizar rápido.\n• SONO: Sono reparador para manter seu corpo forte e equilibrado.\n• ATIVIDADE FÍSICA: Repouso ativo e retorno gradual seguro.\n\nQualquer dúvida, nossa equipe está 100% à sua disposição!`
			                      : mevTone === "formal"
			                      ? `Prezado(a) ${patientName || "[Nome do Paciente]"}, aqui é o Dr. Felipe de Bulhões Ojeda.\n\nCom o objetivo de assegurar a máxima excelência no seu pós-operatório de ${protocol.title}, estabelecemos as seguintes diretrizes de Medicina de Estilo de Vida (MEV) para otimização da sua recuperação:\n\n• NUTRIÇÃO: Dieta de alta densidade nutricional, rica em antioxidantes e hidratação celular.\n• SONO: Protocolo de higiene do sono para otimização da modulação hormonal e cicatrização.\n• ATIVIDADE FÍSICA: Repouso ativo rigoroso com reintrodução gradual assistida.\n\nMinha equipe e eu permanecemos à inteira disposição para suporte contínuo.`
			                      : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe aqui.\n\nFoco na recuperação rápida do seu procedimento de ${protocol.title}. Segue o plano de ação de Estilo de Vida (MEV) focado em alta performance pós-alta:\n\n• NUTRIÇÃO: Protocolo anti-inflamatório focado em regeneração tecidual acelerada.\n• SONO: Higiene do sono estrita para pico de testosterona e reparação celular.\n• ATIVIDADE FÍSICA: Repouso ativo estratégico. Retorno aos treinos conforme o cronograma.\n\nQualquer dúvida, acione nosso suporte rápido!`;
			                    navigator.clipboard.writeText(text);
			                    setMevCopied(true);
			                    toast.success("Mensagem MEV copiada com sucesso!");
			                    setTimeout(() => setMevCopied(false), 2000);
			                  }}
			                  className="flex-1 rounded-xl text-xs h-10 font-semibold border-border"
			                >
			                  {mevCopied ? "Copiado!" : "Copiar Texto"}
			                </Button>
			                <Button
			                  onClick={() => {
			                    const text = mevTone === "acolhedor" 
			                      ? `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe de Bulhões aqui. Espero que esteja se sentindo bem!\n\nPara otimizar a sua recuperação do procedimento de ${protocol.title}, preparei com muito carinho algumas orientações exclusivas de Estilo de Vida (MEV):\n\n• NUTRIÇÃO: Foco em anti-inflamatórios e hidratação celular para cicatrizar rápido.\n• SONO: Sono reparador para manter seu corpo forte e equilibrado.\n• ATIVIDADE FÍSICA: Repouso ativo e retorno gradual seguro.\n\nQualquer dúvida, nossa equipe está 100% à disposição!`
			                      : mevTone === "formal"
			                      ? `Prezado(a) ${patientName || "[Nome do Paciente]"}, aqui é o Dr. Felipe de Bulhões Ojeda.\n\nCom o objetivo de assegurar a máxima excelência no seu pós-operatório de ${protocol.title}, estabelecemos as seguintes diretrizes de Medicina de Estilo de Vida (MEV) para otimização da sua recuperação:\n\n• NUTRIÇÃO: Dieta de alta densidade nutricional, rica em antioxidantes e hidratação celular.\n• SONO: Protocolo de higiene do sono para otimização da modulação hormonal e cicatrização.\n• ATIVIDADE FÍSICA: Repouso ativo rigoroso com reintrodução gradual assistida.\n\nMinha equipe e eu permanecemos à inteira disposição para suporte contínuo.`
			                      : `Olá, ${patientName || "[Nome do Paciente]"}! Dr. Felipe aqui.\n\nFoco na recuperação rápida do seu procedimento de ${protocol.title}. Segue o plano de ação de Estilo de Vida (MEV) focado em alta performance pós-alta:\n\n• NUTRIÇÃO: Protocolo anti-inflamatório focado em regeneração tecidual acelerada.\n• SONO: Higiene do sono estrita para pico de testosterona e reparação celular.\n• ATIVIDADE FÍSICA: Repouso ativo estratégico. Retorno aos treinos conforme o cronograma.\n\nQualquer dúvida, acione nosso suporte rápido!`;
			                    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
			                    window.open(url, "_blank");
			                    toast.success("Abrindo WhatsApp...");
			                  }}
			                  className="flex-1 rounded-xl text-xs h-10 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
			                >
			                  Enviar WhatsApp
			                </Button>
			              </div>
			            </CardContent>
			          </Card>
		        </div>

		        {/* Seções Colapsáveis (Accordion) */}
		        <div className="space-y-4">
		          <Accordion type="multiple" defaultValue={protocol.sections.map((_, i) => `section-${i}`)} className="space-y-4">
		            
		            {/* Aba de Atestados & Laudos Médicos (Adicionado no início do Accordion para destaque) */}
		            {((protocol.atestados && protocol.atestados.length > 0) || (protocol.laudos && protocol.laudos.length > 0)) && (
		              <AccordionItem 
		                value="atestados-laudos"
		                className="border border-blue-500/20 rounded-xl overflow-hidden bg-card shadow-sm"
		              >
		                <div className="flex items-center justify-between px-5 py-3 border-b border-blue-500/10 bg-blue-500/[0.03]">
		                  <AccordionTrigger className="flex-1 hover:no-underline py-1 text-left">
		                    <span className="text-base font-serif font-bold leading-normal text-primary flex items-center gap-2">
		                      <FileText className="w-5 h-5 text-blue-500" />
		                      Documentos Clínicos (Atestados & Laudos)
		                    </span>
		                  </AccordionTrigger>
		                  <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-blue-500/5 font-semibold text-[10px] uppercase tracking-wider">
		                    Modelos Copiáveis
		                  </Badge>
		                </div>
		                <AccordionContent className="p-5 space-y-5">
		                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
		                    {/* Atestados */}
		                    {protocol.atestados && protocol.atestados.length > 0 && (
		                      <div className="space-y-3">
		                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-1.5">
		                          <FileText className="w-3.5 h-3.5 text-blue-500" />
		                          Atestados de Afastamento
		                        </h4>
		                        {protocol.atestados.map((atestando: any, idx: number) => {
		                          const pName = patientName.trim() || "___________________________________";
		                          const dToday = new Date().toLocaleDateString("pt-BR");
		                          const formattedText = atestando.modelo
		                            .replace(/{paciente}/g, pName)
		                            .replace(/{data}/g, dToday)
		                            .replace(/{titulo}/g, protocol.title)
		                            .replace(/{cid}/g, "N/A");

		                          return (
		                            <div key={idx} className="border border-border/60 rounded-xl p-4 bg-secondary/10 space-y-3">
		                              <div className="flex items-center justify-between gap-2">
		                                <span className="text-xs font-bold text-primary font-serif truncate">{atestando.titulo}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleCopyCertificado(atestando.modelo, idx, false)}
                                    className="h-7 px-2 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                                  >
                                    {certCopied === idx ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copiar
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePrintDocument(atestando.titulo || "Atestado Médico", atestando.modelo, false)}
                                    className="h-7 px-2 rounded-lg text-[10px] font-semibold text-accent hover:text-accent/80 hover:bg-accent/5"
                                  >
                                    <Printer className="w-3 h-3" />
                                    Imprimir
                                  </Button>
                                </div>
		                              </div>
		                              <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap bg-card p-3 rounded-lg border border-border/40">
		                                {formattedText}
		                              </p>
		                            </div>
		                          );
		                        })}
		                      </div>
		                    )}

		                    {/* Laudos */}
		                    {protocol.laudos && protocol.laudos.length > 0 && (
		                      <div className="space-y-3">
		                        <h4 className="text-xs font-bold text-[#B87333] uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-1.5">
		                          <FileText className="w-3.5 h-3.5 text-[#B87333]" />
		                          Laudos Médicos
		                        </h4>
		                        {protocol.laudos.map((laudando: any, idx: number) => {
		                          const pName = patientName.trim() || "___________________________________";
		                          const dToday = new Date().toLocaleDateString("pt-BR");
		                          const formattedText = laudando.modelo
		                            .replace(/{paciente}/g, pName)
		                            .replace(/{data}/g, dToday)
		                            .replace(/{titulo}/g, protocol.title)
		                            .replace(/{cid}/g, "N/A");

		                          return (
		                            <div key={idx} className="border border-border/60 rounded-xl p-4 bg-secondary/10 space-y-3">
		                              <div className="flex items-center justify-between gap-2">
		                                <span className="text-xs font-bold text-primary font-serif truncate">{laudando.titulo}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleCopyCertificado(laudando.modelo, idx, true)}
                                    className="h-7 px-2 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                                  >
                                    {laudoCopied === idx ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copiar
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePrintDocument(laudando.titulo || "Laudo Médico", laudando.modelo, false)}
                                    className="h-7 px-2 rounded-lg text-[10px] font-semibold text-accent hover:text-accent/80 hover:bg-accent/5"
                                  >
                                    <Printer className="w-3 h-3" />
                                    Imprimir
                                  </Button>
                                </div>
		                              </div>
		                              <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap bg-card p-3 rounded-lg border border-border/40">
		                                {formattedText}
		                              </p>
		                            </div>
		                          );
		                        })}
		                      </div>
		                    )}
		                  </div>
		                </AccordionContent>
		              </AccordionItem>
		            )}

		            {protocol.sections.map((section: any, index: number) => {
	              const isPrescription = section.is_prescription;
	              const isMev = section.is_mev;
	              const isReferences = section.is_references;
	              const isSecretary = section.is_secretary;

	              return (
	                <AccordionItem 
	                  key={index} 
	                  value={`section-${index}`}
	                  className={`
	                    border rounded-xl overflow-hidden bg-card shadow-sm transition-all duration-200
	                    ${isPrescription ? "border-accent/30" : "border-border"}
	                    ${isMev ? "border-emerald-500/20" : ""}
	                    ${isSecretary ? "border-amber-500/20" : ""}
	                  `}
	                >
	                  <div className={`
	                    flex items-center justify-between px-5 py-3 border-b border-border/40
	                    ${isPrescription ? "bg-accent/5" : "bg-secondary/30"}
	                    ${isMev ? "bg-emerald-500/5" : ""}
	                    ${isSecretary ? "bg-amber-500/5" : ""}
	                  `}>
	                    <AccordionTrigger className="flex-1 hover:no-underline py-1 text-left">
	                      <span className={`
	                        text-base font-serif font-bold leading-normal
	                        ${isPrescription ? "text-accent" : "text-primary"}
	                        ${isMev ? "text-emerald-600" : ""}
	                        ${isSecretary ? "text-amber-600" : ""}
	                      `}>
	                        {section.title}
	                      </span>
	                    </AccordionTrigger>

	                    {/* Botão de cópia para prescrições ou conteúdo clínico */}
	                    <div className="flex items-center gap-2 ml-4">
	                      {isPrescription && (
	                        <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 font-semibold text-[10px] uppercase tracking-wider">
	                          Prescrição Modelo
	                        </Badge>
	                      )}
	                      {isMev && (
	                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold text-[10px] uppercase tracking-wider">
	                          Medicina de Estilo de Vida
	                        </Badge>
	                      )}
	                      {isSecretary && (
		                        <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/5 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
		                          <PhoneCall className="w-2.5 h-2.5" />
		                          Comunicação & Vendas
		                        </Badge>
		                      )}
	                      <div className="flex items-center gap-1.5">
	                        {isSecretary ? (
	                          <div className="flex items-center gap-1.5">
	                            <Button
	                              variant="ghost"
	                              size="sm"
	                              onClick={() => {
	                                const cleanContent = section.content
	                                  .replace(/\[Nome do Paciente\]/g, patientName || "Paciente")
	                                  .replace(/\[Nome\]/g, patientName || "Paciente");
	                                copyToClipboard(cleanContent, section.title, false);
	                              }}
	                              className="h-8 gap-1.5 rounded-lg text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-500/5 border border-amber-500/10"
	                            >
	                              {copiedText === section.title ? (
	                                <>
	                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
	                                  Copiado
	                                </>
	                              ) : (
	                                <>
	                                  <Copy className="w-3.5 h-3.5" />
	                                  Copiar Roteiro
	                                </>
	                              )}
	                            </Button>
	                            <Button
	                              variant="ghost"
	                              size="sm"
	                              onClick={() => {
	                                const cleanContent = section.content
	                                  .replace(/\[Nome do Paciente\]/g, patientName || "Paciente")
	                                  .replace(/\[Nome\]/g, patientName || "Paciente");
	                                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanContent)}`;
	                                window.open(url, "_blank");
	                              }}
	                              className="h-8 gap-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm"
	                            >
	                              <MessageSquare className="w-3.5 h-3.5" />
	                              Enviar WhatsApp
	                            </Button>
	                          </div>
	                        ) : (
	                          <Button
	                            variant="ghost"
	                            size="sm"
	                            onClick={() => copyToClipboard(section.content, section.title, isPrescription)}
	                            className="h-8 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
	                          >
	                            {copiedText === section.title ? (
	                              <>
	                                <Check className="w-3.5 h-3.5 text-emerald-500" />
	                                Copiado
	                              </>
	                            ) : (
	                              <>
	                                <Copy className="w-3.5 h-3.5" />
	                                Copiar
	                              </>
	                            )}
	                          </Button>
	                        )}
                        {isPrescription && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintDocument("Prescrição Médica", section.content, true, false)}
                              className="h-8 gap-1.5 rounded-lg text-xs font-medium text-accent hover:text-accent/80 hover:bg-accent/5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Imprimir Receita
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintDocument("Receita de Controle Especial", section.content, true, true)}
                              className="h-8 gap-1.5 rounded-lg text-xs font-medium text-[#B87333] hover:text-[#B87333]/80 hover:bg-[#B87333]/5 border border-[#B87333]/10"
                              title="Imprimir no formato de Receita de Controle Especial (Portaria 344/98) com 1ª e 2ª via"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#B87333]" />
                              Controle Especial (C1)
                            </Button>
                          </div>
                        )}
                      </div>
	                    </div>
	                  </div>

		                  <AccordionContent className="p-5 pt-4 text-sm leading-relaxed text-foreground/90 prose dark:prose-invert max-w-none">
			                    {isPrescription ? (
			                      <div className="space-y-4">
			                        {/* Seletor de Cabeçalho / Local de Atendimento */}
			                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-3">
			                          <div className="flex items-center justify-between">
			                            <span className="text-xs font-bold text-[#1C3D5A] uppercase tracking-wider flex items-center gap-1.5">
			                              <MapPin className="w-3.5 h-3.5 text-accent" />
			                              Modelo de Cabeçalho / Local de Atendimento
			                            </span>
			                            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 text-[9px] font-semibold uppercase tracking-wider">
			                              Configuração de Impressão
			                            </Badge>
			                          </div>
			                          <p className="text-[10px] text-muted-foreground">
			                            Escolha qual cabeçalho timbrado e dados de contato devem aparecer no topo da sua receita de alta antes de imprimir.
			                          </p>
			                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
			                            {[
			                              { id: "clinovi_paulista", label: "Clinovi Paulista", sub: "São Paulo/SP" },
			                              { id: "clinovi_moema", label: "Clinovi Moema", sub: "São Paulo/SP" },
			                              { id: "campinas_day", label: "Campinas Day", sub: "Campinas/SP" },
			                              { id: "sem_logo", label: "Receita Limpa", sub: "Apenas CRM/RQE" }
			                            ].map((loc) => (
			                              <div
			                                key={loc.id}
			                                onClick={() => setLocalAtendimento(loc.id as any)}
			                                className={`
			                                  flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer text-center transition-all duration-200
			                                  ${localAtendimento === loc.id 
			                                    ? "border-accent bg-accent/10 text-accent font-bold" 
			                                    : "border-border bg-card text-muted-foreground hover:bg-secondary/50"
			                                  }
			                                `}
			                              >
			                                <span className="text-xs font-semibold">{loc.label}</span>
			                                <span className="text-[9px] opacity-80">{loc.sub}</span>
			                              </div>
			                            ))}
			                          </div>
			                        </div>

			                        {/* Seletor de Medicamentos Adjuvantes / Sintomáticos */}
		                        <div className="bg-secondary/20 border border-border/60 rounded-xl p-4 space-y-3">
		                          <div className="flex items-center justify-between">
		                            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
		                              <Sparkles className="w-3.5 h-3.5 text-accent" />
		                              Medicamentos Adjuvantes / Sintomáticos Opcionais
		                            </span>
		                            <Badge variant="secondary" className="text-[9px] font-semibold uppercase tracking-wider">
		                              Injetar na Receita
		                            </Badge>
		                          </div>
		                          <p className="text-[10px] text-muted-foreground">
		                            Selecione medicamentos complementares para serem injetados automaticamente no final do seu receituário antes de imprimir ou copiar.
		                          </p>
			                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
			                            {[
			                              { id: "tansulosina", name: "Tansulosina 0,4mg", desc: "1 cp VO à noite por 30 dias (facilita eliminação de cálculos/LUTS)" },
			                              { id: "pyridium", name: "Pyridium (Fenazopiridina) 200mg", desc: "1 cp VO de 8/8h por 2 dias se disúria importante" },
			                              { id: "laxante", name: "Lactulona (Xarope)", desc: "15ml VO à noite se constipação pós-operatória" },
			                              { id: "scopolamina", name: "Buscopan Composto", desc: "1 cp VO de 8/8h se cólica ou espasmo vesical" },
			                              { id: "cetoprofeno", name: "Profem (Cetoprofeno) 100mg", desc: "1 cp VO de 12/12h por 3 a 5 dias se dor/inflamação" },
			                              { id: "ciprofloxacino", name: "Ciprofloxacino 500mg", desc: "1 cp VO de 12/12h por 3 a 5 dias se profilaxia de ITU estendida" },
			                              ...customAdjuvants
			                            ].map((med) => {
			                              const isSelected = (selectedAdjuvants[section.title] || []).includes(`${med.name} - ${med.desc}`);
			                              const isCustom = customAdjuvants.some(ca => ca.id === med.id);
			                              return (
			                                <div 
			                                  key={med.id}
			                                  onClick={() => handleToggleAdjuvant(section.title, `${med.name} - ${med.desc}`)}
			                                  className={`
			                                    flex items-start justify-between gap-3 p-2.5 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-card group
			                                    ${isSelected ? "border-accent/50 bg-accent/[0.03] shadow-sm" : "border-border/50 bg-card/40"}
			                                  `}
			                                >
			                                  <div className="flex items-start gap-3">
			                                    <input 
			                                      type="checkbox"
			                                      checked={isSelected}
			                                      onChange={() => {}} // Tratado no onClick do container
			                                      className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent mt-0.5 pointer-events-none"
			                                    />
			                                    <div className="space-y-0.5 text-left">
			                                      <div className="text-xs font-bold text-primary flex items-center gap-1.5">
			                                        {med.name}
			                                        {isCustom && <Badge className="text-[8px] px-1 py-0 bg-accent/10 text-accent border-accent/20">Custom</Badge>}
			                                      </div>
			                                      <div className="text-[10px] text-muted-foreground leading-normal">{med.desc}</div>
			                                    </div>
			                                  </div>
                                  {isCustom && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        handleRemoveCustomAdjuvant(med.id, e);
                                      }}
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
			                                </div>
			                              );
			                            })}
			                          </div>

			                          {/* Formulário para Cadastrar Adjuvante Customizado */}
			                          <div className="pt-3 mt-3 border-t border-border/40 space-y-2">
			                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block text-left">Cadastrar Novo Medicamento Customizado:</span>
			                            <div className="flex flex-col md:flex-row gap-2">
			                              <input
			                                type="text"
			                                placeholder="Nome do Medicamento (ex: Buscopan Composto 500mg)"
			                                value={newMedName}
			                                onChange={(e) => setNewMedName(e.target.value)}
			                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs focus:ring-1 focus:ring-accent focus:border-accent"
			                              />
			                              <input
			                                type="text"
			                                placeholder="Posologia / Instrução (ex: Tomar 1 cp VO de 8/8h se cólica)"
			                                value={newMedDesc}
			                                onChange={(e) => setNewMedDesc(e.target.value)}
			                                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs focus:ring-1 focus:ring-accent focus:border-accent"
			                              />
			                              <Button
			                                size="sm"
			                                onClick={handleAddCustomAdjuvant}
			                                className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white rounded-lg px-4 shrink-0"
			                              >
			                                Adicionar ao Catálogo
			                              </Button>
			                            </div>
			                          </div>
			                        </div>

		                        <div className="bg-secondary/50 dark:bg-secondary/20 p-4 rounded-lg border border-border/60 font-mono text-xs overflow-x-auto whitespace-pre-wrap text-left">
		                          {section.content.replace(/```/g, "")}
		                          {(selectedAdjuvants[section.title] || []).length > 0 && (
		                            <div className="mt-4 pt-4 border-t border-dashed border-border/80 text-accent font-mono">
		                              <span className="font-bold uppercase tracking-wider block mb-2 text-[10px]">[+] Medicamentos Adjuvantes Injetados:</span>
		                              {(selectedAdjuvants[section.title] || []).map((adj, idx) => (
		                                <div key={idx} className="pl-2 border-l-2 border-accent/40 mb-1">
		                                  {idx + 1}. {adj}
		                                </div>
		                              ))}
		                            </div>
		                          )}
		                        </div>
		                      </div>
		                    ) : isSecretary ? (
	                      <div className="bg-amber-500/[0.02] dark:bg-amber-500/[0.05] p-5 rounded-xl border border-amber-500/10 space-y-2">
	                        <Streamdown>{section.content}</Streamdown>
	                      </div>
	                    ) : (
	                      <Streamdown>{section.content}</Streamdown>
	                    )}
	                  </AccordionContent>
	                </AccordionItem>
	              );
	            })}
	          </Accordion>
	        </div>
      </div>
    </Layout>
  );
}
