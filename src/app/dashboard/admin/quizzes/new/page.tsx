import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";
import { requireRole } from "@/lib/auth";

export default async function AdminNewQuizPage() {
  await requireRole(["ADMIN"]);

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
        <h1 className="text-3xl font-black text-slate-950">Buat Quiz Baru</h1>
        <p className="mt-2 text-slate-500">Rancang kategori, paket soal, dan pembahasan kuis baru.</p>
        <div className="mt-8">
          <QuizBuilderForm />
        </div>
      </div>
    </div>
  );
}
