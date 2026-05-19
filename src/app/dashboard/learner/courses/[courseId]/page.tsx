import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnrollCourseButton } from "@/components/courses/enroll-course-button";
import { getCourseDetail } from "@/lib/queries/course.queries";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/learner/courses"
        className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke katalog
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge variant="green">{course.category}</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950">
            {course.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-500">
            {course.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Star
                className="size-5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {course.rating} ({course.reviews} ulasan)
            </span>
            <span className="inline-flex items-center gap-2">
              <BookOpen className="size-5 text-emerald-500" aria-hidden="true" />
              {course.lessons.length} modul
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-5 text-orange-500" aria-hidden="true" />
              {course.duration} jam
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <EnrollCourseButton
              courseId={course.id}
              slug={course.slug}
              enrolled={course.enrolled}
            />
            <Link
              href="/dashboard/learner/mentoring"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Cari Mentor Pendamping
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-72">
            <Image
              className="object-cover"
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">Progress belajar</span>
              <span className="font-black text-slate-950">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="mt-3" />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-black text-slate-950">
          Kurikulum Course
        </h2>
        <div className="space-y-3">
          {course.lessons.map((lesson, index) => (
            <Card key={lesson.id} className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-black text-blue-600">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-950">{lesson.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {lesson.description}
                </p>
              </div>
              <div className="hidden items-center gap-2 text-sm font-bold text-slate-500 sm:flex">
                <Clock3 className="size-4" aria-hidden="true" />
                {lesson.duration} menit
              </div>
              {index === 0 ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : null}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
