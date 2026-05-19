import { TutorCourseForm } from "@/components/tutor/tutor-course-form";
import { requireRole } from "@/lib/auth";
import { getCourseDetail } from "@/lib/queries/course.queries";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole(["TUTOR", "ADMIN"]);
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);

  return <TutorCourseForm mode="lesson" courseId={course.id} />;
}
