"use client";

import { useMemo } from "react";
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p>Sesi tidak ditemukan.</p>
        <Button className="mt-4" onClick={() => router.push("/kelas/labs")}>Kembali ke Lab</Button>
      </div>
    );
  }

  const isAman = session.status === "aman";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-md rounded-2xl p-8 text-center shadow-xl ${isAman ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isAman ? "bg-green-100" : "bg-red-100"}`}>
          {isAman ? <CheckCircle2 className="h-10 w-10 text-green-600" /> : <TriangleAlert className="h-10 w-10 text-red-600" />}
        </div>

        <Badge className={`mb-2 text-sm px-4 py-1 ${isAman ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {isAman ? "Status Lab Aman" : "Ada Selisih / Kerusakan"}
        </Badge>

        <h2 className={`text-xl font-bold mt-2 ${isAman ? "text-green-800" : "text-red-800"}`}>
          {isAman ? "Semua barang sesuai!" : "Terdapat ketidaksesuaian barang"}
        </h2>
        <p className={`text-sm mt-2 ${isAman ? "text-green-700" : "text-red-700"}`}>
          {isAman ? "Terima kasih telah menjaga kondisi lab dengan baik." : "Laporan peringatan telah dikirim ke Admin untuk ditindaklanjuti."}
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

        {!isAman && sessionAlerts.length > 0 && (
          <div className="mt-5 text-left space-y-2">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Detail Masalah</p>
            {sessionAlerts.map((a) => (
              <div key={a.id} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{a.message}</div>
            ))}
          </div>
        )}

        <Button className={`mt-7 w-full h-11 ${isAman ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`} onClick={() => router.push("/kelas/labs")}>
          Selesai
        </Button>
      </div>
    </div>
  );
}
