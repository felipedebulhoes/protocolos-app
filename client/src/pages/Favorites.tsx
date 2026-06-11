import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Heart, 
  ChevronRight, 
  BookOpen, 
  Activity, 
  Scissors, 
  TrendingUp, 
  Zap, 
  Link as LinkIcon, 
  Search,
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
  Droplets
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import protocolsData from "@/data/protocols.json";

// Mapeamento dinâmico de ícones do Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  Activity, Scissors, TrendingUp, Zap, Link: LinkIcon, Search,
  PlusCircle, Flame, ShieldAlert, RefreshCw, Layers, Sparkles,
  FileText, Users, Clock, Hourglass, AlertTriangle, HeartCrack,
  FolderHeart, HeartPulse, ZapOff, CheckSquare, Droplet, Moon,
  Gem, Droplets
};

export default function Favorites() {
  const [, setLocation] = useLocation();
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
    e.stopPropagation();
    const updated = favorites.filter(favId => favId !== id);
    setFavorites(updated);
    localStorage.setItem("protoUro_favorites", JSON.stringify(updated));
  };

  // Filtrar protocolos favoritados
  const favoriteProtocols = useMemo(() => {
    return protocolsData.filter(p => favorites.includes(p.id));
  }, [favorites]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header da Página */}
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-primary">Protocolos Favoritos</h2>
          <p className="text-muted-foreground text-sm">
            Seus protocolos mais acessados e de consulta rápida no dia a dia do consultório.
          </p>
        </div>

        {favoriteProtocols.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border max-w-xl mx-auto">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-foreground mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Marque com um coração os protocolos que você mais utiliza para que eles apareçam aqui instantaneamente.
            </p>
            <Button onClick={() => setLocation("/")} className="rounded-xl">
              Explorar Protocolos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteProtocols.map((p) => {
              const IconComponent = iconMap[p.icon] || FileText;
              return (
                <Card 
                  key={p.id}
                  onClick={() => setLocation(`/protocolo/${p.id}`)}
                  className="group relative bg-card hover:border-accent/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  {/* Borda decorativa lateral */}
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-accent" />
                  
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/5 group-hover:text-accent transition-colors duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="h-8 w-8 text-accent hover:bg-transparent"
                      >
                        <Heart className="w-5 h-5 fill-accent text-accent" />
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
    </Layout>
  );
}
