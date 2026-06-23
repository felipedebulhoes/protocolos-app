import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";

export function CreatePassword() {
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetMutation = trpc.doctorAuth.resetPassword.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não correspondem.");
      return;
    }

    if (!token) {
      setError("Link de criação de senha inválido ou ausente.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetMutation.mutateAsync({ token, newPassword });
      if (result.ok) {
        setSuccess("Senha criada com sucesso! Redirecionando para o login...");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          window.location.href = "/login/doctor";
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar senha. O link pode ter expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C3D5A] to-[#0d2233] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              O link de criação de senha é inválido ou expirou. Solicite um novo link ao administrador.
            </p>
            <Button onClick={() => { window.location.href = "/login/doctor"; }} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C3D5A] to-[#0d2233] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Crie sua senha</CardTitle>
          <CardDescription>
            Bem-vindo(a) ao ProtoUro. Defina uma senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading || !!success}
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirmar Senha
              </label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !!success}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !!success}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Criando...
                </>
              ) : (
                "Criar minha senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
