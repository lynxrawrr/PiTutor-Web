import { BookOpen, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PitutorLogo } from "@/components/common/pitutor-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCourseList } from "@/lib/queries/course.queries";

export default async function PublicCoursesPage() {
  const courses = await getCourseList();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/">
            <PitutorLogo />
          </Link>
          <Link href="/sign-in" className={buttonVariants()}>
            Masuk
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Badge>Public Preview</Badge>
        <h1 className="mt-4 text-4xl font-black text-slate-950">
          Katalog Course Pitutor
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-500">
          Lihat course yang sudah dipublish. Enroll, progress, dan lesson
          lengkap tersedia setelah masuk sebagai learner.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  className="object-cover"
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="p-6">
                <Badge variant="green">{course.category}</Badge>
                <h2 className="mt-4 text-xl font-black text-slate-950">
                  {course.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {course.description}
                </p>
                <div className="mt-5 flex gap-4 text-sm font-bold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="size-4 text-emerald-500" />
                    {course.lessons.length} lesson
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-orange-500" />
                    {course.duration} jam
                  </span>
                </div>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ className: "mt-6 w-full" })}
                >
                  Enroll Course
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
