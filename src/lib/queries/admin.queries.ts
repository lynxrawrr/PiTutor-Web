import { prisma } from "@/lib/prisma";
import { getTutorCourses } from "@/lib/queries/course.queries";
import { getTutorBookings, getMentorList } from "@/lib/queries/mentoring.queries";
import { getQuizList } from "@/lib/queries/quiz.queries";

export async function getAdminOverview() {
  const [users, courses, mentors, quizzes, bookings] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    getTutorCourses(),
    getMentorList(),
    getQuizList(),
    getTutorBookings(),
  ]);

  return {
    users,
    courses,
    mentors,
    quizzes,
    bookings,
  };
}
