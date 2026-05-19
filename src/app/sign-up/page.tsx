import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";
import { PitutorLogo } from "@/components/common/pitutor-logo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.roleSelected ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen w-full bg-white font-sans">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <section className="relative hidden flex-1 flex-col bg-white p-12 lg:flex xl:p-20">
          <div className="absolute -right-24 -top-24 size-[600px] rounded-full bg-emerald-600/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 size-[400px] rounded-full bg-blue-600/5 blur-[100px]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-12">
              <Link
                href="/"
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "h-auto gap-2 p-0 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-transparent hover:text-emerald-600",
                })}
              >
                <ArrowLeft className="size-3" />
                Kembali ke Beranda
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <PitutorLogo className="origin-left scale-110" />
            </div>

            <div className="mt-20 max-w-lg">
              <p className="mb-6 text-[13px] font-black uppercase tracking-[0.3em] text-emerald-600">
                Join the Movement
              </p>
              <h1 className="text-6xl font-black leading-[1.1] tracking-tighter text-slate-900 xl:text-7xl">
                Mulai berbagi{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  ilmu & inspirasi
                </span>{" "}
                di Pitutor.
              </h1>
              <p className="mt-10 text-lg font-medium leading-relaxed text-slate-500 xl:text-xl">
                Jadilah tutor atau learner. Bangun reputasi akademikmu dan bantu
                sesama mahasiswa mencapai impian mereka.
              </p>
            </div>

            <div className="mt-auto pt-20">
              <div className="mb-6 flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-10 rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-100/50"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400">
                Bergabung bersama ribuan mahasiswa lainnya.
              </p>
            </div>
          </div>
        </section>

        <section className="flex w-full flex-col bg-white lg:w-[500px] xl:w-[540px]">
          <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-16 lg:p-12 xl:p-20">
            <div className="mb-12 flex w-full items-center justify-between lg:hidden">
              <PitutorLogo />
              <Link
                href="/"
                className="text-sm font-bold text-emerald-600 hover:underline"
              >
                Beranda
              </Link>
            </div>

            <div className="w-full max-w-[400px]">
              <AuthForm mode="sign-up" />

              <div className="mt-10 text-center">
                <p className="text-sm font-bold text-slate-400">
                  Sudah memiliki akun?{" "}
                  <Link
                    href="/sign-in"
                    className="ml-1 font-black text-emerald-600 transition-all hover:text-emerald-700 hover:underline"
                  >
                    Masuk ke Dashboard
                  </Link>
                </p>
              </div>
            </div>

            <footer className="mt-20 text-center text-[11px] font-bold uppercase tracking-widest text-slate-300">
              {`Copyright ${new Date().getFullYear()} Pitutor Platform - Academic Excellence`}
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
