"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const translations = {
  id: {
    common: {
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      add: "Tambah",
      search: "Cari",
      back: "Kembali",
      close: "Tutup",
      yes: "Ya",
      no: "Tidak",
      loading: "Memuat...",
      noData: "Belum ada data.",
      logout: "Keluar",
    },
    nav: {
      dashboard: "Dashboard",
      labs: "Laboratorium",
      items: "Master Barang",
      classes: "Akun Kelas",
      sessions: "Log Sesi",
      lostReports: "Barang Hilang",
      schedule: "Jadwal Lab",
      stats: "Statistik",
      settings: "Pengaturan",
      appName: "Inventaris Lab",
      schoolName: "SMK Bintang Nusantara",
      role: "Kepala Laboratorium",
    },
    settings: {
      title: "Pengaturan",
      description: "Kelola keamanan akun dan data sistem",
      appearance: {
        title: "Tampilan",
        description: "Pilih tema antarmuka admin",
        light: "Terang",
        dark: "Gelap",
        system: "Sistem",
        lightActive: "Tema terang aktif.",
        darkActive: "Tema gelap aktif.",
        systemActive: "Mengikuti pengaturan sistem operasi perangkat.",
      },
      language: {
        title: "Bahasa",
        description: "Pilih bahasa antarmuka",
        id: "Indonesia",
        en: "English",
      },
      password: {
        title: "Ganti Password Admin",
        current: "Password Saat Ini",
        currentPlaceholder: "Masukkan password saat ini",
        new: "Password Baru",
        newPlaceholder: "Minimal 4 karakter",
        confirm: "Konfirmasi Password Baru",
        confirmPlaceholder: "Ulangi password baru",
        save: "Simpan Password Baru",
        errorShort: "Password baru minimal 4 karakter.",
        errorMismatch: "Konfirmasi password tidak cocok.",
        errorWrong: "Password saat ini salah.",
        success: "Password berhasil diubah.",
      },
      reset: {
        title: "Reset Data Demo",
        description: "Hapus semua data sesi, laporan, dan perubahan inventaris. Data akan kembali ke kondisi awal (mock data). Aksi ini tidak dapat dibatalkan.",
        button: "Reset Semua Data",
        confirmTitle: "Konfirmasi Reset Data",
        confirmBody: "Semua data akan dihapus permanen: sesi, laporan hilang, perubahan inventaris, dan log peringatan. Data kembali ke kondisi demo awal.",
        confirmButton: "Ya, Reset Sekarang",
        error: "Gagal mereset data.",
        success: "Data berhasil direset ke awal.",
        successDesc: "Halaman akan dimuat ulang...",
      },
      feedback: {
        title: "Feedback & Bantuan",
        description: "Temukan bug atau punya saran? Hubungi developer.",
        button: "Hubungi via WhatsApp",
      },
    },
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      back: "Back",
      close: "Close",
      yes: "Yes",
      no: "No",
      loading: "Loading...",
      noData: "No data yet.",
      logout: "Logout",
    },
    nav: {
      dashboard: "Dashboard",
      labs: "Laboratories",
      items: "Inventory",
      classes: "Class Accounts",
      sessions: "Session Log",
      lostReports: "Lost Items",
      schedule: "Lab Schedule",
      stats: "Statistics",
      settings: "Settings",
      appName: "Lab Inventory",
      schoolName: "SMK Bintang Nusantara",
      role: "Lab Administrator",
    },
    settings: {
      title: "Settings",
      description: "Manage account security and system data",
      appearance: {
        title: "Appearance",
        description: "Choose the admin interface theme",
        light: "Light",
        dark: "Dark",
        system: "System",
        lightActive: "Light theme active.",
        darkActive: "Dark theme active.",
        systemActive: "Follows the device operating system settings.",
      },
      language: {
        title: "Language",
        description: "Choose interface language",
        id: "Indonesian",
        en: "English",
      },
      password: {
        title: "Change Admin Password",
        current: "Current Password",
        currentPlaceholder: "Enter current password",
        new: "New Password",
        newPlaceholder: "Minimum 4 characters",
        confirm: "Confirm New Password",
        confirmPlaceholder: "Repeat new password",
        save: "Save New Password",
        errorShort: "New password must be at least 4 characters.",
        errorMismatch: "Password confirmation does not match.",
        errorWrong: "Current password is incorrect.",
        success: "Password changed successfully.",
      },
      reset: {
        title: "Reset Demo Data",
        description: "Delete all session data, reports, and inventory changes. Data will return to its initial state (mock data). This action cannot be undone.",
        button: "Reset All Data",
        confirmTitle: "Confirm Data Reset",
        confirmBody: "All data will be permanently deleted: sessions, lost reports, inventory changes, and alert logs. Data returns to initial demo state.",
        confirmButton: "Yes, Reset Now",
        error: "Failed to reset data.",
        success: "Data successfully reset to initial state.",
        successDesc: "Page will reload...",
      },
      feedback: {
        title: "Feedback & Help",
        description: "Found a bug or have suggestions? Contact the developer.",
        button: "Contact via WhatsApp",
      },
    },
  },
};

type Lang = "id" | "en";
type Translations = typeof translations.id;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    const saved = localStorage.getItem("inv_lang") as Lang | null;
    if (saved === "id" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("inv_lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
