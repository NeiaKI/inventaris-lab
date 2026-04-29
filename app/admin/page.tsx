"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FlaskConical, ShieldCheck, Loader2 } from "lucide-react";
import { loginAsync, saveSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Username dan password tidak boleh kosong."); return; }
    setLoading(true);
    setError("");
    const user = await loginAsync(username, password);
    setLoading(false);
    if (!user || user.role !== "admin") { setError("Username atau password salah."); return; }
    saveSession(user);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-5">
          <div className="flex justify-center">
            <div className="bg-gray-900 text-white p-3 rounded-xl">
              <FlaskConical className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">Portal Admin</CardTitle>
          <CardDescription>SMK Bintang Nusantara — Inventaris Lab</CardDescription>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Akses Khusus Kepala Laboratorium
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                autoComplete="username"
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-700 mt-1">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memuat...</> : "Masuk sebagai Admin"}
            </Button>
          </form>
          <p className="text-center mt-5">
            <Link href="/" className="text-blue-600 hover:underline text-sm">← Kembali ke Login Kelas</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
