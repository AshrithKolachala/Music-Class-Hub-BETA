import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/hooks/use-app-auth';

export type ClassStatus = 'scheduled' | 'ongoing' | 'completed';

export interface Class {
  id: number;
  title: string;
  topic: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status: ClassStatus;
  studentIds: string[];
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Student {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

export const getListClassesQueryKey = () => ['classes'];
export const getListAnnouncementsQueryKey = () => ['announcements'];
export const getListStudentsQueryKey = () => ['students'];

export function useListClasses() {
  return useQuery({
    queryKey: getListClassesQueryKey(),
    queryFn: async () => {
      const res = await apiFetch('/api/classes');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateClass(options?: any) {
  return useMutation({
    mutationFn: async (data: Partial<Class>) => {
      const res = await apiFetch('/api/classes', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create class');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useUpdateClass(options?: any) {
  return useMutation({
    mutationFn: async ({ classId, data }: { classId: number; data: Partial<Class> }) => {
      const res = await apiFetch(`/api/classes/${classId}`, { method: 'PUT', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to update class');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteClass(options?: any) {
  return useMutation({
    mutationFn: async (classId: number) => {
      const res = await apiFetch(`/api/classes/${classId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete class');
    },
    ...options?.mutation,
  });
}

export function useListAnnouncements() {
  return useQuery({
    queryKey: getListAnnouncementsQueryKey(),
    queryFn: async () => {
      const res = await apiFetch('/api/announcements');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateAnnouncement(options?: any) {
  return useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await apiFetch('/api/announcements', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create announcement');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteAnnouncement(options?: any) {
  return useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await apiFetch(`/api/announcements/${announcementId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete announcement');
    },
    ...options?.mutation,
  });
}

export function useListStudents() {
  return useQuery({
    queryKey: getListStudentsQueryKey(),
    queryFn: async () => {
      const res = await apiFetch('/api/students');
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateStudent(options?: any) {
  return useMutation({
    mutationFn: async (data: { name: string; userId: string; password: string }) => {
      const res = await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create student' }));
        throw new Error(err.error || 'Failed to create student');
      }
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteStudent(options?: any) {
  return useMutation({
    mutationFn: async (studentId: number) => {
      const res = await apiFetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
    },
    ...options?.mutation,
  });
}
