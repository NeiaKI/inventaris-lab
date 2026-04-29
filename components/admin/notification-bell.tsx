"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, TriangleAlert, X, CheckCheck } from "lucide-react";
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

function fmt(dt: string) {
  return new Date(dt).toLocaleString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  /** "sidebar" renders white icon on dark bg; "header" renders gray icon on white bg */
  variant?: "sidebar" | "header";
  onNotifSeen?: () => void;
}

export function NotificationBell({ variant = "sidebar", onNotifSeen }: Props) {
  const [alerts] = useAlerts();
  const [lostReports] = useLostReports();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastSeen(getLastSeen());
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isNew = (dt: string) => new Date(dt).getTime() > lastSeen;

  const unreadAlerts = alerts.filter((a) => isNew(a.created_at));
  const unreadLost = lostReports.filter(
    (r) => r.status === "baru" && isNew(r.created_at)
  );
  const unreadCount = unreadAlerts.length + unreadLost.length;

  // Merge and sort newest first
  const items: NotifItem[] = [
    ...alerts.map((a): NotifItem => ({ kind: "alert", data: a })),
    ...lostReports
      .filter((r) => r.status === "baru")
      .map((r): NotifItem => ({ kind: "lost", data: r })),
  ].sort((a, b) => {
    const ta = a.kind === "alert" ? a.data.created_at : a.data.created_at;
    const tb = b.kind === "alert" ? b.data.created_at : b.data.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  const handleMarkRead = useCallback(() => {
    markAllSeen();
    setLastSeen(Date.now());
    onNotifSeen?.();
  }, [onNotifSeen]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const iconClass =
    variant === "sidebar"
      ? "text-gray-300 hover:text-white hover:bg-gray-700"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className={`relative p-1.5 rounded-lg transition-colors ${iconClass}`}
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white overflow-hidden
            ${variant === "sidebar" ? "left-0 top-9" : "right-0 top-9"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-sm text-gray-800">
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai dibaca
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Tidak ada peringatan.
              </div>
            ) : (
              items.slice(0, 10).map((item) => {
                if (item.kind === "alert") {
                  const a = item.data;
                  const unread = isNew(a.created_at);
                  return (
                    <div
                      key={`alert-${a.id}`}
                      className={`px-4 py-3 ${unread ? "bg-red-50" : "bg-white"}`}
                    >
                      <div className="flex items-start gap-2">
                        <TriangleAlert className={`h-4 w-4 shrink-0 mt-0.5 ${a.type === "rusak" ? "text-yellow-500" : "text-red-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">
                            {a.type === "selisih" ? "Selisih Barang" : "Barang Rusak"}
                            {unread && (
                              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 align-middle" />
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{a.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{fmt(a.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const r = item.data;
                  const unread = isNew(r.created_at);
                  return (
                    <div
                      key={`lost-${r.id}`}
                      className={`px-4 py-3 ${unread ? "bg-orange-50" : "bg-white"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base leading-none shrink-0 mt-0.5">📦</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">
                            Laporan Barang Hilang
                            {unread && (
                              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle" />
                            )}
                          </p>
                          {r.description && (
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{r.description}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">{fmt(r.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
              })
            )}
          </div>

          {items.length > 10 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">+{items.length - 10} peringatan lainnya di Dashboard</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
