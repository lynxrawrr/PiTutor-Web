import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TutorPendingPage() {
  const user = await requireUser();

  if (user.role !== "TUTOR") {
    redirect(`/dashboard/${user.role.toLowerCase()}`);
  }

  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
  });

  if (tutor?.verified) {
    redirect("/dashboard/tutor");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-2xl overflow-hidden border-none p-0 shadow-2xl shadow-blue-600/5">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-12 text-center text-white">
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ring-1 ring-white/30">
            <Clock className="size-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="mt-8 text-3xl font-black tracking-tight leading-tight">
            Akun Tutor Sedang Diverifikasi
          </h1>
          <p className="mt-4 text-amber-50/80 font-medium">
            Terima kasih telah mendaftar sebagai Tutor di Pitutor! Admin sedang meninjau profil Anda.
          </p>
        </div>
        
        <div className="bg-white p-10 text-center">
          <div className="space-y-6">
            <p className="text-slate-600 font-medium leading-relaxed">
              Proses verifikasi biasanya membutuhkan waktu <span className="font-bold text-slate-950">1x24 jam</span>. 
              Kami akan memastikan kualifikasi tutor tetap terjaga demi kualitas pembelajaran mahasiswa.
            </p>
            
            <div className="rounded-2xl bg-amber-50 p-6 text-sm font-bold text-amber-700 ring-1 ring-amber-100">
              💡 Tip: Pastikan profil Anda sudah lengkap agar admin lebih mudah melakukan verifikasi.
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Link
                href="/"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-900 px-8 font-black text-white transition hover:bg-slate-800 shadow-xl shadow-slate-950/20"
              >
                Kembali ke Beranda
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 px-8 font-black text-slate-600 transition hover:bg-slate-50"
              >
                Lengkapi Profil
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
