import React from "react";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-accent">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-primary">Página não encontrada</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A conduta ou ferramenta que você tentou acessar não existe ou foi movida de lugar.
          </p>
        </div>

        <Link href="/">
          <Button className="w-full py-6 rounded-xl text-sm font-semibold copper-gradient text-white shadow-md shadow-accent/15">
            Voltar para os Protocolos
          </Button>
        </Link>
      </div>
    </div>
  );
}
