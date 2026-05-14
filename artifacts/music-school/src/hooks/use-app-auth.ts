import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { login, logout, getCurrentUser, type UserInfo } from "@/lib/db/auth";

const AUTH_QUERY_KEY = ["auth", "me"];

export function useAppAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<UserInfo | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (body: { userId: string; password: string; role: "teacher" | "student" }) => {
      return login(body.userId, body.password, body.role);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      window.location.href = import.meta.env.BASE_URL || "/";
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
