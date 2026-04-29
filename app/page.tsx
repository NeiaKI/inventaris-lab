"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FlaskConical, Loader2 } from "lucide-react";
import { loginAsync, saveSession, getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { MOCK_CLASSES } from "@/lib/mock-data";
import type { ClassAccount } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassAccount[]>(MOCK_CLASSES);

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      router.replace(existing.role === "admin" ? "/admin/dashboard" : "/kelas/labs");
      return;
    }
    supabase
      .from("classes")
      .select("id, name, username")
      .then(({ data }) => {
        if (data && data.length > 0) setClasses(data as ClassAccount[]);
      });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { setError("Pilih nama kelas terlebih dahulu."); return; }
    if (!password) { setError("Password tidak boleh kosong."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await loginAsync(selected, password);
      setLoading(false);
      if (!user) { setError("Username atau password salah."); return; }
      saveSession(user);
      router.push("/kelas/labs");
    } catch {
      setLoading(false);
      setError("Terlalu banyak percobaan. Tunggu 1 menit dan coba lagi.");
    }
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
              <Label htmlFor="username">Nama Kelas</Label>
              <Select value={selected} onValueChange={(v) => { setSelected(v ?? ""); setError(""); }}>
                <SelectTrigger id="username">
                  <SelectValue placeholder="-- Pilih nama kelas --" />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memuat...</> : "Masuk"}
            </Button>
          </form>
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Login sebagai Admin / Kepala Lab →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
