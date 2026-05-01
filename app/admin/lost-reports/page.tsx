"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MessageCircle, Filter, ImageIcon } from "lucide-react";
import { useLostReports, useItems, useLabs, useClasses, useSessions } from "@/lib/store";
import { ADMIN_WA_NUMBER } from "@/lib/mock-data";
import type { LostReportStatus } from "@/lib/types";
import { toast } from "sonner";

const statusLabel: Record<LostReportStatus, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
};

const statusColor: Record<LostReportStatus, string> = {
  baru: "bg-red-100 text-red-700 border-red-200",
  diproses: "bg-yellow-100 text-yellow-700 border-yellow-200",
  selesai: "bg-green-100 text-green-700 border-green-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function LostReportsPage() {
  const [reports, setReports] = useLostReports();
  const [items] = useItems();
  const [labs] = useLabs();
  const [classes] = useClasses();
  const [sessions] = useSessions();
  const [filterStatus, setFilterStatus] = useState<LostReportStatus | "semua">("semua");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const enriched = useMemo(() => reports.map((r) => {
    const item = items.find((i) => i.id === r.lab_item_id);
    const session = sessions.find((s) => s.id === r.session_id);
    const lab = labs.find((l) => l.id === session?.lab_id);
    const kelas = classes.find((c) => c.id === r.class_id);
    return { ...r, itemName: item?.name ?? "-", labName: lab?.name ?? "-", kelasName: kelas?.name ?? "-" };
  }), [reports, items, labs, classes, sessions]);

  const newCount = reports.filter((r) => r.status === "baru").length;
  const displayed = useMemo(
    () => (filterStatus === "semua" ? enriched : enriched.filter((r) => r.status === filterStatus)).slice().reverse(),
    [enriched, filterStatus]
  );

  function updateStatus(id: number, status: LostReportStatus) {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    const label = { baru: "Baru", diproses: "Diproses", selesai: "Selesai" }[status];
    toast.success("Status diperbarui", { description: `Laporan ditandai sebagai "${label}".` });
  }

  function handleWA(r: typeof enriched[0]) {
    const detail =
      `- Barang: ${r.itemName}\n` +
      `- Lab: ${r.labName}\n` +
      (r.description ? `- Keterangan: ${r.description}\n` : "");

    const bodyByStatus: Record<LostReportStatus, string> = {
      baru:
        `Halo ${r.kelasName}, laporan barang hilang Anda sudah kami terima.\n\n` +
        detail +
        `\nAkan segera kami tindaklanjuti. Mohon ditunggu.`,
      diproses:
        `Halo ${r.kelasName}, laporan barang hilang Anda sedang kami proses.\n\n` +
        detail +
        `\nTim kami sedang menangani kasus ini. Kami akan segera menginformasikan hasilnya.`,
      selesai:
        `Halo ${r.kelasName}, laporan barang hilang Anda telah selesai ditangani.\n\n` +
        detail +
        `\nTerima kasih atas laporannya. Silakan hubungi kami jika ada pertanyaan lebih lanjut.`,
    };

    window.open(
      `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(bodyByStatus[r.status])}`,
      "_blank"
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Laporan Barang Hilang
            {newCount > 0 && (
              <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1">
                {newCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Laporan barang hilang yang dikirim oleh siswa</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LostReportStatus | "semua")}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              <SelectItem value="baru">Baru</SelectItem>
              <SelectItem value="diproses">Diproses</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayed.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400 dark:text-gray-500">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada laporan barang hilang.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-300">{displayed.length} laporan ditemukan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((r) => (
                  <TableRow key={r.id} className={r.status === "baru" ? "bg-red-50" : ""}>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                    <TableCell className="font-medium text-sm">{r.kelasName}</TableCell>
                    <TableCell className="text-sm">{r.labName}</TableCell>
                    <TableCell className="text-sm font-semibold text-red-700">{r.itemName}</TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-300 max-w-[160px]">
                      {r.description || <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </TableCell>
                    <TableCell>
                      {r.photo_url ? (
                        <button onClick={() => setLightboxUrl(r.photo_url!)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.photo_url} alt="foto" className="h-9 w-9 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity" />
                        </button>
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-200 dark:text-gray-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={(v) => updateStatus(r.id, v as LostReportStatus)}
                      >
                        <SelectTrigger className={`h-7 text-xs w-[110px] border ${statusColor[r.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baru">Baru</SelectItem>
                          <SelectItem value="diproses">Diproses</SelectItem>
                          <SelectItem value="selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-green-400 text-green-700 hover:bg-green-50"
                        onClick={() => handleWA(r)}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />WA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Photo lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="foto kerusakan"
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
