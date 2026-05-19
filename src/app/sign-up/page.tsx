import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { PitutorLogo } from "@/components/common/pitutor-logo";
import { getCurrentUser } from "@/lib/auth";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.roleSelected ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="grid min-h-screen bg-slate-50 p-6 lg:grid-cols-2">
      <section className="hidden rounded-3xl bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <PitutorLogo className="[&_span]:text-white" />
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-emerald-200">
            Peer-to-peer learning
          </p>
          <h1 className="max-w-xl text-5xl font-black">
            Buat akun dan pilih peranmu di ekosistem Pitutor.
          </h1>
          <p className="mt-5 max-w-md text-slate-300">
            Learner, tutor, dan admin punya dashboard berbeda dengan akses
            server-side sesuai role.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center">
        <AuthForm mode="sign-up" />
        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/sign-in" className="font-bold text-blue-600">
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}
