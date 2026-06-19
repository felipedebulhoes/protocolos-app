import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function TeamJoin() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  const acceptInvite = trpc.team.acceptInvite.useMutation();

  useEffect(() => {
    const processInvite = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de convite inválido ou ausente.");
        return;
      }

      setIsProcessing(true);
      try {
        const result = await acceptInvite.mutateAsync({ token });
        setStatus("success");
        setMessage(`Bem-vindo, ${result.fullName}! Você agora tem acesso aos protocolos.`);
        
        // Redirecionar para home após 3 segundos
        setTimeout(() => {
          setLocation("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Erro ao aceitar convite. Verifique o link e tente novamente."
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processInvite();
  }, [token, acceptInvite, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a52] to-[#2d5a7b] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#B87333]" />
              <h2 className="text-xl font-semibold mb-2">Processando convite...</h2>
              <p className="text-sm text-muted-foreground">Aguarde um momento.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Convite Aceito!</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <p className="text-xs text-muted-foreground">Redirecionando...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erro ao Aceitar Convite</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <Button
                className="w-full bg-[#B87333] hover:bg-[#B87333]/90"
                onClick={() => setLocation("/")}
              >
                Voltar para Home
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
