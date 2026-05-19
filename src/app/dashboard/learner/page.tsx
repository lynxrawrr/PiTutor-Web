import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as motion from "framer-motion/client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getCourseList } from "@/lib/queries/course.queries";
import { getLearnerBookings } from "@/lib/queries/mentoring.queries";

export default async function LearnerDashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).getHours();
  let greeting = "Selamat malam";
  if (hour >= 5 && hour < 12) greeting = "Selamat pagi";
  else if (hour >= 12 && hour < 15) greeting = "Selamat siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat sore";

  const [courses, bookings] = await Promise.all([
    getCourseList(),
    getLearnerBookings(),
  ]);
  const learningItems = courses.filter((course) => course.enrolled);
  const visibleLearningItems = learningItems.length > 0 ? learningItems : courses;
  const nextBooking = bookings[0];

  return (
    <div className="space-y-10">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-8 py-12 text-white shadow-2xl shadow-blue-600/20 md:px-12"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            {greeting}, {firstName}! 🎓
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-blue-50/90">
            Terus pertahankan semangat belajarmu! Kamu memiliki{" "}
            <span className="font-bold text-white">2 materi</span> yang belum
            diselesaikan dan <span className="font-bold text-white">1 jadwal</span>{" "}
            mentoring hari ini.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/dashboard/learner/courses"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "rounded-2xl font-bold shadow-xl shadow-black/10",
              })}
            >
              <PlayCircle className="size-5" aria-hidden="true" />
              Lanjutkan Belajar
            </Link>
            <Link
              href="/dashboard/learner/mentoring"
              className={buttonVariants({
                size: "lg",
                className:
                  "rounded-2xl border-white/20 bg-white/10 font-bold text-white backdrop-blur-sm hover:bg-white/20",
              })}
            >
              Cari Mentor Baru
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 size-60 rounded-full bg-blue-400/20 blur-3xl" />
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock3}
          value="24.5"
          label="Jam Belajar"
          helper="+2.5 jam minggu ini"
        />
        <StatCard
          icon={CheckCircle2}
          value="12"
          label="Course Selesai"
          helper="Dari 15 terdaftar"
          tone="green"
        />
        <StatCard
          icon={Star}
          value="88"
          label="Skor Rata-rata"
          helper="Top 15% di kampus"
          tone="orange"
        />
        <StatCard
          icon={TrendingUp}
          value="#42"
          label="Peringkat"
          helper="Naik 5 posisi"
          tone="purple"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">
              Sedang Dipelajari
            </h2>
            <Link
              href="/dashboard/learner/courses"
              className="font-bold text-blue-600"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-4">
            {visibleLearningItems.map((item) => (
              <Card
                key={item.title}
                className="grid gap-4 p-5 md:grid-cols-[180px_1fr]"
              >
                <Image
                  className="h-28 w-full rounded-2xl object-cover"
                  src={item.thumbnailUrl}
                  alt={item.title}
                  width={360}
                  height={224}
                />
                <div className="flex min-w-0 flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <Badge variant="green">{item.category}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-4" aria-hidden="true" />
                      {item.duration} Jam Materi
                    </span>
                  </div>
                  <Link href={`/dashboard/learner/courses/${item.slug}`}>
                    <h3 className="mt-3 text-xl font-black text-slate-950">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="mt-5 flex items-center gap-4">
                    <Progress value={item.progress} className="flex-1" />
                    <span className="w-12 text-right font-black text-slate-700">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-2xl font-black text-slate-950">
            Jadwal Terdekat
          </h2>
          <Card className="overflow-hidden p-6">
            <div className="flex gap-5">
              <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-purple-50 font-black text-purple-700">
                <span className="text-sm">MEI</span>
                <span className="text-2xl">18</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  {nextBooking?.topic ?? "Belum ada jadwal mentoring"}
                </h3>
                <p className="mt-2 text-slate-500">
                  {nextBooking?.schedule ?? "Booking mentor untuk mulai sesi"}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <Image
                    className="size-7 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Budi Santoso"
                    width={28}
                    height={28}
                  />
                  {nextBooking?.mentorName ?? "Pitutor Mentor"}
                </div>
              </div>
            </div>
            <div className="mt-7 border-t border-slate-100 pt-6">
              {nextBooking?.meetingUrl ? (
                <a
                  href={nextBooking.meetingUrl}
                  target="_blank"
                  className={buttonVariants({ variant: "purple", className: "w-full" })}
                >
                  Gabung Sesi
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href="/dashboard/learner/mentoring"
                  className={buttonVariants({ variant: "purple", className: "w-full" })}
                >
                  Lihat Detail Sesi
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/dashboard/learner/mentoring"
                className={buttonVariants({ variant: "secondary", className: "mt-3 w-full" })}
              >
                Reschedule
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
