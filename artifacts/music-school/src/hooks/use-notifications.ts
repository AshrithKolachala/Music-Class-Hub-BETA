import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  type AppNotification,
} from "@/lib/db/notifications";
import { useAppAuth } from "@/hooks/use-app-auth";

export function useNotifications() {
  const { user } = useAppAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.studentId) return;
    try {
      const data = await getNotifications(user.studentId);
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.studentId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (notifId: string) => {
    await markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user?.studentId) return;
    await markAllRead(user.studentId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, loading, markRead: handleMarkRead, markAllRead: handleMarkAllRead };
}
