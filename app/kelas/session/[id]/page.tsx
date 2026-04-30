"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, MapPin, Clock, ClipboardCheck, Package, AlertTriangle, MessageCircle, Loader2, Camera, X } from "lucide-react";
import { useSessions, useLabs, useItems, useLostReports } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { ADMIN_WA_NUMBER } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { LostItemReport } from "@/lib/types";
import { toast } from "sonner";

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
  const [sessions, setSessions] = useSessions();
  const [labs] = useLabs();
  const [items] = useItems();
  const [lostReports, setLostReports] = useLostReports();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const user = typeof window !== "undefined" ? getSession() : null;
  const sessionId = Number(id);
  const session = useMemo(() => sessions.find((s) => s.id === sessionId), [sessions, sessionId]);
  const lab = useMemo(() => labs.find((l) => l.id === session?.lab_id), [labs, session]);
  const labItems = useMemo(() => items.filter((i) => i.lab_id === session?.lab_id), [items, session]);

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

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (session.status !== "aktif") { router.replace(`/kelas/result/${session.id}`); return null; }
  if (session.class_id !== user?.id) { router.replace("/kelas/labs"); return null; }

  const selectedItem = labItems.find((i) => i.id === Number(selectedItemId));

  function handleOpenDialog() {
    setSelectedItemId("");
    setDescription("");
    setSubmitted(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setDialogOpen(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  function removePhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }

  async function handleSubmitReport() {
    if (!selectedItemId) return;
    setUploading(true);
    let photoUrl: string | undefined;
    if (photoFile) {
      const path = `reports/${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data, error } = await supabase.storage.from("damage-photos").upload(path, photoFile, { upsert: false });
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("damage-photos").getPublicUrl(data.path);
        photoUrl = urlData.publicUrl;
      }
    }
    const report: LostItemReport = {
      id: Date.now(),
      session_id: sessionId,
      lab_item_id: Number(selectedItemId),
      class_id: user!.id,
      description: description.trim(),
      status: "baru",
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
    };
    setLostReports((prev) => [...prev, report]);
    setUploading(false);
    setSubmitted(true);
    toast.success("Laporan terkirim", { description: `Barang hilang: ${selectedItem?.name} telah dilaporkan ke admin.` });
  }

  function handleReportViaWA() {
    if (!selectedItemId) return;
    const itemName = selectedItem?.name ?? "-";
    const text = encodeURIComponent(
      `Halo Admin, saya dari kelas *${user?.name}* ingin melaporkan barang hilang di *${lab?.name}*.\n\n` +
      `- Barang: ${itemName}\n` +
      (description.trim() ? `- Keterangan: ${description.trim()}\n` : "") +
      `\nMohon ditindaklanjuti. Terima kasih.`
    );
    window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${text}`, "_blank");
  }

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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
        <strong>Perhatian:</strong> Harap jaga kondisi semua barang di lab. Saat selesai, lakukan pengecekan barang sebelum menutup sesi.
      </div>

      <Button
        variant="outline"
        className="w-full h-11 mb-3 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleOpenDialog}
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Laporkan Barang Hilang
      </Button>

      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={() => router.push(`/kelas/checkout/${session.id}`)}>
        <ClipboardCheck className="h-5 w-5 mr-2" />Akhiri Sesi & Cek Barang
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Laporkan Barang Hilang
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="py-4 text-center space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                Laporan berhasil dikirim. Admin akan segera menindaklanjuti.
              </div>
              <p className="text-sm text-gray-500">Atau laporkan langsung via WhatsApp:</p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleReportViaWA}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Lanjut Lapor via WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setDialogOpen(false)}>
                Tutup
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label>Barang yang Hilang</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {labItems.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Keterangan <span className="text-gray-400 font-normal">(opsional)</span></Label>
                <textarea
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Contoh: Mouse nomor 5 tidak ada di meja saat sesi berakhir..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Foto Kerusakan <span className="text-gray-400 font-normal">(opsional)</span></Label>
                {photoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 shrink-0" />
                    <span>Ambil foto atau pilih dari galeri</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!selectedItemId || uploading}
                  onClick={handleSubmitReport}
                >
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                  Kirim Laporan ke Admin
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-400 text-green-700 hover:bg-green-50"
                  disabled={!selectedItemId}
                  onClick={handleReportViaWA}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Lapor via WhatsApp
                </Button>
                <Button variant="ghost" className="w-full text-gray-500" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
