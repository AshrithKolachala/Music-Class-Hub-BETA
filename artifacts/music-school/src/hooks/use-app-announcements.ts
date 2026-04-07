import { useQueryClient } from "@tanstack/react-query";
import {
  useListAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  getListAnnouncementsQueryKey
} from "@workspace/api-client-react";

export function useAppAnnouncements() {
  const queryClient = useQueryClient();
  const queryKey = getListAnnouncementsQueryKey();

  const { data: announcements = [], isLoading } = useListAnnouncements();

  const createMutation = useCreateAnnouncement({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  const deleteMutation = useDeleteAnnouncement({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    }
  });

  return {
    announcements,
    isLoading,
    createAnnouncement: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteAnnouncement: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
