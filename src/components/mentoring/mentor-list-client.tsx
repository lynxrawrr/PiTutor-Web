"use client";

import { Clock3, Search, Star } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageToolbar } from "@/components/common/page-toolbar";
import { LearnerBookingsPanel } from "@/components/mentoring/learner-bookings-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentors } from "@/hooks/use-mentoring";

export function MentorListClient() {
  const [search, setSearch] = useState("");
  const { data: mentors = [], isLoading, isError } = useMentors();

  const filteredMentors = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return mentors.filter((mentor) =>
      `${mentor.name} ${mentor.headline} ${mentor.bio} ${mentor.expertise.join(" ")}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [mentors, search]);

  return (
    <div className="space-y-8">
      <LearnerBookingsPanel />

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal text-slate-950">
            Cari Mentor
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Pilih mentor terbaik untuk sesi konsultasi 1-on-1 mu.
          </p>
        </div>
        <PageToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Nama mentor, matkul..."
        />
      </div>

      {isError ? <ErrorState message="Data mentor gagal dimuat." /> : null}

      {isLoading ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="size-24" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
              <Skeleton className="mt-6 h-16 w-full" />
            </Card>
          ))}
        </section>
      ) : null}

      {!isLoading && filteredMentors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Mentor tidak ditemukan"
          description="Coba cari nama, skill, atau mata kuliah lain."
        />
      ) : null}

      {!isLoading && filteredMentors.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="p-6">
              <div className="flex gap-4">
                <Image
                  className="size-24 rounded-2xl object-cover ring-4 ring-slate-100 bg-slate-50"
                  src={mentor.avatarUrl}
                  alt={mentor.name}
                  width={96}
                  height={96}
                />
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {mentor.name}
                  </h2>
                  <Badge variant="purple" className="mt-2">
                    {mentor.headline}
                  </Badge>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star
                      className="size-5 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                    <span className="font-black text-slate-900">
                      {mentor.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400">
                      ({mentor.totalSessions} sesi)
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-6 line-clamp-3 min-h-16 text-slate-600 italic leading-7">
                &quot;{mentor.bio}&quot;
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {mentor.expertise.map((skill) => (
                  <Badge key={skill} variant="slate">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                <p className="text-2xl font-black text-slate-950">
                  Rp {Math.round(mentor.hourlyRate / 1000)}rb{" "}
                  <span className="text-sm font-semibold text-slate-500">
                    / jam
                  </span>
                </p>
                <a
                  href={`/dashboard/learner/mentoring/${mentor.id}`}
                  className={buttonVariants({ variant: "purple" })}
                >
                  <Clock3 className="size-4" aria-hidden="true" />
                  Booking Sesi
                </a>
              </div>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
