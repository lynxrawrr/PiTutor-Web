import { BookOpen, ShieldCheck, Users, WandSparkles } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries/admin.queries";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/20">
        <h1 className="text-4xl font-black">Dashboard Admin</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-300">
          Kelola user, review course tutor, verifikasi mentor, dan bank soal.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin/courses"
            className={buttonVariants({ variant: "secondary" })}
          >
            Review Course
          </Link>
          <Link
            href="/dashboard/admin/quizzes"
            className={buttonVariants({
              className: "bg-white/10 text-white ring-1 ring-white/25",
            })}
          >
            Kelola Quiz
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          value={String(overview.users.length)}
          label="Users"
          helper="Akun Aktif"
        />
        <StatCard
          icon={BookOpen}
          value={String(overview.courses.length)}
          label="Courses"
          helper="Semua Status"
          tone="green"
        />
        <StatCard
          icon={ShieldCheck}
          value={String(overview.mentors.length)}
          label="Mentors"
          helper="Perlu Verifikasi"
          tone="purple"
        />
        <StatCard
          icon={WandSparkles}
          value={String(overview.quizzes.length)}
          label="Quiz"
          helper="Kategori Aktif"
          tone="orange"
        />
      </section>

      <Card className="p-6">
        <h2 className="text-2xl font-black text-slate-950">Antrian Review</h2>
        <div className="mt-5 space-y-3">
          {overview.courses
            .filter((course) => course.status === "WAITING_REVIEW")
            .map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-black text-slate-950">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Oleh {course.tutorName}
                  </p>
                </div>
                <Link
                  href="/dashboard/admin/courses"
                  className="font-bold text-blue-600"
                >
                  Review
                </Link>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
