import { NextResponse } from "next/server";

import { getCourseList } from "@/lib/queries/course.queries";

export async function GET() {
  const courses = await getCourseList();

  return NextResponse.json({ data: courses });
}

export async function POST() {
  return NextResponse.json(
    { message: "Gunakan Server Action createCourse untuk mutation course." },
    { status: 405 },
  );
}
