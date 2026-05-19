"use client";

import { 
  ArrowRight, 
  PlayCircle, 
  BookOpen, 
  Users, 
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { PitutorLogo } from "@/components/common/pitutor-logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CourseDto } from "@/types/dtos";

const features = [
  {
    title: "Video Course Eksklusif",
    description: "Belajar materi kampus dari mahasiswa senior yang sudah berpengalaman dengan format video embed yang interaktif.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Mentoring 1-on-1",
    description: "Butuh bantuan tugas atau proyek? Booking jadwal mentoring dengan tutor pilihanmu secara real-time.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Bank Soal & Quiz",
    description: "Uji kemampuanmu dengan kuis interaktif. Kumpulkan poin dan lihat peringkatmu di leaderboard kampus.",
    icon: Trophy,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }
];

const steps = [
  {
    step: "01",
    title: "Daftar Akun",
    description: "Buat akun menggunakan email kampusmu dan pilih role sebagai Learner atau Tutor."
  },
  {
    step: "02",
    title: "Pilih Materi",
    description: "Cari course atau mentor yang sesuai dengan kebutuhan akademikmu saat ini."
  },
  {
    step: "03",
    title: "Mulai Belajar",
    description: "Tonton video, kerjakan kuis, atau mulai sesi mentoring video call dengan Google Meet."
  }
];

export default function LandingClient({ featuredCourses }: { featuredCourses: CourseDto[] }) {
  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-12">
            <PitutorLogo white />
            <div className="hidden items-center gap-8 md:flex">
              <Link href="#fitur" className="text-sm font-bold text-slate-400 transition hover:text-white">
                Fitur
              </Link>
              <Link href="#cara-kerja" className="text-sm font-bold text-slate-400 transition hover:text-white">
                Cara Kerja
              </Link>
              <Link href="#course" className="text-sm font-bold text-slate-400 transition hover:text-white">
                Course
              </Link>
            </div>
          </div>
          <Link
            href="/dashboard"
            className={buttonVariants({
              className: "rounded-full !bg-blue-600 !text-white px-6 font-black hover:!bg-blue-700 transition-all shadow-xl shadow-blue-600/20 border-none",
            })}
          >
            Masuk Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80"
            alt="Students collaborating"
            fill
            className="object-cover opacity-30 grayscale-[0.5]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 uppercase font-black tracking-widest mb-6">
              By students, for students
            </Badge>

            <h1 className="text-7xl font-black tracking-tighter sm:text-8xl lg:text-9xl mb-8">
              Pitutor
            </h1>
            
            <p className="text-lg leading-relaxed text-slate-300 sm:text-xl mb-12">
              Platform peer-to-peer learning untuk mahasiswa yang ingin belajar
              course, mentoring, dan latihan soal dari mahasiswa lain.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className: "h-14 rounded-2xl bg-blue-600 px-8 font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-600/25",
                })}
              >
                Mulai Belajar
                <ArrowRight className="ml-2 size-5" />
              </Link>
              <Link
                href="#cara-kerja"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-14 rounded-2xl border-white/20 bg-white/5 px-8 font-black text-white backdrop-blur-sm hover:bg-white/10",
                })}
              >
                <PlayCircle className="mr-2 size-5" />
                Cara Kerja Pitutor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="relative z-10 bg-[#020617] py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-4">Fitur Utama</h2>
            <p className="text-4xl font-black mb-16 sm:text-5xl">Segalanya yang Kamu Butuhkan untuk Belajar</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-[32px] border border-white/5 bg-white/[0.02] p-8 text-left transition hover:bg-white/[0.04]"
              >
                <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className={`size-7 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="cara-kerja" className="relative z-10 bg-[#020617] py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Alur Belajar</h2>
              <p className="text-4xl font-black mb-8 sm:text-5xl">Cara Kerja Pitutor</p>
              <p className="text-lg text-slate-400 leading-relaxed mb-12">
                Kami merancang pengalaman belajar yang sesimpel mungkin agar kamu bisa fokus pada penguasaan materi, bukan pada hambatan teknis.
              </p>
              <div className="space-y-8">
                {steps.map((s) => (
                  <div key={s.step} className="flex gap-6">
                    <span className="text-2xl font-black text-white/20">{s.step}</span>
                    <div>
                      <h4 className="text-xl font-black mb-2">{s.title}</h4>
                      <p className="text-slate-400 font-medium">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full" />
              <div className="relative h-full rounded-[40px] border border-white/10 bg-slate-900/50 p-4 backdrop-blur-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                  alt="Dashboard preview"
                  fill
                  className="object-cover rounded-[32px] opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="course" className="relative z-10 bg-[#020617] py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-400 mb-4">Katalog Materi</h2>
              <p className="text-4xl font-black sm:text-5xl">Mulai Belajar Hari Ini</p>
            </div>
            <Link 
              href="/dashboard/learner/courses" 
              className="group flex items-center gap-2 text-blue-500 font-black hover:text-blue-400 transition-colors"
            >
              Lihat Semua Katalog <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] transition hover:bg-white/[0.04]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={c.thumbnailUrl || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80"}
                      alt={c.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute left-4 top-4">
                      <Badge className="bg-[#020617]/80 backdrop-blur-md text-white border-white/10 uppercase font-black text-[10px]">
                        {c.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-2xl font-black mb-4 line-clamp-1">{c.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">{c.lessons.length} Materi</span>
                      <Link
                        href={`/dashboard/learner/courses/${c.slug}`}
                        className="text-sm font-black text-blue-500 transition hover:text-blue-400"
                      >
                        Buka Course
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 rounded-[32px] border border-dashed border-white/10 text-slate-500 font-bold">
                Belum ada course yang dipublikasikan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020617] py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <PitutorLogo white className="mx-auto mb-8" />
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <Link href="#fitur" className="text-sm font-bold text-slate-500 hover:text-white">Fitur</Link>
            <Link href="#cara-kerja" className="text-sm font-bold text-slate-500 hover:text-white">Alur Belajar</Link>
            <Link href="#course" className="text-sm font-bold text-slate-500 hover:text-white">Course</Link>
          </div>
          <p className="text-sm font-medium text-slate-600">
            &copy; {new Date().getFullYear()} Pitutor Platform. Memberdayakan mahasiswa melalui kolaborasi.
          </p>
        </div>
      </footer>
    </main>
  );
}
