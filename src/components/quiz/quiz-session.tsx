"use client";

import { useMachine } from "@xstate/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { submitQuizAttempt } from "@/lib/actions/quiz.actions";
import type { QuizDto } from "@/types/dtos";
import { quizMachine } from "@/lib/machines/quiz.machine";
import { cn } from "@/lib/utils";

export function QuizSession({ quiz }: { quiz: QuizDto }) {
  const [snapshot, send] = useMachine(quizMachine);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time Timer State
  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit ?? 15) * 60);

  const selectedAnswers = snapshot.context.answers;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = Math.round((answeredCount / quiz.questions.length) * 100);

  const score = useMemo(() => {
    const correct = quiz.questions.filter((item) => {
      const selectedOptionId = selectedAnswers[item.id];
      return item.options.some(
        (option) => option.id === selectedOptionId && option.isCorrect,
      );
    }).length;

    return Math.round((correct / quiz.questions.length) * 100);
  }, [quiz.questions, selectedAnswers]);

  const submitQuiz = useCallback(async () => {
    send({ type: "SUBMIT" });
    setError(null);

    try {
      const attempt = await submitQuizAttempt({
        quizId: quiz.id,
        answers: Object.entries(selectedAnswers).map(
          ([questionId, optionId]) => ({
            questionId,
            optionId,
          }),
        ),
      });
      send({ type: "SUBMIT_SUCCESS" });
      send({ type: "CALCULATE_DONE", score: attempt.score ?? score });
      toast.success("Kuis berhasil diselesaikan!");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Submit quiz gagal.";
      setError(message);
      send({ type: "SUBMIT_FAILED", error: message });
      toast.error(message);
    }
  }, [quiz.id, selectedAnswers, send, score]);

  useEffect(() => {
    if (!snapshot.matches("answeringQuestions")) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void submitQuiz(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [snapshot, submitQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const question = quiz.questions[questionIndex];

  function startQuiz() {
    send({ type: "SELECT_CATEGORY", categoryId: quiz.category });
    send({ type: "LOAD_SUCCESS" });
  }

  if (snapshot.matches("selectingCategory") || snapshot.matches("loadingQuestions")) {
    return (
      <Card className="mx-auto max-w-3xl p-8 text-center shadow-xl shadow-slate-200/50">
        <Badge variant="orange">{quiz.category}</Badge>
        <h1 className="mt-4 text-3xl md:text-4xl font-black text-slate-950">{quiz.title}</h1>
        <p className="mt-4 text-base md:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">{quiz.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-black text-slate-500 uppercase tracking-widest">
          <span className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
            <Clock3 className="size-4 text-orange-500" /> {quiz.timeLimit} menit
          </span>
          <span className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
            {quiz.questions.length} Butir Soal
          </span>
        </div>
        <Button className="mt-10 h-14 px-10 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black shadow-xl shadow-orange-500/20" onClick={startQuiz}>
          Mulai Kuis Sekarang
        </Button>
      </Card>
    );
  }

  if (snapshot.matches("reviewingAnswers")) {
    return (
      <Card className="mx-auto max-w-4xl p-8 shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-black text-slate-950">Review Jawaban</h1>
        <p className="mt-2 text-slate-500 font-medium">
          Pastikan semua jawaban sudah sesuai sebelum submit.
        </p>
        <div className="mt-8 grid gap-4">
          {quiz.questions.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5"
            >
              <span className="font-bold text-slate-700">Soal {index + 1}</span>
              <Badge variant={selectedAnswers[item.id] ? "green" : "orange"}>
                {selectedAnswers[item.id] ? "Terjawab" : "Belum dijawab"}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-between border-t border-slate-100 pt-8">
          <Button variant="secondary" className="rounded-xl px-8 h-12" onClick={() => send({ type: "BACK" })}>
            Kembali
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 rounded-xl px-8 h-12 shadow-lg shadow-orange-500/20"
            onClick={submitQuiz}
          >
            Submit Quiz
          </Button>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl bg-orange-50 p-4 font-bold text-orange-700">
            {error}
          </div>
        ) : null}
      </Card>
    );
  }

  if (snapshot.matches("submitting") || snapshot.matches("calculatingScore")) {
    return (
      <Card className="mx-auto max-w-3xl p-12 text-center shadow-xl">
        <Loader2 className="mx-auto size-14 animate-spin text-orange-500" />
        <h1 className="mt-6 text-2xl font-black text-slate-950">
          Menghitung skor...
        </h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Tunggu sebentar, kami sedang memvalidasi jawabanmu.</p>
      </Card>
    );
  }

  if (snapshot.matches("showingResult") || snapshot.matches("showingDiscussion")) {
    return (
      <Card className="mx-auto max-w-4xl p-6 md:p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto flex size-16 md:size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-8 md:size-10" />
          </div>
          <h1 className="mt-6 text-3xl md:text-5xl font-black text-slate-950 uppercase tracking-tight">
            Skor Kamu: {snapshot.context.score}
          </h1>
          <p className="mt-4 text-lg md:text-xl font-bold text-slate-500">
            {snapshot.context.score >= 80
              ? "Luar biasa! Pemahamanmu sudah sangat kuat."
              : "Kerja bagus! Terus asah kemampuanmu lagi."}
          </p>
        </div>

        {snapshot.matches("showingDiscussion") ? (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-black text-slate-950 border-b pb-4">Pembahasan Soal</h3>
            {quiz.questions.map((item, index) => {
              const selectedOption = item.options.find(
                (option) => option.id === selectedAnswers[item.id],
              );

              return (
                <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50/30 p-6">
                  <p className="text-lg font-black text-slate-900 leading-relaxed">
                    {index + 1}. {item.prompt}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-sm font-black uppercase text-slate-400">Jawabanmu:</span>
                    <span className={cn(
                      "text-sm font-black",
                      selectedOption?.isCorrect ? "text-emerald-600" : "text-red-500"
                    )}>
                      {selectedOption?.text ?? "Belum dijawab"}
                    </span>
                  </div>
                  <div className="mt-4 rounded-2xl bg-emerald-50/50 p-4 ring-1 ring-emerald-100/50">
                    <p className="text-sm font-bold text-emerald-800 leading-relaxed">
                      <span className="font-black uppercase tracking-wider text-[10px] mr-2 opacity-60">Penjelasan:</span>
                      {item.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100 pt-10">
          {snapshot.matches("showingDiscussion") ? (
            <Link
              href="/dashboard/learner/quizzes"
              className={buttonVariants({ variant: "secondary", className: "h-14 rounded-2xl px-10 font-black" })}
            >
              Kembali ke Bank Soal
            </Link>
          ) : (
            <Button
              variant="secondary"
              className="h-14 rounded-2xl px-10 font-black"
              onClick={() => send({ type: "VIEW_DISCUSSION" })}
            >
              Lihat Pembahasan
            </Button>
          )}
          <Button
            className="h-14 rounded-2xl px-10 bg-orange-500 hover:bg-orange-600 font-black shadow-xl shadow-orange-500/20"
            onClick={() => {
              setQuestionIndex(0);
              setTimeLeft((quiz.timeLimit ?? 15) * 60);
              send({ type: "RETAKE" });
              send({ type: "LOAD_SUCCESS" });
            }}
          >
            Retake Kuis
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
      <Card className="p-8 shadow-lg shadow-slate-200/50 border-slate-100">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-slate-50 pb-6">
          <div>
            <Badge variant="orange" className="font-black tracking-widest">{quiz.category}</Badge>
            <h1 className="mt-3 text-3xl font-black text-slate-950 tracking-tight">
              {quiz.title}
            </h1>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-orange-50 px-5 py-3 font-black text-xl text-orange-700 ring-1 ring-orange-200">
            <Clock3 className="size-6" /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Soal {questionIndex + 1} dari {quiz.questions.length}
          </p>
          <h2 className="mt-4 text-2xl font-black leading-snug text-slate-950">
            {question.prompt}
          </h2>
          <div className="mt-10 space-y-4">
            {question.options.map((option, index) => {
              const selected = selectedAnswers[question.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() =>
                    send({
                      type: "ANSWER_QUESTION",
                      questionId: question.id,
                      optionId: option.id,
                    })
                  }
                  className={cn(
                    "group flex w-full items-center justify-between rounded-[24px] border-2 p-6 text-left transition-all duration-200",
                    selected
                      ? "border-orange-500 bg-orange-50/50 text-orange-950 shadow-inner"
                      : "border-slate-100 bg-white hover:border-orange-200 hover:bg-slate-50/30",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "flex size-10 items-center justify-center rounded-xl border-2 font-black transition-colors",
                      selected ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-orange-200"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-bold text-lg">{option.text}</span>
                  </div>
                  {selected ? <CheckCircle2 className="size-6 text-orange-600" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-between pt-8 border-t border-slate-50">
          <Button
            variant="ghost"
            className="h-14 rounded-2xl px-8 font-black text-slate-500"
            onClick={() => setQuestionIndex((value) => Math.max(0, value - 1))}
            disabled={questionIndex === 0}
          >
            <ArrowLeft className="size-5 mr-2" />
            Sebelumnya
          </Button>
          {questionIndex === quiz.questions.length - 1 ? (
            <Button
              className="h-14 rounded-2xl px-10 bg-orange-500 hover:bg-orange-600 font-black text-white shadow-xl shadow-orange-500/25"
              onClick={() => send({ type: "REVIEW" })}
            >
              Review Jawaban
            </Button>
          ) : (
            <Button
              className="h-14 rounded-2xl px-10 font-black shadow-xl shadow-slate-900/10"
              onClick={() =>
                setQuestionIndex((value) =>
                  Math.min(quiz.questions.length - 1, value + 1),
                )
              }
            >
              Lanjut
              <ArrowRight className="size-5 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 border-slate-100 shadow-xl shadow-slate-200/50">
          <h2 className="font-black text-slate-950 uppercase tracking-widest text-xs">Navigasi Soal</h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-400">PROGRESS</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {quiz.questions.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setQuestionIndex(index)}
                className={cn(
                  "h-12 rounded-xl font-black text-sm transition-all active:scale-90",
                  questionIndex === index
                    ? "bg-slate-950 text-white shadow-lg ring-2 ring-slate-950 ring-offset-2"
                    : selectedAnswers[item.id]
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200",
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-950 text-white border-none shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Info Kuis</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-blue-500" />
              <p className="text-sm font-bold text-slate-300">{quiz.totalQuestions} Pertanyaan</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-orange-500" />
              <p className="text-sm font-bold text-slate-300">Waktu: {quiz.timeLimit} Menit</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
