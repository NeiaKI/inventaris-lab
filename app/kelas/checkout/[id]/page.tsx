"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, TriangleAlert, Loader2 } from "lucide-react";
import { useSessions, useLabs, useItems, useAlerts, useSessionItemStatuses } from "@/lib/store";
import { getSession } from "@/lib/auth";
import type { ItemCondition, SessionItemStatus, Alert } from "@/lib/types";

type ChecklistRow = { lab_item_id: number; name: string; initial_quantity: number; counted_quantity: number; condition: ItemCondition };

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessions, setSessions] = useSessions();
  const [labs] = useLabs();
  const [items, setItems] = useItems();
  const [, setAlerts] = useAlerts();
  const [, setStatuses] = useSessionItemStatuses();

  const user = typeof window !== "undefined" ? getSession() : null;
  const sessionId = Number(id);
  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const lab = useMemo(() => labs.find((l) => l.id === session?.lab_id), [labs, session]);
  const labItems = useMemo(() => items.filter((i) => i.lab_id === session?.lab_id), [items, session]);

  const [checklist, setChecklist] = useState<ChecklistRow[]>([]);
  const checklistInitRef = useRef(false);

  useEffect(() => {
    if (labItems.length > 0 && !checklistInitRef.current) {
      checklistInitRef.current = true;
      setChecklist(
        labItems.map((item) => ({
          lab_item_id: item.id,
          name: item.name,
          initial_quantity: item.functional_quantity,
          counted_quantity: item.functional_quantity,
          condition: "baik" as ItemCondition,
        }))
      );
    }
  }, [labItems]);

  const [submitting, setSubmitting] = useState(false);

  // Auto-expire: if session has been active > 24h, close it
  useEffect(() => {
    if (!session || session.status !== "aktif") return;
    const ageMs = Date.now() - new Date(session.started_at).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      setSessions((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, status: "pending", ended_at: new Date().toISOString() } : s)
      );
    }
  }, [session, sessionId, setSessions]);

  const updateRow = (idx: number, field: keyof ChecklistRow, value: string | number) => {
    setChecklist((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  // Show spinner while Supabase is still loading
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (session.status !== "aktif") {
    const isForceEnded = session.status === "pending";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className={`p-4 rounded-full mb-4 ${isForceEnded ? "bg-yellow-100" : "bg-gray-100"}`}>
          {isForceEnded
            ? <span className="text-3xl">🔒</span>
            : <span className="text-3xl">✅</span>}
        </div>
        <p className="font-semibold text-gray-700">
          {isForceEnded ? "Sesi diakhiri oleh Admin" : "Sesi sudah selesai"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isForceEnded
            ? "Admin telah menutup sesi ini. Hubungi guru jika ada pertanyaan."
            : "Sesi ini sudah tidak aktif."
          }
        </p>
        <Button className="mt-5" onClick={() => router.push("/kelas/labs")}>Kembali ke Lab</Button>
      </div>
    );
  }
  if (session.class_id !== user?.id) { router.replace("/kelas/labs"); return null; }

  const hasIssue = checklist.some((r) => r.counted_quantity < r.initial_quantity || r.condition !== "baik");

  const handleSubmit = () => {
    setSubmitting(true);
    const now = new Date().toISOString();
    // Persist checklist snapshot so the result page can show expected vs actual
    sessionStorage.setItem(`checkout-${sessionId}`, JSON.stringify(checklist));

    const newStatuses: SessionItemStatus[] = checklist.map((r, i) => ({
      id: Date.now() + i, session_id: sessionId, lab_item_id: r.lab_item_id, counted_quantity: r.counted_quantity, condition: r.condition,
    }));
    setStatuses((prev) => [...prev, ...newStatuses]);

    setItems((prev) => prev.map((item) => {
      const row = checklist.find((r) => r.lab_item_id === item.id);
      if (!row) return item;
      return { ...item, functional_quantity: Math.max(0, row.counted_quantity) };
    }));

    const base = Date.now();
    const newAlerts: Alert[] = [];
    checklist.forEach((r, i) => {
      if (r.counted_quantity < r.initial_quantity) {
        newAlerts.push({ id: base + i * 10 + 1, session_id: sessionId, lab_item_id: r.lab_item_id, type: "selisih", message: `${r.name} berkurang ${r.initial_quantity - r.counted_quantity} unit saat sesi ${user?.name} di ${lab?.name}.`, created_at: now });
      }
      if (r.condition === "rusak") {
        newAlerts.push({ id: base + i * 10 + 2, session_id: sessionId, lab_item_id: r.lab_item_id, type: "rusak", message: `${r.name} dilaporkan rusak oleh ${user?.name} di ${lab?.name}.`, created_at: now });
      }
      if (r.condition === "hilang") {
        newAlerts.push({ id: base + i * 10 + 3, session_id: sessionId, lab_item_id: r.lab_item_id, type: "selisih", message: `${r.name} dilaporkan hilang oleh ${user?.name} di ${lab?.name}.`, created_at: now });
      }
    });
    if (newAlerts.length > 0) setAlerts((prev) => [...prev, ...newAlerts]);

    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, ended_at: now, status: hasIssue ? "selisih" : "aman" } : s));
    router.push(`/kelas/result/${sessionId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Checklist Akhir Sesi</h1>
        <p className="text-gray-500 text-sm mt-1">{lab?.name} — Isi jumlah aktual dan kondisi setiap barang</p>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-blue-500" />Validasi Barang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklist.map((row, idx) => (
            <div key={row.lab_item_id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-sm">{row.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`counted-qty-${idx}`} className="text-xs text-gray-500">Jumlah Aktual</Label>
                  <Input
                    id={`counted-qty-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={row.counted_quantity}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const parsed = raw === "" ? 0 : parseInt(raw, 10);
                      updateRow(idx, "counted_quantity", Math.min(parsed, row.initial_quantity));
                    }}
                    className={row.counted_quantity < row.initial_quantity ? "border-red-300 bg-red-50" : ""}
                  />
                  <p className="text-xs text-gray-400">Maks: {row.initial_quantity} unit</p>
                  {row.counted_quantity < row.initial_quantity && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><TriangleAlert className="h-3 w-3" />Kurang {row.initial_quantity - row.counted_quantity} unit</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`condition-${idx}`} className="text-xs text-gray-500">Kondisi</Label>
                  <Select value={row.condition} onValueChange={(v) => updateRow(idx, "condition", v ?? "baik")}>
                    <SelectTrigger id={`condition-${idx}`} className={row.condition !== "baik" ? "border-red-300 bg-red-50" : ""}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baik">✅ Baik</SelectItem>
                      <SelectItem value="rusak">⚠️ Rusak</SelectItem>
                      <SelectItem value="hilang">❌ Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {hasIssue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-700 flex items-start gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Ada barang yang tidak sesuai. Peringatan akan dikirim ke Admin.</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.push(`/kelas/session/${sessionId}`)} disabled={submitting}>Kembali</Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-12" onClick={handleSubmit} disabled={submitting}>
          <ClipboardCheck className="h-5 w-5 mr-2" />Submit & Tutup Sesi
        </Button>
      </div>
    </div>
  );
}
