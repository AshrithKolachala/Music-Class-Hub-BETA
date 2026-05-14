import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getStudents,
  createStudent,
  deleteStudent,
  changeStudentPassword,
  type Student,
} from "@/lib/db/students";

const STUDENTS_KEY = ["students"];

export function useAppStudents() {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: STUDENTS_KEY,
    queryFn: getStudents,
  });

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: { name: string; instrument: string } }) => {
      return createStudent(data.name, data.instrument);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      return deleteStudent(studentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });

  const changePassword = async (studentId: string, newPassword: string) => {
    await changeStudentPassword(studentId, newPassword);
    await queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
  };

  return {
    students,
    isLoading,
    createStudent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteStudent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    changeStudentPassword: changePassword,
  };
}
