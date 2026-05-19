import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { PitutorLogo } from "@/components/common/pitutor-logo";
import { getCurrentUser } from "@/lib/auth";

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.roleSelected ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="grid min-h-screen bg-slate-50 p-6 lg:grid-cols-2">
      <section className="hidden rounded-3xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <PitutorLogo className="[&_span]:text-white" />
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-blue-50">
            By students, for students
          </p>
          <h1 className="max-w-xl text-5xl font-black">
            Masuk untuk lanjut belajar bareng teman kampus.
          </h1>
          <p className="mt-5 max-w-md text-blue-50">
            Course video embed, mentoring 1-on-1, dan bank soal kini terhubung
            ke Auth.js dan PostgreSQL.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center">
        <AuthForm mode="sign-in" />
        <p className="mt-5 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/sign-up" className="font-bold text-blue-600">
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  );
}
