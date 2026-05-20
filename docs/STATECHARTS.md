# Statecharts Pitutor

Pitutor memakai XState v5 untuk mengatur workflow UI yang memiliki banyak langkah dan banyak kemungkinan hasil async. State machine berada di `src/lib/machines`, sedangkan integrasinya berada di component client dengan `useMachine` dari `@xstate/react`.

State machine di project ini tidak langsung menjalankan query atau mutation database. Tugas machine adalah:

- Menyimpan state UI saat ini.
- Menyimpan context sementara seperti selected lesson, selected slot, answers, score, dan error.
- Membuat transisi UI eksplisit.
- Mencegah komponen punya terlalu banyak boolean state.
- Menjadi jembatan antara interaksi user dan Server Actions.

Mutasi database tetap dilakukan lewat Server Actions. Setelah action berhasil atau gagal, component mengirim event lanjutan ke machine.

## 1. Course Learning Flow

File machine: `src/lib/machines/course-learning.machine.ts`

File integrasi: `src/components/courses/course-learning-demo.tsx`

Flow ini mengatur pengalaman learner saat membuka halaman belajar course, memilih lesson, memuat video embed, menandai lesson selesai, dan menyelesaikan course.

### Context

| Field              | Tipe             | Fungsi                                |
| ------------------ | ---------------- | ------------------------------------- |
| `selectedLessonId` | `string \| null` | Lesson yang sedang aktif di player.   |
| `error`            | `string \| null` | Pesan error video atau progress save. |

### States

| State                  | Makna                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `courseOverview`       | State awal. Learner belum masuk ke daftar lesson.                                                                                       |
| `enrolling`            | State saat proses enrollment berlangsung. Saat ini dipakai oleh machine, walau halaman learning umumnya sudah menerima enrolled course. |
| `lessonList`           | Learner melihat atau berada pada daftar lesson.                                                                                         |
| `loadingVideo`         | Lesson sudah dipilih dan UI sedang memvalidasi/memuat video.                                                                            |
| `watchingVideo`        | Video siap ditonton.                                                                                                                    |
| `savingProgress`       | Server Action `markLessonComplete` sedang berjalan.                                                                                     |
| `videoError`           | URL video tidak valid atau embed gagal disiapkan.                                                                                       |
| `courseCompleted`      | Semua lesson selesai, learner masuk ke layar completion dan rating.                                                                     |
| `submittingRating`     | Server Action `submitCourseRating` sedang menyimpan rating/review.                                                                      |
| `ratingSubmitted`      | Rating/review course berhasil dikirim.                                                                                                  |

### Events

| Event               | Dari State                                                      | Efek                                                          |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| `ENROLL`            | `courseOverview`                                                | Masuk ke `enrolling` dan clear error.                         |
| `ENROLL_SUCCESS`    | `enrolling`                                                     | Masuk ke `lessonList`.                                        |
| `ENROLL_FAILED`     | `enrolling`                                                     | Balik ke `courseOverview` dan isi error.                      |
| `CONTINUE_LEARNING` | `courseOverview`                                                | Masuk ke `lessonList`.                                        |
| `SELECT_LESSON`     | `lessonList`, `loadingVideo`, `watchingVideo`, `videoError`     | Set `selectedLessonId`, clear error, masuk ke `loadingVideo`. |
| `NEXT_LESSON`       | `lessonList`                                                    | Set next lesson dan masuk ke `loadingVideo`.                  |
| `VIDEO_READY`       | `loadingVideo`                                                  | Masuk ke `watchingVideo`.                                     |
| `VIDEO_ERROR`       | `loadingVideo`, `watchingVideo`                                 | Masuk ke `videoError` dan simpan error.                       |
| `MARK_COMPLETE`     | `watchingVideo`                                                 | Masuk ke `savingProgress`.                                    |
| `SAVE_SUCCESS`      | `savingProgress`                                                | Kembali ke `lessonList`.                                      |
| `SAVE_FAILED`       | `savingProgress`                                                | Kembali ke `watchingVideo` dan simpan error.                  |
| `COURSE_COMPLETED`  | `lessonList`, `loadingVideo`, `watchingVideo`, `savingProgress` | Masuk ke `courseCompleted`.                                   |
| `SUBMIT_RATING`     | `courseCompleted`                                               | Masuk ke `submittingRating` dan clear error.                  |
| `RATING_SUCCESS`    | `submittingRating`                                              | Masuk ke `ratingSubmitted`.                                   |
| `RATING_FAILED`     | `submittingRating`                                              | Kembali ke `courseCompleted` dan simpan error.                |
| `BACK_TO_LESSONS`   | `loadingVideo`, `watchingVideo`, `videoError`                   | Kembali ke `lessonList`.                                      |
| `BACK_TO_COURSE`    | `lessonList`, `courseCompleted`, `ratingSubmitted`              | Kembali ke `courseOverview`.                                  |
| `RETRY`             | `videoError`                                                    | Mencoba ulang load video.                                     |

### Integrasi dengan Component

Di `CourseLearningDemo`:

1. Saat komponen mount dan ada lesson pertama, component mengirim:
   - `CONTINUE_LEARNING`
   - `SELECT_LESSON`
2. Saat state `loadingVideo`, component menunggu singkat lalu mengecek URL video dengan `getVideoEmbedUrl`.
3. Jika embed URL valid, component mengirim `VIDEO_READY`.
4. Jika tidak valid, component mengirim `VIDEO_ERROR`.
5. Saat learner klik "Tandai Selesai", component mengirim `MARK_COMPLETE`, lalu menjalankan `markLessonComplete`.
6. Jika action sukses:
   - Local state `completedLessonIds` diperbarui.
   - Jika semua lesson selesai, kirim `COURSE_COMPLETED`.
   - Jika belum selesai, kirim `SAVE_SUCCESS`.
7. Saat state `courseCompleted`, component langsung melakukan conditional render layar completion + form rating/review.
8. Saat learner submit rating, component mengirim `SUBMIT_RATING`, menjalankan `submitCourseRating`, lalu mengirim `RATING_SUCCESS` atau `RATING_FAILED`.
9. Jika action progress gagal, kirim `SAVE_FAILED`.

### Efek Database

Server Action terkait:

- `markLessonComplete`
- `calculateCourseProgress`
- `submitCourseRating`

Tabel yang berubah:

- `LessonProgress`: upsert progress lesson.
- `Enrollment`: update `progress`, `status`, `completedAt`.
- `Enrollment.rating` dan `Enrollment.review`: saat learner mengirim rating.

Jika progress mencapai 100, enrollment menjadi `COMPLETED`.

## 2. Mentoring Booking Flow

File machine: `src/lib/machines/mentoring-booking.machine.ts`

File integrasi: `src/components/mentoring/booking-flow.tsx`

Flow ini mengatur learner saat memilih mentor, memilih slot schedule, mengisi topik, submit booking, lalu melihat status booking.

### Context

| Field      | Tipe             | Fungsi                                       |
| ---------- | ---------------- | -------------------------------------------- |
| `mentorId` | `string \| null` | Tutor profile yang dipilih.                  |
| `slotId`   | `string \| null` | Mentor schedule yang dipilih.                |
| `error`    | `string \| null` | Error booking, rejection, atau failure lain. |

### States

| State                 | Makna                                                 |
| --------------------- | ----------------------------------------------------- |
| `viewingMentors`      | State awal untuk memilih mentor.                      |
| `viewingProfile`      | Mentor dipilih, user melihat profil.                  |
| `selectingSchedule`   | User memilih jadwal dari schedule mentor.             |
| `fillingForm`         | User mengisi topik dan goals mentoring.               |
| `submittingBooking`   | Server Action `bookMentoringSession` sedang berjalan. |
| `waitingConfirmation` | Booking sudah dibuat dengan status `PENDING`.         |
| `scheduled`           | Booking diterima tutor.                               |
| `rejected`            | Booking ditolak tutor.                                |
| `completed`           | Sesi mentoring selesai.                               |
| `reviewed`            | Learner sudah memberi review.                         |

### Events

| Event              | Efek                                                       |
| ------------------ | ---------------------------------------------------------- |
| `SELECT_MENTOR`    | Set `mentorId`, reset `slotId`, masuk ke `viewingProfile`. |
| `VIEW_SCHEDULE`    | Dari `viewingProfile` ke `selectingSchedule`.              |
| `SELECT_SLOT`      | Set `slotId`, masuk ke `fillingForm`.                      |
| `SUBMIT`           | Dari `fillingForm` ke `submittingBooking`.                 |
| `SUCCESS`          | Dari `submittingBooking` ke `waitingConfirmation`.         |
| `FAILED`           | Dari `submittingBooking` ke `fillingForm`, simpan error.   |
| `ACCEPTED`         | Dari `waitingConfirmation` ke `scheduled`.                 |
| `REJECTED`         | Dari `waitingConfirmation` ke `rejected`, simpan error.    |
| `COMPLETE_SESSION` | Dari `scheduled` ke `completed`.                           |
| `GIVE_REVIEW`      | Dari `completed` ke `reviewed`.                            |
| `CHOOSE_ANOTHER`   | Kembali ke `viewingMentors`.                               |
| `BACK`             | Mundur satu langkah pada state yang mendukung.             |

### Integrasi dengan Component

Di `BookingFlow`:

1. Tombol "Mulai Booking" mengirim `SELECT_MENTOR`, lalu `VIEW_SCHEDULE`.
2. Pilihan jadwal mengirim `SELECT_SLOT` dan menyimpan `slotId`.
3. Submit form mengirim `SUBMIT`, lalu menjalankan `bookMentoringSession`.
4. Jika action sukses, component mengirim `SUCCESS`.
5. Jika action gagal, component mengirim `FAILED` dengan message.

Server-side status booking tetap disimpan di database sebagai enum `BookingStatus`. Machine hanya mengatur state UI lokal pada flow saat ini.

### Efek Database

Server Action terkait:

- `bookMentoringSession`
- `acceptBooking`
- `rejectBooking`
- `completeBooking`
- `submitMentorReview`

Tabel yang berubah:

- `MentoringBooking`: data booking, status, meeting URL, rejection reason, rating, review.
- `MentorSchedule`: `isBooked` diubah menjadi `true` setelah booking dibuat.

### Catatan Sinkronisasi

Machine saat ini tidak memiliki event `PROCEED`. Transisi dari memilih jadwal ke form dilakukan langsung oleh `SELECT_SLOT`. Jika UI memakai tombol "Lanjut" setelah slot dipilih, tombol itu harus mengirim event yang memang ada di machine atau machine perlu ditambah event baru.

## 3. Quiz Flow

File machine: `src/lib/machines/quiz.machine.ts`

File integrasi: `src/components/quiz/quiz-session.tsx`

Flow ini mengatur sesi quiz dari halaman pembuka, pengerjaan soal, review jawaban, submit, kalkulasi skor, sampai pembahasan.

### Context

| Field        | Tipe                     | Fungsi                                                                          |
| ------------ | ------------------------ | ------------------------------------------------------------------------------- |
| `categoryId` | `string \| null`         | Kategori quiz yang dipilih. Pada component saat ini diisi dari `quiz.category`. |
| `answers`    | `Record<string, string>` | Map `questionId -> optionId`.                                                   |
| `score`      | `number \| null`         | Skor akhir setelah submit dan kalkulasi.                                        |
| `error`      | `string \| null`         | Pesan error load atau submit.                                                   |

### States

| State               | Makna                                        |
| ------------------- | -------------------------------------------- |
| `selectingCategory` | State awal sebelum quiz dimulai.             |
| `loadingQuestions`  | UI sedang menyiapkan daftar pertanyaan.      |
| `answering`         | User sedang menjawab soal.                   |
| `reviewingAnswers`  | User meninjau jawaban sebelum submit.        |
| `submitting`        | Jawaban sedang dikirim ke server.            |
| `calculatingScore`  | Sistem sedang menunggu hasil kalkulasi skor. |
| `showingResult`     | Skor akhir ditampilkan.                      |
| `showingDiscussion` | Pembahasan tiap soal ditampilkan.            |

### Events

| Event             | Efek                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `SELECT_CATEGORY` | Set category, reset answers/score/error, masuk ke `loadingQuestions`.                                                                     |
| `LOAD_SUCCESS`    | Dari `loadingQuestions` ke `answering`.                                                                                                   |
| `LOAD_FAILED`     | Kembali ke `selectingCategory`, simpan error.                                                                                             |
| `ANSWER_QUESTION` | Menyimpan jawaban pada context `answers`.                                                                                                 |
| `REVIEW`          | Dari `answering` ke `reviewingAnswers`.                                                                                                   |
| `SUBMIT`          | Dari `reviewingAnswers` ke `submitting`.                                                                                                  |
| `SUBMIT_SUCCESS`  | Dari `submitting` ke `calculatingScore`.                                                                                                  |
| `SUBMIT_FAILED`   | Dari `submitting` ke `reviewingAnswers`, simpan error.                                                                                    |
| `CALCULATE_DONE`  | Simpan score dan masuk ke `showingResult`.                                                                                                |
| `VIEW_DISCUSSION` | Dari `showingResult` ke `showingDiscussion`.                                                                                              |
| `RETAKE`          | Reset answers/score/error dan kembali ke `loadingQuestions`.                                                                              |
| `BACK`            | Mundur dari `answering` ke `selectingCategory`, dari `reviewingAnswers` ke `answering`, atau dari `showingDiscussion` ke `showingResult`. |

### Integrasi dengan Component

Di `QuizSession`:

1. Tombol mulai quiz mengirim `SELECT_CATEGORY`, lalu `LOAD_SUCCESS`.
2. Pilihan jawaban mengirim `ANSWER_QUESTION`.
3. Tombol review mengirim `REVIEW`.
4. Tombol submit mengirim `SUBMIT`, lalu menjalankan `submitQuizAttempt`.
5. Jika action sukses:
   - Component mengirim `SUBMIT_SUCCESS`.
   - Component mengirim `CALCULATE_DONE` dengan skor dari server.
6. Jika action gagal, component mengirim `SUBMIT_FAILED`.
7. Tombol pembahasan mengirim `VIEW_DISCUSSION`.
8. Tombol retake mengirim `RETAKE`, lalu `LOAD_SUCCESS`.

### Efek Database

Server Action terkait:

- `submitQuizAttempt`
- `calculateQuizScore`

Tabel yang berubah:

- `QuizAttempt`: dibuat dengan status `SUBMITTED`, lalu diupdate menjadi `SCORED`.
- `QuizAnswer`: dibuat untuk tiap jawaban, lalu `isCorrect` diisi setelah kalkulasi.

Skor dihitung server-side dari `QuestionOption.isCorrect`.

### Catatan Sinkronisasi

Nama state machine saat ini adalah `answering`, bukan `answeringQuestions`. Timer di component harus mengecek `snapshot.matches("answering")` agar sesuai dengan machine.

## Prinsip Pemakaian State Machine

Saat menambah flow baru, ikuti pola ini:

1. Context hanya menyimpan data UI sementara, bukan data yang sudah menjadi source of truth database.
2. Event diberi nama berdasarkan aksi user atau hasil async, misalnya `SUBMIT`, `SUCCESS`, `FAILED`.
3. Server Action dipanggil di component atau hook, bukan di machine.
4. Setelah action selesai, kirim event sukses/gagal ke machine.
5. Simpan error di context agar UI dapat menampilkan pesan yang konsisten.
6. Pastikan event yang dikirim component ada di union type event machine.

## Ringkasan Integrasi Database

| Flow              | Machine                   | Component            | Server Action Utama                        | Tabel Utama                          |
| ----------------- | ------------------------- | -------------------- | ------------------------------------------ | ------------------------------------ |
| Course learning   | `courseLearningMachine`   | `CourseLearningDemo` | `markLessonComplete`, `submitCourseRating` | `Enrollment`, `LessonProgress`       |
| Mentoring booking | `mentoringBookingMachine` | `BookingFlow`        | `bookMentoringSession`                     | `MentoringBooking`, `MentorSchedule` |
| Quiz              | `quizMachine`             | `QuizSession`        | `submitQuizAttempt`                        | `QuizAttempt`, `QuizAnswer`          |

## Catatan Maintainability

- Jika menambah event baru, update type union di file machine dan update dokumentasi ini.
- Jika mengubah nama state, cek semua `snapshot.matches(...)` di component.
- Jika ada Server Action baru, jangan masukkan side effect database langsung ke machine.
- Jika ada polling React Query yang juga membaca data hasil mutasi, pastikan `revalidatePath()` tetap dipanggil pada action terkait.
