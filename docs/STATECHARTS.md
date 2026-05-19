# Statecharts Pitutor

Pitutor menggunakan XState untuk tiga flow utama agar state UI, async status, dan transisi antar tahap eksplisit.

## Course Learning Flow

File: `src/lib/machines/course-learning.machine.ts`

State utama:
- `courseOverview`
- `enrolling`
- `lessonList`
- `loadingVideo`
- `watchingVideo`
- `savingProgress`
- `checkingCompletion`
- `videoError`
- `courseCompleted`
- `certificateAvailable`

Integrasi awal:
- `src/components/courses/course-learning-demo.tsx`
- Flow ini sudah dipakai untuk memilih lesson, load video, menonton video, menyimpan progress, dan menyelesaikan course.

## Mentoring Booking Flow

File: `src/lib/machines/mentoring-booking.machine.ts`

State utama:
- `viewingMentors`
- `viewingProfile`
- `selectingSchedule`
- `fillingForm`
- `submittingBooking`
- `waitingConfirmation`
- `scheduled`
- `rejected`
- `completed`
- `reviewed`

Integrasi awal:
- `src/components/mentoring/booking-flow.tsx`
- Flow ini sudah dipakai untuk pilih jadwal, isi form booking, submit, waiting confirmation, scheduled, completed, dan reviewed.

## Quiz Flow

File: `src/lib/machines/quiz.machine.ts`

State utama:
- `selectingCategory`
- `loadingQuestions`
- `answering`
- `reviewingAnswers`
- `submitting`
- `calculatingScore`
- `showingResult`
- `showingDiscussion`

Integrasi awal:
- `src/components/quiz/quiz-session.tsx`
- Flow ini sudah dipakai untuk load questions, answer question, review answers, submit, calculate score, show result, discussion, dan retake.

