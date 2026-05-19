import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TutorCourseForm } from "@/components/tutor/tutor-course-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  await requireRole(["TUTOR", "ADMIN"]);
  const { courseId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/tutor/courses/${courseId}`}
        className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke Detail Course
      </Link>
      
      <TutorCourseForm mode="lesson" courseId={courseId} initialData={lesson} />
    </div>
  );
}
