"use client";

import { BookOpen, Clock3, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageToolbar } from "@/components/common/page-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/use-courses";
import { COURSE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const categories = ["Semua", ...COURSE_CATEGORIES];

export function CourseCatalogClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const { data: courses = [], isLoading, isError } = useCourses();

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return courses.filter((course) => {
      const matchesSearch = `${course.title} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "Semua" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, selectedCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal text-slate-950">
            Katalog Materi
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Temukan materi sesuai kurikulum kampusmu.
          </p>
        </div>
        <PageToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari materi..."
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "h-12 shrink-0 rounded-2xl px-6 font-bold transition",
              selectedCategory === category
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "border border-slate-200 bg-white text-slate-600 hover:text-slate-950",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {isError ? <ErrorState message="Katalog course gagal dimuat." /> : null}

      {isLoading ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-52 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-14 w-full" />
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      {!isLoading && filteredCourses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Course tidak ditemukan"
          description="Coba kata kunci atau kategori lain."
        />
      ) : null}

      {!isLoading && filteredCourses.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/learner/courses/${course.slug}`}
            >
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-52">
                  <Image
                    className="object-cover"
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <Badge variant="green" className="absolute left-4 top-4">
                    {course.category}
                  </Badge>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-sm">
                    <Star
                      className="size-5 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                    <span className="font-black text-slate-900">
                      {course.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400">
                      ({course.reviews} ulasan)
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    {course.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 min-h-14 text-slate-500">
                    {course.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="size-4 text-emerald-500" />
                      {course.lessons.length} Modul
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4 text-orange-500" />
                      {course.duration} Jam
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
}
