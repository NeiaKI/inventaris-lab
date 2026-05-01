"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyRound, RotateCcw, Eye, EyeOff, ShieldAlert, Loader2, Sun, Moon, Monitor, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { DEV_WA_NUMBER, DEV_NAME } from "@/lib/mock-data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleChangePassword() {
    if (newPwd.length < 4) { toast.error("Password baru minimal 4 karakter."); return; }
    if (newPwd !== confirmPwd) { toast.error("Konfirmasi password tidak cocok."); return; }
    setSavingPwd(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    setSavingPwd(false);
    if (!res.ok) { toast.error("Password saat ini salah."); return; }
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success("Password berhasil diubah.");
  }

  async function handleResetData() {
    setResetting(true);
    const res = await fetch("/api/reset", { method: "POST" });
    setResetting(false);
    setResetOpen(false);
    if (!res.ok) { toast.error("Gagal mereset data."); return; }
    toast.success("Data berhasil direset ke awal.", { description: "Halaman akan dimuat ulang..." });
    setTimeout(() => window.location.reload(), 1200);
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Pengaturan</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kelola keamanan akun dan data sistem</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
            <Monitor className="h-4 w-4 text-purple-500" />
            Tampilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Pilih tema antarmuka admin</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Light mode */}
            <button
              onClick={() => setTheme("light")}
              className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "light" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
            >
              {/* Preview */}
              <div className="bg-gray-100 p-2">
                <div className="bg-white rounded-lg p-2 space-y-1.5 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded bg-gray-800" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 rounded bg-gray-300 w-3/4" />
                      <div className="h-1 rounded bg-gray-200 w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-4 rounded bg-blue-100" />
                    <div className="h-4 rounded bg-green-100" />
                    <div className="h-4 rounded bg-purple-100" />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className={`px-3 py-2 flex items-center justify-between ${theme === "light" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                <div className="flex items-center gap-1.5">
                  <Sun className={`h-3.5 w-3.5 ${theme === "light" ? "text-blue-600" : "text-gray-500 dark:text-gray-400"}`} />
                  <span className={`text-sm font-medium ${theme === "light" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>Terang</span>
                </div>
                {theme === "light" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
            </button>

            {/* Dark mode */}
            <button
              onClick={() => setTheme("dark")}
              className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "dark" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
            >
              {/* Preview */}
              <div className="bg-gray-900 p-2">
                <div className="bg-gray-800 rounded-lg p-2 space-y-1.5 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded bg-gray-100" />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 rounded bg-gray-500 w-3/4" />
                      <div className="h-1 rounded bg-gray-600 w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-4 rounded bg-blue-900" />
                    <div className="h-4 rounded bg-green-900" />
                    <div className="h-4 rounded bg-purple-900" />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className={`px-3 py-2 flex items-center justify-between ${theme === "dark" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                <div className="flex items-center gap-1.5">
                  <Moon className={`h-3.5 w-3.5 ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>Gelap</span>
                </div>
                {theme === "dark" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
            </button>

            {/* System */}
            <button
              onClick={() => setTheme("system")}
              className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "system" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
            >
              {/* Preview — split half light / half dark */}
              <div className="p-2" style={{ background: "linear-gradient(135deg, #f3f4f6 50%, #111827 50%)" }}>
                <div className="rounded-lg p-2 space-y-1.5" style={{ background: "linear-gradient(135deg, #ffffff 50%, #1f2937 50%)" }}>
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ background: "linear-gradient(135deg, #374151 50%, #e5e7eb 50%)" }} />
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 rounded w-3/4" style={{ background: "linear-gradient(135deg, #d1d5db 50%, #4b5563 50%)" }} />
                      <div className="h-1 rounded w-1/2" style={{ background: "linear-gradient(135deg, #e5e7eb 50%, #374151 50%)" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #dbeafe 50%, #1e3a5f 50%)" }} />
                    <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #dcfce7 50%, #14532d 50%)" }} />
                    <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #f3e8ff 50%, #3b0764 50%)" }} />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className={`px-3 py-2 flex items-center justify-between ${theme === "system" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                <div className="flex items-center gap-1.5">
                  <Monitor className={`h-3.5 w-3.5 ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                  <span className={`text-sm font-medium ${theme === "system" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>Sistem</span>
                </div>
                {theme === "system" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {theme === "system" ? "Mengikuti pengaturan sistem operasi perangkat." : theme === "dark" ? "Tema gelap aktif." : "Tema terang aktif."}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-500" />
            Ganti Password Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-pwd">Password Saat Ini</Label>
            <div className="relative">
              <Input
                id="current-pwd"
                type={showPwd ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Masukkan password saat ini"
              />
              <button type="button" className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd">Password Baru</Label>
            <Input
              id="new-pwd"
              type={showPwd ? "text" : "password"}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Minimal 4 karakter"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd">Konfirmasi Password Baru</Label>
            <Input
              id="confirm-pwd"
              type={showPwd ? "text" : "password"}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!currentPwd || !newPwd || !confirmPwd || savingPwd}
            onClick={handleChangePassword}
          >
            {savingPwd ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
            Simpan Password Baru
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
            <MessageCircle className="h-4 w-4 text-green-500" />
            Hubungi Developer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
              <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{DEV_NAME}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pengembang Sistem Inventaris Lab</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">+{DEV_WA_NUMBER}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Butuh bantuan teknis, penambahan fitur, atau laporkan bug? Hubungi developer langsung melalui WhatsApp.
          </p>
          <a
            href={`https://wa.me/${DEV_WA_NUMBER}?text=Halo%20${encodeURIComponent(DEV_NAME)}%2C%20saya%20ingin%20bertanya%20mengenai%20Sistem%20Inventaris%20Lab%20SMK%20Bintang%20Nusantara.`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat via WhatsApp
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <RotateCcw className="h-4 w-4" />
            Reset Data Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Hapus semua data sesi, laporan, dan perubahan inventaris. Data akan kembali ke kondisi awal (mock data). Aksi ini tidak dapat dibatalkan.
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Semua Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Konfirmasi Reset Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-4 text-sm text-red-700 dark:text-red-200">
              Semua data akan <strong>dihapus permanen</strong>: sesi, laporan hilang, perubahan inventaris, dan log peringatan. Data kembali ke kondisi demo awal.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>Batal</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={resetting} onClick={handleResetData}>
                {resetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                Ya, Reset Sekarang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
