import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schedules = await prisma.mentorSchedule.findMany({
    include: {
      tutor: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  return NextResponse.json({
    data: schedules.map((schedule) => ({
      id: schedule.id,
      tutorId: schedule.tutorId,
      tutorName: schedule.tutor.user.name,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      isBooked: schedule.isBooked,
    })),
  });
}

export async function POST() {
  return NextResponse.json(
    { message: "Gunakan Server Action createMentorSchedule." },
    { status: 405 },
  );
}
