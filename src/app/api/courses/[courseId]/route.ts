import { NextResponse } from "next/server";

import { getCourseDetail } from "@/lib/queries/course.queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);

  return NextResponse.json({ data: course });
}
