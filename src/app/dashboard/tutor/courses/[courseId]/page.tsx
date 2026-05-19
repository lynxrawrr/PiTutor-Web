import { ArrowLeft, BookOpen, Clock3, Edit3, Plus } from "lucide-react";
import Link from "next/link";

import { VideoEmbedPlayer } from "@/components/video/video-embed-player";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LessonActions } from "@/components/tutor/lesson-actions";
import { CourseReviewActions } from "@/components/admin/course-review-actions";
import { requireRole, requireUser } from "@/lib/auth";
import { getCourseDetail } from "@/lib/queries/course.queries";

export default async function TutorCoursePreviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireUser();
  await requireRole(["TUTOR", "ADMIN"]);
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);
  const firstLesson = course.lessons[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={user.role === "ADMIN" ? "/dashboard/admin/courses" : "/dashboard/tutor/courses"}
          className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke {user.role === "ADMIN" ? "Course Review" : "My Courses"}
        </Link>
        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <CourseReviewActions
              courseId={course.id}
              disabled={course.status !== "WAITING_REVIEW"}
            />
          )}
          <Link
            href={`/dashboard/tutor/courses/${course.id}/edit`}
            className={buttonVariants({ variant: "secondary", className: "rounded-2xl" })}
          >
            <Edit3 className="size-4" />
            Edit Course
          </Link>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Badge
            variant={
              course.status === "PUBLISHED"
                ? "green"
                : course.status === "WAITING_REVIEW"
                  ? "orange"
                  : "slate"
            }
          >
            {course.status}
          </Badge>
          <h1 className="text-4xl font-black text-slate-950 leading-tight">{course.title}</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-500 font-medium">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-5 text-sm font-black text-slate-500">
            <span className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <BookOpen className="size-5 text-blue-600" aria-hidden="true" />
              {course.lessons.length} Materi
            </span>
            <span className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <Clock3 className="size-5 text-purple-600" aria-hidden="true" />
              {course.duration} Jam Estimasi
            </span>
          </div>
          <Link
            href={`/dashboard/tutor/courses/${course.id}/lessons/new`}
            className={buttonVariants({ size: "lg", className: "rounded-2xl shadow-xl shadow-blue-600/20" })}
          >
            <Plus className="size-5" />
            Tambah Materi Baru
          </Link>
        </div>

        <Card className="p-6 border-slate-100 shadow-lg shadow-slate-200/50">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Preview Video Pertama
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-100">
            <VideoEmbedPlayer
              title={firstLesson?.title ?? course.title}
              embedUrl={firstLesson?.embedUrl ?? null}
            />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-black text-slate-950">
          Kurikulum Kursus
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {course.lessons.map((lesson) => (
            <Card key={lesson.id} className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    Bagian {lesson.order}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950 line-clamp-1">
                    {lesson.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium line-clamp-2">
                    {lesson.description}
                  </p>
                </div>
                <LessonActions lessonId={lesson.id} courseSlug={course.id} />
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  {lesson.duration} Menit
                </span>
                {lesson.videoUrl && (
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Video Ready
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
