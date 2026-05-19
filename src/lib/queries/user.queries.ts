import { prisma } from "@/lib/prisma";

export async function getLearnerStats(userId: string) {
  const [enrollments, quizAttempts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { learnerId: userId },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { learnerId: userId, status: "SUBMITTED" },
    }),
  ]);

  // 1. Total Jam Belajar (Estimate from completed lessons duration)
  // For now, let's sum duration of all lessons in active enrollments as a proxy, 
  // or more accurately, sum completed lessons duration.
  const lessonProgresses = await prisma.lessonProgress.findMany({
    where: {
      enrollment: { learnerId: userId },
      completed: true,
    },
    include: {
      lesson: true,
    },
  });

  const totalMinutes = lessonProgresses.reduce((acc, curr) => acc + (curr.lesson.duration ?? 0), 0);
  const totalHours = Number((totalMinutes / 60).toFixed(1));

  // 2. Course Selesai
  const completedCourses = enrollments.filter(e => e.status === "COMPLETED").length;
  const totalEnrolled = enrollments.length;

  // 3. Skor Rata-rata Quiz
  const totalScore = quizAttempts.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
  const avgScore = quizAttempts.length > 0 ? Math.round(totalScore / quizAttempts.length) : 0;

  // 4. Ranking (Mock for now, or calculate based on total score/progress)
  // Real ranking would involve comparing with all users.
  const allAttempts = await prisma.quizAttempt.findMany({
    where: { status: "SUBMITTED" },
    select: { learnerId: true, score: true },
  });

  const leaderBoard = allAttempts.reduce((acc, curr) => {
    acc[curr.learnerId] = (acc[curr.learnerId] || 0) + (curr.score || 0);
    return acc;
  }, {} as Record<string, number>);

  const sortedUserIds = Object.keys(leaderBoard).sort((a, b) => leaderBoard[b] - leaderBoard[a]);
  const ranking = sortedUserIds.indexOf(userId) + 1 || sortedUserIds.length + 1;

  return {
    learningHours: totalHours,
    completedCourses,
    totalEnrolled,
    averageScore: avgScore,
    ranking: ranking > 0 ? `#${ranking}` : "-",
  };
}
