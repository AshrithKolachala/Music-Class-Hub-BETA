import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  type ClassRecord,
} from "@/lib/db/classes";
import { useAppAuth } from "@/hooks/use-app-auth";

const CLASSES_KEY = ["classes"];

export function useAppClasses() {
  const queryClient = useQueryClient();
  const { user } = useAppAuth();

  const { data: allClasses = [], isLoading } = useQuery<ClassRecord[]>({
    queryKey: CLASSES_KEY,
    queryFn: getClasses,
  });

  const classes =
    user?.role === "student"
      ? allClasses.filter(
          (c) => c.studentId === null || c.studentId === user.studentId
        )
      : allClasses;

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: any }) => createClass(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ classId, data }: { classId: string; data: any }) =>
      updateClass(classId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ classId }: { classId: string }) => deleteClass(classId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });

  return {
    classes,
    isLoading,
    createClass: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateClass: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteClass: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
