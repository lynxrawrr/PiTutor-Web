"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function verifyTutor(tutorId: string) {
  await requireRole(["ADMIN"]);

  const tutor = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: { verified: true },
  });

  revalidatePath("/dashboard/admin/mentors");
  return tutor;
}
