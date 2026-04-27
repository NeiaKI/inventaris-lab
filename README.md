# Inventaris Lab — SMK Bintang Nusantara

Sistem Informasi Inventaris Laboratorium Komputer Berbasis Web untuk SMK Bintang Nusantara Tangerang Selatan.

## Tentang Proyek

Aplikasi ini mendigitalkan pencatatan inventaris dan penggunaan laboratorium komputer yang sebelumnya dilakukan secara manual. Sistem mencatat sesi penggunaan lab per kelas, memvalidasi kondisi barang saat check-out, dan memberikan peringatan otomatis ke Admin jika terdapat selisih atau kerusakan.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State:** localStorage (mock — akan diganti dengan REST API)

## Fitur

### Admin / Kepala Lab
- Dashboard ringkasan: jumlah lab, barang, sesi aktif, dan peringatan terbaru
- CRUD Laboratorium
- CRUD Master Barang per lab (dengan filter per lab dan indikator selisih)
- Kelola Akun Kelas: tambah, edit, hapus, dan reset password
- Log Sesi: riwayat semua sesi dengan fitur pencarian

### Ketua Kelas
- Login dengan dropdown nama kelas + password
- Pilih lab dan mulai sesi (check-in)
- Lihat daftar inventaris lab yang sedang digunakan
- Form checklist check-out: input jumlah aktual dan kondisi tiap barang
- Layar hasil: **Status Aman** (hijau) atau **Ada Selisih / Kerusakan** (merah)

## Cara Menjalankan

```bash
# Clone repo
git clone https://github.com/NeiaKI/PKM.git
cd PKM

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun Demo

| Role | Pilihan di Dropdown | Password |
|------|---------------------|----------|
| Admin | Admin / Kepala Lab | `admin123` |
| Ketua Kelas | Nama kelas (cth. X RPL 1) | `kelas123` |

## Struktur Proyek

```
app/
├── page.tsx                   # Halaman login
├── admin/
│   ├── layout.tsx             # Layout admin dengan sidebar
│   ├── dashboard/page.tsx     # Dashboard & ringkasan
│   ├── labs/page.tsx          # Manajemen lab
│   ├── items/page.tsx         # Manajemen master barang
│   ├── classes/page.tsx       # Manajemen akun kelas
│   └── sessions/page.tsx      # Log sesi
└── kelas/
    ├── layout.tsx             # Layout ketua kelas
    ├── labs/page.tsx          # Pemilihan lab & mulai sesi
    ├── session/[id]/page.tsx  # Halaman sesi aktif
    ├── checkout/[id]/page.tsx # Form checklist check-out
    └── result/[id]/page.tsx   # Hasil validasi sesi

lib/
├── types.ts        # TypeScript types
├── mock-data.ts    # Data awal (mock)
├── store.ts        # Hooks localStorage
└── auth.ts         # Login & session management
```

## Roadmap

- [ ] Integrasi REST API backend (Next.js API Routes / Express)
- [ ] Database PostgreSQL dengan Prisma ORM
- [ ] Autentikasi berbasis JWT / session cookie
- [ ] Export laporan ke PDF / Excel
- [ ] Notifikasi real-time (WebSocket)