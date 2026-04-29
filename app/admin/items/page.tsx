"use client";

import { useRef, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, TriangleAlert, Upload, Download } from "lucide-react";
import { useItems, useLabs } from "@/lib/store";
import { toast } from "sonner";
import type { LabItem } from "@/lib/types";

type FormState = Omit<LabItem, "id">;
const EMPTY: FormState = { lab_id: 0, name: "", category: "", initial_quantity: 0, functional_quantity: 0 };

const CSV_TEMPLATE = `nama_lab,nama_barang,kategori,jumlah_awal,jumlah_berfungsi
Lab Komputer 1,PC / Komputer,Hardware,20,20
Lab Komputer 1,Monitor,Hardware,20,20`;

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-import-barang.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ItemsPage() {
  const [items, setItems] = useItems();
  const [labs] = useLabs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LabItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filterLab, setFilterLab] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<LabItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<FormState[]>([]);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);
  const labNameMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.name.toLowerCase(), l.id])), [labs]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.trim().split(/\r?\n/).slice(1); // skip header
      const rows: FormState[] = [];
      const errors: string[] = [];
      lines.forEach((line, idx) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 5) { errors.push(`Baris ${idx + 2}: kurang kolom`); return; }
        const [labName, name, category, initialStr, functionalStr] = cols;
        const lab_id = labNameMap[labName.toLowerCase()];
        if (!lab_id) { errors.push(`Baris ${idx + 2}: lab "${labName}" tidak ditemukan`); return; }
        const initial_quantity = parseInt(initialStr);
        const functional_quantity = parseInt(functionalStr);
        if (isNaN(initial_quantity) || isNaN(functional_quantity)) { errors.push(`Baris ${idx + 2}: jumlah tidak valid`); return; }
        rows.push({ lab_id, name, category, initial_quantity, functional_quantity: Math.min(functional_quantity, initial_quantity) });
      });
      if (errors.length > 0) {
        setImportError(errors.slice(0, 3).join("; ") + (errors.length > 3 ? ` ... (${errors.length} error)` : ""));
        setImportRows([]);
      } else {
        setImportError("");
        setImportRows(rows);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportConfirm = () => {
    if (importRows.length === 0) return;
    const now = Date.now();
    setItems((prev) => [...prev, ...importRows.map((r, i) => ({ id: now + i, ...r }))]);
    toast.success(`${importRows.length} barang berhasil diimpor`);
    setImportOpen(false);
    setImportRows([]);
    setImportError("");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Barang</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola inventaris aset di setiap laboratorium</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Tambah Barang
          </Button>
        </div>
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

      {/* Add/Edit Dialog */}
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
                <Input
                  id="item-initial"
                  type="number"
                  min={0}
                  value={form.initial_quantity}
                  onChange={(e) => {
                    const initial = Math.max(0, Number(e.target.value));
                    setForm((p) => ({
                      ...p,
                      initial_quantity: initial,
                      functional_quantity: Math.min(p.functional_quantity, initial),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-functional">Jumlah Berfungsi</Label>
                <Input
                  id="item-functional"
                  type="number"
                  min={0}
                  max={form.initial_quantity}
                  value={form.functional_quantity}
                  onChange={(e) => {
                    const val = Math.min(Math.max(0, Number(e.target.value)), form.initial_quantity);
                    setForm((p) => ({ ...p, functional_quantity: val }));
                  }}
                />
                {form.functional_quantity > form.initial_quantity && (
                  <p className="text-xs text-red-500">Tidak boleh melebihi jumlah awal ({form.initial_quantity})</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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

      {/* Import CSV Dialog */}
      <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) { setImportRows([]); setImportError(""); } }}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Import Barang via CSV
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 space-y-1">
              <p className="font-medium">Format kolom CSV:</p>
              <p className="font-mono text-xs">nama_lab, nama_barang, kategori, jumlah_awal, jumlah_berfungsi</p>
              <Button variant="link" className="text-blue-600 p-0 h-auto text-xs gap-1" onClick={downloadTemplate}>
                <Download className="h-3 w-3" />
                Unduh template CSV
              </Button>
            </div>

            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Pilih File CSV
            </Button>

            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium mb-1">Error parsing CSV:</p>
                <p>{importError}</p>
              </div>
            )}

            {importRows.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{importRows.length} barang siap diimpor:</p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Nama</TableHead>
                        <TableHead className="text-xs">Lab</TableHead>
                        <TableHead className="text-xs text-center">Jml</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs py-1.5">{r.name}</TableCell>
                          <TableCell className="text-xs py-1.5 text-gray-500">{labMap[r.lab_id]}</TableCell>
                          <TableCell className="text-xs py-1.5 text-center">{r.initial_quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportRows([]); setImportError(""); }}>Batal</Button>
            <Button
              disabled={importRows.length === 0}
              onClick={handleImportConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import {importRows.length > 0 ? `(${importRows.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
