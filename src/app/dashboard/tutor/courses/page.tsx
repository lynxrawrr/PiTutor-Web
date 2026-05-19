import { Eye, Plus } from "lucide-react";
import Link from "next/link";

import { SubmitCourseReviewButton } from "@/components/tutor/submit-course-review-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTutorCourses } from "@/lib/queries/course.queries";

export default async function TutorCoursesPage() {
  await requireRole(["TUTOR", "ADMIN"]);
  const courses = await getTutorCourses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950">My Courses</h1>
          <p className="mt-2 text-slate-500">
            Kelola course, lesson, preview, dan submit review admin.
          </p>
        </div>
        <Link
          href="/dashboard/tutor/courses/new"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus className="size-5" />
          Create Course
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_170px_180px] border-b border-slate-100 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
          <span>Course</span>
          <span>Status</span>
          <span>Lesson</span>
          <span>Aksi</span>
        </div>
        {courses.map((course) => (
          <div
            key={course.id}
            className="grid grid-cols-[1fr_150px_170px_180px] items-center border-b border-slate-100 px-6 py-5 last:border-b-0"
          >
            <div>
              <h2 className="font-black text-slate-950">{course.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{course.category}</p>
            </div>
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
            <span className="font-bold text-slate-600">
              {course.lessons.length} lesson
            </span>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/tutor/courses/${course.slug}`}
                className={buttonVariants({ variant: "secondary", size: "icon" })}
                aria-label="Preview"
              >
                <Eye className="size-4" />
              </Link>
              <Link
                href={`/dashboard/tutor/courses/${course.slug}/lessons/new`}
                className={buttonVariants({ variant: "secondary", size: "icon" })}
                aria-label="Tambah lesson"
              >
                <Plus className="size-4" />
              </Link>
              <SubmitCourseReviewButton
                courseId={course.id}
                disabled={course.status === "WAITING_REVIEW"}
              />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
