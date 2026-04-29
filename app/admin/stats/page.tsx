"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, FlaskConical, TriangleAlert } from "lucide-react";
import { useSessions, useLabs, useItems, useAlerts } from "@/lib/store";

function getMonthKey(dt: string) {
  const d = new Date(dt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function SimpleBarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-xs text-gray-600 font-medium">{d.value}</span>
          <div className="w-full rounded-t-sm transition-all" style={{
            height: `${Math.max((d.value / max) * 120, d.value > 0 ? 4 : 0)}px`,
            backgroundColor: d.color ?? "#3b82f6",
          }} />
          <span className="text-xs text-gray-400 text-center leading-tight truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const [sessions] = useSessions();
  const [labs] = useLabs();
  const [items] = useItems();
  const [alerts] = useAlerts();

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);

  // Sessions per lab
  const sessionsPerLab = useMemo(() => {
    const counts: Record<number, number> = {};
    sessions.forEach((s) => { counts[s.lab_id] = (counts[s.lab_id] ?? 0) + 1; });
    return labs.map((l) => ({ label: l.name, value: counts[l.id] ?? 0, color: "#3b82f6" }));
  }, [sessions, labs]);

  // Sessions per month (last 6 months)
  const sessionsPerMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const key = getMonthKey(s.started_at);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const sorted = Object.keys(counts).sort().slice(-6);
    return sorted.map((k) => ({ label: formatMonth(k), value: counts[k], color: "#6366f1" }));
  }, [sessions]);

  // Damage per lab
  const damagePerLab = useMemo(() => {
    const counts: Record<number, number> = {};
    items.forEach((i) => {
      if (i.functional_quantity < i.initial_quantity) {
        counts[i.lab_id] = (counts[i.lab_id] ?? 0) + (i.initial_quantity - i.functional_quantity);
      }
    });
    return labs.map((l) => ({ label: l.name, value: counts[l.id] ?? 0, color: "#ef4444" }));
  }, [items, labs]);

  // Alerts per lab
  const alertsPerLab = useMemo(() => {
    const itemLabMap: Record<number, number> = {};
    items.forEach((i) => { itemLabMap[i.id] = i.lab_id; });
    const counts: Record<number, number> = {};
    alerts.forEach((a) => {
      const labId = itemLabMap[a.lab_item_id];
      if (labId) counts[labId] = (counts[labId] ?? 0) + 1;
    });
    return labs.map((l) => ({ label: l.name, value: counts[l.id] ?? 0, color: "#f59e0b" }));
  }, [alerts, items, labs]);

  // Top used labs (sorted)
  const topLabs = useMemo(() => {
    return [...sessionsPerLab].sort((a, b) => b.value - a.value);
  }, [sessionsPerLab]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistik</h1>
        <p className="text-gray-500 text-sm mt-1">Tren penggunaan dan kondisi laboratorium</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sessions per month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Sesi per Bulan (6 Bulan Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsPerMonth.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Belum ada data sesi.</p>
            ) : (
              <SimpleBarChart data={sessionsPerMonth} />
            )}
          </CardContent>
        </Card>

        {/* Sessions per lab */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-blue-500" />
              Sesi per Laboratorium
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsPerLab.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Belum ada data lab.</p>
            ) : (
              <SimpleBarChart data={sessionsPerLab} />
            )}
          </CardContent>
        </Card>

        {/* Damage per lab */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-red-500" />
              Selisih Barang per Laboratorium
            </CardTitle>
          </CardHeader>
          <CardContent>
            {damagePerLab.every((d) => d.value === 0) ? (
              <p className="text-sm text-green-600 py-8 text-center flex items-center justify-center gap-2">
                Semua barang dalam kondisi normal.
              </p>
            ) : (
              <SimpleBarChart data={damagePerLab} />
            )}
          </CardContent>
        </Card>

        {/* Alerts per lab */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Peringatan per Laboratorium
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsPerLab.every((d) => d.value === 0) ? (
              <p className="text-sm text-green-600 py-8 text-center">Tidak ada peringatan aktif.</p>
            ) : (
              <SimpleBarChart data={alertsPerLab} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Labs Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-blue-500" />
            Ringkasan per Lab
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLabs.map((l, idx) => {
              const lab = labs.find((lb) => lb.name === l.label);
              if (!lab) return null;
              const labItems = items.filter((i) => i.lab_id === lab.id);
              const brokenCount = labItems.filter((i) => i.functional_quantity < i.initial_quantity).length;
              return (
                <div key={l.label} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{l.label}</p>
                    <p className="text-xs text-gray-400">{labItems.length} jenis barang</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{l.value}</p>
                      <p className="text-xs text-gray-400">sesi</p>
                    </div>
                    {brokenCount > 0 ? (
                      <Badge className="bg-red-100 text-red-700 text-xs gap-1">
                        <TriangleAlert className="h-3 w-3" />
                        {brokenCount} masalah
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 text-xs">Normal</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
