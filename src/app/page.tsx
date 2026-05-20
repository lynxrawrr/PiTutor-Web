import { getCourseList } from "@/lib/queries/course.queries";
import LandingClient from "@/components/landing/landing-client";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const courses = await getCourseList();

  // Take top 3 for featured
  const featuredCourses = courses.slice(0, 3);

  return <LandingClient featuredCourses={featuredCourses} />;
}
