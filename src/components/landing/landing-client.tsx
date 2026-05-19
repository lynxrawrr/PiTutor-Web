"use client";

import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Trophy,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { PitutorLogo } from "@/components/common/pitutor-logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CourseDto } from "@/types/dtos";

const features = [
  {
    title: "Video Course Eksklusif",
    description: "Belajar materi kampus dari mahasiswa senior yang sudah berpengalaman dengan format video embed yang interaktif.",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-500/10"
  },
  {
    title: "Mentoring 1-on-1",
    description: "Butuh bantuan tugas atau proyek? Booking jadwal mentoring dengan tutor pilihanmu secara real-time.",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-500/10"
  },
  {
    title: "Bank Soal & Quiz",
    description: "Uji kemampuanmu dengan kuis interaktif. Kumpulkan poin dan lihat peringkatmu di leaderboard kampus.",
    icon: Trophy,
    color: "text-orange-600",
    bg: "bg-orange-500/10"
  }
];

const steps = [
  {
    step: "01",
    title: "Daftar Akun",
    description: "Buat akun menggunakan email aktifmu dan pilih role sebagai Learner atau Tutor."
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Navigation - Dynamic Background & Smooth Transition */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out border-b",
          scrolled 
            ? "border-slate-100 bg-white/80 backdrop-blur-xl py-4 shadow-sm" 
            : "border-transparent bg-transparent py-6"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-6 md:gap-12">
            <PitutorLogo />
            <div className="hidden items-center gap-6 lg:gap-10 md:flex">
              <Link href="#fitur" className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 hover:text-blue-600",
                scrolled ? "text-slate-500" : "text-slate-600"
              )}>
                Layanan
              </Link>
              <Link href="#cara-kerja" className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 hover:text-blue-600",
                scrolled ? "text-slate-500" : "text-slate-600"
              )}>
                Workflow
              </Link>
              <Link href="#course" className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 hover:text-blue-600",
                scrolled ? "text-slate-500" : "text-slate-600"
              )}>
                Katalog
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <Link 
              href="/sign-in" 
              className={cn(
                "hidden text-[11px] font-black uppercase tracking-[0.2em] hover:text-blue-600 sm:block transition-colors duration-300",
                scrolled ? "text-slate-500" : "text-slate-700"
              )}
            >
              Masuk
            </Link>
            <Link
              href="/sign-up"
              className={buttonVariants({
                className: cn(
                  "rounded-xl font-black px-6 md:px-8 transition-all duration-300 border-none uppercase tracking-[0.15em] text-[10px] h-11",
                  scrolled
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-blue-600"
                    : "bg-slate-900 text-white shadow-lg hover:bg-blue-600"
                ),
              })}
            >
              Coba Sekarang
            </Link>          </div>
        </div>
      </nav>

      {/* Hero Section - Refined Spacing */}
      <section className="relative flex pt-52 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Background Image: Students Studying/Collaborating */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80" 
              alt="Students studying"
              fill
              className="object-cover opacity-[0.12] scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/30 to-white" />
          </div>

          <div className="absolute -top-24 -left-24 size-[700px] rounded-full bg-blue-400/15 blur-[120px]" />
          <div className="absolute bottom-0 right-0 size-[600px] rounded-full bg-purple-400/15 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-[1.05] mb-8 text-slate-900">
              Belajar lebih cerdas <br className="hidden sm:block" />
              dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Pitutor.</span>
            </h1>
            
            <p className="text-lg leading-relaxed text-slate-500 sm:text-xl mb-12 max-w-2xl mx-auto font-medium">
              Platform kolaborasi mahasiswa untuk menguasai materi kampus melalui course interaktif dan mentoring real-time.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className: "h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 font-black text-white hover:opacity-90 shadow-xl shadow-blue-600/20 text-base transition-all active:scale-95 border-none",
                })}
              >
                Mulai Belajar
                <ArrowRight className="ml-2 size-5" />
              </Link>
              <Link
                href="#cara-kerja"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "h-14 rounded-2xl bg-white border border-slate-200 px-10 font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-base transition-all shadow-sm",
                })}
              >
                Lihat Workflow
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="relative z-10 bg-slate-50/50 py-32 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-3xl border border-slate-100 bg-white p-10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/5 hover:border-blue-100"
              >
                <div className={`mb-8 flex size-14 items-center justify-center rounded-2xl ${f.bg} group-hover:scale-110 transition-transform shadow-sm`}>
                  <f.icon className={`size-7 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-800">{f.title}</h3>
                <p className="text-base text-slate-500 leading-relaxed font-medium">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="cara-kerja" className="relative z-10 bg-white py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Cara Kerja Pitutor</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">Dirancang untuk memudahkan perjalanan akademikmu langkah demi langkah.</p>
          </div>
          
          <div className="grid gap-12 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="relative group text-center">
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-700 mx-auto transition group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-blue-600/20">
                  {s.step}
                </div>
                <h4 className="text-xl font-black mb-3 text-slate-800">{s.title}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="course" className="relative z-10 bg-slate-50/50 py-32 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Materi Populer</h2>
              <p className="text-slate-500 font-medium mt-2">Katalog materi terbaik pilihan mahasiswa.</p>
            </div>
            <Link 
              href="/dashboard/learner/courses" 
              className="group flex items-center gap-2 text-blue-600 font-bold hover:text-purple-600 transition-all"
            >
              Lihat Semua Katalog <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/5 hover:border-blue-100"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={c.thumbnailUrl || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80"}
                      alt={c.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-slate-100 font-bold text-[9px] px-2 py-1 shadow-sm uppercase tracking-wider">
                        {c.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-1 text-sm mb-4">
                      {c.reviews > 0 ? (
                        <>
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-700">{c.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({c.reviews})</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">New</span>
                      )}
                    </div>
                    <h4 className="text-xl font-black mb-6 line-clamp-1 group-hover:text-blue-600 transition-colors text-slate-800 tracking-tight">{c.title}</h4>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{c.lessons.length} Materi</span>
                      <Link
                        href={`/dashboard/learner/courses/${c.slug}`}
                        className="text-sm font-black text-blue-600 flex items-center gap-1 hover:text-purple-600 transition-colors"
                      >
                        Buka <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-32 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
                <BookOpen className="size-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Katalog Belum Tersedia</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer - Branded */}
      <footer className="bg-white pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-4 mb-20">
            <div className="lg:col-span-2">
              <PitutorLogo className="mb-8" />
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                Platform peer-learning modern untuk mahasiswa Indonesia. Memberdayakan masa depan melalui kolaborasi.
              </p>
            </div>
            <div>
              <h5 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Navigasi</h5>
              <ul className="space-y-4">
                <li><Link href="#fitur" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Layanan Kami</Link></li>
                <li><Link href="#cara-kerja" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Cara Kerja</Link></li>
                <li><Link href="#course" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Katalog Materi</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Akun</h5>
              <ul className="space-y-4">
                <li><Link href="/sign-in" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Masuk</Link></li>
                <li><Link href="/sign-up" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Daftar Akun</Link></li>
                <li><Link href="/onboarding" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition">Onboarding</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              {`© ${new Date().getFullYear()} Pitutor • Built with passion for students.`}
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-300">
              <Link href="#" className="hover:text-blue-600 transition">Privacy</Link>
              <Link href="#" className="hover:text-blue-600 transition">Terms</Link>
              <Link href="#" className="hover:text-blue-600 transition">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
