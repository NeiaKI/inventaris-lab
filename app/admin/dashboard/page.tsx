"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FlaskConical, Package, Users, TriangleAlert, CheckCircle2, Clock, AlertCircle, AlertTriangle, X, CheckCheck, Download } from "lucide-react";
import type { Alert as AlertType } from "@/lib/types";

function exportAlertsCSV(alerts: AlertType[], itemMap: Record<number, string>) {
  const header = ["Tipe", "Barang", "Pesan", "Tanggal"];
  const rows = alerts.map((a) => [
    a.type === "selisih" ? "Selisih" : "Rusak",
    itemMap[a.lab_item_id] ?? "-",
    a.message,
    new Date(a.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url;
  el.download = `peringatan-${new Date().toISOString().slice(0, 10)}.csv`;
  el.click();
  URL.revokeObjectURL(url);
}
import { useLabs, useItems, useClasses, useSessions, useAlerts, useLostReports } from "@/lib/store";

function fmt(dt: string) {
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [labs] = useLabs();
  const [items] = useItems();
  const [classes] = useClasses();
  const [sessions] = useSessions();
  const [alerts, setAlerts] = useAlerts();
  const [lostReports] = useLostReports();

  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const resolveAlert = (id: number) => setAlerts((prev) => prev.filter((a) => a.id !== id));
  const resolveAllAlerts = () => { setAlerts([]); setConfirmClearAll(false); };

  const brokenItems = useMemo(() => items.filter((i) => i.functional_quantity < i.initial_quantity), [items]);
  const activeSessions = sessions.filter((s) => s.status === "aktif");
  const newLostReports = useMemo(() => lostReports.filter((r) => r.status === "baru"), [lostReports]);

  const labMap = Object.fromEntries(labs.map((l) => [l.id, l.name]));
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i.name]));

  const stats = [
    { label: "Total Lab", value: labs.length, icon: FlaskConical, color: "text-blue-600 bg-blue-50 dark:bg-blue-950", href: "/admin/labs" },
    { label: "Total Barang", value: items.length, icon: Package, color: "text-green-600 bg-green-50 dark:bg-green-950", href: "/admin/items" },
    { label: "Akun Kelas", value: classes.length, icon: Users, color: "text-purple-600 bg-purple-50 dark:bg-purple-950", href: "/admin/classes" },
    { label: "Barang Bermasalah", value: brokenItems.length, icon: TriangleAlert, color: "text-orange-600 bg-orange-50 dark:bg-orange-950", href: "/admin/items" },
    { label: "Laporan Hilang Baru", value: newLostReports.length, icon: AlertTriangle, color: newLostReports.length > 0 ? "text-red-600 bg-red-50 dark:bg-red-950" : "text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500", href: "/admin/lost-reports" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ringkasan kondisi laboratorium komputer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${label === "Laporan Hilang Baru" && value > 0 ? "text-red-600" : "text-gray-900"}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sesi Aktif */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Sesi Aktif
              {activeSessions.length > 0 && <Badge className="bg-blue-100 text-blue-700 ml-1">{activeSessions.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Tidak ada sesi aktif saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((s) => (
                  <div key={s.id} className="flex justify-between items-start p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div>
                      <p className="font-medium text-sm text-gray-800 dark:text-blue-100">{labMap[s.lab_id] ?? "-"}</p>
                      <p className="text-xs text-gray-500 dark:text-blue-200/70">{classMap[s.class_id] ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white text-xs">Aktif</Badge>
                      <p className="text-xs text-gray-400 dark:text-blue-200/60 mt-1">{fmt(s.started_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peringatan Terbaru */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Peringatan Terbaru
              {alerts.length > 0 && (
                <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 ml-0.5">
                  {alerts.length}
                </span>
              )}
              {alerts.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => exportAlertsCSV(alerts, itemMap)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                    title="Export CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(true)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
                    title="Selesaikan semua"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Selesaikan Semua
                  </button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Semua peringatan telah diselesaikan.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {alerts.slice().reverse().slice(0, 5).map((a) => {
                    const isSelisih = a.type === "selisih";
                    return (
                      <div
                        key={a.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${isSelisih ? "bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800" : "bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800"}`}
                      >
                        <TriangleAlert className={`h-4 w-4 shrink-0 mt-0.5 ${isSelisih ? "text-orange-500 dark:text-orange-400" : "text-red-500 dark:text-red-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${isSelisih ? "text-orange-700 dark:text-orange-200" : "text-red-700 dark:text-red-200"}`}>
                            {isSelisih ? "Selisih Barang" : "Barang Rusak"}
                            <span className="font-normal ml-1">· {itemMap[a.lab_item_id] ?? "-"}</span>
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-200 mt-0.5 line-clamp-2">{a.message}</p>
                          <p className={`text-xs mt-1 ${isSelisih ? "text-orange-500 dark:text-orange-300" : "text-red-500 dark:text-red-300"}`}>{fmt(a.created_at)}</p>
                        </div>
                        <button
                          onClick={() => resolveAlert(a.id)}
                          className="p-1 rounded-md hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
                          title="Selesaikan"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {alerts.length > 5 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    dan <span className="font-medium text-gray-600 dark:text-gray-300">{alerts.length - 5} peringatan lainnya</span> — gunakan "Selesaikan Semua" untuk membersihkan
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Laporan Hilang Baru */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Laporan Hilang Baru
              {newLostReports.length > 0 && (
                <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 ml-1">
                  {newLostReports.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newLostReports.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Tidak ada laporan hilang baru.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {newLostReports.slice().reverse().slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-red-700 dark:text-red-200">{itemMap[r.lab_item_id] ?? "-"}</p>
                      <Badge className="bg-red-100 text-red-600 text-xs border-red-200">Baru</Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-red-200/70 mt-0.5">{classMap[r.class_id] ?? "-"}</p>
                    {r.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">{r.description}</p>}
                    <p className="text-xs text-gray-400 dark:text-red-300/70 mt-1">{fmt(r.created_at)}</p>
                  </div>
                ))}
                {newLostReports.length > 5 && (
                  <Link href="/admin/lost-reports" className="block text-center text-xs text-blue-600 hover:underline pt-1">
                    Lihat semua {newLostReports.length} laporan →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Selesaikan Semua Peringatan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Sebanyak <strong>{alerts.length} peringatan</strong> akan ditandai selesai dan dihapus dari daftar.
            Tindakan ini tidak memulihkan jumlah barang secara otomatis.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearAll(false)}>Batal</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={resolveAllAlerts}>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Ya, Selesaikan Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
