import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  Search, 
  Heart, 
  Calculator, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronRight,
  Activity,
  User,
  ExternalLink,
  Calendar,
  MessageCircle,
  Users,
  GraduationCap,
  FileText,
  Target,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Fechar sidebar no mobile quando mudar de rota
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const menuItems = [
    { href: "/", label: "Protocolos", icon: BookOpen },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/calculadoras", label: "Calculadoras", icon: Calculator },
    { href: "/pacientes", label: "Pacientes", icon: Users },
    { href: "/orçamentos", label: "Orçamentos", icon: FileText },
    { href: "/treinamento", label: "Treinar Equipe", icon: GraduationCap },
    { href: "/fichas", label: "Fichas Pré-Consulta", icon: ClipboardList },
    { href: "/icp", label: "Paciente Ideal (ICP)", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* HEADER MOBILE - Fundo em Azul do Nilo (#1C3D5A) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-[#1C3D5A] sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo oficial branca sobre fundo escuro */}
          <img 
            src="/images/isotipo.svg" 
            alt="Isotipo Dr. Felipe Bulhões" 
            className="w-8 h-8 object-contain invert brightness-0"
          />
          <span className="font-serif text-lg font-bold tracking-tight text-[#FEFEFE]">ProtoUro</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-[#FEFEFE] hover:bg-white/10">
            {theme === "dark" ? <Sun className="w-5 h-5 text-[#B87333]" /> : <Moon className="w-5 h-5 text-[#FEFEFE]" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#FEFEFE] hover:bg-white/10">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* SIDEBAR DESKTOP & MOBILE DRAWER - Fundo em Azul do Nilo (#1C3D5A) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1C3D5A] border-r border-primary/10 flex flex-col transition-transform duration-300 ease-out md:sticky md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo / Header da Sidebar com Isotipo Branco e Pattern */}
        <div className="p-5 border-b border-white/10 hidden md:flex items-center justify-between relative overflow-hidden bg-black/10">
          {/* Pattern sutil no fundo da sidebar */}
          <div className="absolute inset-0 brand-pattern opacity-[0.03] pointer-events-none" />
          <Link href="/" className="flex items-center gap-3 relative z-10">
            <img 
              src="/images/isotipo.svg" 
              alt="Isotipo Dr. Felipe Bulhões" 
              className="w-10 h-10 object-contain invert brightness-0"
            />
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-[#FEFEFE] leading-none">ProtoUro</h1>
              <span className="text-[9px] text-white/60 tracking-wider uppercase font-bold">Dr. Felipe de Bulhões</span>
            </div>
          </Link>
        </div>

        {/* Links de Navegação com Contraste Branco e Cobre */}
        <nav className="flex-1 p-4 space-y-1 relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-[#B87333] text-[#FEFEFE] shadow-md shadow-[#B87333]/20" 
                    : "text-white/70 hover:bg-white/5 hover:text-[#FEFEFE]"}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#FEFEFE]" : "text-white/60"}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#FEFEFE]" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/10 relative z-10">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-white/60 font-medium">Modo Offline Pronto</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex text-white/70 hover:bg-white/5 hover:text-[#FEFEFE]" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#B87333]" /> : <Moon className="w-4 h-4 text-white" />}
            </Button>
          </div>
          
          {/* Botões Rápidos de Agendamento */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider px-2">Links Rápidos</p>
            <a 
              href="https://www.doctoralia.com.br/felipe-de-bulhoes-ojeda-2/urologista/campinas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#B87333] hover:bg-[#B87333]/90 transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Doctoralia Campinas
            </a>
            <a 
              href="https://wa.me/5511981124455" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Comercial
            </a>

          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
            <img 
              src="/images/isotipo.svg" 
              alt="Dr. Felipe de Bulhões" 
              className="w-8 h-8 rounded-full bg-white/10 p-1 object-contain invert brightness-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-[#FEFEFE] font-serif">Dr. Felipe de Bulhões</p>
              <p className="text-[9px] text-white/50 truncate uppercase tracking-wider font-semibold">Urologista & Cirurgião</p>
            </div>
          </div>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="flex-1 container py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
