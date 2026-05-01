"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth";
import { FlaskConical, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/types";

export default function KelasLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getSession();
    if (!u || u.role !== "kelas") { router.replace("/"); return; }
    setUser(u);
  }, [router]);

  const handleLogout = () => { clearSession(); router.push("/"); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <Link href="/kelas/labs" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg"><FlaskConical className="h-4 w-4" /></div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Inventaris Lab</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">👤 <strong>{user.name}</strong></span>}
          <Link href="/kelas/history">
            <Button size="sm" variant="ghost" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100">
              <History className="h-3.5 w-3.5 mr-1.5" />Riwayat
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" />Keluar
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
