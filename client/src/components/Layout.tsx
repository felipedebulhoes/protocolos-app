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
  ExternalLink
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
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* HEADER MOBILE */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/images/isotipo.svg" 
            alt="Isotipo Dr. Felipe Bulhões" 
            className="w-8 h-8 object-contain dark:invert"
          />
          <span className="font-serif text-lg font-bold tracking-tight text-primary">ProtoUro</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* SIDEBAR DESKTOP & MOBILE DRAWER */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-out md:sticky md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo / Header da Sidebar */}
        <div className="p-5 border-b border-border hidden md:flex items-center justify-between bg-secondary/10">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/isotipo.svg" 
              alt="Isotipo Dr. Felipe Bulhões" 
              className="w-10 h-10 object-contain dark:invert"
            />
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-primary leading-none">ProtoUro</h1>
              <span className="text-[9px] text-muted-foreground tracking-wider uppercase font-bold">Dr. Felipe de Bulhões</span>
            </div>
          </Link>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-accent" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-border space-y-3 bg-secondary/30">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Modo Offline Pronto</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-primary" />}
            </Button>
          </div>
          
          <div className="p-3 bg-card rounded-lg border border-border flex items-center gap-3">
            <img 
              src="/images/isotipo.svg" 
              alt="Dr. Felipe de Bulhões" 
              className="w-8 h-8 rounded-full bg-primary/5 p-1 object-contain dark:invert"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-foreground font-serif">Dr. Felipe de Bulhões</p>
              <p className="text-[9px] text-muted-foreground truncate uppercase tracking-wider font-semibold">Urologista & Cirurgião</p>
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
