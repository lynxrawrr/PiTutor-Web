# Async dan Reactive Operations

Dokumen ini menjelaskan pola async Pitutor sesuai implementasi saat ini. Aplikasi memakai kombinasi:

- **React Query** untuk data client-side yang perlu polling dan state loading/error.
- **Next.js Server Actions** untuk mutasi yang menulis ke PostgreSQL melalui Prisma.
- **Route Handlers** untuk read API yang dikonsumsi React Query.
- **XState** untuk alur UI yang punya banyak langkah, seperti course learning, booking mentoring, dan quiz.
- **Auth.js JWT session** untuk identitas user dan role-based access.

## Arsitektur Data

Pola utamanya adalah:

1. Component client memanggil hook React Query.
2. Hook melakukan `fetch()` ke route handler di `/api/*`.
3. Route handler membaca data dari query layer di `src/lib/queries/*`.
4. Query layer membaca PostgreSQL melalui Prisma dan mengubah hasilnya menjadi DTO.
5. Mutasi tidak dilakukan lewat API umum, tetapi lewat Server Actions di `src/lib/actions/*`.
6. Server Actions melakukan validasi Zod, cek role, tulis ke database, lalu memanggil `revalidatePath()`.

Dengan pola ini, read dan write dipisahkan:

- Read: React Query + Route Handler + Query layer.
- Write: Server Actions + Prisma + `revalidatePath`.
- UI flow: XState + local component state.

## Provider React Query

Provider ada di `src/components/common/providers.tsx` dan dipasang di root layout.

Konfigurasi global saat ini:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
```

Artinya:

- Data dianggap fresh selama 30 detik.
- Browser focus tidak otomatis memicu refetch.
- Beberapa hook tetap memakai `refetchInterval: 5000` untuk memberi efek semi real-time.

Provider juga membungkus aplikasi dengan `SessionProvider` dari `next-auth/react`, sehingga komponen client dapat membaca session Auth.js bila dibutuhkan.

## React Query Hooks

### Course

File: `src/hooks/use-courses.ts`

| Hook                  | Query Key               | Endpoint                      | Interval | Fungsi                                                   |
| --------------------- | ----------------------- | ----------------------------- | -------- | -------------------------------------------------------- |
| `useCourses()`        | `["courses"]`           | `GET /api/courses`            | 5 detik  | Mengambil daftar course published untuk learner/catalog. |
| `useCourse(courseId)` | `["courses", courseId]` | `GET /api/courses/[courseId]` | Manual   | Mengambil detail course berdasarkan id atau slug.        |

Endpoint course memakai `getCourseList()` dan `getCourseDetail()` dari `src/lib/queries/course.queries.ts`.

DTO course berisi status enrollment user saat ini, progress, lesson list, rating rata-rata, jumlah review, tutor name, dan total enrollment.

### Mentoring

File: `src/hooks/use-mentoring.ts`

| Hook            | Query Key                   | Endpoint                      | Interval | Fungsi                                                             |
| --------------- | --------------------------- | ----------------------------- | -------- | ------------------------------------------------------------------ |
| `useMentors()`  | `["mentoring", "mentors"]`  | `GET /api/mentoring/mentors`  | 5 detik  | Mengambil daftar tutor/mentor beserta schedule dan rating dinamis. |
| `useBookings()` | `["mentoring", "bookings"]` | `GET /api/mentoring/bookings` | 5 detik  | Mengambil booking milik learner saat ini.                          |

Endpoint mentoring membaca dari `src/lib/queries/mentoring.queries.ts`.

Rating mentor tidak hanya mengambil field statis `TutorProfile.rating`, tetapi dihitung ulang dari booking `COMPLETED` yang punya `rating`.

### Quiz

File: `src/hooks/use-quiz.ts`

| Hook           | Query Key     | Endpoint           | Interval | Fungsi                                                                         |
| -------------- | ------------- | ------------------ | -------- | ------------------------------------------------------------------------------ |
| `useQuizzes()` | `["quizzes"]` | `GET /api/quizzes` | 5 detik  | Mengambil daftar quiz beserta questions/options dan total points user learner. |

Endpoint quiz memakai `getQuizList()` dan, jika user adalah learner, juga `getTotalPoints(user.id)`.

## Route Handlers untuk Read

Route handlers mengembalikan JSON berbentuk `{ data }` agar gampang dipakai hook.

| Route                     | Method | Query Layer                            |
| ------------------------- | ------ | -------------------------------------- |
| `/api/courses`            | `GET`  | `getCourseList()`                      |
| `/api/courses/[courseId]` | `GET`  | `getCourseDetail(courseId)`            |
| `/api/mentoring/mentors`  | `GET`  | `getMentorList()`                      |
| `/api/mentoring/bookings` | `GET`  | `getLearnerBookings()`                 |
| `/api/quizzes`            | `GET`  | `getQuizList()` dan `getTotalPoints()` |

Beberapa route memiliki `POST` yang sengaja mengembalikan `405`. Ini karena mutasi diarahkan ke Server Actions, bukan route handler umum.

## Server Actions

Server Actions menjadi jalur utama untuk operasi tulis. Semua action penting:

- Mengecek user dengan `requireUser()` atau `requireRole()`.
- Memvalidasi input dengan Zod.
- Menulis ke database memakai Prisma.
- Memanggil `revalidatePath()` pada halaman terkait.

### Auth dan User

File:

- `src/lib/actions/auth.actions.ts`
- `src/lib/actions/user.actions.ts`
- `src/app/api/auth/register/route.ts`

Operasi:

- `POST /api/auth/register`: membuat user baru dari halaman `/sign-up`.
- `selectRoleAction`: memilih role untuk user yang belum punya role final.
- `updateAccountAction`: update nama, email, password, dan profil tutor.
- `updateUserRole`: admin dapat mengubah role user menjadi `LEARNER` atau `TUTOR`.
- `updateLearnerProfile`: update bio/goals learner.
- `updateTutorProfile`: update headline, bio, expertise, hourly rate tutor.
- `updateAvatarUrl`: menyimpan URL avatar.

Kebijakan role saat ini:

- `Role` database tetap punya `ADMIN`.
- Registrasi publik hanya menerima `LEARNER` dan `TUTOR` melalui `selectableRoleSchema`.
- Akun `ADMIN` hanya dibuat dari seed database.
- `updateUserRole` juga dibatasi ke `LEARNER` atau `TUTOR`, sehingga admin tidak bisa membuat admin baru dari jalur action ini.

### Course

File: `src/lib/actions/course.actions.ts`

Operasi:

- `createCourse`: tutor/admin membuat draft course.
- `updateCourse`: update metadata course.
- `createLesson`: menambah lesson dan mengubah URL YouTube menjadi embed URL.
- `updateLesson`: update lesson dan regenerate embed URL jika `videoUrl` berubah.
- `deleteLesson`: menghapus lesson.
- `submitCourseForReview`: mengubah status course menjadi `WAITING_REVIEW`.
- `approveCourse`: admin publish course dan membuat `AdminReviewLog`.
- `rejectCourse`: admin reject course, menyimpan alasan, dan membuat `AdminReviewLog`.
- `enrollCourse`: learner enroll ke course.
- `markLessonComplete`: learner menandai lesson selesai dan membuat/update `LessonProgress`.
- `calculateCourseProgress`: menghitung progress dari jumlah lesson selesai.
- `submitCourseRating`: learner memberi rating/review ke enrollment.

Reaktivitas penting:

- Setelah `markLessonComplete`, sistem menghitung ulang progress enrollment.
- Jika progress menjadi 100, status enrollment berubah menjadi `COMPLETED` dan `completedAt` diisi.
- Rating course dihitung dari semua enrollment yang punya rating, bukan dari field cache di course.

### Mentoring

File: `src/lib/actions/mentoring.actions.ts`

Operasi:

- `createMentorSchedule`: tutor/admin membuat slot jadwal.
- `updateMentorSchedule`: tutor/admin mengubah waktu schedule.
- `bookMentoringSession`: learner membuat booking dan schedule ditandai `isBooked: true`.
- `acceptBooking`: tutor/admin menerima booking dan dapat menyimpan meeting URL.
- `rejectBooking`: tutor/admin menolak booking dan menyimpan alasan.
- `completeBooking`: tutor/admin menandai booking selesai.
- `submitMentorReview`: learner memberi rating/review setelah sesi.

Reaktivitas penting:

- Daftar mentor polling tiap 5 detik, jadi perubahan schedule/rating akan muncul tanpa refresh manual.
- Rating mentor dihitung dari booking `COMPLETED` yang punya rating.
- Total session mentor dihitung dari `_count.bookings` dengan status `COMPLETED`.

### Quiz

File: `src/lib/actions/quiz.actions.ts`

Operasi:

- `createQuizCategory`: tutor/admin membuat atau update kategori berdasarkan slug.
- `createQuiz`: tutor/admin membuat quiz.
- `createQuestion`: tutor/admin membuat pertanyaan dan options.
- `deleteQuiz`: tutor/admin menghapus quiz.
- `submitQuizAttempt`: learner mengirim jawaban dan membuat `QuizAttempt`.
- `calculateQuizScore`: menghitung skor, menandai jawaban benar/salah, lalu update attempt menjadi `SCORED`.

Reaktivitas penting:

- Score dihitung server-side berdasarkan `QuestionOption.isCorrect`.
- `QuizAnswer.isCorrect` diisi setelah kalkulasi.
- `GET /api/quizzes` juga mengembalikan `totalPoints` untuk learner dari akumulasi score semua attempt.

### Admin

File: `src/lib/actions/admin.actions.ts`

Operasi:

- `verifyTutor`: admin memverifikasi `TutorProfile.verified`.

Efek:

- Tutor baru yang belum verified diarahkan ke `/dashboard/tutor/pending` oleh `requireRole()`.
- Setelah admin melakukan verifikasi, akses dashboard tutor dibuka.

## Auth, Session, dan Gating

File utama:

- `src/lib/auth.ts`
- `middleware.ts`
- `src/app/api/auth/[...nextauth]/route.ts`

Pitutor memakai Auth.js v5 dengan Credentials Provider dan JWT session.

Alur login:

1. User mengirim email/password.
2. `loginSchema` memvalidasi input.
3. Sistem mencari `User.email` di database.
4. Password dicek dengan `bcryptjs.compare`.
5. JWT session menyimpan `id`, `role`, `roleSelected`, `institution`, `major`, dan avatar.
6. Callback JWT membaca ulang data user dari database agar perubahan role/profil ikut terbawa ke session.

Proteksi route:

- Middleware hanya memastikan `/dashboard/*` punya token.
- Role spesifik dicek server-side lewat `requireRole()`.
- Jika belum login, user diarahkan ke `/sign-in`.
- Jika belum memilih role, user diarahkan ke `/onboarding`.
- Jika role tidak sesuai, user diarahkan ke dashboard role masing-masing.
- Jika tutor belum verified, user diarahkan ke `/dashboard/tutor/pending`.

## XState dalam Reaktivitas UI

XState dipakai pada UI yang punya step jelas:

- Course learning: `src/components/courses/course-learning-demo.tsx`
- Mentoring booking: `src/components/mentoring/booking-flow.tsx`
- Quiz session: `src/components/quiz/quiz-session.tsx`

State machine tidak mengganti database. Machine hanya mengatur status UI, event, error, dan pilihan sementara. Mutasi tetap dilakukan oleh Server Actions.

Contoh pola:

1. User klik tombol.
2. Component mengirim event XState seperti `MARK_COMPLETE` atau `SUBMIT`.
3. Component menjalankan Server Action.
4. Jika sukses, component mengirim event sukses seperti `SAVE_SUCCESS` atau `SUCCESS`.
5. Jika gagal, component mengirim event gagal dengan pesan error.

## Loading, Error, dan Success State

Sumber state async:

- React Query menyediakan `isLoading`, `isError`, dan `data` untuk fetch client-side.
- XState menyediakan state eksplisit seperti `loadingVideo`, `savingProgress`, `submittingBooking`, `submitting`, dan `calculatingScore`.
- Server Actions melempar `Error` jika validasi/akses/database gagal.
- UI client menampilkan feedback dengan `sonner` toast.

Contoh:

- Course learning menampilkan loading saat video dicek dan spinner saat progress disimpan.
- Booking menampilkan state `submittingBooking` saat menulis booking.
- Quiz menampilkan state `submitting` dan `calculatingScore` saat mengirim jawaban.

## Data Derivatif

Beberapa nilai tidak disimpan sebagai tabel khusus, tetapi dihitung dari relasi:

- Course rating: rata-rata `Enrollment.rating`.
- Course review count: jumlah enrollment yang punya rating.
- Course progress: jumlah `LessonProgress.completed` dibanding total lesson.
- Enrollment completed: progress 100 mengubah `EnrollmentStatus` menjadi `COMPLETED`.
- Mentor rating: rata-rata `MentoringBooking.rating` dari booking completed.
- Total mentoring session: count booking completed.
- Quiz score: persentase jawaban benar dari attempt.

## Catatan Implementasi Saat Ini

- Seed database hanya membuat satu akun admin: `admin@pitutor.edu` dengan password `password123`.
- Setelah `npm run db:reset`, jalankan `npm run db:seed` agar akun admin dibuat ulang.
- Upload file masih memakai `public/uploads` lewat `/api/upload`; ini cocok untuk lokal, tetapi tidak persistent di Vercel.
- Aplikasi belum memakai Supabase Realtime subscription. Efek real-time saat ini berasal dari polling React Query dan `revalidatePath`.
- Untuk deployment production, gunakan migration di `prisma/migrations` dan jalankan `npm run db:deploy`.
