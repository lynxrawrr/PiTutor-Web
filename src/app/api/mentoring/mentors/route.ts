import { NextResponse } from "next/server";

import { getMentorList } from "@/lib/queries/mentoring.queries";

export async function GET() {
  const mentors = await getMentorList();

  return NextResponse.json({ data: mentors });
}
