import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.validation";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { message: "Email sudah terdaftar. Silakan masuk." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name,
      role: data.role,
      roleSelected: true,
      institution: data.institution,
      major: data.major,
      learnerProfile:
        data.role === "LEARNER"
          ? {
              create: {
                goals: "Mulai belajar bersama Pitutor.",
              },
            }
          : undefined,
      tutorProfile:
        data.role === "TUTOR"
          ? {
              create: {
                headline: "Tutor Pitutor",
                bio: "Siap berbagi ilmu dengan mahasiswa lain.",
                expertise: [],
              },
            }
          : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
