import { z } from "zod";

export const createQuizCategorySchema = z.object({
  name: z.string().trim().min(3, "Nama kategori minimal 3 karakter."),
  description: z.string().trim().optional(),
});

export const createQuizSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  title: z.string().trim().min(5, "Judul quiz minimal 5 karakter."),
  description: z.string().trim().optional(),
  timeLimit: z.coerce.number().int().min(1).optional(),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz wajib dipilih."),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      optionId: z.string().min(1),
    }),
  ),
});

export const createQuestionSchema = z.object({
  quizId: z.string().min(1, "Quiz wajib dipilih."),
  prompt: z.string().trim().min(10, "Pertanyaan minimal 10 karakter."),
  explanation: z.string().trim().optional(),
  order: z.coerce.number().int().min(1),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, "Pilihan jawaban wajib diisi."),
        isCorrect: z.boolean().default(false),
      }),
    )
    .min(2, "Minimal dua pilihan jawaban.")
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "Minimal satu pilihan harus menjadi jawaban benar.",
    }),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateQuizCategoryInput = z.infer<
  typeof createQuizCategorySchema
>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
