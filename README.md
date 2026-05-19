# Pitutor

Pitutor adalah web app peer-to-peer learning untuk mahasiswa dengan konsep "by students, for students".

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js Credentials
- XState
- React Query
- Zod
- lucide-react

## Setup

Install dependency:

```bash
npm install
```

Salin environment example:

```bash
cp .env.example .env
```

Di PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi `DATABASE_URL`, lalu generate Prisma Client:

```bash
npm run db:generate
```

Sinkronkan schema dan seed data:

```bash
npm run db:push
npm run db:seed
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Route Awal

- `/` landing page
- `/dashboard/learner` dashboard learner
- `/dashboard/learner/courses` katalog course
- `/dashboard/learner/courses/[courseId]` detail course
- `/dashboard/learner/courses/react-next/learn` course learning berbasis video embed dan XState
- `/dashboard/learner/mentoring` mentoring catalog
- `/dashboard/learner/mentoring/[mentorId]` mentor profile dan booking flow
- `/dashboard/learner/quizzes` bank soal
- `/dashboard/learner/quizzes/[quizId]` quiz session, review, score, pembahasan
- `/dashboard/tutor` tutor dashboard
- `/dashboard/tutor/courses` course management
- `/dashboard/tutor/courses/new` create course
- `/dashboard/tutor/courses/[courseId]/lessons/new` add lesson
- `/dashboard/tutor/schedules` schedule management
- `/dashboard/tutor/bookings` incoming bookings
- `/dashboard/admin` admin dashboard
- `/dashboard/admin/users` user management
- `/dashboard/admin/courses` course review
- `/dashboard/admin/mentors` tutor verification
- `/dashboard/admin/quizzes` quiz management

## Auth.js Login

Pitutor memakai Auth.js Credentials dengan user tersimpan di PostgreSQL.
Password seed semua akun demo:

```text
password123
```

Akun demo:

```text
Learner: ahmad@student.univ.edu
Tutor: sarah@mentor.univ.edu
Admin: admin@pitutor.edu
```

Route `/dashboard/*` dilindungi middleware Auth.js JWT. Role access juga dicek
server-side lewat `requireRole()` di halaman dan Server Actions.

## API Routes

- `GET|POST /api/auth/[...nextauth]`
- `POST /api/auth/register`
- `GET /api/courses`
- `GET /api/courses/[courseId]`
- `GET /api/mentoring/mentors`
- `GET /api/mentoring/schedules`
- `GET /api/mentoring/bookings`
- `GET /api/quizzes`
- `POST /api/quizzes/[quizId]/submit`
- `POST /api/upload`
- `POST /api/webhooks/clerk` placeholder nonaktif karena MVP memakai Auth.js

## Dokumentasi

- `docs/STATECHARTS.md`
- `docs/ASYNC_REACTIVE.md`
- `docs/DATABASE_SCHEMA.md`

## Database Real

Project ini sekarang membaca data dashboard dari PostgreSQL melalui Prisma query layer:

- `src/lib/queries/course.queries.ts`
- `src/lib/queries/mentoring.queries.ts`
- `src/lib/queries/quiz.queries.ts`
- `src/lib/queries/admin.queries.ts`

Mutation utama juga sudah menulis ke database melalui Server Actions untuk:

- Enroll course
- Mark lesson complete
- Create/update course
- Submit course for admin review
- Create/update lesson
- Booking mentoring
- Tutor accept/reject/complete booking
- Submit mentor review
- Submit quiz attempt dan calculate score
- Create quiz category, quiz, question, option, dan pembahasan
- Admin approve/reject course
- Admin verify tutor

## Catatan Auth

Auth.js dikonfigurasi di `src/lib/auth.ts` dengan Credentials provider.
User baru dibuat melalui `POST /api/auth/register`, password disimpan sebagai
`passwordHash`, dan session JWT membawa `id`, `role`, serta `roleSelected`.

