import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const AUTH_QUERY_KEY = ["auth", "me"];

export function getToken() {
  return localStorage.getItem("session_token");
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-session-token": token } : {}),
      ...options.headers,
    },
  });
}

type UserInfo = {
  role: "teacher" | "student";
  userId: string;
  name: string;
  studentId: number | null;
};

async function fetchCurrentUser(): Promise<UserInfo | null> {
  const token = getToken();
  if (!token) return null;
  const res = await apiFetch("/api/auth/me");
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
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(error.error || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("session_token", data.token);
      return data as UserInfo;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("session_token");
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
