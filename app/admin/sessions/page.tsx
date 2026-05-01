"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle2, TriangleAlert, Clock, StopCircle, Download, Package } from "lucide-react";
import { useSessions, useLabs, useClasses, useSessionItemStatuses, useItems } from "@/lib/store";
import type { Session, SessionStatus, ItemCondition } from "@/lib/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<SessionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  aman: { label: "Aman", className: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  selisih: { label: "Selisih", className: "bg-red-100 text-red-700", icon: <TriangleAlert className="h-3 w-3" /> },
  aktif: { label: "Aktif", className: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  pending: { label: "Ditutup Admin", className: "bg-yellow-100 text-yellow-700", icon: <StopCircle className="h-3 w-3" /> },
};

const CONDITION_CONFIG: Record<ItemCondition, { label: string; className: string }> = {
  baik: { label: "Baik", className: "bg-green-100 text-green-700" },
  rusak: { label: "Rusak", className: "bg-red-100 text-red-700" },
  hilang: { label: "Hilang", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
};

function fmt(dt: string | null) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(dt: string | null) {
  if (!dt) return "";
  return new Date(dt).toISOString().slice(0, 10);
}

function exportCSV(sessions: Session[], labMap: Record<number, string>, classMap: Record<number, string>) {
  const header = ["Lab", "Kelas", "Mulai Sesi", "Akhir Sesi", "Status"];
  const rows = sessions.map((s) => [
    labMap[s.lab_id] ?? "-",
    classMap[s.class_id] ?? "-",
    fmt(s.started_at),
    fmt(s.ended_at),
    STATUS_CONFIG[s.status]?.label ?? s.status,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `log-sesi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SessionsPage() {
  const [sessions, setSessions] = useSessions();
  const [labs] = useLabs();
  const [classes] = useClasses();
  const [sessionItemStatuses] = useSessionItemStatuses();
  const [items] = useItems();
  const [search, setSearch] = useState("");
  const [filterLab, setFilterLab] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | SessionStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmSession, setConfirmSession] = useState<Session | null>(null);
  const [detailSession, setDetailSession] = useState<Session | null>(null);

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);
  const classMap = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c.name])), [classes]);
  const itemMap = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.slice().reverse().filter((s) => {
      const labName = labMap[s.lab_id]?.toLowerCase() ?? "";
      const className = classMap[s.class_id]?.toLowerCase() ?? "";
      if (q && !labName.includes(q) && !className.includes(q)) return false;
      if (filterLab !== "all" && s.lab_id !== Number(filterLab)) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (dateFrom && fmtDate(s.started_at) < dateFrom) return false;
      if (dateTo && fmtDate(s.started_at) > dateTo) return false;
      return true;
    });
  }, [sessions, search, filterLab, filterStatus, dateFrom, dateTo, labMap, classMap]);

  const detailItems = useMemo(() => {
    if (!detailSession) return [];
    return sessionItemStatuses
      .filter((sis) => sis.session_id === detailSession.id)
      .map((sis) => ({ ...sis, item: itemMap[sis.lab_item_id] }));
  }, [detailSession, sessionItemStatuses, itemMap]);

  function handleForceEnd() {
    if (!confirmSession) return;
    const now = new Date().toISOString();
    const target = confirmSession;
    setSessions((prev) =>
      prev.map((s) => s.id === target.id ? { ...s, ended_at: now, status: "pending" as SessionStatus } : s)
    );
    setConfirmSession(null);
    toast.success("Sesi diakhiri", { description: `Sesi ${classMap[target.class_id]} di ${labMap[target.lab_id]} telah ditutup oleh admin.` });
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Log Sesi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Riwayat penggunaan laboratorium oleh setiap kelas</p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportCSV(filtered, labMap, classMap)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari kelas atau lab..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterLab} onValueChange={setFilterLab}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Semua Lab" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lab</SelectItem>
            {labs.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | SessionStatus)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Semua Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="aman">Aman</SelectItem>
            <SelectItem value="selisih">Selisih</SelectItem>
            <SelectItem value="pending">Ditutup Admin</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Dari</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" />
          <Label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">s/d</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" />
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{filtered.length} sesi ditemukan · klik baris untuk lihat detail</p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lab</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mulai Sesi</TableHead>
                <TableHead>Akhir Sesi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-10">Tidak ada sesi ditemukan.</TableCell>
                </TableRow>
              )}
              {filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.status];
                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setDetailSession(s)}
                  >
                    <TableCell className="font-medium">{labMap[s.lab_id] ?? "-"}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">{classMap[s.class_id] ?? "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">{fmt(s.started_at)}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">{fmt(s.ended_at)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${cfg.className} flex items-center gap-1 w-fit mx-auto text-xs`}>
                        {cfg.icon}{cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {s.status === "aktif" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmSession(s)}
                        >
                          <StopCircle className="h-3.5 w-3.5 mr-1" />
                          Akhiri Sesi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      <Dialog open={!!detailSession} onOpenChange={(open) => { if (!open) setDetailSession(null); }}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Detail Sesi
            </DialogTitle>
          </DialogHeader>
          {detailSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Lab</p>
                  <p className="font-semibold">{labMap[detailSession.lab_id] ?? "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Kelas</p>
                  <p className="font-semibold">{classMap[detailSession.class_id] ?? "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Mulai</p>
                  <p>{fmt(detailSession.started_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Akhir</p>
                  <p>{fmt(detailSession.ended_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status:</p>
                {(() => {
                  const cfg = STATUS_CONFIG[detailSession.status];
                  return (
                    <Badge className={`${cfg.className} flex items-center gap-1 text-xs`}>
                      {cfg.icon}{cfg.label}
                    </Badge>
                  );
                })()}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Checklist Barang</p>
                {detailItems.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Tidak ada data checklist untuk sesi ini.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barang</TableHead>
                        <TableHead className="text-center">Jumlah Dicek</TableHead>
                        <TableHead className="text-center">Kondisi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailItems.map((di) => {
                        const condCfg = CONDITION_CONFIG[di.condition];
                        const expected = di.item?.initial_quantity ?? 0;
                        const diff = di.counted_quantity - expected;
                        return (
                          <TableRow key={di.id}>
                            <TableCell className="font-medium">{di.item?.name ?? "-"}</TableCell>
                            <TableCell className="text-center">
                              <span className={diff < 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-700 dark:text-gray-200"}>
                                {di.counted_quantity}
                                {diff < 0 && <span className="text-xs ml-1">({diff})</span>}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${condCfg.className} text-xs`}>{condCfg.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Force End Confirm */}
      <Dialog open={!!confirmSession} onOpenChange={(open) => { if (!open) setConfirmSession(null); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <StopCircle className="h-5 w-5" />
              Akhiri Sesi Paksa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Anda akan mengakhiri sesi <strong>{classMap[confirmSession?.class_id ?? 0]}</strong> di{" "}
              <strong>{labMap[confirmSession?.lab_id ?? 0]}</strong> secara paksa.
              <br /><br />
              Sesi akan ditandai sebagai <strong>Ditutup Admin</strong> tanpa checklist barang.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmSession(null)}>
                Batal
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleForceEnd}>
                <StopCircle className="h-4 w-4 mr-2" />
                Ya, Akhiri Sekarang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
