import Image from "next/image";

import { VerifyTutorButton } from "@/components/admin/verify-tutor-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminMentorsPage() {
  await requireRole(["ADMIN"]);

  const mentors = await prisma.tutorProfile.findMany({
    where: {
      user: {
        role: "TUTOR",
      },
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">Tutor Verification</h1>
        <p className="mt-2 text-slate-500">
          Verifikasi profil mentor sebelum ditampilkan secara luas.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="p-6">
            <div className="flex gap-4">
              <Image
                className="size-20 rounded-2xl object-cover"
                src={mentor.user.avatarUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"}
                alt={mentor.user.name}
                width={80}
                height={80}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-slate-950">
                  {mentor.user.name}
                </h2>
                <p className="mt-1 text-slate-500">{mentor.headline ?? "Tutor Pitutor"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="slate">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <VerifyTutorButton tutorId={mentor.id} verified={mentor.verified} />
          </Card>
        ))}
      </div>
    </div>
  );
}
