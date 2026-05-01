import type { Lab, LabItem, ClassAccount, Session, Alert, LostItemReport, LabSchedule } from "./types";

export const MOCK_LABS: Lab[] = [
  { id: 1, name: "Lab Komputer 1", location: "Gedung A, Lantai 2", created_at: "2024-01-10" },
  { id: 2, name: "Lab RPL", location: "Gedung B, Lantai 1", created_at: "2024-01-10" },
  { id: 3, name: "Lab Jaringan", location: "Gedung B, Lantai 2", created_at: "2024-01-11" },
];

export const MOCK_ITEMS: LabItem[] = [
  { id: 1, lab_id: 1, name: "PC / Komputer", category: "Hardware", initial_quantity: 30, functional_quantity: 28 },
  { id: 2, lab_id: 1, name: "Monitor", category: "Hardware", initial_quantity: 30, functional_quantity: 29 },
  { id: 3, lab_id: 1, name: "Keyboard", category: "Periferal", initial_quantity: 30, functional_quantity: 30 },
  { id: 4, lab_id: 1, name: "Mouse", category: "Periferal", initial_quantity: 30, functional_quantity: 30 },
  { id: 5, lab_id: 1, name: "Kursi", category: "Furnitur", initial_quantity: 32, functional_quantity: 32 },
  { id: 6, lab_id: 1, name: "Proyektor", category: "Hardware", initial_quantity: 1, functional_quantity: 1 },
  { id: 7, lab_id: 2, name: "PC / Komputer", category: "Hardware", initial_quantity: 25, functional_quantity: 25 },
  { id: 8, lab_id: 2, name: "Monitor", category: "Hardware", initial_quantity: 25, functional_quantity: 25 },
  { id: 9, lab_id: 2, name: "Keyboard", category: "Periferal", initial_quantity: 25, functional_quantity: 24 },
  { id: 10, lab_id: 2, name: "Mouse", category: "Periferal", initial_quantity: 25, functional_quantity: 25 },
  { id: 11, lab_id: 3, name: "Switch", category: "Jaringan", initial_quantity: 5, functional_quantity: 5 },
  { id: 12, lab_id: 3, name: "Kabel LAN", category: "Jaringan", initial_quantity: 50, functional_quantity: 48 },
  { id: 13, lab_id: 3, name: "PC / Komputer", category: "Hardware", initial_quantity: 20, functional_quantity: 20 },
];

export const MOCK_CLASSES: ClassAccount[] = [
  { id: 1, name: "X RPL 1", username: "x-rpl-1", password: "kelas123" },
  { id: 2, name: "X RPL 2", username: "x-rpl-2", password: "kelas123" },
  { id: 3, name: "XI RPL 1", username: "xi-rpl-1", password: "kelas123" },
  { id: 4, name: "XI TKJ 1", username: "xi-tkj-1", password: "kelas123" },
  { id: 5, name: "XII RPL 1", username: "xii-rpl-1", password: "kelas123" },
];

export const MOCK_SESSIONS: Session[] = [
  { id: 1, lab_id: 1, class_id: 1, started_at: "2025-04-26T08:00:00", ended_at: "2025-04-26T10:00:00", status: "aman" },
  { id: 2, lab_id: 2, class_id: 3, started_at: "2025-04-26T10:00:00", ended_at: "2025-04-26T12:00:00", status: "selisih" },
  { id: 3, lab_id: 1, class_id: 2, started_at: "2025-04-27T08:00:00", ended_at: "2025-04-27T10:00:00", status: "aman" },
  { id: 4, lab_id: 3, class_id: 4, started_at: "2025-04-27T10:00:00", ended_at: null, status: "aktif" },
];

export const MOCK_ALERTS: Alert[] = [
  { id: 1, session_id: 2, lab_item_id: 9, type: "selisih", message: "Keyboard berkurang 1 unit saat sesi XI RPL 1 di Lab RPL.", created_at: "2025-04-26T12:05:00" },
  { id: 2, session_id: 2, lab_item_id: 8, type: "rusak", message: "Monitor dilaporkan rusak oleh XI RPL 1 di Lab RPL.", created_at: "2025-04-26T12:05:00" },
];

export const MOCK_LOST_REPORTS: LostItemReport[] = [];

export const MOCK_SCHEDULES: LabSchedule[] = [
  { id: 1, lab_id: 1, class_id: 1, day_of_week: "Senin", start_time: "07:00", end_time: "09:00", subject: "Pemrograman Dasar", created_at: "2024-01-10" },
  { id: 2, lab_id: 1, class_id: 2, day_of_week: "Senin", start_time: "09:00", end_time: "11:00", subject: "Basis Data", created_at: "2024-01-10" },
  { id: 3, lab_id: 2, class_id: 3, day_of_week: "Selasa", start_time: "07:00", end_time: "09:30", subject: "Rekayasa Perangkat Lunak", created_at: "2024-01-10" },
  { id: 4, lab_id: 3, class_id: 4, day_of_week: "Rabu", start_time: "09:00", end_time: "11:00", subject: "Jaringan Komputer", created_at: "2024-01-10" },
  { id: 5, lab_id: 1, class_id: 5, day_of_week: "Kamis", start_time: "07:00", end_time: "09:00", subject: "Pemrograman Web", created_at: "2024-01-10" },
  { id: 6, lab_id: 2, class_id: 1, day_of_week: "Jumat", start_time: "07:00", end_time: "09:00", subject: "Proyek Perangkat Lunak", created_at: "2024-01-10" },
];

export const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

// Ganti nomor WA admin di sini (format: 62xxx tanpa +)
export const ADMIN_WA_NUMBER = "6289652865939";

// Ganti nomor WA developer di sini (format: 62xxx tanpa +)
export const DEV_WA_NUMBER = "6289652865939";
export const DEV_NAME = "NEki";
