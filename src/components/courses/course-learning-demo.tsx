"use client";

import { useMachine } from "@xstate/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  PlayCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { VideoEmbedPlayer } from "@/components/video/video-embed-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { markLessonComplete, submitCourseRating } from "@/lib/actions/course.actions";
import type { CourseDto } from "@/types/dtos";
import { courseLearningMachine } from "@/lib/machines/course-learning.machine";
import { cn } from "@/lib/utils";
import { getVideoEmbedUrl } from "@/lib/utils/video";

export function CourseLearningDemo({ course }: { course: CourseDto }) {
  const [snapshot, send] = useMachine(courseLearningMachine);
  const lessons = course.lessons;
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(
    lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id),
  );

  // Rating State
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isPendingRating, startRatingTransition] = useTransition();
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (!lessons[0]) {
      return;
    }

    send({ type: "CONTINUE_LEARNING" });
    send({ type: "SELECT_LESSON", lessonId: lessons[0].id });
  }, [lessons, send]);

  useEffect(() => {
    if (!snapshot.matches("loadingVideo")) {
      return;
    }

    const timer = window.setTimeout(() => {
      const lesson = lessons.find(
        (item) => item.id === snapshot.context.selectedLessonId,
      );
      const embedUrl = lesson ? getVideoEmbedUrl(lesson.videoUrl) : null;

      send(
        embedUrl
          ? { type: "VIDEO_READY" }
          : { type: "VIDEO_ERROR", error: "Video URL tidak valid." },
      );
    }, 450);

    return () => window.clearTimeout(timer);
  }, [lessons, send, snapshot]);

  const activeLesson =
    lessons.find((lesson) => lesson.id === snapshot.context.selectedLessonId) ??
    lessons[0];

  const activeLessonIndex = lessons.findIndex(
    (lesson) => lesson.id === activeLesson.id,
  );
  const embedUrl = activeLesson.embedUrl ?? getVideoEmbedUrl(activeLesson.videoUrl);
  const isCompleted = completedLessonIds.includes(activeLesson.id);
  const progress = Math.round((completedLessonIds.length / lessons.length) * 100);

  const lessonStateLabel = useMemo(() => {
    if (snapshot.matches("loadingVideo")) {
      return "Memuat video";
    }

    if (snapshot.matches("savingProgress")) {
      return "Menyimpan progress";
    }

    if (snapshot.matches("courseCompleted")) {
      return "Course selesai";
    }

    if (snapshot.matches("videoError")) {
      return "Video bermasalah";
    }

    return "Sedang belajar";
  }, [snapshot]);

  function selectLesson(lessonId: string) {
    send({ type: "SELECT_LESSON", lessonId });
  }

  async function markComplete() {
    send({ type: "MARK_COMPLETE" });

    try {
      await markLessonComplete({
        enrollmentId: course.enrollmentId!,
        lessonId: activeLesson.id,
      });
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
      send({ type: "SAVE_SUCCESS" });
      toast.success("Materi selesai!");

      if (completedLessonIds.length + 1 === lessons.length) {
        send({ type: "ALL_COMPLETED" });
        toast.success("Selamat! Course selesai.");
      }
    } catch (caughtError) {
      toast.error("Gagal menyimpan progress.");
      send({ type: "SAVE_FAILED", error: "Gagal simpan" });
    }
  }

  async function handleRatingSubmit() {
    if (rating === 0) {
      toast.error("Pilih rating terlebih dahulu.");
      return;
    }

    startRatingTransition(async () => {
      try {
        await submitCourseRating({
          enrollmentId: course.enrollmentId!,
          rating,
          review,
        });
        toast.success("Terima kasih atas reviewnya!");
        setRatingSubmitted(true);
      } catch (error) {
        toast.error("Gagal mengirim review.");
      }
    });
  }

  if (snapshot.matches("courseCompleted")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-2xl p-10 text-center shadow-2xl">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-10" aria-hidden="true" />
          </div>
          <h1 className="mt-8 text-4xl font-black text-slate-950">
            Selamat! Anda telah Menyelesaikan Course
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Anda telah menyelesaikan semua materi pada course{" "}
            <span className="font-bold text-slate-900">{course.title}</span>.
          </p>

          {!ratingSubmitted ? (
            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-xl font-black text-slate-950">Beri Rating Course Ini</h3>
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      className={cn(
                        "size-10",
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200",
                      )}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tuliskan pengalaman belajarmu (opsional)..."
                className="mt-6 min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-600/5"
              />
              <Button
                className="mt-6 w-full h-14 rounded-2xl font-black shadow-xl shadow-blue-600/20"
                onClick={handleRatingSubmit}
                disabled={isPendingRating}
              >
                {isPendingRating ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="size-5 mr-2" />
                )}
                Kirim Review
              </Button>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl bg-emerald-50 p-6 font-bold text-emerald-700">
              Terima kasih! Review Anda membantu kami meningkatkan kualitas materi.
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/learner"
              className={cn(
                "inline-flex h-14 items-center justify-center rounded-2xl bg-slate-900 px-8 font-black text-white transition hover:bg-slate-800",
              )}
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 lg:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white lg:h-full lg:w-80 lg:border-b-0 lg:border-r">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <Link
            href={`/dashboard/learner/courses/${course.slug}`}
            className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              {course.title}
            </p>
            <p className="text-xs font-bold text-slate-400">
              Progress: {progress}%
            </p>
          </div>
        </div>

        <div className="max-h-[calc(100vh-80px)] overflow-y-auto p-4">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
            Daftar Materi
          </p>
          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLesson.id;
              const completed = completedLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => selectLesson(lesson.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                      : "hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
                      isActive
                        ? "border-white/40 bg-white/20 text-white"
                        : completed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate text-sm font-black",
                        isActive ? "text-white" : "text-slate-900",
                      )}
                    >
                      {lesson.title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[10px] font-bold",
                        isActive ? "text-blue-100" : "text-slate-400",
                      )}
                    >
                      {lesson.duration} Menit
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="blue">{lessonStateLabel}</Badge>
              <h2 className="mt-4 text-3xl font-black text-slate-950">
                {activeLesson.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="purple"
                className="h-12 rounded-2xl px-6 font-black shadow-lg shadow-purple-600/10"
                disabled={isCompleted || snapshot.matches("savingProgress")}
                onClick={markComplete}
              >
                {snapshot.matches("savingProgress") ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-5" />
                )}
                {isCompleted ? "Sudah Selesai" : "Tandai Selesai"}
              </Button>
            </div>
          </div>

          <div className="mt-8 aspect-video overflow-hidden rounded-[32px] border border-slate-100 bg-black shadow-2xl">
            {snapshot.matches("loadingVideo") ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-900 text-white">
                <Loader2 className="size-10 animate-spin text-blue-500" />
                <p className="font-bold tracking-widest text-slate-400">
                  MEMUAT VIDEO...
                </p>
              </div>
            ) : (
              <VideoEmbedPlayer
                title={activeLesson.title}
                embedUrl={embedUrl}
              />
            )}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-950">
                Deskripsi Materi
              </h3>
              <p className="text-lg font-medium leading-relaxed text-slate-500">
                {activeLesson.description ||
                  "Tidak ada deskripsi untuk materi ini."}
              </p>
            </div>
            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Resources
                </p>
                <div className="mt-4 space-y-3">
                  <a
                    href={activeLesson.moduleUrl || "#"}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                    target="_blank"
                  >
                    <FileText className="size-6 text-blue-600" />
                    <span className="text-sm font-black text-slate-900">
                      Modul Pembelajaran
                    </span>
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
            <Button
              variant="ghost"
              className="h-12 rounded-2xl px-6 font-black"
              disabled={activeLessonIndex === 0}
              onClick={() => selectLesson(lessons[activeLessonIndex - 1].id)}
            >
              <ArrowLeft className="mr-2 size-5" />
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              className="h-12 rounded-2xl px-6 font-black"
              disabled={activeLessonIndex === lessons.length - 1}
              onClick={() => selectLesson(lessons[activeLessonIndex + 1].id)}
            >
              Selanjutnya
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
