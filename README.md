# Pitutor

Pitutor adalah aplikasi web _peer-to-peer learning_ modern yang dirancang khusus untuk mahasiswa, mengusung konsep **"by students, for students"**. Platform ini memfasilitasi pembelajaran kolaboratif melalui _video courses_, sesi _mentoring 1-on-1_ secara real-time, dan bank soal/kuis interaktif.

## Tech Stack

Aplikasi ini dibangun menggunakan arsitektur full-stack modern:

- **Framework:** Next.js 16 (App Router) & React 19
- **Bahasa:** TypeScript
- **Database:** PostgreSQL & Prisma ORM
- **Authentication:** Auth.js (v5) - _Credentials Provider_
- **State Management:** XState v5 (untuk alur belajar, kuis, dan booking)
- **Data Fetching:** React Query & Server Actions
- **Styling:** Tailwind CSS & Framer Motion (Animasi)
- **Deployment:** Vercel (Frontend) & Supabase (Database PostgreSQL)

## Setup & Instalasi Lokal

Ikuti langkah berikut untuk menjalankan proyek di mesin lokal Anda:

1. **Install Dependency:**

   ```bash
   npm install
   ```

2. **Setup Environment Variables:**
   Salin file _template_ ke `.env`:

   ```bash
   cp .env.example .env
   ```

   _(Untuk pengguna Windows PowerShell: `Copy-Item .env.example .env`)_

   Buka file `.env` dan pastikan `DATABASE_URL` mengarah ke database PostgreSQL lokal atau Supabase Anda. Anda juga perlu mengisi `AUTH_SECRET` (generate menggunakan `npx auth secret`).

3. **Setup Database dengan Migration & Seed Data:**

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

   Jika database lokal Anda sudah pernah dibuat dengan `prisma db push` atau ingin reset total data lokal, gunakan:

   ```bash
   npm run db:reset
   npm run db:seed
   ```

   `db:reset` akan menghapus data dan apply ulang semua migration dari
   `prisma/migrations`. Jalankan `db:seed` setelahnya untuk membuat ulang akun
   admin awal.

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui `http://localhost:3000`.

## Akun Demo (Seeding)

Script `seed.mjs` saat ini akan membersihkan data aplikasi dan membuat akun admin awal:

- **Admin:** `admin@pitutor.edu`
- **Password:** `password123`

Admin hanya dibuat melalui seed database. Registrasi publik tetap tersedia di
`/sign-up`, tetapi hanya untuk role **Learner** dan **Tutor**.

## Routing & Struktur Aplikasi

Aplikasi dibagi menjadi 3 dashboard utama berdasarkan _Role_, dilindungi oleh Auth.js Session JWT dan fungsi `requireRole()`.

### Publik & Auth

- `/` - Landing Page interaktif
- `/sign-in` & `/sign-up` - Halaman autentikasi. Sign-up hanya untuk Learner/Tutor.
- `/onboarding` - Pemilihan Role (Learner/Tutor) untuk pengguna baru

### Dashboard Learner

- `/dashboard/learner` - Ringkasan statistik dan Jadwal Terdekat (Real-time).
- `/dashboard/learner/courses` - Katalog materi.
- `/dashboard/learner/courses/[courseId]/learn` - Video player interaktif & form rating dengan XState.
- `/dashboard/learner/mentoring` - Pencarian mentor & alur _booking_.
- `/dashboard/learner/quizzes` - Sesi kuis interaktif.

### Dashboard Tutor

_(Membutuhkan persetujuan Admin sebelum dapat diakses. Tutor baru akan diarahkan ke `/dashboard/tutor/pending`)_

- `/dashboard/tutor` - Ringkasan kelas dan jadwal.
- `/dashboard/tutor/courses` - Manajemen silabus dan upload video.
- `/dashboard/tutor/schedules` - Pengaturan waktu luang.
- `/dashboard/tutor/bookings` - Konfirmasi sesi dari Learner.

### Dashboard Admin

- `/dashboard/admin` - Pusat kontrol platform.
- `/dashboard/admin/users` - Pemantauan Role.
- `/dashboard/admin/courses` - Verifikasi materi pengajaran (`WAITING_REVIEW`).
- `/dashboard/admin/mentors` - **Tutor Verification**: Menerima/menyetujui profil tutor secara real-time.
