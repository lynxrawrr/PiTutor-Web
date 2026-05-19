import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getQuizList, getTotalPoints } from "@/lib/queries/quiz.queries";

export async function GET() {
  const user = await getCurrentUser();
  const quizzes = await getQuizList();
  
  let totalPoints = 0;
  if (user?.role === "LEARNER") {
    totalPoints = await getTotalPoints(user.id);
  }

  return NextResponse.json({ data: quizzes, totalPoints });
}
