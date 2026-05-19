Saya ingin membangun web app bernama Pitutor menggunakan Next.js App Router.

Project ini langsung dieksekusi menjadi MVP full, bukan hanya brainstorming/foundation.

TECH STACK:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Auth.js / NextAuth
- XState
- React Query
- Zod
- Supabase Storage opsional untuk thumbnail/avatar/module PDF
- Video course menggunakan embed URL, bukan upload video

AUTH:
Gunakan Auth.js / NextAuth, bukan Clerk.

Auth requirement:
- Setup Auth.js.
- Gunakan Prisma Adapter jika cocok.
- Buat model User, Account, Session, VerificationToken sesuai kebutuhan Auth.js.
- Tambahkan field role pada User: LEARNER, TUTOR, ADMIN.
- Setelah register/login pertama, user diarahkan ke onboarding untuk memilih role.
- Role-based access:
  - LEARNER hanya bisa akses /dashboard/learner
  - TUTOR hanya bisa akses /dashboard/tutor
  - ADMIN hanya bisa akses /dashboard/admin
- Jika belum login, redirect ke sign-in.
- Jika role belum dipilih, redirect ke onboarding.

CORE FEATURES:
1. Landing Page
2. Auth.js sign-in/sign-up
3. Onboarding role
4. Learner Dashboard
5. Tutor Dashboard
6. Admin Dashboard
7. Online Course berbasis video embed
8. Course enrollment
9. Course learning page
10. Lesson progress tracking
11. Mentoring booking
12. Tutor schedule management
13. Bank soal / quiz
14. Admin course review

COURSE LEARNING:
- Course berbasis video embed.
- Tutor input YouTube URL.
- Sistem convert menjadi embed URL.
- Learner menonton video lewat iframe.
- Learner klik Mark as Complete.
- Progress tersimpan ke database.
- Progress bar update reaktif.
- Jika semua lesson selesai, enrollment menjadi COMPLETED.

STATECHART:
Gunakan XState secara nyata pada:
1. Course Learning Flow
2. Mentoring Booking Flow
3. Quiz Flow

ASYNC/REACTIVE:
Gunakan React Query untuk:
- Fetch course list
- Fetch course detail
- Enroll course
- Mark lesson complete
- Fetch mentor list
- Submit booking
- Tutor accept/reject booking
- Fetch quiz questions
- Submit quiz attempt

DATABASE:
Gunakan Prisma + PostgreSQL.

Model minimal:
- User
- Account
- Session
- VerificationToken
- LearnerProfile
- TutorProfile
- Course
- Lesson
- Enrollment
- LessonProgress
- MentorSchedule
- MentoringBooking
- Quiz
- Question
- QuestionOption
- QuizAttempt
- CourseReviewLog

ENUM:
- Role: LEARNER, TUTOR, ADMIN
- CourseStatus: DRAFT, WAITING_REVIEW, PUBLISHED, REJECTED
- VideoProvider: YOUTUBE, VIMEO, GOOGLE_DRIVE, CUSTOM_EMBED
- EnrollmentStatus: ACTIVE, COMPLETED
- BookingStatus: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
- CourseLevel: BEGINNER, INTERMEDIATE, ADVANCED

IMPLEMENT FULL MVP:
Tolong langsung implementasikan semua phase berikut secara berurutan:

PHASE 1 — Setup Foundation
- Install dan setup dependencies.
- Setup Prisma.
- Setup Auth.js.
- Setup shadcn/ui.
- Setup React Query provider.
- Setup env example.
- Setup Prisma client.
- Setup protected routes.
- Setup role-based dashboard layout.

PHASE 2 — Database
- Buat schema.prisma lengkap.
- Buat migration-ready schema.
- Buat seed data dummy untuk course, lesson, mentor, quiz.
- Pastikan relasi database rapi.

PHASE 3 — Auth.js
- Setup Auth.js config.
- Setup Prisma Adapter.
- Buat sign-in page.
- Buat onboarding role page.
- Buat helper getCurrentUser.
- Buat middleware/protection untuk route dashboard.

PHASE 4 — State Machines
Buat:
- lib/machines/course-learning.machine.ts
- lib/machines/mentoring-booking.machine.ts
- lib/machines/quiz.machine.ts

PHASE 5 — Video Embed
Buat:
- lib/utils/video.ts
- detectVideoProvider()
- getYoutubeEmbedUrl()
- getVideoEmbedUrl()
- components/video/video-embed-player.tsx

PHASE 6 — Course Module
Implement:
- Course list
- Course detail
- Enroll course
- Course learning page
- Lesson sidebar
- Video player
- Mark as complete
- Progress bar
- Completed state

PHASE 7 — Tutor Module
Implement:
- Tutor dashboard
- Create course
- Add lesson with YouTube URL
- Preview course
- Submit course for review
- Manage schedules
- Accept/reject booking

PHASE 8 — Mentoring Module
Implement:
- Mentor list
- Mentor profile
- Schedule picker
- Booking form
- Booking status
- Mentoring statechart integration

PHASE 9 — Quiz Module
Implement:
- Quiz category
- Quiz session
- Answer question
- Review answers
- Submit quiz
- Result page
- Discussion panel
- Quiz statechart integration

PHASE 10 — Admin Module
Implement:
- Admin dashboard
- User list
- Course review
- Approve/reject course
- Tutor verification

PHASE 11 — UI
Gunakan style:
- Modern EdTech Dashboard
- Clean
- Friendly
- Soft
- Blue-green accent
- Rounded-2xl cards
- Responsive
- shadcn/ui components

PHASE 12 — Documentation
Buat:
- README.md
- docs/statecharts.md
- docs/async-reactive.md
- docs/database-schema.md
- docs/authjs-setup.md
- docs/how-to-run.md

IMPORTANT RULES:
- Jangan pakai Clerk.
- Gunakan Auth.js / NextAuth.
- Jangan upload video ke Supabase untuk MVP.
- Video course wajib pakai embed URL.
- Minimal support YouTube embed.
- Jangan hardcode jika bisa pakai Prisma.
- Gunakan reusable components.
- Gunakan Zod untuk validasi.
- Gunakan loading, error, success state.
- Gunakan XState di komponen, bukan hanya file dummy.
- Langsung eksekusi full MVP sampai selesai.
- Jika ada struktur project yang sudah ada, jangan hapus tanpa alasan.
- Jika ada konflik, prioritaskan arsitektur yang rapi dan project bisa jalan.

START NOW:
1. Inspect project.
2. Install dependencies yang dibutuhkan.
3. Implement schema Prisma.
4. Implement Auth.js.
5. Implement semua fitur MVP sesuai phase.
6. Jalankan lint/typecheck jika tersedia.
7. Perbaiki error sampai project siap dijalankan.