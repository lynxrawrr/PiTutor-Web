import { NextResponse } from "next/server";

import { getLearnerBookings } from "@/lib/queries/mentoring.queries";

export async function GET() {
  const bookings = await getLearnerBookings();

  return NextResponse.json({ data: bookings });
}

export async function POST() {
  return NextResponse.json(
    { message: "Gunakan Server Action bookMentoringSession." },
    { status: 405 },
  );
}
