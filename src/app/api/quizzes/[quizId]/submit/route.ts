import { NextResponse } from "next/server";

import { submitQuizAttempt } from "@/lib/actions/quiz.actions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;
  const body = (await request.json()) as {
    answers?: { questionId: string; optionId: string }[];
  };
  const attempt = await submitQuizAttempt({
    quizId,
    answers: body.answers ?? [],
  });

  return NextResponse.json({
    data: attempt,
  });
}
