import Link from "next/link";

import { CourseReviewActions } from "@/components/admin/course-review-actions";
import { AutoRefresh } from "@/components/common/auto-refresh";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTutorCourses } from "@/lib/queries/course.queries";
import { formatStatus } from "@/lib/utils";

export default async function AdminCoursesPage() {
  await requireRole(["ADMIN"]);
  const courses = await getTutorCourses();

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <div>
        <h1 className="text-4xl font-black text-slate-950">Course Review</h1>
        <p className="mt-2 text-slate-500">
          Preview course, approve publikasi, atau reject dengan alasan.
        </p>
      </div>
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge
                  variant={
                    course.status === "PUBLISHED"
                      ? "green"
                      : course.status === "WAITING_REVIEW"
                        ? "orange"
                        : "slate"
                  }
                >
                  {formatStatus(course.status)}
                </Badge>
                <h2 className="mt-3 text-xl font-black text-slate-950">
                  {course.title}
                </h2>
                <p className="mt-1 text-slate-500">
                  {course.tutorName} - {course.lessons.length} lesson
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/tutor/courses/${course.id}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Preview & Review
                </Link>
                <CourseReviewActions
                  courseId={course.id}
                  disabled={course.status !== "WAITING_REVIEW"}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
