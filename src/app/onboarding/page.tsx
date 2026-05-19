import { GraduationCap, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { selectRoleAction } from "@/lib/actions/auth.actions";
import { requireUser, type AppRole } from "@/lib/auth";

const roles: Array<{
  label: string;
  role: AppRole;
  description: string;
  icon: LucideIcon;
}> = [
  {
    label: "Learner",
    role: "LEARNER",
    description: "Belajar course, booking mentoring, dan mengerjakan quiz.",
    icon: GraduationCap,
  },
  {
    label: "Tutor",
    role: "TUTOR",
    description: "Membuat course, mengatur jadwal, dan menerima booking.",
    icon: Users,
  },
];

export default async function OnboardingPage() {
  const user = await requireUser();

  if (user.roleSelected) {
    redirect(`/dashboard/${user.role.toLowerCase()}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-4xl p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
          Onboarding
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Pilih role untuk akun {user.name}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Role disimpan di database dan dipakai oleh Auth.js session untuk
          membatasi akses dashboard learner, tutor, dan admin.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <form key={role.role} action={selectRoleAction}>
                <input type="hidden" name="role" value={role.role} />
                <button
                  type="submit"
                  className="h-full w-full rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-blue-300 hover:shadow-lg"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="mt-5 block text-xl font-black text-slate-950">
                    {role.label}
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-slate-500">
                    {role.description}
                  </span>
                </button>
              </form>
            );
          })}
        </div>
      </Card>
    </main>
  );
}
