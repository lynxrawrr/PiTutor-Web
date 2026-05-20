import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await requireUser();

  let tutorProfile = null;
  if (user.role === "TUTOR") {
    tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="size-3" />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-4xl font-black text-slate-950 flex items-center gap-4">
          <User className="size-10 text-blue-600" />
          Pengaturan Profil
        </h1>
        <p className="mt-2 text-slate-500 font-medium">
          Kelola informasi akun Anda di sini. Perubahan akan langsung berdampak
          pada seluruh platform.
        </p>
      </div>

      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          headline: tutorProfile?.headline ?? undefined,
          bio: tutorProfile?.bio ?? undefined,
        }}
      />
    </div>
  );
}
