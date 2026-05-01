"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FlaskConical, MapPin, Play, TriangleAlert, Clock } from "lucide-react";
import { useLabs, useSessions, useItems, useSchedules } from "@/lib/store";
import { getSession } from "@/lib/auth";
import type { Session, DayOfWeek } from "@/lib/types";

const TODAY_DAY: DayOfWeek | null = (() => {
  const days: (DayOfWeek | null)[] = [null, "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[new Date().getDay()] ?? null;
})();

export default function LabSelectionPage() {
  const router = useRouter();
  const [labs] = useLabs();
  const [items] = useItems();
  const [sessions, setSessions] = useSessions();
  const [schedules] = useSchedules();
  const [confirmLab, setConfirmLab] = useState<number | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getSession> | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  // Auto-expire sessions older than 24 hours
  useEffect(() => {
    if (!sessions.length) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const expired = sessions.filter(
      (s) => s.status === "aktif" && new Date(s.started_at).getTime() < cutoff
    );
    if (!expired.length) return;
    const expiredIds = new Set(expired.map((s) => s.id));
    const now = new Date().toISOString();
    setSessions((prev) =>
      prev.map((s) => expiredIds.has(s.id) ? { ...s, status: "pending", ended_at: now } : s)
    );
  }, [sessions, setSessions]);

  const activeSessionByClass = useMemo(
    () => sessions.find((s) => s.class_id === user?.id && s.status === "aktif"),
    [sessions, user]
  );

  const busyLabs = useMemo(() => new Set(sessions.filter((s) => s.status === "aktif").map((s) => s.lab_id)), [sessions]);
  const itemCountPerLab = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, items.filter((i) => i.lab_id === l.id).length])), [labs, items]);
  const todaySchedulesByLab = useMemo(() => {
    if (!TODAY_DAY) return {} as Record<number, typeof schedules>;
    const byLab: Record<number, typeof schedules> = {};
    schedules.filter((s) => s.day_of_week === TODAY_DAY).forEach((s) => {
      if (!byLab[s.lab_id]) byLab[s.lab_id] = [];
      byLab[s.lab_id].push(s);
    });
    return byLab;
  }, [schedules]);

  const handleStart = () => {
    if (!confirmLab || !user) return;
    const newSession: Session = { id: Date.now(), lab_id: confirmLab, class_id: user.id, started_at: new Date().toISOString(), ended_at: null, status: "aktif" };
    setSessions((prev) => [...prev, newSession]);
    router.push(`/kelas/session/${newSession.id}`);
  };

  const selectedLab = labs.find((l) => l.id === confirmLab);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pilih Laboratorium</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pilih lab yang akan digunakan untuk sesi hari ini</p>
      </div>

      {activeSessionByClass && (
        <Alert className="mb-5 border-blue-200 bg-blue-50">
          <TriangleAlert className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm">
            Kamu masih memiliki sesi aktif.{" "}
            <button className="underline font-medium" onClick={() => router.push(`/kelas/session/${activeSessionByClass.id}`)}>
              Lanjutkan sesi
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {labs.map((lab) => {
          const isBusy = busyLabs.has(lab.id);
          const isMySession = sessions.find((s) => s.lab_id === lab.id && s.class_id === user?.id && s.status === "aktif");
          return (
            <Card key={lab.id} className={`transition-all ${isBusy && !isMySession ? "opacity-60" : "hover:shadow-md"}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isBusy ? "bg-gray-100 dark:bg-gray-700" : "bg-blue-50 dark:bg-blue-950"}`}>
                    <FlaskConical className={`h-5 w-5 ${isBusy ? "text-gray-400 dark:text-gray-500" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{lab.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3" />{lab.location || "-"}
                      <span className="mx-1">·</span>{itemCountPerLab[lab.id] ?? 0} jenis barang
                    </div>
                    {todaySchedulesByLab[lab.id]?.slice(0, 2).map((sched) => (
                      <div key={sched.id} className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{sched.start_time}–{sched.end_time} · {sched.subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isBusy && !isMySession && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Sedang digunakan</Badge>}
                  {isMySession && <Badge className="bg-blue-100 text-blue-700 text-xs">Sesi kamu</Badge>}
                  <Button
                    size="sm"
                    disabled={isBusy && !isMySession}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => isMySession ? router.push(`/kelas/session/${isMySession.id}`) : setConfirmLab(lab.id)}
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />{isMySession ? "Lanjutkan" : "Mulai Sesi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {labs.length === 0 && <div className="text-center text-gray-400 py-12">Belum ada lab yang tersedia.</div>}
      </div>

      <Dialog open={!!confirmLab} onOpenChange={() => setConfirmLab(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Mulai Sesi?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kamu akan memulai sesi penggunaan <strong>{selectedLab?.name}</strong>. Pastikan kamu benar-benar berada di lab tersebut.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLab(null)}>Batal</Button>
            <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700"><Play className="h-4 w-4 mr-1.5" />Mulai Sesi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
