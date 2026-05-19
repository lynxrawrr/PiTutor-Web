# Deployment Guide: Pitutor

Panduan ini menjelaskan cara deploy Pitutor ke Vercel dengan database PostgreSQL di Supabase, plus cara reset database saat development/staging.

## Status Project Saat Ini

- Framework: Next.js App Router.
- Database: Prisma 7 + PostgreSQL. URL database dibaca dari `prisma.config.ts`, bukan dari `url = env(...)` di `schema.prisma`.
- Auth: Auth.js/NextAuth v5 beta dengan Credentials Provider dan JWT session.
- Migration: sudah ada initial migration di `prisma/migrations/20260520000000_init`. Workflow utama sekarang adalah `prisma migrate dev` untuk local dan `prisma migrate deploy` untuk staging/production.
- Seed: `prisma/seed.mjs` saat ini membersihkan data aplikasi lalu membuat akun admin `admin@pitutor.edu` dengan password `password123`.
- Upload file: `src/app/api/upload/route.ts` menulis ke `public/uploads`. Ini tidak persistent di Vercel. Untuk production, pindahkan upload thumbnail/avatar/PDF ke Supabase Storage atau service storage lain.

## 1. Buat Database Supabase

1. Buka Supabase Dashboard dan buat project baru.
2. Masuk ke project, klik **Connect** atau **Project Settings > Database**.
3. Siapkan dua connection string:
   - Runtime Vercel: gunakan Supavisor Transaction pooler, biasanya port `6543`.
   - Setup schema dari lokal: gunakan Supavisor Session pooler port `5432` atau Direct connection.

Catatan:

- Supabase merekomendasikan transaction pooler untuk serverless/auto-scaling runtime seperti Vercel.
- Transaction pooler tidak mendukung prepared statements. Jika muncul error prepared statement saat memakai Prisma, tambahkan parameter `?pgbouncer=true` pada connection string, atau gunakan session pooler untuk command Prisma CLI.
- Karena repo ini hanya membaca `DATABASE_URL`, gunakan value `DATABASE_URL` yang berbeda sesuai konteks: runtime Vercel memakai transaction pooler, sedangkan setup/reset database lokal memakai session/direct URL.

Contoh format:

```env
# Runtime Vercel
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Local setup/reset command
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
```

## 2. Environment Variables Vercel

Tambahkan environment variables ini di Vercel Project Settings:

| Variable              | Contoh                                        | Keterangan                                                                                      |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | `postgres://...:6543/postgres?pgbouncer=true` | Supabase transaction pooler untuk runtime Vercel.                                               |
| `AUTH_SECRET`         | hasil `npx auth secret`                       | Wajib untuk Auth.js. Minimal 32 karakter random.                                                |
| `AUTH_TRUST_HOST`     | `true`                                        | Aman diset eksplisit untuk reverse proxy/hosting. Kode juga sudah memakai `trustHost: true`.    |
| `AUTH_URL`            | `https://pitutor.vercel.app`                  | Opsional di Auth.js v5, tapi berguna jika host inference bermasalah atau memakai custom domain. |
| `NEXTAUTH_URL`        | `https://pitutor.vercel.app`                  | Compatibility variable untuk ekosistem NextAuth lama.                                           |
| `NEXT_PUBLIC_APP_URL` | `https://pitutor.vercel.app`                  | Base URL publik aplikasi.                                                                       |

Untuk generate secret:

```bash
npx auth secret
```

## 3. Deploy ke Vercel

1. Push project ke GitHub/GitLab/Bitbucket.
2. Import repository di Vercel.
3. Pilih framework preset **Next.js**.
4. Set environment variables dari bagian sebelumnya untuk Production dan Preview.
5. Gunakan build command berikut agar Prisma Client dibuat sebelum Next.js build:

```bash
npm run db:generate && npm run build
```

6. Deploy.

Jika ingin build command tetap default Vercel, tambahkan script `postinstall` di `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## 4. Setup Schema dan Seed Supabase

Gunakan migration untuk membuat schema database. Jalankan dari terminal lokal dengan connection string Session pooler port `5432` atau Direct connection.

Jika database target masih kosong, langsung jalankan:

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
npm run db:deploy
npm run db:seed
Remove-Item Env:DATABASE_URL
```

Bash:

```bash
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:deploy
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:seed
```

Jika database target sebelumnya sudah pernah dibuat dengan `prisma db push`, jangan langsung jalankan `migrate deploy` ke database yang sama karena tabel/enum sudah ada. Untuk development/staging, paling sederhana reset dulu dengan `npm run db:reset`, lalu jalankan `npm run db:seed`. Untuk production yang sudah berisi data penting, lakukan baseline migration dengan hati-hati sebelum memakai workflow migration.

Setelah itu, buka URL Vercel dan login dengan:

```text
Email: admin@pitutor.edu
Password: password123
```

## 5. Workflow Migration Local

Untuk development lokal, gunakan migration setiap kali schema berubah:

```bash
npm run db:migrate -- --name nama_perubahan
```

Contoh:

```bash
npm run db:migrate -- --name add_course_tags
```

Command ini membuat folder migration baru, apply ke database lokal, dan menjalankan generator Prisma.

Untuk production/staging, jangan gunakan `migrate dev`. Gunakan:

```bash
npm run db:deploy
```

Jalankan seed hanya saat inisialisasi database kosong atau saat memang ingin reset data demo:

```bash
npm run db:seed
```

Catatan penting: `prisma migrate deploy` tidak melakukan reset database, tidak mengecek drift, dan memang ditujukan untuk production/staging.

## 6. Cara Reset Database

Pilih sesuai kebutuhan. Semua opsi reset di bawah akan menghapus data. Gunakan hanya untuk development/staging atau saat memang ingin wipe production.

### Opsi A - Reset Data Aplikasi Saja

Script seed saat ini sudah menghapus data model aplikasi lalu membuat admin baru.

```bash
npm run db:seed
```

Gunakan ini jika schema masih benar dan Anda hanya ingin kembali ke data awal.

### Opsi B - Reset Dengan Migrations

Gunakan ini untuk development/staging jika ingin drop schema, apply ulang semua migration, lalu membuat ulang data seed.

PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
npm run db:reset
npm run db:seed
Remove-Item Env:DATABASE_URL
```

Bash:

```bash
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:reset
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres" npm run db:seed
```

### Opsi C - Reset Cepat Tanpa Migration History

Gunakan hanya untuk prototyping cepat ketika migration history tidak penting.

```bash
npx prisma db push --force-reset
npm run db:seed
```

### Opsi D - Hard Reset dari Supabase SQL Editor

Gunakan hanya jika schema sudah kacau dan Anda paham konsekuensinya.

```sql
drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;
```

Setelah hard reset, jalankan lagi:

```bash
npm run db:deploy
npm run db:seed
```

## 7. Checklist Setelah Deploy

- Login `/sign-in` dengan akun admin seed.
- Cek `/dashboard/admin`.
- Buat user learner/tutor dari `/sign-up`.
- Verifikasi tutor dari admin sebelum mengakses dashboard tutor penuh.
- Coba course/video embed.
- Coba booking mentoring dan quiz.
- Jangan mengandalkan upload lokal `public/uploads` di Vercel. Pindahkan ke Supabase Storage untuk production.

## Referensi Resmi

- Supabase + Prisma: https://supabase.com/docs/guides/database/prisma
- Supabase connection strings: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase Prisma troubleshooting: https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting
- Prisma migrate deploy: https://www.prisma.io/docs/cli/migrate/deploy
- Prisma migrate reset: https://www.prisma.io/docs/cli/migrate/reset
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Auth.js deployment: https://authjs.dev/getting-started/deployment
