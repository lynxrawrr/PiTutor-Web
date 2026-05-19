import { CourseLearningDemo } from "@/components/courses/course-learning-demo";
import { getCourseDetail } from "@/lib/queries/course.queries";
import { redirect } from "next/navigation";

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);

  if (!course.enrolled) {
    redirect(`/dashboard/learner/courses/${course.slug}`);
  }

  return <CourseLearningDemo course={course} />;
}
