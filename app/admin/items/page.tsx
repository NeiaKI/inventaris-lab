"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { useItems, useLabs } from "@/lib/store";
import { toast } from "sonner";
import type { LabItem } from "@/lib/types";

type FormState = Omit<LabItem, "id">;
const EMPTY: FormState = { lab_id: 0, name: "", category: "", initial_quantity: 0, functional_quantity: 0 };

export default function ItemsPage() {
  const [items, setItems] = useItems();
  const [labs] = useLabs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LabItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filterLab, setFilterLab] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<LabItem | null>(null);

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);
  const filtered = useMemo(() => filterLab === "all" ? items : items.filter((i) => i.lab_id === Number(filterLab)), [items, filterLab]);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, lab_id: labs[0]?.id ?? 0 }); setOpen(true); };
  const openEdit = (item: LabItem) => { setEditing(item); setForm({ lab_id: item.lab_id, name: item.name, category: item.category, initial_quantity: item.initial_quantity, functional_quantity: item.functional_quantity }); setOpen(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.lab_id) return;
    if (editing) {
      setItems((prev) => prev.map((i) => i.id === editing.id ? { ...i, ...form } : i));
      toast.success("Barang diperbarui", { description: `${form.name} berhasil disimpan.` });
    } else {
      setItems((prev) => [...prev, { id: Date.now(), ...form }]);
      toast.success("Barang ditambahkan", { description: `${form.name} berhasil ditambahkan.` });
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success("Barang dihapus", { description: `${deleteTarget.name} telah dihapus.` });
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Barang</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola inventaris aset di setiap laboratorium</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Tambah Barang</Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Label className="text-sm text-gray-600 whitespace-nowrap">Filter Lab:</Label>
        <Select value={filterLab} onValueChange={(v) => setFilterLab(v ?? "all")}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Semua Lab" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lab</SelectItem>
            {labs.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-400">{filtered.length} item</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lab</TableHead>
                <TableHead className="text-center">Jml Awal</TableHead>
                <TableHead className="text-center">Berfungsi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-10">Belum ada data barang.</TableCell></TableRow>}
              {filtered.map((item) => {
                const hasIssue = item.functional_quantity < item.initial_quantity;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell className="text-gray-600 text-sm">{labMap[item.lab_id] ?? "-"}</TableCell>
                    <TableCell className="text-center">{item.initial_quantity}</TableCell>
                    <TableCell className="text-center"><span className={hasIssue ? "text-red-600 font-semibold" : "text-gray-700"}>{item.functional_quantity}</span></TableCell>
                    <TableCell className="text-center">
                      {hasIssue
                        ? <Badge variant="destructive" className="text-xs gap-1"><TriangleAlert className="h-3 w-3" />Selisih {item.initial_quantity - item.functional_quantity}</Badge>
                        : <Badge className="bg-green-100 text-green-700 text-xs">Normal</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editing ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Laboratorium</Label>
              <Select value={String(form.lab_id)} onValueChange={(v) => setForm((p) => ({ ...p, lab_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Pilih lab" /></SelectTrigger>
                <SelectContent>{labs.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Nama Barang</Label>
                <Input id="item-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="cth. PC / Komputer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-category">Kategori</Label>
                <Input id="item-category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="cth. Hardware" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-initial">Jumlah Awal</Label>
                <Input id="item-initial" type="number" min={0} value={form.initial_quantity} onChange={(e) => setForm((p) => ({ ...p, initial_quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-functional">Jumlah Berfungsi</Label>
                <Input id="item-functional" type="number" min={0} value={form.functional_quantity} onChange={(e) => setForm((p) => ({ ...p, functional_quantity: Number(e.target.value) }))} />
              </div>
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
          <DialogHeader><DialogTitle>Hapus Barang</DialogTitle></DialogHeader>
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
