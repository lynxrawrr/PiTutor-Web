import { ArrowLeft, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BookingFlow } from "@/components/mentoring/booking-flow";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMentorProfile } from "@/lib/queries/mentoring.queries";

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const { mentorId } = await params;
  const mentor = await getMentorProfile(mentorId);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/learner/mentoring"
        className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali
      </Link>

      <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Card className="p-7 text-center">
          <Image
            className="mx-auto size-32 rounded-full object-cover ring-8 ring-purple-50"
            src={mentor.avatarUrl}
            alt={mentor.name}
            width={128}
            height={128}
          />
          <h1 className="mt-5 text-2xl font-black text-slate-950">
            {mentor.name}
          </h1>
          <p className="mt-2 font-bold text-purple-700">{mentor.headline}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 font-black text-slate-800">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            {mentor.rating} Rating
          </div>
          <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-600">
            &quot;{mentor.bio}&quot;
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {mentor.expertise.map((skill) => (
              <Badge key={skill} variant="slate">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        <BookingFlow mentor={mentor} />
      </section>
    </div>
  );
}
