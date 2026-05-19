import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminEditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      category: true,
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Transform to draft questions for the form
  const initialQuestions = quiz.questions.map((q) => ({
    prompt: q.prompt,
    explanation: q.explanation ?? "",
    options: q.options.sort((a, b) => a.order - b.order).map((o) => o.text),
    correctIndex: q.options.findIndex((o) => o.isCorrect),
  }));

  const initialData = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    categoryName: quiz.category.name,
    categoryDescription: quiz.category.description ?? "",
    timeLimit: quiz.timeLimit ?? 15,
    questions: initialQuestions,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/quizzes"
        className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke Daftar Quiz
      </Link>
      
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-black text-slate-950">Edit Quiz</h1>
        <p className="mt-2 text-slate-500">Sesuaikan pertanyaan atau pengaturan quiz ini.</p>
        <div className="mt-8">
          <QuizBuilderForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
