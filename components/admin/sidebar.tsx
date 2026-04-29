"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearSession } from "@/lib/auth";
import { LayoutDashboard, FlaskConical, Package, Users, ClipboardList, LogOut, AlertTriangle, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLostReports } from "@/lib/store";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [lostReports] = useLostReports();
  const newLostCount = lostReports.filter((r) => r.status === "baru").length;

  const handleLogout = () => { clearSession(); router.push("/"); };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { href: "/admin/labs", label: "Laboratorium", icon: FlaskConical, badge: 0 },
    { href: "/admin/items", label: "Master Barang", icon: Package, badge: 0 },
    { href: "/admin/classes", label: "Akun Kelas", icon: Users, badge: 0 },
    { href: "/admin/sessions", label: "Log Sesi", icon: ClipboardList, badge: 0 },
    { href: "/admin/lost-reports", label: "Barang Hilang", icon: AlertTriangle, badge: newLostCount },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings, badge: 0 },
  ];

  return (
    <aside
      className={cn(
        // Mobile: fixed overlay sidebar with slide transition
        "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out",
        "lg:static lg:translate-x-0 lg:transition-none lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "flex flex-col w-64 min-h-screen bg-gray-900 text-white"
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">Inventaris Lab</p>
            <p className="text-xs text-gray-400">SMK Bintang Nusantara</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-700 text-gray-400" aria-label="Tutup menu">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
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

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">A</div>
          <div className="text-sm">
            <p className="font-medium">Admin</p>
            <p className="text-xs text-gray-400">Kepala Laboratorium</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
