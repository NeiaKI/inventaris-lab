"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle2, TriangleAlert, Clock } from "lucide-react";
import { useSessions, useLabs, useClasses } from "@/lib/store";
import type { SessionStatus } from "@/lib/types";

const STATUS_CONFIG: Record<SessionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  aman: { label: "Aman", className: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  selisih: { label: "Selisih", className: "bg-red-100 text-red-700", icon: <TriangleAlert className="h-3 w-3" /> },
  aktif: { label: "Aktif", className: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
};

function fmt(dt: string | null) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SessionsPage() {
  const [sessions] = useSessions();
  const [labs] = useLabs();
  const [classes] = useClasses();
  const [search, setSearch] = useState("");

  const labMap = useMemo(() => Object.fromEntries(labs.map((l) => [l.id, l.name])), [labs]);
  const classMap = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c.name])), [classes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.slice().reverse().filter((s) => {
      const labName = labMap[s.lab_id]?.toLowerCase() ?? "";
      const className = classMap[s.class_id]?.toLowerCase() ?? "";
      return labName.includes(q) || className.includes(q);
    });
  }, [sessions, search, labMap, classMap]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Sesi</h1>
        <p className="text-gray-500 text-sm mt-1">Riwayat penggunaan laboratorium oleh setiap kelas</p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari kelas atau lab..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-10">Tidak ada sesi ditemukan.</TableCell></TableRow>}
              {filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{labMap[s.lab_id] ?? "-"}</TableCell>
                    <TableCell className="text-gray-600">{classMap[s.class_id] ?? "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{fmt(s.started_at)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{fmt(s.ended_at)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${cfg.className} flex items-center gap-1 w-fit mx-auto text-xs`}>{cfg.icon}{cfg.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
