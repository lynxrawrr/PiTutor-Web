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
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

      const nextCompletedIds = [...completedLessonIds, activeLesson.id];
      setCompletedLessonIds(nextCompletedIds);
      toast.success("Materi selesai!");

      if (nextCompletedIds.length === lessons.length) {
        send({ type: "COURSE_COMPLETED" });
        toast.success("Selamat! Course selesai.");
      } else {
        send({ type: "SAVE_SUCCESS" });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 md:p-8 selection:bg-blue-100">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 size-[600px] rounded-full bg-blue-400/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-purple-400/5 blur-[80px]" />
        </div>

        <Card className="relative z-10 w-full max-w-3xl overflow-hidden border-none shadow-2xl shadow-blue-600/10 rounded-[2.5rem]">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-10 text-center text-white">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ring-1 ring-white/30"
            >
              <Trophy className="size-10 text-white" aria-hidden="true" />
            </motion.div>
            <h1 className="mt-6 text-3xl font-black tracking-tight leading-tight md:text-4xl">
              Luar Biasa! Course Selesai.
            </h1>
            <p className="mt-3 text-blue-50/80 font-medium">
              Anda telah menguasai seluruh materi pada <br />
              <span className="font-bold text-white underline decoration-white/30 underline-offset-4">{course.title}</span>
            </p>
          </div>

          <div className="bg-white p-8 md:p-12">
            {!ratingSubmitted ? (
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Beri Rating Pengalaman Belajar</h3>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="group relative transition-all active:scale-90"
                      >
                        <Star
                          className={cn(
                            "size-10 md:size-12 transition-all duration-300",
                            star <= rating
                              ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                              : "text-slate-100 group-hover:text-amber-200",
                          )}
                        />
                        {star === rating && (
                          <motion.div
                            layoutId="star-glow-mid"
                            className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-lg font-black text-slate-800">
                    {rating === 5 ? "Sempurna! 😍" : rating === 4 ? "Sangat Bagus! 😊" : rating === 3 ? "Bagus 👍" : rating === 2 ? "Cukup 😐" : rating === 1 ? "Kurang Memuaskan 😞" : "Pilih bintang"}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ulasan Anda (Opsional)</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Apa hal yang paling Anda sukai dari materi ini?"
                    className="min-h-[120px] w-full rounded-3xl border border-slate-100 bg-slate-50/50 p-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  />
                </div>

                <Button
                  className="w-full h-14 rounded-2xl bg-slate-900 font-black shadow-xl shadow-slate-950/10 transition-all hover:bg-blue-600 border-none text-white"
                  onClick={handleRatingSubmit}
                  disabled={isPendingRating || rating === 0}
                >
                  {isPendingRating ? (
                    <Loader2 className="size-5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="size-5 mr-2" />
                  )}
                  {rating > 0 ? "Kirim Review" : "Pilih Rating"}
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl bg-emerald-50 py-12 px-6 text-center ring-1 ring-emerald-100"
              >
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg mb-6">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="text-xl font-black text-emerald-950">Terima Kasih!</h4>
                <p className="mt-2 text-slate-600 font-medium max-w-xs mx-auto">
                  Ulasan Anda sangat berarti bagi pengembangan materi di Pitutor.
                </p>
              </motion.div>
            )}

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard/learner"
                className="group flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all hover:text-blue-600"
              >
                Kembali ke Dashboard
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 lg:flex-row">
      <main className="order-1 flex-1 overflow-y-auto lg:order-2">
        <div className="mx-auto max-w-5xl p-6 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="blue">{lessonStateLabel}</Badge>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              {activeLesson.title}
            </h2>
          </div>
            <div className="flex items-center gap-3">
              {progress === 100 && (
                <Button
                  variant="secondary"
                  className="h-12 rounded-2xl px-6 font-black border-slate-200"
                  onClick={() => send({ type: "COURSE_COMPLETED" })}
                >
                  <Star className="mr-2 size-5 text-amber-500" />
                  Beri Rating
                </Button>
              )}
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

      <aside className="order-2 w-full border-t border-slate-200 bg-white lg:h-full lg:w-80 lg:order-1 lg:border-t-0 lg:border-r">
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

        <div className="max-h-[60vh] overflow-y-auto p-4 lg:max-h-[calc(100vh-80px)]">
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
    </div>
  );
}
