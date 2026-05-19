import { z } from "zod";

import { getVideoEmbedUrl } from "@/lib/utils/video";

const optionalUrl = z
  .string()
  .trim()
  .url("URL tidak valid.")
  .optional()
  .or(z.literal(""));

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter."),
  description: z.string().trim().min(20, "Deskripsi minimal 20 karakter."),
  category: z.string().trim().min(2, "Kategori wajib diisi."),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  thumbnailUrl: optionalUrl,
});

export const createLessonSchema = z.object({
  title: z.string().trim().min(3, "Judul lesson wajib diisi."),
  description: z.string().trim().optional(),
  videoUrl: z
    .string()
    .trim()
    .url("Video URL harus berupa URL valid.")
    .refine((value) => Boolean(getVideoEmbedUrl(value)), {
      message: "Untuk MVP, gunakan URL YouTube yang valid.",
    }),
  moduleUrl: optionalUrl,
  order: z.coerce.number().int().min(1, "Urutan lesson dimulai dari 1."),
  duration: z.coerce.number().int().positive().optional(),
});

export const enrollCourseSchema = z.object({
  courseId: z.string().min(1, "Course wajib dipilih."),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;
