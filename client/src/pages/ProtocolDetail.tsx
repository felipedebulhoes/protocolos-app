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
  Share2
} from "lucide-react";
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

  // Buscar dados do protocolo atual
  const protocol = protocolsData.find(p => p.id === protocolId);

  // Carregar favoritos
  useEffect(() => {
    const saved = localStorage.getItem("protoUro_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

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

  const copyToClipboard = (text: string, sectionTitle: string) => {
    // Limpar marcações markdown de blocos de código se houver
    const cleanText = text.replace(/```[\s\S]*?\n/g, "").replace(/```/g, "");
    navigator.clipboard.writeText(cleanText);
    setCopiedText(sectionTitle);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedText(null), 2000);
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

        {/* Cabeçalho do Protocolo */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md">
          <div className="absolute top-0 left-0 w-[6px] h-full bg-primary" />
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                {protocol.category}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary leading-tight">
                {protocol.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Seções Colapsáveis (Accordion) */}
        <div className="space-y-4">
          <Accordion type="multiple" defaultValue={protocol.sections.map((_, i) => `section-${i}`)} className="space-y-4">
            {protocol.sections.map((section, index) => {
              const isPrescription = section.is_prescription;
              const isMev = section.is_mev;
              const isReferences = section.is_references;

              return (
                <AccordionItem 
                  key={index} 
                  value={`section-${index}`}
                  className={`
                    border rounded-xl overflow-hidden bg-card shadow-sm transition-all duration-200
                    ${isPrescription ? "border-accent/30" : "border-border"}
                    ${isMev ? "border-emerald-500/20" : ""}
                  `}
                >
                  <div className={`
                    flex items-center justify-between px-5 py-3 border-b border-border/40
                    ${isPrescription ? "bg-accent/5" : "bg-secondary/30"}
                    ${isMev ? "bg-emerald-500/5" : ""}
                  `}>
                    <AccordionTrigger className="flex-1 hover:no-underline py-1 text-left">
                      <span className={`
                        text-base font-serif font-bold leading-normal
                        ${isPrescription ? "text-accent" : "text-primary"}
                        ${isMev ? "text-emerald-600" : ""}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(section.content, section.title)}
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
