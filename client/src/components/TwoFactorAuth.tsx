import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react";

export function TwoFactorAuth() {
  const [step, setStep] = useState<"view" | "enable" | "verify" | "disable">("view");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const enable2FA = trpc.doctorAuth.enable2FA.useMutation();
  const verify2FA = trpc.doctorAuth.verify2FA.useMutation();
  const disable2FA = trpc.doctorAuth.disable2FA.useMutation();
  const me = trpc.doctorAuth.me.useQuery();

  const handleEnable = async () => {
    try {
      setError("");
      const result = await enable2FA.mutateAsync();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Erro ao gerar 2FA");
    }
  };

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    try {
      setError("");
      await verify2FA.mutateAsync({
        secret,
        code: verifyCode,
      });
      setSuccess("2FA ativado com sucesso!");
      setStep("view");
      setVerifyCode("");
      setTimeout(() => {
        me.refetch();
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Código inválido");
    }
  };

  const handleDisable = async () => {
    if (!password) {
      setError("Digite sua senha para desativar 2FA");
      return;
    }

    try {
      setError("");
      await disable2FA.mutateAsync({ password });
      setSuccess("2FA desativado com sucesso");
      setStep("view");
      setPassword("");
      setTimeout(() => {
        me.refetch();
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao desativar 2FA");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const is2FAEnabled = me.data?.totpEnabled;

  if (step === "view") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Autenticação em Dois Fatores (2FA)</CardTitle>
          <CardDescription>
            {is2FAEnabled
              ? "Sua conta está protegida com 2FA"
              : "Adicione uma camada extra de segurança à sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {is2FAEnabled ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">2FA Ativado</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setStep("disable")}
              >
                Desativar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">2FA Desativado</span>
              </div>
              <Button
                onClick={handleEnable}
                disabled={enable2FA.isPending}
              >
                {enable2FA.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Ativar 2FA"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar Autenticador</CardTitle>
          <CardDescription>
            Escaneie o código QR com seu aplicativo de autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chave secreta (se não conseguir escanear):</label>
            <div className="flex gap-2">
              <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm break-all">
                {secret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(secret)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Digite o código de 6 dígitos:</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Códigos de backup (guarde em local seguro):</p>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              {backupCodes.map((code) => (
                <div key={code} className="font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("view")}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verify2FA.isPending || verifyCode.length !== 6}
            >
              {verify2FA.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "disable") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desativar 2FA</CardTitle>
          <CardDescription>
            Digite sua senha para confirmar a desativação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("view")}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disable2FA.isPending || !password}
            >
              {disable2FA.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Desativando...
                </>
              ) : (
                "Desativar 2FA"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
