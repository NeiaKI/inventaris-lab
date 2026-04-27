"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FlaskConical } from "lucide-react";
import { login, saveSession, getSession } from "@/lib/auth";
import { MOCK_CLASSES } from "@/lib/mock-data";
import type { ClassAccount } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<ClassAccount[]>(MOCK_CLASSES);

  useEffect(() => {
    const existing = getSession();
    if (existing) router.replace(existing.role === "admin" ? "/admin/dashboard" : "/kelas/labs");
    try {
      const stored = localStorage.getItem("inv_classes");
      if (stored) setClasses(JSON.parse(stored));
    } catch {}
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError("Pilih nama kelas atau Admin terlebih dahulu."); return; }
    if (!password) { setError("Password tidak boleh kosong."); return; }
    const user = login(selected, password, classes);
    if (!user) { setError("Username atau password salah."); return; }
    saveSession(user);
    router.push(user.role === "admin" ? "/admin/dashboard" : "/kelas/labs");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <FlaskConical className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Inventaris Lab</CardTitle>
          <CardDescription>SMK Bintang Nusantara — Sistem Informasi Laboratorium Komputer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nama Kelas / Admin</Label>
              <Select value={selected} onValueChange={(v) => { setSelected(v ?? ""); setError(""); }}>
                <SelectTrigger id="username">
                  <SelectValue placeholder="-- Pilih nama kelas --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">🔑 Admin / Kepala Lab</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.username}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Masuk</Button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Demo: Admin → admin123 &nbsp;|&nbsp; Kelas → kelas123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
