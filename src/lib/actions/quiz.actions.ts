"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createQuizCategorySchema,
  createQuizSchema,
  createQuestionSchema,
  type CreateQuizCategoryInput,
  type CreateQuizInput,
  submitQuizSchema,
  type CreateQuestionInput,
  type SubmitQuizInput,
} from "@/lib/validations/quiz.validation";
import { createSlug } from "@/lib/utils/slug";

export async function createQuizCategory(input: CreateQuizCategoryInput) {
  await requireRole(["TUTOR", "ADMIN"]);
  const data = createQuizCategorySchema.parse(input);
  const baseSlug = createSlug(data.name);
  const slug = baseSlug || `category-${Date.now()}`;

  const category = await prisma.quizCategory.upsert({
    where: { slug },
    update: {
      name: data.name,
      description: data.description,
    },
    create: {
      name: data.name,
      slug,
      description: data.description,
    },
  });

  revalidatePath("/dashboard/admin/quizzes");
  return category;
}

export async function createQuiz(input: CreateQuizInput) {
  await requireRole(["TUTOR", "ADMIN"]);
  const data = createQuizSchema.parse(input);

  const quiz = await prisma.quiz.create({
    data,
  });

  revalidatePath("/dashboard/admin/quizzes");
  return quiz;
}

export async function createQuestion(input: CreateQuestionInput) {
  await requireRole(["TUTOR", "ADMIN"]);
  const data = createQuestionSchema.parse(input);

  const question = await prisma.question.create({
    data: {
      quizId: data.quizId,
      prompt: data.prompt,
      explanation: data.explanation,
      order: data.order,
      options: {
        create: data.options.map((option, index) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          order: index + 1,
        })),
      },
    },
    include: { options: true },
  });

  revalidatePath("/dashboard/admin/quizzes");
  return question;
}

export async function submitQuizAttempt(input: SubmitQuizInput) {
  const user = await requireRole(["LEARNER"]);
  const data = submitQuizSchema.parse(input);

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: data.quizId,
      learnerId: user.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      answers: {
        create: data.answers.map((answer) => ({
          questionId: answer.questionId,
          optionId: answer.optionId,
        })),
      },
    },
    include: { answers: true },
  });

  return calculateQuizScore(attempt.id);
}

export async function deleteQuiz(quizId: string) {
  await requireRole(["TUTOR", "ADMIN"]);
  await prisma.quiz.delete({
    where: { id: quizId },
  });
  revalidatePath("/dashboard/admin/quizzes");
  revalidatePath("/dashboard/learner/quizzes");
}


export async function calculateQuizScore(attemptId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          option: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Quiz attempt tidak ditemukan.");
  }

  const correctCount = attempt.answers.filter(
    (answer) => answer.option?.isCorrect,
  ).length;
  const totalAnswers = attempt.answers.length;
  const score =
    totalAnswers === 0 ? 0 : Math.round((correctCount / totalAnswers) * 100);

  await Promise.all(
    attempt.answers.map((answer) =>
      prisma.quizAnswer.update({
        where: { id: answer.id },
        data: { isCorrect: Boolean(answer.option?.isCorrect) },
      }),
    ),
  );

  const updatedAttempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      status: "SCORED",
      score,
    },
  });

  revalidatePath("/dashboard/learner/quizzes");
  return {
    id: updatedAttempt.id,
    score: updatedAttempt.score ?? 0,
    status: updatedAttempt.status,
  };
}
