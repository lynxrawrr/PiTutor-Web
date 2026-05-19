import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";
import { PitutorLogo } from "@/components/common/pitutor-logo";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.roleSelected ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen w-full bg-white font-sans">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {/* Left Side: Branding - Top Aligned */}
        <section className="relative hidden flex-1 flex-col bg-white p-12 lg:flex xl:p-20">
          {/* Background Decorative Elements */}
          <div className="absolute -left-24 -top-24 size-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-12">
              <Link 
                href="/" 
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-slate-400 hover:text-blue-600 font-black gap-2 p-0 h-auto hover:bg-transparent uppercase tracking-widest text-[10px]"
                })}
              >
                <ArrowLeft className="size-3" />
                Kembali ke Beranda
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <PitutorLogo className="scale-110 origin-left" />
            </div>

            <div className="mt-20 max-w-lg">
              <p className="mb-6 text-[13px] font-black uppercase tracking-[0.3em] text-blue-600">
                Personalized Learning
              </p>
              <h1 className="text-6xl font-black leading-[1.1] tracking-tighter text-slate-900 xl:text-7xl">
                Upgrade <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">skil kampusmu</span> dengan Peer-Learning.
              </h1>
              <p className="mt-10 text-lg font-medium leading-relaxed text-slate-500 xl:text-xl">
                Platform kolaborasi mahasiswa terbaik untuk menguasai materi kuliah melalui course eksklusif dan mentoring real-time.
              </p>
            </div>

            <div className="mt-auto pt-20">
              <div className="flex -space-x-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-100/50" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400">
                Bergabung bersama ribuan mahasiswa lainnya.
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Form */}
        <section className="flex w-full flex-col bg-white lg:w-[500px] xl:w-[540px]">
          <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-16 lg:p-12 xl:p-20">
            <div className="mb-12 flex w-full items-center justify-between lg:hidden">
              <PitutorLogo />
              <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
                Beranda
              </Link>
            </div>
            
            <div className="w-full max-w-[400px]">
              <AuthForm mode="sign-in" />
              
              <div className="mt-10 text-center">
                <p className="text-sm font-bold text-slate-400">
                  Belum punya akun?{" "}
                  <Link 
                    href="/sign-up" 
                    className="ml-1 text-blue-600 hover:text-blue-700 transition-all font-black"
                  >
                    Daftar Akun Baru
                  </Link>
                </p>
              </div>
            </div>

            <footer className="mt-20 text-center text-[11px] font-bold uppercase tracking-widest text-slate-300">
              {`© ${new Date().getFullYear()} Pitutor Platform • Academic Excellence`}
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}