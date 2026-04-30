"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, Plus, Pencil, Trash2 } from "lucide-react";
import { useSchedules, useLabs, useClasses } from "@/lib/store";
import type { DayOfWeek, LabSchedule } from "@/lib/types";
import { toast } from "sonner";

const DAYS: DayOfWeek[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const dayColor: Record<DayOfWeek, string> = {
  Senin:   "bg-blue-100 text-blue-700 border-blue-200",
  Selasa:  "bg-purple-100 text-purple-700 border-purple-200",
  Rabu:    "bg-green-100 text-green-700 border-green-200",
  Kamis:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  Jumat:   "bg-orange-100 text-orange-700 border-orange-200",
  Sabtu:   "bg-gray-100 text-gray-600 border-gray-200",
};

const EMPTY_FORM = { lab_id: "", class_id: "", day_of_week: "" as DayOfWeek | "", start_time: "07:00", end_time: "09:00", subject: "" };

export default function SchedulePage() {
  const [schedules, setSchedules] = useSchedules();
  const [labs] = useLabs();
  const [classes] = useClasses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LabSchedule | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [filterDay, setFilterDay] = useState<DayOfWeek | "semua">("semua");
  const [deleteTarget, setDeleteTarget] = useState<LabSchedule | null>(null);

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);
  const classMap = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c.name])), [classes]);

  const displayed = useMemo(() => {
    const base = filterDay === "semua" ? schedules : schedules.filter((s) => s.day_of_week === filterDay);
    return [...base].sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time));
  }, [schedules, filterDay]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(s: LabSchedule) {
    setEditing(s);
    setForm({ lab_id: String(s.lab_id), class_id: s.class_id ? String(s.class_id) : "", day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time, subject: s.subject });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.lab_id || !form.day_of_week || !form.subject || !form.start_time || !form.end_time) {
      toast.error("Lengkapi semua field wajib.");
      return;
    }
    if (form.start_time >= form.end_time) {
      toast.error("Waktu mulai harus lebih awal dari waktu selesai.");
      return;
    }
    if (editing) {
      setSchedules((prev) => prev.map((s) => s.id === editing.id ? {
        ...s, lab_id: Number(form.lab_id), class_id: form.class_id ? Number(form.class_id) : null,
        day_of_week: form.day_of_week as DayOfWeek, start_time: form.start_time, end_time: form.end_time, subject: form.subject,
      } : s));
      toast.success("Jadwal diperbarui.");
    } else {
      const newSchedule: LabSchedule = {
        id: Date.now(), lab_id: Number(form.lab_id), class_id: form.class_id ? Number(form.class_id) : null,
        day_of_week: form.day_of_week as DayOfWeek, start_time: form.start_time, end_time: form.end_time,
        subject: form.subject, created_at: new Date().toISOString(),
      };
      setSchedules((prev) => [...prev, newSchedule]);
      toast.success("Jadwal ditambahkan.");
    }
    setDialogOpen(false);
  }

  function handleDelete(s: LabSchedule) {
    setSchedules((prev) => prev.filter((x) => x.id !== s.id));
    setDeleteTarget(null);
    toast.success("Jadwal dihapus.");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            Jadwal Lab
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola jadwal penggunaan laboratorium per kelas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />Tambah Jadwal
        </Button>
      </div>

      {/* Day filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["semua", ...DAYS] as const).map((day) => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterDay === day
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {day === "semua" ? "Semua Hari" : day}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada jadwal. Tambahkan jadwal baru.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayed.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <Badge className={`text-xs border shrink-0 ${dayColor[s.day_of_week]}`}>{s.day_of_week}</Badge>
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 shrink-0">{s.start_time}–{s.end_time}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{s.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{labMap[s.lab_id] ?? "-"}{s.class_id ? ` · ${classMap[s.class_id] ?? "-"}` : ""}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-600" onClick={() => setDeleteTarget(s)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lab <span className="text-red-500">*</span></Label>
                <Select value={form.lab_id} onValueChange={(v) => setForm((f) => ({ ...f, lab_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih lab..." /></SelectTrigger>
                  <SelectContent>{labs.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kelas</Label>
                <Select value={form.class_id} onValueChange={(v) => setForm((f) => ({ ...f, class_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tidak ada —</SelectItem>
                    {classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mata Pelajaran <span className="text-red-500">*</span></Label>
              <Input placeholder="Contoh: Pemrograman Dasar" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Hari <span className="text-red-500">*</span></Label>
                <Select value={form.day_of_week} onValueChange={(v) => setForm((f) => ({ ...f, day_of_week: v as DayOfWeek }))}>
                  <SelectTrigger><SelectValue placeholder="Hari..." /></SelectTrigger>
                  <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Mulai <span className="text-red-500">*</span></Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Selesai <span className="text-red-500">*</span></Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              {editing ? "Simpan Perubahan" : "Tambah Jadwal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Hapus Jadwal?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jadwal <strong>{deleteTarget?.subject}</strong> ({deleteTarget?.day_of_week}, {deleteTarget?.start_time}–{deleteTarget?.end_time}) akan dihapus permanen.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              <Trash2 className="h-4 w-4 mr-1.5" />Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
