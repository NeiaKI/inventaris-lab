"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyRound, RotateCcw, Eye, EyeOff, ShieldAlert, Loader2, Sun, Moon, Monitor, MessageCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { DEV_WA_NUMBER, DEV_NAME } from "@/lib/mock-data";
import { useLang } from "@/lib/lang";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleChangePassword() {
    if (newPwd.length < 4) { toast.error(t.settings.password.errorShort); return; }
    if (newPwd !== confirmPwd) { toast.error(t.settings.password.errorMismatch); return; }
    setSavingPwd(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    setSavingPwd(false);
    if (!res.ok) { toast.error(t.settings.password.errorWrong); return; }
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success(t.settings.password.success);
  }

  async function handleResetData() {
    setResetting(true);
    const res = await fetch("/api/reset", { method: "POST" });
    setResetting(false);
    setResetOpen(false);
    if (!res.ok) { toast.error(t.settings.reset.error); return; }
    toast.success(t.settings.reset.success, { description: t.settings.reset.successDesc });
    setTimeout(() => window.location.reload(), 1200);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t.settings.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.settings.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                <Monitor className="h-4 w-4 text-purple-500" />
                {t.settings.appearance.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.settings.appearance.description}</p>
              <div className="grid grid-cols-3 gap-3">
                {/* Light mode */}
                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "light" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <div className="bg-gray-100 p-2">
                    <div className="bg-white rounded-lg p-2 space-y-1.5 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded bg-gray-800" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 rounded bg-gray-300 w-3/4" />
                          <div className="h-1 rounded bg-gray-200 w-1/2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-4 rounded bg-blue-100" />
                        <div className="h-4 rounded bg-green-100" />
                        <div className="h-4 rounded bg-purple-100" />
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-2 flex items-center justify-between ${theme === "light" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                    <div className="flex items-center gap-1.5">
                      <Sun className={`h-3.5 w-3.5 ${theme === "light" ? "text-blue-600" : "text-gray-500 dark:text-gray-400"}`} />
                      <span className={`text-sm font-medium ${theme === "light" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>{t.settings.appearance.light}</span>
                    </div>
                    {theme === "light" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                </button>

                {/* Dark mode */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "dark" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <div className="bg-gray-900 p-2">
                    <div className="bg-gray-800 rounded-lg p-2 space-y-1.5 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded bg-gray-100" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 rounded bg-gray-500 w-3/4" />
                          <div className="h-1 rounded bg-gray-600 w-1/2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-4 rounded bg-blue-900" />
                        <div className="h-4 rounded bg-green-900" />
                        <div className="h-4 rounded bg-purple-900" />
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-2 flex items-center justify-between ${theme === "dark" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                    <div className="flex items-center gap-1.5">
                      <Moon className={`h-3.5 w-3.5 ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>{t.settings.appearance.dark}</span>
                    </div>
                    {theme === "dark" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                </button>

                {/* System */}
                <button
                  onClick={() => setTheme("system")}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${theme === "system" ? "border-blue-500 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <div className="p-2" style={{ background: "linear-gradient(135deg, #f3f4f6 50%, #111827 50%)" }}>
                    <div className="rounded-lg p-2 space-y-1.5" style={{ background: "linear-gradient(135deg, #ffffff 50%, #1f2937 50%)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded" style={{ background: "linear-gradient(135deg, #374151 50%, #e5e7eb 50%)" }} />
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 rounded w-3/4" style={{ background: "linear-gradient(135deg, #d1d5db 50%, #4b5563 50%)" }} />
                          <div className="h-1 rounded w-1/2" style={{ background: "linear-gradient(135deg, #e5e7eb 50%, #374151 50%)" }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #dbeafe 50%, #1e3a5f 50%)" }} />
                        <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #dcfce7 50%, #14532d 50%)" }} />
                        <div className="h-4 rounded" style={{ background: "linear-gradient(135deg, #f3e8ff 50%, #3b0764 50%)" }} />
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-2 flex items-center justify-between ${theme === "system" ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-800"}`}>
                    <div className="flex items-center gap-1.5">
                      <Monitor className={`h-3.5 w-3.5 ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      <span className={`text-sm font-medium ${theme === "system" ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"}`}>{t.settings.appearance.system}</span>
                    </div>
                    {theme === "system" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                {theme === "system" ? t.settings.appearance.systemActive : theme === "dark" ? t.settings.appearance.darkActive : t.settings.appearance.lightActive}
              </p>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                <Globe className="h-4 w-4 text-blue-500" />
                {t.settings.language.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.settings.language.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLang("id")}
                  className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${lang === "id" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <span className="text-2xl">🇮🇩</span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${lang === "id" ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>{t.settings.language.id}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Indonesia</p>
                  </div>
                  {lang === "id" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${lang === "en" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${lang === "en" ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>{t.settings.language.en}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">English</p>
                  </div>
                  {lang === "en" && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                <KeyRound className="h-4 w-4 text-blue-500" />
                {t.settings.password.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pwd">{t.settings.password.current}</Label>
                <div className="relative">
                  <Input
                    id="current-pwd"
                    type={showPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder={t.settings.password.currentPlaceholder}
                  />
                  <button type="button" className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pwd">{t.settings.password.new}</Label>
                <Input
                  id="new-pwd"
                  type={showPwd ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder={t.settings.password.newPlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pwd">{t.settings.password.confirm}</Label>
                <Input
                  id="confirm-pwd"
                  type={showPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder={t.settings.password.confirmPlaceholder}
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!currentPwd || !newPwd || !confirmPwd || savingPwd}
                onClick={handleChangePassword}
              >
                {savingPwd ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                {t.settings.password.save}
              </Button>
            </CardContent>
          </Card>

          {/* Developer contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                <MessageCircle className="h-4 w-4 text-green-500" />
                {t.settings.feedback.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{DEV_NAME}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">+{DEV_WA_NUMBER}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.settings.feedback.description}</p>
              <a
                href={`https://wa.me/${DEV_WA_NUMBER}?text=Halo%20${encodeURIComponent(DEV_NAME)}%2C%20saya%20ingin%20bertanya%20mengenai%20Sistem%20Inventaris%20Lab%20SMK%20Bintang%20Nusantara.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t.settings.feedback.button}
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Reset Data */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <RotateCcw className="h-4 w-4" />
                {t.settings.reset.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.settings.reset.description}</p>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.settings.reset.button}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              {t.settings.reset.confirmTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-4 text-sm text-red-700 dark:text-red-200">
              {t.settings.reset.confirmBody}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>{t.common.cancel}</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={resetting} onClick={handleResetData}>
                {resetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                {t.settings.reset.confirmButton}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
