import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export function useAuth() {
  const { data, isLoading, error, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const user = data ?? null;

  return {
    user,
    loading: isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login: (returnPath?: string) => {
      window.location.href = getLoginUrl(returnPath);
    },
    logout: () => logoutMutation.mutate(),
    refetch,
  };
}
