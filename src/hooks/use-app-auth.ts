import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const AUTH_QUERY_KEY = ["auth", "me"];

type UserInfo = {
  role: "teacher" | "student";
  userId: string;
  name: string;
  studentId: number | null;
};

// Mock credentials - only these can login
const VALID_CREDENTIALS: Record<string, { password: string; role: "teacher" | "student"; name: string }> = {
  "TEACHER-001": { password: "password123", role: "teacher", name: "Dr. Sharma" },
  "STU-001": { password: "password123", role: "student", name: "Arjun" },
  "STU-002": { password: "password123", role: "student", name: "Priya" },
};

async function fetchCurrentUser(): Promise<UserInfo | null> {
  const stored = localStorage.getItem("auth_user");
  return stored ? JSON.parse(stored) : null;
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
      const cred = VALID_CREDENTIALS[body.userId];
      if (!cred || cred.password !== body.password || cred.role !== body.role) {
        throw new Error("Invalid credentials");
      }
      const userData: UserInfo = {
        userId: body.userId,
        role: body.role,
        name: cred.name,
        studentId: body.role === "student" ? parseInt(body.userId.split("-")[1]) : null,
      };
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return { ...userData, success: true };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth_user");
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
