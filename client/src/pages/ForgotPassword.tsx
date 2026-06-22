import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const forgotMutation = trpc.doctorAuth.forgotPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Por favor, digite seu e-mail.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotMutation.mutateAsync({ email });

      if (result.ok) {
        setSuccess(true);
        setEmail("");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Verifique seu E-mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Se o e-mail estiver registrado em nosso sistema, você receberá um link para redefinir sua senha em breve.
            </p>
            <p className="text-sm text-gray-500">
              O link é válido por 1 hora. Verifique também sua pasta de spam.
            </p>
            <Button
              onClick={() => {
                window.location.href = "/login/doctor";
              }}
              className="w-full mt-6"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Esqueci minha Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber um link de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Você receberá um e-mail com instruções para redefinir sua senha.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Enviando...
                </>
              ) : (
                "Enviar Link de Reset"
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700"
              onClick={() => {
                window.location.href = "/login/doctor";
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Lembrou sua senha?{" "}
            <a
              href="/login/doctor"
              className="text-blue-600 hover:underline"
            >
              Faça login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
