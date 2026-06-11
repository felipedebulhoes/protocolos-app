import React, { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { 
  ArrowLeft, 
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
  Video
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const [whatsappCopied, setWhatsappCopied] = useState<number | null>(null);
  const [certCopied, setCertCopied] = useState<number | null>(null);
  const [laudoCopied, setLaudoCopied] = useState<number | null>(null);

  // Buscar dados do protocolo atual
  const protocol = protocolsData.find(p => p.id === protocolId);

  // Carregar favoritos e histórico de pacientes
  useEffect(() => {
    const savedFavs = localStorage.getItem("protoUro_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedHistory = localStorage.getItem("protoUro_patient_history");
    if (savedHistory) {
      setPatientHistory(JSON.parse(savedHistory));
    }
    // Carregar o último paciente ativo se houver
    const activePatient = localStorage.getItem("protoUro_active_patient");
    if (activePatient) {
      setPatientName(activePatient);
    }
  }, []);

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
    
    // Se for uma prescrição e tiver um nome de paciente definido, injetar o cabeçalho personalizado
    if (isPrescription) {
      const nameHeader = `--------------------------------------------------\nDR. FELIPE DE BULHÕES - UROLOGISTA & CIRURGIÃO GERAL\nRECEITUÁRIO MÉDICO\n\nPaciente: ${patientName || "______________________________________"}\nData: ${new Date().toLocaleDateString("pt-BR")}\n--------------------------------------------------\n\n`;
      cleanText = nameHeader + cleanText;
    }

    navigator.clipboard.writeText(cleanText);
    setCopiedText(sectionTitle);
    toast.success(`${sectionTitle} copiado para a área de transferência!`);
    setTimeout(() => setCopiedText(null), 2000);
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
      setTimeout(() => setLaudoCopied(null), 2000);
    } else {
      setCertCopied(index);
      toast.success("Atestado de afastamento copiado com sucesso!");
      setTimeout(() => setCertCopied(null), 2000);
    }
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
              <div className="w-full md:w-80 flex gap-2">
                <Input
                  placeholder="Nome completo do paciente..."
                  value={patientName}
                  onChange={(e) => handlePatientNameChange(e.target.value)}
                  className="py-5 bg-card border-border rounded-xl text-sm flex-1"
                />
                <Button 
                  onClick={savePatientToHistory}
                  disabled={!patientName.trim()}
                  className="px-4 py-5 rounded-xl text-xs font-bold copper-gradient text-white shadow-sm"
                >
                  Salvar
                </Button>
              </div>
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
		        {(protocol.id === "13_hpb_manejo_completo" || protocol.id === "14_reabilitacao_pos_prostatectomia" || protocol.id === "1_implante_protese_peniana") && (
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
		                                <Button 
		                                  variant="ghost" 
		                                  size="sm" 
		                                  onClick={() => handleCopyCertificado(atestando.modelo, idx, false)}
		                                  className="h-7 px-2 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground shrink-0"
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
		                                <Button 
		                                  variant="ghost" 
		                                  size="sm" 
		                                  onClick={() => handleCopyCertificado(laudando.modelo, idx, true)}
		                                  className="h-7 px-2 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground shrink-0"
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
	                    </div>
	                  </div>

	                  <AccordionContent className="p-5 pt-4 text-sm leading-relaxed text-foreground/90 prose dark:prose-invert max-w-none">
	                    {isPrescription ? (
	                      <div className="bg-secondary/50 dark:bg-secondary/20 p-4 rounded-lg border border-border/60 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
	                        {section.content.replace(/```/g, "")}
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
