import { User } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-950 flex items-center gap-4">
          <User className="size-10 text-blue-600" />
          Pengaturan Profil
        </h1>
        <p className="mt-2 text-slate-500 font-medium">
          Kelola informasi akun Anda di sini. Perubahan akan langsung berdampak pada seluruh platform.
        </p>
      </div>

      <ProfileForm user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }} />
    </div>
  );
}
