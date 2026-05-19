import { ArrowLeft, CalendarDays, ExternalLink, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingActions } from "@/components/tutor/booking-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await requireRole(["TUTOR", "ADMIN"]);
  const { bookingId } = await params;

  const booking = await prisma.mentoringBooking.findUnique({
    where: { id: bookingId },
    include: {
      learner: true,
      schedule: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const statusVariant: Record<string, "orange" | "purple" | "slate" | "green"> = {
    PENDING: "orange",
    ACCEPTED: "purple",
    REJECTED: "slate",
    COMPLETED: "green",
    CANCELLED: "slate",
  };

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/tutor/bookings"
        className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke Daftar Booking
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant[booking.status]}>
                {booking.status}
              </Badge>
              <span className="text-sm font-bold text-slate-400">#{booking.id}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-950">
              Detail Permintaan Mentoring
            </h1>
          </section>

          <Card className="p-8 space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <User className="size-4" /> Learner
                </p>
                <p className="text-xl font-black text-slate-950">{booking.learner.name}</p>
                <p className="text-slate-500 font-medium">{booking.learner.email}</p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <CalendarDays className="size-4" /> Jadwal Sesi
                </p>
                <p className="text-xl font-black text-slate-950">
                  {booking.schedule?.startsAt ? new Date(booking.schedule.startsAt).toLocaleDateString('id-ID', { dateStyle: 'full' }) : "N/A"}
                </p>
                <p className="text-slate-500 font-medium">
                  {booking.schedule?.startsAt ? new Date(booking.schedule.startsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "N/A"} WIB
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-100">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <MessageSquare className="size-4" /> Topik Pembahasan
              </p>
              <div className="rounded-2xl bg-slate-50 p-5 font-bold text-slate-700 leading-relaxed">
                {booking.topic}
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-100">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <ExternalLink className="size-4" /> Goals & Harapan
              </p>
              <p className="text-slate-600 font-medium leading-relaxed">
                {booking.goals}
              </p>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6 sticky top-28">
            <h2 className="text-xl font-black text-slate-950">Tindakan</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Pastikan Anda memasukkan link Google Meet jika menerima booking.
            </p>
            <div className="mt-6">
              <BookingActions
                bookingId={booking.id}
                status={booking.status}
                initialMeetingUrl={booking.meetingUrl}
              />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
