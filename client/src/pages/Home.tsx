import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Heart, 
  ChevronRight, 
  BookOpen, 
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
  Star,
  RotateCw,
  Cpu,
  Bookmark,
  Wrench,
  Trash2,
  Wind,
  Syringe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import protocolsData from "@/data/protocols.json";

// Mapeamento dinâmico de ícones do Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  Activity, Scissors, TrendingUp, Zap, Link: LinkIcon, Search,
  PlusCircle, Flame, ShieldAlert, RefreshCw, Layers, Sparkles,
  FileText, Users, Clock, Hourglass, AlertTriangle, HeartCrack,
  FolderHeart, HeartPulse, ZapOff, CheckSquare, Droplet, Moon,
  Gem, Droplets, RotateCw, Cpu, Bookmark, Wrench, Trash2, Wind, Syringe
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("protoUro_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Alternar favorito
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegação ao clicar no coração
    const updated = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("protoUro_favorites", JSON.stringify(updated));
  };

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(protocolsData.map(p => p.category));
    return Array.from(cats);
  }, []);

  // Filtrar protocolos com base na busca e categoria
  const filteredProtocols = useMemo(() => {
    return protocolsData.filter(p => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.raw_content && p.raw_content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.sections && p.sections.some(sec => sec.content.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner de Boas-vindas Premium com Pattern Oficial */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg shadow-primary/5">
          {/* Pattern oficial de marca com 4% de opacidade */}
          <div className="absolute inset-0 brand-pattern opacity-[0.04] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 px-3 py-1 font-semibold text-xs uppercase tracking-wider">
                Handbook Digital Premium
              </Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary leading-tight">
                Protocolos Clínicos de Urologia & Andrologia
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-normal font-sans">
                Acesso rápido a condutas cirúrgicas, painéis metabólicos, prescrições modelo e Medicina de Estilo de Vida (MEV) baseada em evidências científicas de alto impacto.
              </p>
            </div>
            
            {/* Logotipo Landscape em SVG para compor o banner */}
            <div className="hidden lg:block shrink-0 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <img 
                src="/images/logo_landscape.svg" 
                alt="Logo Dr. Felipe de Bulhões" 
                className="h-16 object-contain dark:invert"
              />
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por protocolo, conduta, dose, CID ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-card border-border rounded-xl text-base shadow-sm focus-visible:ring-accent"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full text-xs font-medium px-4 py-1.5"
            >
              Todos ({protocolsData.length})
            </Button>
            {categories.map(cat => {
              const count = protocolsData.filter(p => p.category === cat).length;
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full text-xs font-medium px-4 py-1.5"
                >
                  {cat} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Lista de Protocolos em Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-primary">
              {selectedCategory || "Todos os Protocolos"}
              <span className="text-sm font-sans font-medium text-muted-foreground ml-2">
                ({filteredProtocols.length} encontrados)
              </span>
            </h3>
          </div>

          {filteredProtocols.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">Nenhum protocolo encontrado para os termos digitados.</p>
              <Button variant="ghost" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }} className="mt-2 text-accent">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProtocols.map((p) => {
                const IconComponent = iconMap[p.icon] || FileText;
                const isFav = favorites.includes(p.id);
                return (
                  <Card 
                    key={p.id}
                    onClick={() => setLocation(`/protocolo/${p.id}`)}
                    className="group relative bg-card hover:border-accent/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                  >
                    {/* Borda decorativa lateral */}
                    <div className="absolute top-0 left-0 w-[4px] h-full bg-primary group-hover:bg-accent transition-colors duration-300" />
                    
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/5 group-hover:text-accent transition-colors duration-300">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-transparent"
                        >
                          <Heart className={`w-5 h-5 ${isFav ? "fill-accent text-accent" : ""}`} />
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5 pt-3">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                          {p.category}
                        </Badge>
                        <CardTitle className="text-base font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
                          {p.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-auto">
                      <span className="text-xs text-muted-foreground font-medium">Ver conduta completa</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-accent transition-all duration-300" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
