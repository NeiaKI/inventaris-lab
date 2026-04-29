"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FlaskConical, QrCode, Download } from "lucide-react";
import { useLabs } from "@/lib/store";
import { toast } from "sonner";
import type { Lab } from "@/lib/types";
import QRCode from "qrcode";

const EMPTY = { name: "", location: "" };

function QRModal({ lab, onClose }: { lab: Lab; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/?lab=${encodeURIComponent(lab.name)}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 280, margin: 2 }, (err) => {
        if (err) console.error(err);
      });
    }
  }, [url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `qr-${lab.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-500" />
            QR Code — {lab.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-gray-400 text-center break-all max-w-xs">{url}</p>
          <p className="text-sm text-gray-500 text-center">Scan QR ini untuk langsung menuju halaman login {lab.name}.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="h-4 w-4" />
            Unduh PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LabsPage() {
  const [labs, setLabs] = useLabs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Lab | null>(null);
  const [qrLab, setQrLab] = useState<Lab | null>(null);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (lab: Lab) => { setEditing(lab); setForm({ name: lab.name, location: lab.location }); setOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setLabs((prev) => prev.map((l) => l.id === editing.id ? { ...l, ...form } : l));
      toast.success("Lab diperbarui", { description: `${form.name} berhasil disimpan.` });
    } else {
      setLabs((prev) => [...prev, { id: Date.now(), ...form, created_at: new Date().toISOString().slice(0, 10) }]);
      toast.success("Lab ditambahkan", { description: `${form.name} berhasil ditambahkan.` });
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setLabs((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    toast.success("Lab dihapus", { description: `${deleteTarget.name} telah dihapus.` });
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratorium</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola daftar ruang laboratorium komputer</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />Tambah Lab
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Nama Lab</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-10">Belum ada data lab.</TableCell></TableRow>
              )}
              {labs.map((lab, idx) => (
                <TableRow key={lab.id}>
                  <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{lab.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{lab.location || "-"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{lab.created_at}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setQrLab(lab)} title="QR Code">
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(lab)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(lab)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {qrLab && <QRModal lab={qrLab} onClose={() => setQrLab(null)} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit Lab" : "Tambah Lab Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="lab-name">Nama Lab</Label>
              <Input id="lab-name" placeholder="cth. Lab Komputer 1" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lab-location">Lokasi</Label>
              <Input id="lab-location" placeholder="cth. Gedung A, Lantai 2" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Hapus Lab</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Hapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
