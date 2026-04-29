"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlaskConical, Package, Users, TriangleAlert, CheckCircle2, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { useLabs, useItems, useClasses, useSessions, useAlerts, useLostReports } from "@/lib/store";

function fmt(dt: string) {
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [labs] = useLabs();
  const [items] = useItems();
  const [classes] = useClasses();
  const [sessions] = useSessions();
  const [alerts] = useAlerts();
  const [lostReports] = useLostReports();

  const brokenItems = useMemo(() => items.filter((i) => i.functional_quantity < i.initial_quantity), [items]);
  const activeSessions = sessions.filter((s) => s.status === "aktif");
  const newLostReports = useMemo(() => lostReports.filter((r) => r.status === "baru"), [lostReports]);

  const labMap = Object.fromEntries(labs.map((l) => [l.id, l.name]));
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i.name]));

  const stats = [
    { label: "Total Lab", value: labs.length, icon: FlaskConical, color: "text-blue-600 bg-blue-50", href: "/admin/labs" },
    { label: "Total Barang", value: items.length, icon: Package, color: "text-green-600 bg-green-50", href: "/admin/items" },
    { label: "Akun Kelas", value: classes.length, icon: Users, color: "text-purple-600 bg-purple-50", href: "/admin/classes" },
    { label: "Barang Bermasalah", value: brokenItems.length, icon: TriangleAlert, color: "text-orange-600 bg-orange-50", href: "/admin/items" },
    { label: "Laporan Hilang Baru", value: newLostReports.length, icon: AlertTriangle, color: newLostReports.length > 0 ? "text-red-600 bg-red-50" : "text-gray-400 bg-gray-50", href: "/admin/lost-reports" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan kondisi laboratorium komputer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
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
                  <div key={s.id} className="flex justify-between items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <p className="font-medium text-sm">{labMap[s.lab_id] ?? "-"}</p>
                      <p className="text-xs text-gray-500">{classMap[s.class_id] ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white text-xs">Aktif</Badge>
                      <p className="text-xs text-gray-400 mt-1">{fmt(s.started_at)}</p>
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
              {alerts.length > 0 && <Badge variant="destructive" className="ml-1">{alerts.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Tidak ada peringatan aktif.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {alerts.map((a) => (
                  <Alert key={a.id} variant="destructive" className="py-3">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle className="text-xs font-semibold uppercase tracking-wide">
                      {a.type === "selisih" ? "Selisih Barang" : "Barang Rusak"} · <span className="normal-case font-normal">{itemMap[a.lab_item_id]}</span>
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-0.5">{a.message}</AlertDescription>
                    <p className="text-xs text-red-400 mt-1">{fmt(a.created_at)}</p>
                  </Alert>
                ))}
              </div>
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
                  <div key={r.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-red-700">{itemMap[r.lab_item_id] ?? "-"}</p>
                      <Badge className="bg-red-100 text-red-600 text-xs border-red-200">Baru</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{classMap[r.class_id] ?? "-"}</p>
                    {r.description && <p className="text-xs text-gray-600 mt-1 truncate">{r.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{fmt(r.created_at)}</p>
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
    </div>
  );
}
