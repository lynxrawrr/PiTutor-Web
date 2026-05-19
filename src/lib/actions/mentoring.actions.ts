"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  bookingSchema,
  createScheduleSchema,
  type BookingInput,
  type CreateScheduleInput,
} from "@/lib/validations/mentoring.validation";

const updateScheduleSchema = z
  .object({
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
  })
  .refine(
    (value) =>
      !value.startsAt || !value.endsAt || value.endsAt > value.startsAt,
    {
      message: "Waktu selesai harus setelah waktu mulai.",
      path: ["endsAt"],
    },
  );

export async function createMentorSchedule(input: CreateScheduleInput) {
  const user = await requireRole(["TUTOR", "ADMIN"]);
  const data = createScheduleSchema.parse(input);
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!tutor) {
    throw new Error("Profil tutor belum tersedia.");
  }

  const schedule = await prisma.mentorSchedule.create({
    data: {
      tutorId: tutor.id,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });

  revalidatePath("/dashboard/tutor/schedules");
  return schedule;
}

export async function updateMentorSchedule(
  scheduleId: string,
  input: Partial<CreateScheduleInput>,
) {
  await requireRole(["TUTOR", "ADMIN"]);
  const data = updateScheduleSchema.parse(input);

  const schedule = await prisma.mentorSchedule.update({
    where: { id: scheduleId },
    data,
  });

  revalidatePath("/dashboard/tutor/schedules");
  return schedule;
}

export async function bookMentoringSession(input: BookingInput) {
  const user = await requireRole(["LEARNER"]);
  const data = bookingSchema.parse(input);

  const booking = await prisma.mentoringBooking.create({
    data: {
      learnerId: user.id,
      tutorId: data.tutorId,
      scheduleId: data.scheduleId,
      topic: data.topic,
      goals: data.goals,
    },
  });

  await prisma.mentorSchedule.update({
    where: { id: data.scheduleId },
    data: { isBooked: true },
  });

  revalidatePath("/dashboard/learner/mentoring");
  revalidatePath("/dashboard/tutor/bookings");
  return booking;
}

export async function acceptBooking(bookingId: string, meetingUrl?: string) {
  await requireRole(["TUTOR", "ADMIN"]);

  const booking = await prisma.mentoringBooking.update({
    where: { id: bookingId },
    data: {
      status: "ACCEPTED",
      meetingUrl,
    },
  });

  revalidatePath("/dashboard/tutor/bookings");
  return booking;
}

export async function rejectBooking(bookingId: string, reason?: string) {
  await requireRole(["TUTOR", "ADMIN"]);

  const booking = await prisma.mentoringBooking.update({
    where: { id: bookingId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
    },
  });

  revalidatePath("/dashboard/tutor/bookings");
  return booking;
}

export async function completeBooking(bookingId: string) {
  await requireRole(["TUTOR", "ADMIN"]);

  const booking = await prisma.mentoringBooking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/dashboard/tutor/bookings");
  revalidatePath("/dashboard/learner/mentoring");
  return booking;
}

export async function submitMentorReview(
  bookingId: string,
  input: { rating: number; review?: string },
) {
  await requireRole(["LEARNER"]);

  const booking = await prisma.mentoringBooking.update({
    where: { id: bookingId },
    data: {
      rating: input.rating,
      review: input.review,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/learner/mentoring");
  return booking;
}
