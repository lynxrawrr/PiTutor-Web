import type { QuizDto } from "@/types/dtos";
import { prisma } from "@/lib/prisma";

type QuizWithRelations = Awaited<ReturnType<typeof fetchQuizzes>>[number];

async function fetchQuizzes() {
  return prisma.quiz.findMany({
    include: {
      category: true,
      questions: {
        include: {
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function mapQuiz(quiz: QuizWithRelations): QuizDto {
  return {
    id: quiz.id,
    title: quiz.title,
    category: quiz.category.name,
    description: quiz.description ?? quiz.category.description ?? "",
    difficulty:
      quiz.questions.length > 20
        ? "Sulit"
        : quiz.questions.length > 10
          ? "Menengah"
          : "Mudah",
    totalQuestions: quiz.questions.length,
    participants: 120 + quiz.questions.length * 25,
    timeLimit: quiz.timeLimit ?? 15,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      explanation: question.explanation ?? "Pembahasan belum tersedia.",
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}

export async function getQuizList() {
  const quizzes = await fetchQuizzes();

  return quizzes.map(mapQuiz);
}

export async function getQuizDetail(id: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      category: true,
      questions: {
        include: {
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz tidak ditemukan.");
  }

  return mapQuiz(quiz);
}

export async function getTotalPoints(learnerId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { learnerId },
  });

  return attempts.reduce((acc, attempt) => acc + (attempt.score ?? 0), 0);
}
