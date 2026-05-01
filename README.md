# Inventaris Lab — SMK Bintang Nusantara

Sistem Informasi Inventaris Laboratorium Komputer Berbasis Web untuk SMK Bintang Nusantara Tangerang Selatan.

## Tentang Proyek

Aplikasi ini mendigitalkan pencatatan inventaris dan penggunaan laboratorium komputer yang sebelumnya dilakukan secara manual. Sistem mencatat sesi penggunaan lab per kelas, memvalidasi kondisi barang saat check-out, dan memberikan peringatan otomatis ke Admin jika terdapat selisih atau kerusakan.

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL) |
| State (client) | localStorage via custom hooks |
| Auth | Session cookie + Middleware Next.js |
| Theme | next-themes (terang / gelap / sistem) |
| Notifikasi UI | sonner |
| Icons | lucide-react |
| Deployment | Vercel (dengan cron job) |

## Fitur

### Admin / Kepala Lab
- **Dashboard** — ringkasan total lab, barang, akun kelas, sesi aktif, peringatan, dan laporan hilang baru
- **Laboratorium** — tambah, edit, hapus lab
- **Master Barang** — CRUD barang per lab, indikator selisih/kerusakan
- **Akun Kelas** — tambah, edit, hapus, reset password akun kelas
- **Log Sesi** — riwayat semua sesi dengan pencarian dan filter
- **Barang Hilang** — terima dan kelola laporan kehilangan dari kelas, lightbox foto bukti
- **Jadwal Lab** — atur jadwal penggunaan lab per hari dan kelas
- **Statistik** — grafik penggunaan lab, barang, dan sesi
- **Pengaturan** — ganti password, pilih tema (terang/gelap/sistem), reset data demo, hubungi developer via WhatsApp
- **Notifikasi Bell** — peringatan real-time selisih, kerusakan, dan laporan hilang baru
- **Proteksi rute** — middleware server-side untuk semua halaman `/admin/*`

### Ketua Kelas
- Login dengan dropdown nama kelas + password
- Pilih lab dan mulai sesi (check-in)
- Lihat daftar inventaris lab yang sedang digunakan
- Form checklist check-out: input jumlah aktual dan kondisi tiap barang
- Halaman hasil: **Status Aman** (hijau) atau **Ada Selisih / Kerusakan** (merah)
- Riwayat sesi sebelumnya
- Laporan barang hilang dengan upload foto bukti
- Auto-expire sesi aktif yang lebih dari 24 jam

## Cara Menjalankan

```bash
# Clone repo
git clone https://github.com/NeiaKI/inventaris-lab.git
cd inventaris-lab

# Install dependencies
npm install

# Salin dan isi environment variable
cp .env.example .env.local
# → isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Akun Demo

| Role | Login | Password |
|------|-------|----------|
| Admin / Kepala Lab | `/admin` | `admin123` |
| Ketua Kelas | Pilih nama kelas di dropdown | `kelas123` |

## Struktur Proyek

```
app/
├── page.tsx                      # Halaman login kelas
├── admin/
│   ├── layout.tsx                # Layout admin + sidebar navigasi
│   ├── page.tsx                  # Login admin
│   ├── dashboard/page.tsx        # Dashboard & ringkasan
│   ├── labs/page.tsx             # Manajemen laboratorium
│   ├── items/page.tsx            # Manajemen master barang
│   ├── classes/page.tsx          # Manajemen akun kelas
│   ├── sessions/page.tsx         # Log sesi penggunaan
│   ├── lost-reports/page.tsx     # Laporan barang hilang
│   ├── schedule/page.tsx         # Jadwal lab
│   ├── stats/page.tsx            # Statistik
│   └── settings/page.tsx         # Pengaturan (tema, password, reset, developer)
├── kelas/
│   ├── layout.tsx                # Layout ketua kelas
│   ├── labs/page.tsx             # Pemilihan lab & mulai sesi
│   ├── session/[id]/page.tsx     # Halaman sesi aktif
│   ├── checkout/[id]/page.tsx    # Form checklist check-out
│   ├── result/[id]/page.tsx      # Hasil validasi sesi
│   └── history/page.tsx          # Riwayat sesi
└── api/
    ├── auth/login/route.ts        # Login endpoint
    ├── auth/logout/route.ts       # Logout endpoint
    ├── auth/change-password/      # Ganti password admin
    ├── setup/route.ts             # Inisialisasi data awal
    ├── reset/route.ts             # Reset data demo
    └── cron/expire-sessions/      # Cron: expire sesi > 24 jam

lib/
├── types.ts        # TypeScript types
├── mock-data.ts    # Data awal & konstanta (nomor WA, kredensial demo)
├── store.ts        # Custom hooks localStorage
├── supabase.ts     # Supabase client
└── auth.ts         # Login & session management

middleware.ts       # Proteksi rute /admin/* dan /kelas/*
```