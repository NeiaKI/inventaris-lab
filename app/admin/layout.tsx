"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { NotificationBell } from "@/components/admin/notification-bell";
import { Menu, LogOut } from "lucide-react";
import { useAlerts, useLostReports } from "@/lib/store";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts] = useAlerts();
  const [lostReports] = useLostReports();

  const handleLogout = () => { clearSession(); router.push("/"); };

  // Show toast once per login session if there are unread notifications
  useEffect(() => {
    if (status !== "authed") return;
    const shown = sessionStorage.getItem("admin_notif_toast_shown");
    if (shown) return;
    const lastSeen = Number(localStorage.getItem("admin_alerts_last_seen") ?? "0");
    const unreadAlerts = alerts.filter((a) => new Date(a.created_at).getTime() > lastSeen);
    const unreadLost = lostReports.filter((r) => r.status === "baru" && new Date(r.created_at).getTime() > lastSeen);
    const total = unreadAlerts.length + unreadLost.length;
    if (total > 0) {
      sessionStorage.setItem("admin_notif_toast_shown", "1");
      toast.warning(`${total} peringatan baru`, {
        description: "Ada selisih, kerusakan, atau laporan barang yang belum ditinjau.",
        duration: 6000,
      });
    }
  }, [status, alerts, lostReports]);

  useEffect(() => {
    const u = getSession();
    if (u?.role === "admin") {
      setStatus("authed");
    } else {
      setStatus("unauthed");
      if (pathname !== "/admin") router.replace("/admin");
    }
  }, [router, pathname]);

  // Close sidebar on route change (mobile nav)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (status === "loading") return null;
  if (status === "unauthed") return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="flex-1 font-semibold text-gray-800 dark:text-gray-100 text-sm">Inventaris Lab</span>
          <NotificationBell variant="header" />
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
