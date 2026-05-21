import type { BookingDto, MentorDto } from "@/types/dtos";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MentorWithRelations = Awaited<ReturnType<typeof fetchMentors>>[number];
type BookingWithRelations = Awaited<ReturnType<typeof fetchBookings>>[number];

async function fetchMentors() {
  return prisma.tutorProfile.findMany({
    include: {
      user: true,
      bookings: {
        where: {
          status: "COMPLETED",
          rating: { not: null },
        },
        select: {
          rating: true,
        },
      },
      schedules: {
        orderBy: {
          startsAt: "asc",
        },
      },
      _count: {
        select: {
          bookings: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
    orderBy: {
      rating: "desc",
    },
  });
}

async function fetchBookings() {
  return prisma.mentoringBooking.findMany({
    include: {
      learner: true,
      tutor: {
        include: {
          user: true,
        },
      },
      schedule: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function formatScheduleDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatScheduleDay(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
  }).format(date);
}

function formatScheduleTime(startsAt: Date, endsAt: Date) {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formatter.format(startsAt)} - ${formatter.format(endsAt)}`;
}

function getScheduleDurationMinutes(startsAt: Date, endsAt: Date) {
  return Math.max(
    1,
    Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000),
  );
}

function mapMentor(mentor: MentorWithRelations): MentorDto {
  const completedBookings = mentor.bookings || [];
  const totalReviews = completedBookings.length;
  const avgRating =
    totalReviews > 0
      ? completedBookings.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
        totalReviews
      : 0;

  return {
    id: mentor.id,
    name: mentor.user.name,
    headline: mentor.headline ?? "Mentor Pitutor",
    bio: mentor.bio ?? "Siap membantu sesi belajar 1-on-1.",
    avatarUrl: mentor.user.avatarUrl ?? "/vercel.svg",
    expertise: mentor.expertise,
    hourlyRate: mentor.hourlyRate ?? 50000,
    rating: avgRating,
    totalSessions: mentor._count?.bookings ?? 0,
    verified: mentor.verified,
    availableTomorrow: mentor.schedules.some((schedule) => !schedule.isBooked),
    schedules: mentor.schedules.map((schedule) => ({
      id: schedule.id,
      date: formatScheduleDate(schedule.startsAt),
      day: formatScheduleDay(schedule.startsAt),
      time: formatScheduleTime(schedule.startsAt, schedule.endsAt),
      durationMinutes: getScheduleDurationMinutes(
        schedule.startsAt,
        schedule.endsAt,
      ),
    })),
  };
}

function mapBooking(booking: BookingWithRelations): BookingDto {
  const schedule = booking.schedule
    ? `${formatScheduleDate(booking.schedule.startsAt)}, ${formatScheduleTime(
        booking.schedule.startsAt,
        booking.schedule.endsAt,
      )}`
    : "Jadwal fleksibel";

  return {
    id: booking.id,
    learnerName: booking.learner.name,
    mentorName: booking.tutor.user.name,
    mentorAvatar: booking.tutor.user.avatarUrl,
    topic: booking.topic,
    schedule,
    startsAt: booking.schedule?.startsAt ?? null,
    durationMinutes: booking.schedule
      ? getScheduleDurationMinutes(
          booking.schedule.startsAt,
          booking.schedule.endsAt,
        )
      : null,
    status: booking.status,
    meetingUrl: booking.meetingUrl,
    rating: booking.rating,
    review: booking.review,
    reviewedAt: booking.reviewedAt?.toISOString() ?? null,
  };
}

export async function getMentorList() {
  const mentors = await fetchMentors();

  return mentors.map(mapMentor);
}

export async function getMentorProfile(id: string) {
  const mentor = await prisma.tutorProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
    include: {
      user: true,
      bookings: {
        where: {
          status: "COMPLETED",
          rating: { not: null },
        },
        select: {
          rating: true,
        },
      },
      schedules: {
        orderBy: {
          startsAt: "asc",
        },
      },
      _count: {
        select: {
          bookings: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
  });

  if (!mentor) {
    throw new Error("Mentor tidak ditemukan.");
  }

  return mapMentor(mentor);
}

export async function getLearnerBookings() {
  const user = await getCurrentUser();
  const bookings = await fetchBookings();
  const scopedBookings = user
    ? bookings.filter((booking) => booking.learnerId === user.id)
    : [];

  return scopedBookings.map(mapBooking);
}

export async function getTutorBookings() {
  const user = await getCurrentUser();
  const bookings = await fetchBookings();
  const scopedBookings =
    user?.role === "TUTOR"
      ? bookings.filter((booking) => booking.tutor.userId === user.id)
      : bookings;

  return scopedBookings.map(mapBooking);
}

export async function getTutorSchedules() {
  const user = await getCurrentUser();
  const schedules = await prisma.mentorSchedule.findMany({
    where:
      user?.role === "TUTOR"
        ? {
            tutor: {
              userId: user.id,
            },
          }
        : undefined,
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

  return schedules.map((schedule) => ({
    id: schedule.id,
    mentorName: schedule.tutor.user.name,
    date: formatScheduleDate(schedule.startsAt),
    day: formatScheduleDay(schedule.startsAt),
    time: formatScheduleTime(schedule.startsAt, schedule.endsAt),
    startsAt: schedule.startsAt,
    endsAt: schedule.endsAt,
    durationMinutes: getScheduleDurationMinutes(
      schedule.startsAt,
      schedule.endsAt,
    ),
    isBooked: schedule.isBooked,
  }));
}
