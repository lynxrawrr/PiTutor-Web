# Async dan Reactive Operations

Fondasi async Pitutor memakai React Query dan Server Actions.

## React Query

Provider tersedia di:

`src/components/common/providers.tsx`

Provider sudah dipasang di root layout:

`src/app/layout.tsx`

Operasi yang memakai React Query:
- Fetch course list di `useCourses`
- Fetch course detail di `useCourse`
- Fetch mentor list di `useMentors`
- Fetch learner booking status di `useBookings`
- Fetch quiz list di `useQuizzes`
- Fetch quiz detail/questions di `useQuiz`

Mutation async yang memakai Server Actions dan me-refresh UI:
- Enroll course
- Mark lesson as complete
- Refresh course progress
- Submit mentoring booking
- Tutor accept/reject/complete booking
- Submit mentor review
- Submit quiz attempt
- Calculate score dan show result

## Server Actions

Server Actions foundation:
- `src/lib/actions/course.actions.ts`
- `src/lib/actions/mentoring.actions.ts`
- `src/lib/actions/quiz.actions.ts`
- `src/lib/actions/user.actions.ts`

Action penting yang sudah disediakan:
- `enrollCourse`
- `markLessonComplete`
- `calculateCourseProgress`
- `bookMentoringSession`
- `acceptBooking`
- `rejectBooking`
- `completeBooking`
- `submitMentorReview`
- `submitQuizAttempt`
- `calculateQuizScore`
- `createQuizCategory`
- `createQuiz`
- `createQuestion`

## UI State

Course learning demo sudah menampilkan state reaktif dari XState:
- Loading video
- Watching video
- Saving progress
- Completed
- Video error fallback

Mentoring booking sudah menampilkan state reaktif:
- Selecting schedule
- Filling form
- Submitting booking
- Waiting confirmation
- Scheduled
- Completed/reviewed

Quiz session sudah menampilkan state reaktif:
- Loading questions
- Answering
- Reviewing answers
- Submitting
- Calculating score
- Showing result
- Showing discussion

Data aplikasi sekarang dibaca dari PostgreSQL melalui Prisma query layer. Data Transfer Objects (DTOs) kini dikelola di `src/types/dtos.ts`, tetapi course, mentor, booking, quiz, admin overview, dan route handlers utama membaca dari database.

Mutation yang sudah menulis ke database:
- `enrollCourse`
- `markLessonComplete`
- `createCourse`
- `createLesson`
- `bookMentoringSession`
- `acceptBooking`
- `rejectBooking`
- `completeBooking`
- `submitMentorReview`
- `submitQuizAttempt`
- `createQuizCategory`
- `createQuiz`
- `createQuestion`
- `approveCourse`
- `rejectCourse`
- `verifyTutor`

