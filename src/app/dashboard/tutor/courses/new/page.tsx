import { TutorCourseForm } from "@/components/tutor/tutor-course-form";
import { requireRole } from "@/lib/auth";

export default async function NewCoursePage() {
  await requireRole(["TUTOR", "ADMIN"]);

  return <TutorCourseForm mode="course" />;
}
