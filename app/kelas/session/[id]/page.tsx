"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, MapPin, Clock, ClipboardCheck, Package } from "lucide-react";
import { useSessions, useLabs, useItems } from "@/lib/store";
import { getSession } from "@/lib/auth";

function elapsed(from: string) {
  const ms = Date.now() - new Date(from).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs} jam ${mins % 60} menit`;
  return `${mins} menit`;
}

export default function ActiveSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessions] = useSessions();
  const [labs] = useLabs();
  const [items] = useItems();

  const user = typeof window !== "undefined" ? getSession() : null;
  const sessionId = Number(id);
  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const lab = useMemo(() => labs.find((l) => l.id === session?.lab_id), [labs, session]);
  const labItems = useMemo(() => items.filter((i) => i.lab_id === session?.lab_id), [items, session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <p>Sesi tidak ditemukan.</p>
        <Button className="mt-4" onClick={() => router.push("/kelas/labs")}>Kembali</Button>
      </div>
    );
  }

  if (session.status !== "aktif") { router.replace(`/kelas/result/${session.id}`); return null; }
  if (session.class_id !== user?.id) { router.replace("/kelas/labs"); return null; }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Sesi Aktif · {elapsed(session.started_at)}</Badge>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{lab?.name}</h1>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="h-3.5 w-3.5" />{lab?.location || "-"}
        </div>
      </div>

      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            Inventaris Lab ({labItems.length} jenis barang)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Jml Kondisi Baik</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                  <TableCell className="text-center font-semibold">{item.functional_quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5 text-sm text-yellow-800">
        <strong>Perhatian:</strong> Harap jaga kondisi semua barang di lab. Saat selesai, lakukan pengecekan barang sebelum menutup sesi.
      </div>

      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={() => router.push(`/kelas/checkout/${session.id}`)}>
        <ClipboardCheck className="h-5 w-5 mr-2" />Akhiri Sesi & Cek Barang
      </Button>
    </div>
  );
}
