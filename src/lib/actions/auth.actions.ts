"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleSchema } from "@/lib/validations/auth.validation";

export async function selectRoleAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const role = roleSchema.parse(formData.get("role"));

  await prisma.user.update({
    where: { id: session.user.id },
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

  redirect(`/dashboard/${role.toLowerCase()}`);
}
