"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyRound, RotateCcw, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { getAdminPassword, setAdminPassword } from "@/lib/auth";
import { toast } from "sonner";

const STORAGE_KEYS = [
  "inv_labs", "inv_items", "inv_classes", "inv_sessions",
  "inv_alerts", "inv_session_statuses", "inv_lost_reports",
];

export default function SettingsPage() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  function handleChangePassword() {
    if (currentPwd !== getAdminPassword()) {
      toast.error("Password saat ini salah.");
      return;
    }
    if (newPwd.length < 4) {
      toast.error("Password baru minimal 4 karakter.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    setAdminPassword(newPwd);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success("Password berhasil diubah.");
  }

  function handleResetData() {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    setResetOpen(false);
    toast.success("Data berhasil direset ke awal.", { description: "Halaman akan dimuat ulang..." });
    setTimeout(() => window.location.reload(), 1200);
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola keamanan akun dan data sistem</p>
      </div>

      {/* Ganti Password */}
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
              <button type="button" className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600" onClick={() => setShowPwd(!showPwd)}>
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
            disabled={!currentPwd || !newPwd || !confirmPwd}
            onClick={handleChangePassword}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Simpan Password Baru
          </Button>
        </CardContent>
      </Card>

      {/* Reset Data */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <RotateCcw className="h-4 w-4" />
            Reset Data Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Hapus semua data sesi, laporan, dan perubahan inventaris. Data akan kembali ke kondisi awal (mock data). Aksi ini tidak dapat dibatalkan.
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              Semua data akan <strong>dihapus permanen</strong>: sesi, laporan hilang, perubahan inventaris, dan log peringatan. Data kembali ke kondisi demo awal.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>Batal</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleResetData}>
                <RotateCcw className="h-4 w-4 mr-2" />Ya, Reset Sekarang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
