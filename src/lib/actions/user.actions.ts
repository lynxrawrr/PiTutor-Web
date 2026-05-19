"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateAccountSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.").optional().or(z.literal("")),
});

export async function updateAccountAction(input: z.infer<typeof updateAccountSchema>) {
  const user = await requireUser();
  const data = updateAccountSchema.parse(input);

  const updateData: {
    name: string;
    email: string;
    passwordHash?: string;
  } = {
    name: data.name,
    email: data.email,
  };

  if (data.password && data.password.length >= 6) {
    updateData.passwordHash = await hash(data.password, 12);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath("/dashboard", "layout");
}

const profileSchema = z.object({
  clerkId: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2),
  avatarUrl: z.string().url().optional(),
  institution: z.string().optional(),
  major: z.string().optional(),
});

export async function createUserProfile(input: z.infer<typeof profileSchema>) {
  const data = profileSchema.parse(input);

  return prisma.user.upsert({
    where: { email: data.email },
    update: data,
    create: {
      ...data,
      roleSelected: false,
    },
  });
}

export async function updateUserRole(
  userId: string,
  role: "LEARNER" | "TUTOR" | "ADMIN",
) {
  await requireRole(["ADMIN"]);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      roleSelected: true,
      learnerProfile:
        role === "LEARNER"
          ? {
              upsert: {
                update: {},
                create: {
                  goals: "Mulai belajar bersama Pitutor.",
                },
              },
            }
          : undefined,
      tutorProfile:
        role === "TUTOR"
          ? {
              upsert: {
                update: {},
                create: {
                  headline: "Tutor Pitutor",
                  bio: "Siap berbagi ilmu dengan mahasiswa lain.",
                  expertise: [],
                },
              },
            }
          : undefined,
    },
  });

  revalidatePath("/dashboard/admin/users");
  return user;
}

export async function updateLearnerProfile(input: {
  bio?: string;
  goals?: string;
}) {
  const user = await requireUser();

  return prisma.learnerProfile.upsert({
    where: { userId: user.id },
    update: input,
    create: {
      userId: user.id,
      ...input,
    },
  });
}

export async function updateTutorProfile(input: {
  headline?: string;
  bio?: string;
  expertise?: string[];
  hourlyRate?: number;
}) {
  const user = await requireRole(["TUTOR", "ADMIN"]);

  return prisma.tutorProfile.upsert({
    where: { userId: user.id },
    update: input,
    create: {
      userId: user.id,
      expertise: input.expertise ?? [],
      headline: input.headline,
      bio: input.bio,
      hourlyRate: input.hourlyRate,
    },
  });
}

export async function updateAvatarUrl(url: string) {
  const user = await requireUser();
  
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: url },
  });

  revalidatePath("/dashboard", "layout");
}
