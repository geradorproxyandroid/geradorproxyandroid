import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useShadowAuth() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, navigate] = useLocation();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    logout: () => logoutMutation.mutate(),
    loggingOut: logoutMutation.isPending,
  };
}
