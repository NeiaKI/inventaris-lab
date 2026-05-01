"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearSession } from "@/lib/auth";
import { LayoutDashboard, FlaskConical, Package, Users, ClipboardList, LogOut, AlertTriangle, X, Settings, BarChart3, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLostReports, useAlerts } from "@/lib/store";
import { NotificationBell } from "./notification-bell";
import { useLang } from "@/lib/lang";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [lostReports] = useLostReports();
  const [alerts] = useAlerts();
  const { t } = useLang();
  const newLostCount = lostReports.filter((r) => r.status === "baru").length;
  const alertCount = alerts.length;

  const handleLogout = () => { clearSession(); router.push("/"); };

  const navItems = [
    { href: "/admin/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, badge: alertCount + newLostCount },
    { href: "/admin/labs", label: t.nav.labs, icon: FlaskConical, badge: 0 },
    { href: "/admin/items", label: t.nav.items, icon: Package, badge: 0 },
    { href: "/admin/classes", label: t.nav.classes, icon: Users, badge: 0 },
    { href: "/admin/sessions", label: t.nav.sessions, icon: ClipboardList, badge: 0 },
    { href: "/admin/lost-reports", label: t.nav.lostReports, icon: AlertTriangle, badge: newLostCount },
    { href: "/admin/schedule", label: t.nav.schedule, icon: CalendarDays, badge: 0 },
    { href: "/admin/stats", label: t.nav.stats, icon: BarChart3, badge: 0 },
    { href: "/admin/settings", label: t.nav.settings, icon: Settings, badge: 0 },
  ];

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay sidebar with slide transition
        "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out",
        "lg:static lg:translate-x-0 lg:transition-none lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "flex flex-col w-64 min-h-screen text-white"
      )}
      style={{ backgroundColor: "#111827" }}
    >
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #374151" }}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">{t.nav.appName}</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{t.nav.schoolName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell variant="sidebar" />
          {/* Close button — mobile only */}
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 rounded" style={{ color: "#9ca3af" }} aria-label="Tutup menu">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href ? "bg-blue-600 text-white" : "text-[#d1d5db] hover:text-white"
            )}
            style={pathname !== href ? undefined : undefined}
            onMouseEnter={(e) => { if (pathname !== href) (e.currentTarget as HTMLElement).style.backgroundColor = "#1f2937"; }}
            onMouseLeave={(e) => { if (pathname !== href) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid #374151" }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">A</div>
          <div className="text-sm">
            <p className="font-medium">Admin</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{t.nav.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start hover:text-white" style={{ color: "#9ca3af" }} onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t.common.logout}
        </Button>
      </div>
    </aside>
  );
}
