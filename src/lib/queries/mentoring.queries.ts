import type { BookingDto, MentorDto } from "@/types/dtos";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MentorWithRelations = Awaited<ReturnType<typeof fetchMentors>>[number];
type BookingWithRelations = Awaited<ReturnType<typeof fetchBookings>>[number];

async function fetchMentors() {
  return prisma.tutorProfile.findMany({
    include: {
      user: true,
      schedules: {
        orderBy: {
          startsAt: "asc",
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

function mapMentor(mentor: MentorWithRelations): MentorDto {
  return {
    id: mentor.id,
    name: mentor.user.name,
    headline: mentor.headline ?? "Mentor Pitutor",
    bio: mentor.bio ?? "Siap membantu sesi belajar 1-on-1.",
    avatarUrl:
      mentor.user.avatarUrl ??
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    expertise: mentor.expertise,
    hourlyRate: mentor.hourlyRate ?? 50000,
    rating: mentor.rating,
    totalSessions: mentor.totalReviews,
    verified: mentor.verified,
    availableTomorrow: mentor.schedules.some((schedule) => !schedule.isBooked),
    schedules: mentor.schedules.map((schedule) => ({
      id: schedule.id,
      date: formatScheduleDate(schedule.startsAt),
      day: formatScheduleDay(schedule.startsAt),
      time: formatScheduleTime(schedule.startsAt, schedule.endsAt),
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
    topic: booking.topic,
    schedule,
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
      schedules: {
        orderBy: {
          startsAt: "asc",
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
    isBooked: schedule.isBooked,
  }));
}
