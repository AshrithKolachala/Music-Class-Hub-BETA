import { useQueryClient } from "@tanstack/react-query";
import {
  useListStudents,
  useCreateStudent,
  useDeleteStudent,
  getListStudentsQueryKey
} from "@workspace/api-client-react";

export function useAppStudents() {
  const queryClient = useQueryClient();
  const queryKey = getListStudentsQueryKey();

  const { data: students = [], isLoading } = useListStudents();

  const createMutation = useCreateStudent({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  const deleteMutation = useDeleteStudent({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  const changeStudentPassword = async (studentId: number, newPassword: string) => {
    const res = await fetch(`/api/students/${studentId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update password" }));
      throw new Error(err.error || "Failed to update password");
    }
    await queryClient.invalidateQueries({ queryKey });
    return res.json();
  };

  return {
    students,
    isLoading,
    createStudent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteStudent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    changeStudentPassword,
  };
}
