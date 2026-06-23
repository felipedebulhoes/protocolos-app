import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function TeamJoin() {
  const [status, setStatus] = useState<"loading" | "setup-password" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [memberName, setMemberName] = useState("");
  const [setupToken, setSetupToken] = useState("");

  // Password setup form
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  const acceptInvite = trpc.team.acceptInvite.useMutation();
  const setupPassword = trpc.doctorAuth.resetPassword.useMutation({
    onSuccess: (data: any) => {
      setStatus("success");
      setMessage(`Bem-vindo, ${data.name}! Sua conta está pronta.`);
      setTimeout(() => { window.location.href = "/"; }, 2500);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Erro ao definir senha");
    },
  });

  useEffect(() => {
    const processInvite = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de convite inválido ou ausente.");
        return;
      }

      try {
        const result = await acceptInvite.mutateAsync({ token });
        setMemberName(result.fullName);
        setSetupToken(result.setupToken);
        setStatus("setup-password");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Erro ao aceitar convite. Verifique o link e tente novamente."
        );
      }
    };

    processInvite();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setupPassword.mutate({ token: setupToken, newPassword: password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C3D5A] to-[#0d2233] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-0 shadow-2xl">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#B87333]" />
            <h2 className="text-xl font-semibold mb-2">Validando convite...</h2>
            <p className="text-sm text-muted-foreground">Aguarde um momento.</p>
          </div>
        )}

        {status === "setup-password" && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#B87333]/10 mb-3">
                <Lock className="w-7 h-7 text-[#B87333]" />
              </div>
              <h2 className="text-xl font-semibold">Olá, {memberName}!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Crie uma senha para acessar o ProtoUro.
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={setupPassword.isPending}
                className="w-full bg-[#B87333] hover:bg-[#B87333]/90 font-semibold"
              >
                {setupPassword.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  "Definir senha e entrar"
                )}
              </Button>
            </form>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Conta criada!</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <p className="text-xs text-muted-foreground">Redirecionando...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao aceitar convite</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button
              className="w-full bg-[#B87333] hover:bg-[#B87333]/90"
              onClick={() => window.location.href = "/login/doctor"}
            >
              Ir para o login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
