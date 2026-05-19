import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PitutorLogo } from "@/components/common/pitutor-logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMentorList } from "@/lib/queries/mentoring.queries";

export default async function PublicMentorsPage() {
  const mentors = await getMentorList();

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
          Mentor Mahasiswa
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-500">
          Temukan mentor sesuai expertise. Booking jadwal tersedia setelah masuk
          sebagai learner.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="p-6">
              <div className="flex gap-4">
                <Image
                  className="size-20 rounded-2xl object-cover ring-4 ring-slate-100"
                  src={mentor.avatarUrl}
                  alt={mentor.name}
                  width={80}
                  height={80}
                />
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {mentor.name}
                  </h2>
                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {mentor.headline}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-black">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {mentor.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-500">
                {mentor.bio}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {mentor.expertise.map((skill) => (
                  <Badge key={skill} variant="slate">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "purple",
                  className: "mt-6 w-full",
                })}
              >
                Booking Sesi
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
