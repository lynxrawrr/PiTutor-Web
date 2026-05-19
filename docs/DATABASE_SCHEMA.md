# Database Schema Pitutor

Dokumen ini menjelaskan struktur database Pitutor sesuai `prisma/schema.prisma` saat ini. Database utama adalah PostgreSQL dan diakses melalui Prisma 7 dengan adapter PostgreSQL (`@prisma/adapter-pg`).

## Konfigurasi Prisma

File utama:

- `prisma/schema.prisma`: definisi model, enum, index, dan relasi.
- `prisma.config.ts`: lokasi schema, datasource URL dari `DATABASE_URL`, dan seed command.
- `prisma/migrations/20260520000000_init/migration.sql`: initial migration.
- `prisma/seed.mjs`: reset data aplikasi dan membuat satu akun admin.

Catatan Prisma 7:

- Blok `datasource db` di `schema.prisma` hanya berisi provider `postgresql`.
- URL database dibaca dari `prisma.config.ts`.
- Untuk local, `.env` biasanya memakai `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pitutor?schema=public"`.

Script database:

```bash
npm run db:generate
npm run db:migrate -- --name nama_perubahan
npm run db:deploy
npm run db:reset
npm run db:seed
npm run db:studio
```

Untuk reset lokal:

```bash
npm run db:reset
npm run db:seed
```

`db:reset` menerapkan ulang migration. `db:seed` membuat ulang akun admin seed.

## Auth dan User Model

Pitutor memakai Auth.js Credentials Provider dengan JWT session. Project ini tidak memakai Prisma Adapter table `Account`, `Session`, dan `VerificationToken`. Data login disimpan langsung di model `User` melalui `email` dan `passwordHash`.

### `User`

Fungsi:

- Identitas utama user.
- Source of truth Auth.js credentials.
- Penyimpan role aplikasi.
- Penghubung ke learner profile, tutor profile, enrollment, booking, quiz attempt, dan admin review log.

Field penting:

| Field                    | Fungsi                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `id`                     | Primary key `cuid()`.                                                                      |
| `clerkId`                | Field legacy/opsional. MVP sekarang memakai Auth.js, bukan Clerk.                          |
| `email`                  | Unique login identifier.                                                                   |
| `passwordHash`           | Password bcrypt untuk Credentials Provider.                                                |
| `name`                   | Nama tampilan.                                                                             |
| `avatarUrl`              | URL avatar. Saat ini upload lokal masih memakai `public/uploads` jika lewat `/api/upload`. |
| `role`                   | Enum `LEARNER`, `TUTOR`, atau `ADMIN`. Default `LEARNER`.                                  |
| `roleSelected`           | Menandai apakah user sudah melewati onboarding role.                                       |
| `institution`            | Institusi/kampus.                                                                          |
| `major`                  | Jurusan/program studi.                                                                     |
| `createdAt`, `updatedAt` | Audit timestamp.                                                                           |

Kebijakan role:

- Registrasi publik hanya menerima `LEARNER` dan `TUTOR`.
- `ADMIN` hanya dibuat dari seed database.
- Admin tidak dapat membuat admin lain melalui register atau `updateUserRole`.
- Tutor baru harus diverifikasi admin sebelum masuk dashboard tutor penuh.

Relasi:

- `learnerProfile`: 1-to-1 ke `LearnerProfile`.
- `tutorProfile`: 1-to-1 ke `TutorProfile`.
- `enrollments`: 1-to-many ke `Enrollment`.
- `bookings`: 1-to-many ke `MentoringBooking` sebagai learner.
- `quizAttempts`: 1-to-many ke `QuizAttempt`.
- `reviewLogs`: 1-to-many ke `AdminReviewLog` sebagai admin reviewer.

### `LearnerProfile`

Fungsi:

- Data tambahan untuk user dengan role `LEARNER`.
- Dibuat saat register sebagai learner atau saat role diubah ke learner.

Field:

- `userId`: unique foreign key ke `User`.
- `bio`: deskripsi learner.
- `goals`: tujuan belajar.
- `createdAt`, `updatedAt`.

Relasi memakai `onDelete: Cascade`, jadi profile ikut hilang jika user dihapus.

### `TutorProfile`

Fungsi:

- Data tambahan untuk user dengan role `TUTOR`.
- Menjadi owner course, schedule, dan booking tutor.
- Menyimpan status verifikasi tutor.

Field:

| Field          | Fungsi                                                             |
| -------------- | ------------------------------------------------------------------ |
| `userId`       | Unique foreign key ke `User`.                                      |
| `headline`     | Headline profil tutor.                                             |
| `bio`          | Bio tutor.                                                         |
| `expertise`    | Array string keahlian.                                             |
| `hourlyRate`   | Tarif mentoring.                                                   |
| `rating`       | Field cache/legacy. Rating aktual dihitung dari booking completed. |
| `totalReviews` | Field cache/legacy. Count aktual dihitung dari booking.            |
| `verified`     | Gate akses dashboard tutor. Default `false`.                       |

Relasi:

- `courses`: 1-to-many ke `Course`.
- `schedules`: 1-to-many ke `MentorSchedule`.
- `bookings`: 1-to-many ke `MentoringBooking` sebagai tutor.

## Course dan Learning

### `Course`

Fungsi:

- Kontainer course video embed.
- Dibuat oleh tutor.
- Direview admin sebelum dipublish.

Field penting:

| Field             | Fungsi                                              |
| ----------------- | --------------------------------------------------- |
| `tutorId`         | Owner course, foreign key ke `TutorProfile`.        |
| `title`           | Judul course.                                       |
| `slug`            | Unique slug untuk route/detail.                     |
| `description`     | Deskripsi course.                                   |
| `category`        | Kategori seperti programming/design.                |
| `level`           | Enum `CourseLevel`.                                 |
| `thumbnailUrl`    | URL thumbnail. Bisa local upload atau external URL. |
| `status`          | Enum `CourseStatus`. Default `DRAFT`.               |
| `rejectionReason` | Alasan reject dari admin.                           |

Relasi:

- `lessons`: 1-to-many ke `Lesson`.
- `enrollments`: 1-to-many ke `Enrollment`.
- `reviewLogs`: 1-to-many ke `AdminReviewLog`.

Index:

- `@@index([status, category])`: mempercepat katalog/filter course.
- `@@index([tutorId])`: mempercepat query course milik tutor.

### `Lesson`

Fungsi:

- Unit materi dalam course.
- Menyimpan video source dan embed URL.

Field penting:

| Field           | Fungsi                                              |
| --------------- | --------------------------------------------------- |
| `courseId`      | Foreign key ke `Course`.                            |
| `title`         | Judul lesson.                                       |
| `description`   | Deskripsi lesson.                                   |
| `videoUrl`      | URL asli dari tutor. MVP minimal mendukung YouTube. |
| `embedUrl`      | URL embed hasil helper `getVideoEmbedUrl()`.        |
| `videoProvider` | Enum `VideoProvider`, default `YOUTUBE`.            |
| `moduleUrl`     | URL modul/file pendukung.                           |
| `content`       | Konten teks opsional.                               |
| `order`         | Urutan lesson dalam course.                         |
| `duration`      | Durasi dalam menit/detik sesuai input aplikasi.     |

Constraint:

- `@@unique([courseId, order])`: satu course tidak boleh punya dua lesson dengan order sama.
- `@@index([courseId])`.

### `Enrollment`

Fungsi:

- Relasi learner ke course.
- Menyimpan progress, status selesai, rating, dan review course.

Field penting:

| Field         | Fungsi                                              |
| ------------- | --------------------------------------------------- |
| `learnerId`   | Foreign key ke `User`.                              |
| `courseId`    | Foreign key ke `Course`.                            |
| `status`      | Enum `EnrollmentStatus`, `ACTIVE` atau `COMPLETED`. |
| `progress`    | Persentase progress 0 sampai 100.                   |
| `rating`      | Rating learner untuk course.                        |
| `review`      | Ulasan learner untuk course.                        |
| `completedAt` | Timestamp saat progress mencapai 100.               |

Constraint:

- `@@unique([learnerId, courseId])`: satu learner hanya punya satu enrollment per course.
- `@@index([courseId])`.

### `LessonProgress`

Fungsi:

- Menyimpan lesson mana yang sudah selesai dalam enrollment tertentu.

Field:

- `enrollmentId`: foreign key ke `Enrollment`.
- `lessonId`: foreign key ke `Lesson`.
- `completed`: boolean.
- `completedAt`: waktu selesai.

Constraint:

- `@@unique([enrollmentId, lessonId])`: satu progress record per lesson per enrollment.
- `@@index([lessonId])`.

Flow progress:

1. Learner klik "Tandai Selesai".
2. `markLessonComplete` melakukan upsert `LessonProgress`.
3. `calculateCourseProgress` menghitung lesson completed dibanding total lesson.
4. `Enrollment.progress` diupdate.
5. Jika 100 persen, `Enrollment.status` menjadi `COMPLETED`.

## Mentoring

### `MentorSchedule`

Fungsi:

- Slot waktu yang dibuat tutor.
- Dipilih learner saat booking mentoring.

Field:

- `tutorId`: foreign key ke `TutorProfile`.
- `startsAt`: waktu mulai.
- `endsAt`: waktu selesai.
- `isBooked`: menandai slot sudah dibooking.

Index:

- `@@index([tutorId, startsAt])`: mempercepat daftar schedule tutor.

### `MentoringBooking`

Fungsi:

- Record booking mentoring antara learner dan tutor.
- Menyimpan status booking, meeting URL, review, dan rating.

Field penting:

| Field             | Fungsi                                         |
| ----------------- | ---------------------------------------------- |
| `learnerId`       | User learner yang booking.                     |
| `tutorId`         | TutorProfile yang dibooking.                   |
| `scheduleId`      | Slot schedule, nullable jika schedule dihapus. |
| `topic`           | Topik sesi.                                    |
| `goals`           | Tujuan sesi.                                   |
| `status`          | Enum `BookingStatus`. Default `PENDING`.       |
| `rejectionReason` | Alasan tutor/admin menolak booking.            |
| `meetingUrl`      | Link meeting jika accepted.                    |
| `rating`          | Rating learner setelah sesi.                   |
| `review`          | Review learner setelah sesi.                   |
| `reviewedAt`      | Timestamp review.                              |

Index:

- `@@index([learnerId, status])`: query booking learner.
- `@@index([tutorId, status])`: query booking tutor.

Flow booking:

1. Tutor membuat `MentorSchedule`.
2. Learner memilih schedule dan membuat `MentoringBooking`.
3. Schedule diupdate `isBooked: true`.
4. Tutor/admin menerima atau menolak booking.
5. Jika diterima, `meetingUrl` dapat disimpan.
6. Setelah sesi selesai, status menjadi `COMPLETED`.
7. Learner dapat memberi rating/review.

## Quiz

### `QuizCategory`

Fungsi:

- Pengelompokan quiz.

Field:

- `name`: unique.
- `slug`: unique.
- `description`: opsional.

### `Quiz`

Fungsi:

- Kontainer bank soal.

Field:

- `categoryId`: foreign key ke `QuizCategory`.
- `title`: judul quiz.
- `description`: deskripsi.
- `timeLimit`: batas waktu dalam menit.

Relasi:

- `questions`: 1-to-many ke `Question`.
- `attempts`: 1-to-many ke `QuizAttempt`.

### `Question`

Fungsi:

- Pertanyaan dalam quiz.

Field:

- `quizId`: foreign key ke `Quiz`.
- `prompt`: teks pertanyaan.
- `explanation`: pembahasan.
- `order`: urutan pertanyaan.

Constraint:

- `@@unique([quizId, order])`.
- `@@index([quizId])`.

### `QuestionOption`

Fungsi:

- Pilihan jawaban untuk question.

Field:

- `questionId`: foreign key ke `Question`.
- `text`: teks pilihan.
- `isCorrect`: penanda jawaban benar.
- `order`: urutan pilihan.

Constraint:

- `@@unique([questionId, order])`.
- `@@index([questionId])`.

### `QuizAttempt`

Fungsi:

- Percobaan quiz oleh learner.

Field:

- `quizId`: foreign key ke `Quiz`.
- `learnerId`: foreign key ke `User`.
- `status`: enum `QuizAttemptStatus`.
- `score`: skor akhir 0 sampai 100.
- `submittedAt`: waktu submit.

Index:

- `@@index([quizId, learnerId])`.

### `QuizAnswer`

Fungsi:

- Jawaban user untuk tiap question pada satu attempt.

Field:

- `attemptId`: foreign key ke `QuizAttempt`.
- `questionId`: foreign key ke `Question`.
- `optionId`: selected option, nullable jika option dihapus.
- `isCorrect`: hasil kalkulasi setelah submit.

Constraint:

- `@@unique([attemptId, questionId])`: satu jawaban per question per attempt.

Flow quiz:

1. Learner mengerjakan quiz di UI.
2. `submitQuizAttempt` membuat `QuizAttempt` status `SUBMITTED`.
3. Jawaban dibuat di `QuizAnswer`.
4. `calculateQuizScore` membaca `QuestionOption.isCorrect`.
5. `QuizAnswer.isCorrect` diupdate.
6. `QuizAttempt.status` menjadi `SCORED` dan `score` disimpan.

## Admin Review

### `AdminReviewLog`

Fungsi:

- Audit log untuk review course oleh admin.

Field:

- `courseId`: course yang direview.
- `adminId`: user admin, nullable jika admin dihapus.
- `status`: status hasil review, memakai enum `CourseStatus`.
- `note`: catatan review atau alasan reject.
- `createdAt`: waktu log dibuat.

Flow course review:

1. Tutor submit course for review.
2. `Course.status` menjadi `WAITING_REVIEW`.
3. Admin approve:
   - `Course.status` menjadi `PUBLISHED`.
   - `AdminReviewLog` dibuat dengan status `PUBLISHED`.
4. Admin reject:
   - `Course.status` menjadi `REJECTED`.
   - `Course.rejectionReason` diisi.
   - `AdminReviewLog` dibuat dengan status `REJECTED`.

## Enum

### `Role`

- `LEARNER`: user belajar course, booking mentoring, dan mengerjakan quiz.
- `TUTOR`: user membuat course, lesson, schedule, dan mengelola booking.
- `ADMIN`: user seed untuk mengelola platform.

### `CourseStatus`

- `DRAFT`: course baru dibuat tutor.
- `WAITING_REVIEW`: course dikirim untuk review admin.
- `PUBLISHED`: course tampil di katalog learner.
- `REJECTED`: course ditolak admin.

### `CourseLevel`

- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

### `VideoProvider`

- `YOUTUBE`
- `VIMEO`
- `GOOGLE_DRIVE`
- `CUSTOM_EMBED`

Catatan: MVP saat ini minimal mendukung YouTube melalui helper video.

### `EnrollmentStatus`

- `ACTIVE`
- `COMPLETED`

### `BookingStatus`

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `COMPLETED`
- `CANCELLED`

### `QuizAttemptStatus`

- `IN_PROGRESS`
- `SUBMITTED`
- `SCORED`

## Relasi dan Cascade

Relasi utama memakai cascade untuk data turunan:

- Hapus `User` akan menghapus `LearnerProfile`, `TutorProfile`, enrollment, booking learner, dan quiz attempt terkait.
- Hapus `TutorProfile` akan menghapus course dan schedule tutor.
- Hapus `Course` akan menghapus lesson, enrollment, dan review log.
- Hapus `Enrollment` akan menghapus lesson progress.
- Hapus `Quiz` akan menghapus questions dan attempts.
- Hapus `Question` akan menghapus options dan answers terkait.

Beberapa relasi memakai `SetNull`:

- `MentoringBooking.scheduleId` menjadi null jika schedule dihapus.
- `QuizAnswer.optionId` menjadi null jika option dihapus.
- `AdminReviewLog.adminId` menjadi null jika user admin dihapus.

## Data Derivatif

Nilai berikut dihitung dari relasi, bukan disimpan sebagai tabel khusus:

- Course rating: rata-rata `Enrollment.rating`.
- Course review count: jumlah enrollment yang punya rating.
- Course duration: akumulasi `Lesson.duration`.
- Course progress learner: `LessonProgress.completed / Lesson.count`.
- Mentor rating: rata-rata `MentoringBooking.rating` dari booking completed.
- Mentor total sessions: count booking dengan status `COMPLETED`.
- Quiz difficulty: diturunkan dari jumlah question di DTO.
- Total quiz points learner: akumulasi `QuizAttempt.score`.

## Seed Data

File: `prisma/seed.mjs`

Seed saat ini:

1. Menghapus data dari tabel aplikasi secara berurutan agar foreign key aman.
2. Membuat satu akun admin.

Akun admin:

```text
Email: admin@pitutor.edu
Password: password123
Role: ADMIN
```

Tidak ada learner/tutor demo dari seed saat ini. Learner dan tutor dibuat lewat `/sign-up`.

## Catatan Production

- `public/uploads` hanya aman untuk local development. Di Vercel, filesystem tidak persistent.
- Untuk thumbnail, avatar, atau PDF modul di production, gunakan Supabase Storage atau storage service lain.
- Untuk production/staging, gunakan migration:

```bash
npm run db:deploy
```

- Untuk reset development/staging:

```bash
npm run db:reset
npm run db:seed
```

- Jangan menjalankan reset pada production berisi data penting tanpa backup.
