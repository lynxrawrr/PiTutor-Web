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
- **Storage:** Supabase Storage untuk upload thumbnail/avatar/PDF di production
- **Deployment:** Vercel (Frontend) & Supabase (PostgreSQL + Storage)

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

## Deployment Vercel + Supabase

Bagian ini adalah checklist step-by-step supaya aplikasi jalan di Vercel, database ada di Supabase Postgres, dan file upload seperti thumbnail/avatar/PDF masuk ke Supabase Storage.

### 1. Install Dependency

Untuk fresh clone, jalankan:

```bash
npm install
```

Project ini sudah memakai package berikut untuk production deployment:

- `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg` untuk Supabase Postgres.
- `next-auth` untuk Auth.js.
- `@supabase/supabase-js` untuk Supabase Storage upload.

Kalau package Supabase Storage belum ada di environment Anda, install manual:

```bash
npm install @supabase/supabase-js
```

### 2. Buat Project Supabase

1. Buka Supabase Dashboard.
2. Buat project baru.
3. Simpan **Project URL** dari **Project Settings > API**.
4. Simpan **service_role key** dari **Project Settings > API**.
5. Buka menu **Connect** atau **Project Settings > Database** untuk mengambil connection string database.

Gunakan dua connection string:

- **Session pooler / direct connection port 5432** untuk menjalankan migration dari lokal.
- **Transaction pooler port 6543** untuk runtime Vercel.

Contoh:

```env
# Untuk migration/seed dari lokal
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"

# Untuk runtime Vercel
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Jika password database punya karakter spesial seperti `@`, `#`, `/`, `:`, atau `%`, encode dulu password-nya agar connection string tidak rusak.

### 3. Buat Bucket Supabase Storage

1. Buka Supabase Dashboard.
2. Masuk ke **Storage**.
3. Klik **New bucket**.
4. Nama bucket:

```text
pitutor-uploads
```

5. Untuk MVP, aktifkan **Public bucket** agar URL hasil upload bisa langsung dibuka browser.

Route upload project ini ada di `src/app/api/upload/route.ts`. Jika env Supabase Storage tersedia, file akan diupload ke bucket `pitutor-uploads`. Jika env kosong, route fallback ke `public/uploads` hanya untuk local development. Di production, env storage wajib lengkap agar file tidak diam-diam ditulis ke filesystem Vercel.

### 4. Environment Variables Local

Salin `.env.example`:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Contoh `.env` untuk local dengan PostgreSQL lokal dan upload lokal:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pitutor?schema=public"

AUTH_SECRET="replace-with-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET="pitutor-uploads"
```

Contoh `.env` untuk local tetapi database dan upload sudah memakai Supabase:

```env
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"

AUTH_SECRET="replace-with-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SUPABASE_SERVICE_ROLE_KEY]"
SUPABASE_STORAGE_BUCKET="pitutor-uploads"
```

Generate `AUTH_SECRET`:

```bash
npx auth secret
```

### 5. Jalankan Migration dan Seed ke Supabase

Untuk database Supabase kosong, jalankan dari terminal lokal dengan `DATABASE_URL` session pooler port `5432`:

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
npm run db:deploy
npm run db:seed
Remove-Item Env:DATABASE_URL
```

Bash:

```bash
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:deploy
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:seed
```

Seed membuat satu akun admin:

```text
Email: admin@pitutor.edu
Password: password123
```

### 6. Set Environment Variables di Vercel

Di Vercel Project Settings > Environment Variables, isi untuk **Production** dan **Preview**:

```env
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

AUTH_SECRET="[HASIL_NPX_AUTH_SECRET]"
AUTH_TRUST_HOST="true"
AUTH_URL="https://pitutor.vercel.app"
NEXTAUTH_URL="https://pitutor.vercel.app"
NEXT_PUBLIC_APP_URL="https://pitutor.vercel.app"

SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SUPABASE_SERVICE_ROLE_KEY]"
SUPABASE_STORAGE_BUCKET="pitutor-uploads"
```

Jika memakai custom domain, ganti semua URL `https://pitutor.vercel.app` menjadi domain production Anda.

Jangan memakai `NEXT_PUBLIC_` untuk `SUPABASE_SERVICE_ROLE_KEY`. Key ini hanya boleh berada di server environment.

### 7. Build dan Deploy di Vercel

1. Push project ke GitHub/GitLab/Bitbucket.
2. Import repo di Vercel.
3. Framework preset: **Next.js**.
4. Build command:

```bash
npm run db:generate && npm run build
```

5. Install command:

```bash
npm install
```

6. Deploy.

### 8. Verifikasi Setelah Deploy

1. Buka URL Vercel.
2. Login:

```text
admin@pitutor.edu
password123
```

3. Buat akun learner/tutor dari `/sign-up`.
4. Verifikasi tutor dari dashboard admin.
5. Coba upload thumbnail/avatar/PDF dari fitur yang memakai `/api/upload`.
6. Buka Supabase Dashboard > Storage > `pitutor-uploads` dan pastikan file masuk ke folder `uploads/`.
7. Cek field database seperti `User.avatarUrl`, `Course.thumbnailUrl`, atau `Lesson.moduleUrl`; field tersebut seharusnya menyimpan URL Supabase Storage.

### 9. Reset Supabase Staging/Development

Gunakan hanya untuk database staging/development karena data akan hilang.

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
npm run db:reset
npm run db:seed
Remove-Item Env:DATABASE_URL
```

Bash:

```bash
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:reset
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:seed
```

### 10. Catatan Upload Production

Di Vercel, jangan mengandalkan file hasil tulis ke `public/uploads` karena runtime filesystem tidak persistent. Dengan env Supabase Storage yang lengkap, route `/api/upload` akan menyimpan file ke Supabase Storage dan mengembalikan public URL.

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
