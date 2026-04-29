"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, TriangleAlert, PackageX, CheckCheck, X } from "lucide-react";
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
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  variant?: "sidebar" | "header";
  onNotifSeen?: () => void;
}

export function NotificationBell({ variant = "sidebar", onNotifSeen }: Props) {
  const [alerts] = useAlerts();
  const [lostReports] = useLostReports();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastSeen(getLastSeen());
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
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

  const items: NotifItem[] = [
    ...alerts.map((a): NotifItem => ({ kind: "alert", data: a })),
    ...lostReports
      .filter((r) => r.status === "baru")
      .map((r): NotifItem => ({ kind: "lost", data: r })),
  ].sort((a, b) => {
    const ta = a.data.created_at;
    const tb = b.data.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const DROPDOWN_W = 320;
    const margin = 8;

    // Position below the button, aligned left but clamped to viewport
    let left = rect.left;
    if (left + DROPDOWN_W > window.innerWidth - margin) {
      left = window.innerWidth - DROPDOWN_W - margin;
    }

    setDropdownPos({ top: rect.bottom + 6, left });
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
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100";

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
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: 320 }}
          className="fixed z-[9999] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-sm text-gray-800">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tandai dibaca
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Tidak ada peringatan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.slice(0, 10).map((item) => {
                  if (item.kind === "alert") {
                    const a = item.data;
                    const unread = isNew(a.created_at);
                    const isRusak = a.type === "rusak";
                    return (
                      <div
                        key={`alert-${a.id}`}
                        className={`flex gap-3 px-4 py-3 ${unread ? (isRusak ? "bg-yellow-50" : "bg-red-50") : "bg-white hover:bg-gray-50"} transition-colors`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full ${isRusak ? "bg-yellow-100" : "bg-red-100"}`}>
                          <TriangleAlert className={`h-3.5 w-3.5 ${isRusak ? "text-yellow-600" : "text-red-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {isRusak ? "Barang Rusak" : "Selisih Barang"}
                            </p>
                            {unread && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {a.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">{fmt(a.created_at)}</p>
                        </div>
                      </div>
                    );
                  } else {
                    const r = item.data;
                    const unread = isNew(r.created_at);
                    return (
                      <div
                        key={`lost-${r.id}`}
                        className={`flex gap-3 px-4 py-3 ${unread ? "bg-orange-50" : "bg-white hover:bg-gray-50"} transition-colors`}
                      >
                        <div className="mt-0.5 flex-shrink-0 p-1.5 rounded-full bg-orange-100">
                          <PackageX className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-800">Laporan Barang Hilang</p>
                            {unread && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          {r.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {r.description}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">{fmt(r.created_at)}</p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>

          {items.length > 10 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">
                +{items.length - 10} peringatan lainnya di Dashboard
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
