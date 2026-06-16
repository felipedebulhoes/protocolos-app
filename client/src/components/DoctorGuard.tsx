import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ShieldAlert } from "lucide-react";

/**
 * Guards the physician-facing area. Only the project owner (the doctor)
 * may access these routes. Any other visitor — anonymous or even another
 * authenticated Manus user — is redirected to login / shown access denied.
 *
 * Note: the sensitive patient data is also protected on the backend via
 * `ownerProcedure`; this guard is the UX layer that hides the doctor UI.
 */
export function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const isOwner = !!data && (data as { isOwner?: boolean }).isOwner === true;
  const settled = !isLoading;
  const notAuthenticated = settled && !data;

  // Anonymous visitors are sent straight to the Manus login, returning to
  // the page they tried to reach.
  useEffect(() => {
    if (notAuthenticated || isError) {
      const returnPath = window.location.pathname + window.location.search;
      window.location.href = getLoginUrl(returnPath);
    }
  }, [notAuthenticated, isError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verificando acesso…</p>
      </div>
    );
  }

  // Authenticated but NOT the owner → explicit access denied (no redirect loop).
  if (data && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Esta área é exclusiva do médico responsável. Sua conta não tem
            permissão para acessá-la.
          </p>
        </div>
        <a
          href="/paciente"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ir para a área do paciente
        </a>
      </div>
    );
  }

  if (!isOwner) {
    // Redirect in flight — render nothing to avoid a flash of content.
    return null;
  }

  return <>{children}</>;
}
