"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useAlerts, useLostReports } from "@/lib/store";
import type { Alert, LostItemReport } from "@/lib/types";

const LS_KEY = "admin_alerts_last_seen";

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(LS_KEY) ?? "0");
}

function markAllSeen() {
  localStorage.setItem(LS_KEY, String(Date.now()));
}

type NotifItem =
  | { kind: "alert"; data: Alert }
  | { kind: "lost"; data: LostItemReport };

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

const TYPE_META = {
  selisih: { label: "Selisih", dot: "bg-red-400", border: "border-l-red-400", badge: "text-red-500" },
  rusak:   { label: "Rusak",   dot: "bg-amber-400", border: "border-l-amber-400", badge: "text-amber-500" },
  lost:    { label: "Hilang",  dot: "bg-orange-400", border: "border-l-orange-400", badge: "text-orange-500" },
};

interface Props {
  variant?: "sidebar" | "header";
  onNotifSeen?: () => void;
}

export function NotificationBell({ variant = "sidebar", onNotifSeen }: Props) {
  const [alerts] = useAlerts();
  const [lostReports] = useLostReports();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLastSeen(getLastSeen()); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current?.contains(e.target as Node) === false &&
        btnRef.current?.contains(e.target as Node) === false
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isNew = (dt: string) => new Date(dt).getTime() > lastSeen;

  const items: NotifItem[] = [
    ...alerts.map((a): NotifItem => ({ kind: "alert", data: a })),
    ...lostReports.filter((r) => r.status === "baru").map((r): NotifItem => ({ kind: "lost", data: r })),
  ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());

  const unreadCount = items.filter((it) => isNew(it.data.created_at)).length;

  const handleOpen = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const W = 304;
    const left = Math.min(r.left, window.innerWidth - W - 8);
    setPos({ top: r.bottom + 6, left });
    setOpen((v) => !v);
  };

  const handleMarkRead = useCallback(() => {
    markAllSeen();
    setLastSeen(Date.now());
    setOpen(false);
    onNotifSeen?.();
  }, [onNotifSeen]);

  const iconCls =
    variant === "sidebar"
      ? "text-gray-300 hover:text-white hover:bg-gray-700"
      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100";

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`relative p-1.5 rounded-lg transition-colors ${iconCls}`}
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full h-[14px] min-w-[14px] px-0.5 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{ top: pos.top, left: pos.left, width: 304 }}
          className="fixed z-[9999] rounded-xl shadow-xl border border-gray-100 bg-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-gray-400">{unreadCount} belum dibaca</span>
              )}
            </span>
            <div className="flex items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  title="Tandai semua dibaca"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                <Bell className="h-7 w-7" />
                <p className="text-xs">Tidak ada peringatan</p>
              </div>
            ) : (
              items.slice(0, 10).map((item) => {
                const unread = isNew(item.data.created_at);

                if (item.kind === "alert") {
                  const a = item.data;
                  const meta = TYPE_META[a.type] ?? TYPE_META.selisih;
                  return (
                    <div
                      key={`a-${a.id}`}
                      className={`border-l-2 ${meta.border} px-4 py-3 hover:bg-gray-50 transition-colors ${unread ? "bg-gray-50/60" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] font-semibold uppercase tracking-wide ${meta.badge}`}>
                            {meta.label}
                          </span>
                          {unread && <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{timeAgo(a.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{a.message}</p>
                    </div>
                  );
                } else {
                  const r = item.data;
                  const meta = TYPE_META.lost;
                  return (
                    <div
                      key={`l-${r.id}`}
                      className={`border-l-2 ${meta.border} px-4 py-3 hover:bg-gray-50 transition-colors ${unread ? "bg-gray-50/60" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-semibold uppercase tracking-wide ${meta.badge}`}>
                            {meta.label}
                          </span>
                          {unread && <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{timeAgo(r.created_at)}</span>
                      </div>
                      {r.description && (
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{r.description}</p>
                      )}
                    </div>
                  );
                }
              })
            )}
          </div>

          {items.length > 10 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400">+{items.length - 10} lainnya di Dashboard</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
