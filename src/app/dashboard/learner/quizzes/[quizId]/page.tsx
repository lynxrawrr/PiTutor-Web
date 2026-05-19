import { QuizSession } from "@/components/quiz/quiz-session";
import { getQuizDetail } from "@/lib/queries/quiz.queries";

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = await getQuizDetail(quizId);

  return <QuizSession quiz={quiz} />;
}
