import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/lib/db/announcements";

const ANNOUNCEMENTS_KEY = ["announcements"];

export function useAppAnnouncements() {
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ANNOUNCEMENTS_KEY,
    queryFn: getAnnouncements,
  });

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: { title: string; content: string; isPinned: boolean } }) =>
      createAnnouncement(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ announcementId }: { announcementId: string }) =>
      deleteAnnouncement(announcementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY }),
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
