import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

/**
 * Second step of doctor login when 2FA is enabled.
 *
 * Reached after a successful Manus OAuth exchange that set the short-lived
 * "pending" cookie (see server/_core/index.ts). No session exists yet — the
 * user only gets a real session cookie once the 6-digit code below is
 * verified server-side by `totp.verifyLogin`.
 */
export default function VerifyTotpLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const returnPath = params.get("returnPath") || "/";

  const verifyLogin = trpc.totp.verifyLogin.useMutation({
    onSuccess: () => {
      // Full page reload so the new session cookie is picked up by every
      // query (auth.me, DoctorGuard, etc.) without stale cached state.
      window.location.href = returnPath;
    },
    onError: (err) => setError(err.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6 space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="w-10 h-10 text-[#B87333]" />
          <h1 className="text-lg font-semibold text-foreground">Verificação em duas etapas</h1>
          <p className="text-sm text-muted-foreground">
            Digite o código de 6 dígitos do seu aplicativo autenticador para concluir o login.
          </p>
        </div>

        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
          placeholder="000000"
          maxLength={6}
          autoFocus
          className="font-mono text-center text-lg tracking-widest"
        />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <Button
          className="w-full bg-[#B87333] hover:bg-[#B87333]/90"
          disabled={code.length !== 6 || verifyLogin.isPending}
          onClick={() => verifyLogin.mutate({ code })}
        >
          {verifyLogin.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Confirmar
        </Button>
      </Card>
    </div>
  );
}
