"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, KeyRound, Eye, EyeOff } from "lucide-react";
import { useClasses } from "@/lib/store";
import type { ClassAccount } from "@/lib/types";

type FormState = Omit<ClassAccount, "id">;
const EMPTY: FormState = { name: "", username: "", password: "" };

export default function ClassesPage() {
  const [classes, setClasses] = useClasses();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editing, setEditing] = useState<ClassAccount | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassAccount | null>(null);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowPass(false); setOpen(true); };
  const openEdit = (c: ClassAccount) => { setEditing(c); setForm({ name: c.name, username: c.username, password: c.password }); setShowPass(false); setOpen(true); };
  const openReset = (c: ClassAccount) => { setEditing(c); setNewPassword(""); setResetOpen(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return;
    if (editing) {
      setClasses((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setClasses((prev) => [...prev, { id: Date.now(), ...form }]);
    }
    setOpen(false);
  };

  const handleReset = () => {
    if (!newPassword.trim() || !editing) return;
    setClasses((prev) => prev.map((c) => c.id === editing.id ? { ...c, password: newPassword } : c));
    setResetOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Akun Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola akun login untuk Ketua Kelas</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Tambah Kelas</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-10">Belum ada akun kelas.</TableCell></TableRow>}
              {classes.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-gray-600 font-mono text-sm">{c.username}</TableCell>
                  <TableCell><span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-500">{"•".repeat(Math.min(c.password.length, 8))}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openReset(c)} title="Reset Password"><KeyRound className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit Akun Kelas" : "Tambah Akun Kelas Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nama Kelas</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="cth. X RPL 1" /></div>
            <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="cth. x-rpl-1" /></div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Masukkan password" />
                <button type="button" className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Reset Password — {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Password Baru</Label>
            <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Masukkan password baru" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Batal</Button>
            <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700">Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Hapus Akun Kelas</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Hapus akun <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
