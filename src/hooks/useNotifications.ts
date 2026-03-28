// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from "react";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  entity_type: string | null;
  entity_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 60_000; // 60 seconds

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('access_token') || '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const intervalRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch("/api/notifications.php?limit=30", {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch {
      // silently ignore — non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchNotifications();

    // Poll every 60s
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications.php", {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify({ id }),
      });
    } catch {
      // silently ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications.php", {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify({ mark_all_read: true }),
      });
    } catch {
      // silently ignore
    }
  }, []);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh };
}
