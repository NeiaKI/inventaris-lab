"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Package, Clock, CheckCircle2, TriangleAlert, Monitor } from "lucide-react";
import { useLabs, useItems, useSessions } from "@/lib/store";

function fmt(dt: string) {
  return new Date(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function PublicStatusPage() {
  const [labs] = useLabs();
  const [items] = useItems();
  const [sessions] = useSessions();

  const now = new Date();

  const labStats = useMemo(() => {
    return labs.map((lab) => {
      const labItems = items.filter((i) => i.lab_id === lab.id);
      const activeSessions = sessions.filter((s) => s.lab_id === lab.id && s.status === "aktif");
      const hasIssues = labItems.some((i) => i.functional_quantity < i.initial_quantity);
      const issueCount = labItems.filter((i) => i.functional_quantity < i.initial_quantity).length;
      return { lab, labItems, activeSessions, hasIssues, issueCount };
    });
  }, [labs, items, sessions]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Status Laboratorium</h1>
            <p className="text-xs text-gray-500">SMK Bintang Nusantara · Diperbarui otomatis</p>
          </div>
          <div className="ml-auto text-xs text-gray-400">
            {now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-4">
        {labs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-400">
              <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Belum ada data laboratorium.</p>
            </CardContent>
          </Card>
        ) : (
          labStats.map(({ lab, labItems, activeSessions, hasIssues, issueCount }) => {
            const isInUse = activeSessions.length > 0;
            return (
              <Card key={lab.id} className={`border-2 ${isInUse ? "border-blue-200" : hasIssues ? "border-orange-100" : "border-green-100"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-blue-500" />
                      {lab.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isInUse ? (
                        <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Sedang Digunakan
                        </Badge>
                      ) : hasIssues ? (
                        <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" />
                          Ada Masalah
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Tersedia
                        </Badge>
                      )}
                    </div>
                  </div>
                  {lab.location && <p className="text-xs text-gray-400 mt-0.5">{lab.location}</p>}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Active session info */}
                    <div>
                      {isInUse ? (
                        <div className="bg-blue-50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-blue-700 mb-1 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Sesi Aktif
                          </p>
                          {activeSessions.map((s) => (
                            <p key={s.id} className="text-xs text-blue-600">
                              Mulai: {fmt(s.started_at)}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Lab tidak sedang digunakan
                        </div>
                      )}
                    </div>

                    {/* Items summary */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {labItems.length} jenis inventaris
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {labItems.slice(0, 6).map((item) => {
                          const hasIssue = item.functional_quantity < item.initial_quantity;
                          return (
                            <span
                              key={item.id}
                              className={`text-xs px-2 py-0.5 rounded-full border ${hasIssue ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 bg-white text-gray-600"}`}
                            >
                              {item.name}
                              {hasIssue && (
                                <span className="ml-1 text-red-500">
                                  ({item.functional_quantity}/{item.initial_quantity})
                                </span>
                              )}
                            </span>
                          );
                        })}
                        {labItems.length > 6 && (
                          <span className="text-xs text-gray-400 px-2 py-0.5">+{labItems.length - 6} lainnya</span>
                        )}
                      </div>
                      {issueCount > 0 && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" />
                          {issueCount} barang ada masalah
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Data diperbarui secara real-time dari sistem inventaris SMK Bintang Nusantara
      </footer>
    </div>
  );
}
