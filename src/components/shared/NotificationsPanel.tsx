// src/components/shared/NotificationsPanel.tsx
import { useEffect, useRef } from "react";
import { CreditCard, UserPlus, Bell, CheckCheck, Clock } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)         return "agora mesmo";
  if (diff < 3600)       return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400)      return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7)  return `há ${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("pt-MZ");
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "payment_recorded":
      return (
        <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <CreditCard className="h-4 w-4 text-emerald-600" />
        </div>
      );
    case "enrollment_created":
      return (
        <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <UserPlus className="h-4 w-4 text-blue-600" />
        </div>
      );
    default:
      return (
        <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="h-4 w-4 text-slate-500" />
        </div>
      );
  }
}

export function NotificationsPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute top-12 right-0 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      style={{ maxHeight: "420px" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#004B87] to-[#0066B3]">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Notificações</h3>
          {unreadCount > 0 && (
            <span className="h-5 px-1.5 bg-[#F5821F] text-white text-[10px] font-bold rounded-full leading-5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-blue-200 hover:text-white transition-colors font-medium"
            title="Marcar todas como lidas"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Todas lidas
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-200" />
            <p className="text-sm">Sem notificações</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && onMarkRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
                idx < notifications.length - 1 ? "border-b border-slate-50" : ""
              } ${
                n.is_read
                  ? "bg-white hover:bg-slate-50"
                  : "bg-blue-50/50 hover:bg-blue-50"
              }`}
            >
              <NotificationIcon type={n.type} />

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug truncate ${n.is_read ? "text-slate-500" : "text-slate-800 font-semibold"}`}>
                  {n.title}
                </p>
                {n.message && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.message}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-slate-300" />
                  <span className="text-[10px] text-slate-400">{timeAgo(n.created_at)}</span>
                  {!n.is_read && (
                    <span className="ml-1 h-1.5 w-1.5 bg-[#004B87] rounded-full inline-block" />
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
