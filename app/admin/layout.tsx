"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Menu, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { clearSession(); router.push("/"); };

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
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="flex-1 font-semibold text-gray-800 text-sm">Inventaris Lab</span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
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
