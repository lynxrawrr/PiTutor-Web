import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getScheduleDurationMinutes(startsAt: Date, endsAt: Date) {
  return Math.max(
    1,
    Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000),
  );
}

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
      durationMinutes: getScheduleDurationMinutes(
        schedule.startsAt,
        schedule.endsAt,
      ),
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
