import { z } from "zod";

export const roleSchema = z.enum(["LEARNER", "TUTOR", "ADMIN"]);

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: roleSchema,
  institution: z.string().trim().optional(),
  major: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthRoleInput = z.infer<typeof roleSchema>;
