import { useQuery, useMutation } from '@tanstack/react-query';

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
  id: string;
  name: string;
  email: string;
}

// Query Keys
export const getListClassesQueryKey = () => ['classes'];
export const getListAnnouncementsQueryKey = () => ['announcements'];
export const getListStudentsQueryKey = () => ['students'];

// Hooks - with mock/stub implementations
export function useListClasses() {
  return useQuery({
    queryKey: getListClassesQueryKey(),
    queryFn: async () => {
      try {
        const res = await fetch('/api/classes');
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateClass(options?: any) {
  return useMutation({
    mutationFn: async (data: Partial<Class>) => {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create class');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useUpdateClass(options?: any) {
  return useMutation({
    mutationFn: async ({ classId, data }: { classId: number; data: Partial<Class> }) => {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update class');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteClass(options?: any) {
  return useMutation({
    mutationFn: async (classId: number) => {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete class');
    },
    ...options?.mutation,
  });
}

export function useListAnnouncements() {
  return useQuery({
    queryKey: getListAnnouncementsQueryKey(),
    queryFn: async () => {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAnnouncement(options?: any) {
  return useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteAnnouncement(options?: any) {
  return useMutation({
    mutationFn: async (announcementId: number) => {
      const res = await fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete announcement');
    },
    ...options?.mutation,
  });
}

export function useListStudents() {
  return useQuery({
    queryKey: getListStudentsQueryKey(),
    queryFn: async () => {
      try {
        const res = await fetch('/api/students');
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateStudent(options?: any) {
  return useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create student');
      return res.json();
    },
    ...options?.mutation,
  });
}

export function useDeleteStudent(options?: any) {
  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
    },
    ...options?.mutation,
  });
}
