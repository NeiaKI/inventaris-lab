"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TriangleAlert, Clock, MapPin } from "lucide-react";
import { useSessions, useLabs, useAlerts, useClasses } from "@/lib/store";

function fmt(dt: string | null) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function duration(start: string, end: string | null) {
  if (!end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs} jam ${mins % 60} menit`;
  return `${mins} menit`;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessions] = useSessions();
  const [labs] = useLabs();
  const [alerts] = useAlerts();
  const [classes] = useClasses();

  const sessionId = Number(id);
  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const lab = useMemo(() => labs.find((l) => l.id === session?.lab_id), [labs, session]);
  const kelas = useMemo(() => classes.find((c) => c.id === session?.class_id), [classes, session]);
  const sessionAlerts = useMemo(() => alerts.filter((a) => a.session_id === sessionId), [alerts, sessionId]);

  type ChecklistSnapshot = { lab_item_id: number; name: string; initial_quantity: number; counted_quantity: number; condition: string };
  const [snapshot, setSnapshot] = useState<ChecklistSnapshot[]>([]);
  useEffect(() => {
    const raw = sessionStorage.getItem(`checkout-${sessionId}`);
    if (raw) setSnapshot(JSON.parse(raw));
  }, [sessionId]);

  const issueRows = useMemo(
    () => snapshot.filter((r) => r.counted_quantity < r.initial_quantity || r.condition !== "baik"),
    [snapshot]
  );

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p>Sesi tidak ditemukan.</p>
        <Button className="mt-4" onClick={() => router.push("/kelas/labs")}>Kembali ke Lab</Button>
      </div>
    );
  }

  const isAman = session.status === "aman";
  const isPending = session.status === "pending";

  const cardStyle = isPending
    ? "bg-yellow-50 border-2 border-yellow-200"
    : isAman ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200";
  const iconBg = isPending ? "bg-yellow-100" : isAman ? "bg-green-100" : "bg-red-100";
  const badgeStyle = isPending ? "bg-yellow-500 text-white" : isAman ? "bg-green-600 text-white" : "bg-red-600 text-white";
  const titleStyle = isPending ? "text-yellow-800" : isAman ? "text-green-800" : "text-red-800";
  const descStyle = isPending ? "text-yellow-700" : isAman ? "text-green-700" : "text-red-700";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-md rounded-2xl p-8 text-center shadow-xl ${cardStyle}`}>
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}>
          {isPending
            ? <span className="text-4xl">🔒</span>
            : isAman
              ? <CheckCircle2 className="h-10 w-10 text-green-600" />
              : <TriangleAlert className="h-10 w-10 text-red-600" />}
        </div>

        <Badge className={`mb-2 text-sm px-4 py-1 ${badgeStyle}`}>
          {isPending ? "Sesi Diakhiri Admin" : isAman ? "Status Lab Aman" : "Ada Selisih / Kerusakan"}
        </Badge>

        <h2 className={`text-xl font-bold mt-2 ${titleStyle}`}>
          {isPending ? "Sesi diakhiri oleh Admin" : isAman ? "Semua barang sesuai!" : "Terdapat ketidaksesuaian barang"}
        </h2>
        <p className={`text-sm mt-2 ${descStyle}`}>
          {isPending
            ? "Guru/Admin telah menutup sesi ini. Hubungi guru jika ada pertanyaan."
            : isAman
              ? "Terima kasih telah menjaga kondisi lab dengan baik."
              : "Laporan peringatan telah dikirim ke Admin untuk ditindaklanjuti."}
        </p>

        <div className="mt-6 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium">{lab?.name}</p>
              <p className="text-xs text-gray-400">{kelas?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Waktu Sesi</p>
              <p className="font-medium">{fmt(session.started_at)} – {fmt(session.ended_at)}</p>
              <p className="text-xs text-gray-400">Durasi: {duration(session.started_at, session.ended_at)}</p>
            </div>
          </div>
        </div>

        {!isAman && issueRows.length > 0 && (
          <div className="mt-5 text-left">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Detail Barang Bermasalah</p>
            <div className="rounded-lg overflow-hidden border border-red-200">
              <table className="w-full text-xs">
                <thead className="bg-red-100 text-red-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Barang</th>
                    <th className="text-center px-3 py-2 font-semibold">Seharusnya</th>
                    <th className="text-center px-3 py-2 font-semibold">Aktual</th>
                    <th className="text-center px-3 py-2 font-semibold">Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {issueRows.map((r) => (
                    <tr key={r.lab_item_id} className="bg-white border-t border-red-100">
                      <td className="px-3 py-2 font-medium text-gray-800">{r.name}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{r.initial_quantity}</td>
                      <td className={`px-3 py-2 text-center font-semibold ${r.counted_quantity < r.initial_quantity ? "text-red-600" : "text-gray-800"}`}>
                        {r.counted_quantity}
                        {r.counted_quantity < r.initial_quantity && (
                          <span className="ml-1 text-red-400">(-{r.initial_quantity - r.counted_quantity})</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.condition === "baik" && <span className="text-green-600">✅ Baik</span>}
                        {r.condition === "rusak" && <span className="text-yellow-600">⚠️ Rusak</span>}
                        {r.condition === "hilang" && <span className="text-red-600">❌ Hilang</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!isAman && issueRows.length === 0 && sessionAlerts.length > 0 && (
          <div className="mt-5 text-left space-y-2">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Detail Masalah</p>
            {sessionAlerts.map((a) => (
              <div key={a.id} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{a.message}</div>
            ))}
          </div>
        )}

        <Button className={`mt-7 w-full h-11 ${isPending ? "bg-yellow-600 hover:bg-yellow-700" : isAman ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`} onClick={() => router.push("/kelas/labs")}>
          Selesai
        </Button>
      </div>
    </div>
  );
}
