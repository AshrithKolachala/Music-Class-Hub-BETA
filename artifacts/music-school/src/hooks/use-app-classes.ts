import { useQueryClient } from "@tanstack/react-query";
import {
  useListClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  getListClassesQueryKey
} from "@workspace/api-client-react";

export function useAppClasses() {
  const queryClient = useQueryClient();
  const queryKey = getListClassesQueryKey();

  const { data: classes = [], isLoading } = useListClasses();

  const createMutation = useCreateClass({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  const updateMutation = useUpdateClass({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  const deleteMutation = useDeleteClass({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
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
