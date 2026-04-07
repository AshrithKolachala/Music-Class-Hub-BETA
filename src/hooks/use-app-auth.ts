import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const AUTH_QUERY_KEY = ["auth", "me"];

type UserInfo = {
  role: "teacher" | "student";
  userId: string;
  name: string;
  studentId: number | null;
};

async function fetchCurrentUser(): Promise<UserInfo | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export function useAppAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (body: { userId: string; password: string; role: "teacher" | "student" }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(error.error || "Login failed");
      }
      return res.json() as Promise<UserInfo & { success: boolean }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    login: (body: { userId: string; password: string; role: "teacher" | "student" }) =>
      loginMutation.mutateAsync(body),
    isLoggingIn: loginMutation.isPending,
    logout: () => logoutMutation.mutateAsync(),
    isLoggingOut: logoutMutation.isPending,
  };
}
