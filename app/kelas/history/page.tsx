"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, CheckCircle2, TriangleAlert, StopCircle, ChevronRight, History } from "lucide-react";
import { useSessions, useLabs } from "@/lib/store";
import { getSession } from "@/lib/auth";
import type { SessionStatus } from "@/lib/types";

const STATUS_CONFIG: Record<SessionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  aman: { label: "Aman", className: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  selisih: { label: "Selisih", className: "bg-red-100 text-red-700", icon: <TriangleAlert className="h-3 w-3" /> },
  aktif: { label: "Aktif", className: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  pending: { label: "Diakhiri Admin", className: "bg-yellow-100 text-yellow-700", icon: <StopCircle className="h-3 w-3" /> },
};

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function duration(start: string, end: string | null) {
  if (!end) return null;
  const mins = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  const hrs = Math.floor(mins / 60);
  return hrs > 0 ? `${hrs} jam ${mins % 60} menit` : `${mins} menit`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions] = useSessions();
  const [labs] = useLabs();
  const user = typeof window !== "undefined" ? getSession() : null;

  const mySessions = useMemo(
    () => sessions.filter((s) => s.class_id === user?.id && s.status !== "aktif").slice().reverse(),
    [sessions, user]
  );

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l])), [labs]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-5 w-5 text-gray-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Riwayat Sesi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semua sesi lab yang pernah kamu ikuti</p>
        </div>
      </div>

      {mySessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada riwayat sesi.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mySessions.map((s) => {
            const lab = labMap[s.lab_id];
            const cfg = STATUS_CONFIG[s.status];
            const dur = duration(s.started_at, s.ended_at);
            return (
              <Card
                key={s.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/kelas/result/${s.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 truncate">{lab?.name ?? "-"}</p>
                      <Badge className={`${cfg.className} flex items-center gap-1 shrink-0 text-xs`}>
                        {cfg.icon}{cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{lab?.location ?? "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{fmtDate(s.started_at)} · {fmtTime(s.started_at)}
                        {dur && ` · ${dur}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Button variant="outline" className="w-full mt-5" onClick={() => router.push("/kelas/labs")}>
        Kembali ke Lab
      </Button>
    </div>
  );
}
