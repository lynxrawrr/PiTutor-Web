# Database Schema

Schema Prisma berada di:

`prisma/schema.prisma`

## Model Utama

- `User`
- `LearnerProfile`
- `TutorProfile`
- `Course`
- `Lesson`
- `Enrollment`
- `LessonProgress`
- `MentorSchedule`
- `MentoringBooking`
- `QuizCategory`
- `Quiz`
- `Question`
- `QuestionOption`
- `QuizAttempt`
- `QuizAnswer`
- `AdminReviewLog`

## Enum Utama

- `Role`: `LEARNER`, `TUTOR`, `ADMIN`
- `CourseStatus`: `DRAFT`, `WAITING_REVIEW`, `PUBLISHED`, `REJECTED`
- `VideoProvider`: `YOUTUBE`, `VIMEO`, `GOOGLE_DRIVE`, `CUSTOM_EMBED`
- `EnrollmentStatus`: `ACTIVE`, `COMPLETED`
- `BookingStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`

## Auth.js Credentials

`User` menyimpan data login lokal untuk Auth.js:
- `email` sebagai identifier unik
- `passwordHash` untuk password yang sudah di-hash
- `role` untuk `LEARNER`, `TUTOR`, atau `ADMIN`
- `roleSelected` untuk menentukan apakah user perlu onboarding

Session Auth.js memakai JWT dan membawa `id`, `role`, `roleSelected`,
`institution`, dan `major`. Proteksi route dilakukan oleh middleware, sedangkan
proteksi role dilakukan server-side melalui `requireRole()`.

## Course Video Embed

`Lesson` menyimpan:
- `videoUrl`
- `embedUrl`
- `videoProvider`
- `moduleUrl`
- `content`
- `order`
- `duration`

Untuk MVP, helper video hanya mengubah URL YouTube menjadi embed URL.

Helper berada di:

`src/lib/utils/video.ts`

## Seed Data

Seed awal berada di:

`prisma/seed.mjs`

Jalankan:

```bash
npm run db:push
npm run db:seed
```

Akun seed memakai password `pitutor123` untuk learner, tutor, dan admin.
