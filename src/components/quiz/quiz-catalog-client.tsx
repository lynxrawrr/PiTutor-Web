"use client";

import { CircleHelp, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizzes } from "@/hooks/use-quiz";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  purple: "from-purple-50 to-violet-50 text-purple-600",
  green: "from-emerald-50 to-teal-50 text-emerald-600",
  orange: "from-orange-50 to-amber-50 text-orange-600",
  cyan: "from-cyan-50 to-sky-50 text-cyan-600",
};

export function QuizCatalogClient() {
  const [search, setSearch] = useState("");
  const { data: response, isLoading, isError } = useQuizzes();
  
  const quizzes = response?.data ?? [];
  const totalPoints = response?.totalPoints ?? 0;

  const groupedQuizzes = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const filtered = quizzes.filter((quiz) =>
      `${quiz.title} ${quiz.category} ${quiz.description}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
    
    const groups: Record<string, typeof quizzes> = {};
    for (const quiz of filtered) {
      if (!groups[quiz.category]) {
        groups[quiz.category] = [];
      }
      groups[quiz.category].push(quiz);
    }
    return Object.entries(groups);
  }, [quizzes, search]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-10 text-white shadow-2xl shadow-orange-500/20">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">
              Uji Kemampuanmu!
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-orange-50">
              Kerjakan kuis dari bank soal terlengkap. Kumpulkan poin, naikkan
              peringkatmu, dan buktikan kamu yang terbaik di kampus.
            </p>
          </div>
          <div className="flex size-32 shrink-0 flex-col items-center justify-center rounded-3xl border border-white/30 bg-white/15">
            <Trophy className="size-10 text-yellow-300" aria-hidden="true" />
            <span className="mt-2 text-3xl font-black">{totalPoints}</span>
            <span className="text-sm">TOTAL POIN</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-black text-slate-950">
          Kategori Bank Soal
        </h2>
        <label className="flex h-12 min-w-72 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="size-5 text-slate-400" aria-hidden="true" />
          <span className="sr-only">Cari kuis</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Cari kuis..."
          />
        </label>
      </div>

      {isError ? <ErrorState message="Data quiz gagal dimuat." /> : null}

      {isLoading ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-7">
              <Skeleton className="size-12" />
              <Skeleton className="mt-8 h-7 w-3/4" />
              <Skeleton className="mt-4 h-14 w-full" />
              <Skeleton className="mt-8 h-12 w-full" />
            </Card>
          ))}
        </section>
      ) : null}

      {!isLoading && groupedQuizzes.length === 0 ? (
        <EmptyState
          icon={CircleHelp}
          title="Quiz tidak ditemukan"
          description="Coba kata kunci lain atau buat quiz baru dari dashboard admin."
        />
      ) : null}

      {!isLoading && groupedQuizzes.length > 0 ? (
        <div className="space-y-12">
          {groupedQuizzes.map(([category, categoryQuizzes]) => (
            <section key={category}>
              <h3 className="mb-6 text-2xl font-black text-slate-800 border-b pb-2">{category}</h3>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categoryQuizzes.map((quiz, index) => (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/learner/quizzes/${quiz.id}`}
                    className={cn(
                      "rounded-2xl border border-slate-200 bg-gradient-to-br p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
                      tones[["purple", "green", "orange", "cyan"][index % 4]],
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <CircleHelp className="size-6" aria-hidden="true" />
                      </div>
                      <Badge
                        variant={
                          quiz.difficulty === "Sulit"
                            ? "orange"
                            : quiz.difficulty === "Menengah"
                              ? "purple"
                              : "green"
                        }
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <h4 className="mt-8 text-xl font-black text-slate-950">
                      {quiz.title}
                    </h4>
                    <p className="mt-4 min-h-12 text-slate-600 line-clamp-2">
                      {quiz.description}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-white/65 p-2 text-center font-black text-slate-700">
                      <span>{quiz.totalQuestions} Soal</span>
                      <span>{quiz.timeLimit} Menit</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
