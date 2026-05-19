import { z } from "zod";

export const createScheduleSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((value) => value.endsAt.getTime() > value.startsAt.getTime(), {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endsAt"],
  });

export const bookingSchema = z.object({
  tutorId: z.string().min(1, "Mentor wajib dipilih."),
  scheduleId: z.string().min(1, "Jadwal wajib dipilih."),
  topic: z.string().trim().min(3, "Topik mentoring wajib diisi."),
  goals: z.string().trim().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
