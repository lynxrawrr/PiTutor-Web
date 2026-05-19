import { Plus } from "lucide-react";
import Link from "next/link";

import { QuizActions } from "@/components/admin/quiz-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getQuizList } from "@/lib/queries/quiz.queries";

export default async function AdminQuizzesPage() {
  await requireRole(["ADMIN"]);
  const quizzes = await getQuizList();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950">
            Quiz & Category Management
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Kelola kategori, paket soal, pertanyaan, opsi, dan pembahasan kuis.
          </p>
        </div>
        <Link
          href="/dashboard/admin/quizzes/new"
          className={buttonVariants({
            className: "rounded-2xl shadow-xl shadow-blue-600/20 px-8 h-14 font-black",
          })}
        >
          <Plus className="size-5" />
          Buat Quiz Baru
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 relative">
            <div className="absolute right-6 top-6">
              <QuizActions quizId={quiz.id} />
            </div>
            <Badge variant="orange">{quiz.category}</Badge>
            <h2 className="mt-4 text-xl font-black text-slate-950 pr-8">
              {quiz.title}
            </h2>
            <p className="mt-2 text-slate-500">{quiz.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm font-black">
              <span className="rounded-xl bg-slate-50 p-3">
                {quiz.questions.length} Soal
              </span>
              <span className="rounded-xl bg-slate-50 p-3">
                {quiz.timeLimit} Menit
              </span>
              <span className="rounded-xl bg-slate-50 p-3">
                {quiz.difficulty}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
