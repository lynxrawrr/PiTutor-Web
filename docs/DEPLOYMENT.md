# Deployment Guide: Pitutor

Panduan ini menjelaskan deploy Pitutor ke **Vercel** dengan **Supabase Postgres** untuk database dan **Supabase Storage** untuk upload file. Target akhirnya:

- Data aplikasi tersimpan di Supabase Postgres.
- File upload seperti thumbnail/avatar/PDF tersimpan di Supabase Storage.
- Vercel hanya menjalankan aplikasi Next.js, tidak menyimpan file upload.

## 0. Prasyarat

Install dan akun yang dibutuhkan:

- Node.js 20+.
- npm.
- Git.
- Akun Supabase.
- Akun Vercel.
- Repository GitHub/GitLab/Bitbucket.
- PostgreSQL client optional untuk command seperti `pg_dump`/`pg_restore`.

Install dependency project:

```bash
npm install
```

Package penting untuk deployment:

- `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg` untuk Supabase Postgres.
- `next-auth` untuk Auth.js.
- `@supabase/supabase-js` untuk Supabase Storage.

Jika package Supabase Storage belum ada:

```bash
npm install @supabase/supabase-js
```

## 1. Status Project

- Framework: Next.js App Router.
- Database: Prisma 7 + PostgreSQL.
- Prisma datasource URL dibaca dari `prisma.config.ts` melalui `DATABASE_URL`.
- Migration tersedia di `prisma/migrations/20260520000000_init`.
- Auth: Auth.js/NextAuth v5 beta dengan Credentials Provider dan JWT session.
- Register publik hanya untuk `LEARNER` dan `TUTOR`.
- Admin hanya dibuat dari seed database.
- Seed membuat `admin@pitutor.edu` dengan password `password123`.
- Upload route `src/app/api/upload/route.ts` memakai Supabase Storage jika env storage tersedia. Fallback ke `public/uploads` hanya untuk local development; production akan error jika env storage belum lengkap.

## 2. Buat Project Supabase

1. Buka Supabase Dashboard.
2. Buat project baru.
3. Catat **Project Ref** dari URL project.
4. Buka **Project Settings > API**.
5. Simpan:
   - `Project URL`
   - `service_role key`
6. Buka **Connect** atau **Project Settings > Database**.
7. Siapkan dua connection string:
   - **Session pooler port 5432** untuk migration/seed dari lokal.
   - **Transaction pooler port 6543** untuk runtime Vercel.

### Yang Dicopy dari Panel Supabase

Jika di Supabase muncul panel seperti:

```text
Project URL
Publishable key
Direct connection string
CLI setup commands
Get Connected
```

Pilih seperti ini:

| Item di Supabase                                 | Dipakai untuk                                  | Env Pitutor                                    |
| ------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| **Project URL**                                  | URL project Supabase untuk Storage             | `SUPABASE_URL`                                 |
| **Publishable key**                              | Tidak dipakai untuk upload server-side Pitutor | Jangan masukkan ke `SUPABASE_SERVICE_ROLE_KEY` |
| **Direct connection string**                     | Boleh untuk migration/seed lokal               | `DATABASE_URL` lokal sementara                 |
| **Get Connected**                                | Cari pooler connection string                  | `DATABASE_URL` Vercel dan migration            |
| **service_role key** dari Project Settings > API | Upload server-side ke Storage                  | `SUPABASE_SERVICE_ROLE_KEY`                    |

Detailnya:

- Untuk `SUPABASE_URL`, copy **Project URL**.
- Untuk `SUPABASE_SERVICE_ROLE_KEY`, jangan copy **Publishable key**. Buka **Project Settings > API**, lalu copy key dengan nama **service_role**.
- Untuk migration/seed lokal, boleh copy **Direct connection string**. Ganti `[YOUR-PASSWORD]` dengan database password project.
- Untuk Vercel runtime, klik **Get Connected**, cari **Transaction pooler** atau **Supavisor Transaction mode** port `6543`, lalu tambahkan `?pgbouncer=true` jika belum ada.
- Untuk command Prisma dari lokal yang memakai pooler, klik **Get Connected**, cari **Session pooler** port `5432`.

Contoh:

```env
# Untuk migration/seed dari terminal lokal
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"

# Untuk runtime Vercel
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[DB_PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Catatan:

- Untuk Vercel/serverless, gunakan transaction pooler port `6543`.
- Untuk Prisma CLI migration/seed, gunakan session pooler port `5432` atau direct connection.
- Jika password database berisi karakter spesial seperti `@`, `#`, `%`, `/`, atau `:`, lakukan URL encode.

## 3. Buat Bucket Supabase Storage

1. Buka **Storage** di Supabase Dashboard.
2. Klik **New bucket**.
3. Nama bucket:

```text
pitutor-uploads
```

4. Untuk MVP, aktifkan **Public bucket**.

Kenapa public bucket? Route upload saat ini mengembalikan public URL dengan `getPublicUrl()`. Jika bucket private, perlu implementasi signed URL tambahan.

Folder object yang dipakai aplikasi:

```text
uploads/[timestamp]_[filename]
```

## 4. Environment Local

Salin template:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

### Opsi A - Local DB dan Local Upload

Gunakan ini untuk development biasa.

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

Dengan konfigurasi ini, `/api/upload` fallback ke `public/uploads` selama `NODE_ENV` bukan `production`.

### Opsi B - Local App, Supabase DB, Supabase Storage

Gunakan ini jika ingin local development sudah memakai Supabase.

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

## 5. Migration dan Seed Database

Untuk database Supabase kosong, jalankan dari terminal lokal dengan connection string port `5432`.

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

Seed membuat akun:

```text
Email: admin@pitutor.edu
Password: password123
```

Jika database pernah dibuat dengan `prisma db push`, jangan langsung jalankan `migrate deploy` karena tabel/enum sudah ada. Untuk staging/development, reset dulu:

```bash
npm run db:reset
npm run db:seed
```

## 6. Environment Variables Vercel

Tambahkan semua variable berikut di **Vercel Project Settings > Environment Variables** untuk Production dan Preview.

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

Jika memakai custom domain, ganti:

```text
https://pitutor.vercel.app
```

dengan domain production Anda.

Keamanan:

- Jangan commit `.env`.
- Jangan memberi prefix `NEXT_PUBLIC_` pada `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai server-side.

## 7. Konfigurasi Build Vercel

Di Vercel:

- Framework Preset: **Next.js**
- Install Command:

```bash
npm install
```

- Build Command:

```bash
npm run db:generate && npm run build
```

- Output Directory: default Next.js.

Kenapa `db:generate`? Prisma Client perlu dibuat sebelum Next.js build.

## 8. Deploy

1. Push branch ke repository.
2. Import repository di Vercel.
3. Isi environment variables.
4. Pastikan migration dan seed sudah dijalankan ke Supabase.
5. Deploy.
6. Buka URL Vercel.

Login admin:

```text
admin@pitutor.edu
password123
```

## 9. Verifikasi Upload Supabase Storage

1. Login ke aplikasi.
2. Jalankan fitur yang memakai upload, misalnya avatar, thumbnail, atau module PDF.
3. Setelah upload, buka Supabase Dashboard.
4. Masuk ke **Storage > pitutor-uploads**.
5. Pastikan file muncul di folder `uploads/`.
6. Cek response `/api/upload`; jika sukses production, response berisi:

```json
{
  "url": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/pitutor-uploads/uploads/...",
  "storage": "supabase"
}
```

Jika response `"storage": "local"`, artinya aplikasi sedang berjalan di development lokal tanpa env Supabase Storage. Di production, env storage yang tidak lengkap akan membuat upload gagal agar file tidak diam-diam ditulis ke filesystem Vercel.

## 10. Cara Reset Supabase Development/Staging

Hati-hati: perintah ini menghapus data.

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

Reset ini tidak menghapus file di Supabase Storage. Jika ingin membersihkan storage juga, hapus object dari Supabase Dashboard > Storage.

## 11. Migrasi File Lama dari `public/uploads`

Jika sebelumnya ada file lokal di `public/uploads`:

1. Upload file tersebut ke Supabase Storage bucket `pitutor-uploads`, folder `uploads/`.
2. Update URL lama di database.

Contoh URL lama:

```text
/uploads/1779208239744_download.jpeg
```

Ganti menjadi:

```text
https://[PROJECT_REF].supabase.co/storage/v1/object/public/pitutor-uploads/uploads/1779208239744_download.jpeg
```

Field yang mungkin perlu dicek:

- `User.avatarUrl`
- `Course.thumbnailUrl`
- `Lesson.moduleUrl`

## 12. Troubleshooting

### Upload masih masuk lokal

Pastikan env ini ada di Vercel:

```env
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SUPABASE_SERVICE_ROLE_KEY]"
SUPABASE_STORAGE_BUCKET="pitutor-uploads"
```

### File berhasil upload tapi URL tidak bisa dibuka

Pastikan bucket `pitutor-uploads` adalah public bucket. Jika bucket private, route perlu diubah memakai signed URL.

### Prisma connection error di Vercel

Pastikan `DATABASE_URL` Vercel memakai transaction pooler port `6543` dan parameter `?pgbouncer=true`.

### Migration gagal karena tabel sudah ada

Database kemungkinan pernah dibuat dengan `db push`. Untuk staging/development, gunakan:

```bash
npm run db:reset
npm run db:seed
```

Untuk production berisi data penting, lakukan baseline migration dengan hati-hati.

## Referensi Resmi

- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Storage upload: https://supabase.com/docs/guides/storage/uploads/standard-uploads
- Supabase + Prisma: https://supabase.com/docs/guides/database/prisma
- Vercel upload guidance: https://vercel.com/guides/how-to-upload-and-store-files-with-vercel
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Auth.js deployment: https://authjs.dev/getting-started/deployment
