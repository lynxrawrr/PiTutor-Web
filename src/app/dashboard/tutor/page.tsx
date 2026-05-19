import { BookOpen, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import { AutoRefresh } from "@/components/common/auto-refresh";
import { StatCard } from "@/components/dashboard/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTutorCourses } from "@/lib/queries/course.queries";
import { getTutorBookings } from "@/lib/queries/mentoring.queries";

export default async function TutorDashboardPage() {
  await requireRole(["TUTOR", "ADMIN"]);
  const [courses, bookings] = await Promise.all([
    getTutorCourses(),
    getTutorBookings(),
  ]);

  return (
    <div className="space-y-8">
      <AutoRefresh />
      <section className="rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-10 text-white shadow-2xl shadow-purple-600/20">
        <h1 className="text-4xl font-black">Dashboard Tutor</h1>
        <p className="mt-3 max-w-5xl pl-1 text-lg text-purple-50">
          Kelola course, tambah lesson video embed, atur jadwal mentoring, dan
          respon booking learner.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard/tutor/courses/new"
            className={buttonVariants({ variant: "secondary" })}
          >
            Create Course
          </Link>
          <Link
            href="/dashboard/tutor/bookings"
            className={buttonVariants({
              className: "bg-white/10 text-white ring-1 ring-white/25",
            })}
          >
            Lihat Booking
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          value={String(courses.length)}
          label="Total Course"
          helper="Termasuk draft"
        />
        <StatCard
          icon={CheckCircle2}
          value={String(courses.filter((course) => course.status === "PUBLISHED").length)}
          label="Published"
          helper="Siap diakses learner"
          tone="green"
        />
        <StatCard
          icon={CalendarDays}
          value={String(courses.reduce((acc, curr) => acc + curr.totalEnrollments, 0))}
          label="Total Learner"
          helper="Terdaftar di course"
          tone="cyan"
        />
        <StatCard
          icon={Clock3}
          value={String(bookings.filter((booking) => booking.status === "PENDING").length)}
          label="Pending Booking"
          helper="Butuh respon"
          tone="orange"
        />
      </section>

      <Card className="p-6">
        <h2 className="text-2xl font-black text-slate-950">Aktivitas Terbaru</h2>
        <div className="mt-5 space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
            >
              <div>
                <p className="font-black text-slate-950">{booking.topic}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {booking.learnerName} - {booking.schedule}
                </p>
              </div>
              <span className="rounded-xl bg-white px-3 py-1 text-sm font-black text-slate-600">
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
