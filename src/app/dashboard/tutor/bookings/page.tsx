import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTutorBookings } from "@/lib/queries/mentoring.queries";

export default async function TutorBookingsPage() {
  await requireRole(["TUTOR", "ADMIN"]);
  const bookings = await getTutorBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">Incoming Booking</h1>
        <p className="mt-2 text-slate-500">
          Kelola permintaan mentoring dari learner di halaman detail.
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge
                  variant={
                    booking.status === "ACCEPTED"
                      ? "purple"
                      : booking.status === "PENDING"
                        ? "orange"
                        : booking.status === "COMPLETED"
                          ? "green"
                          : "slate"
                  }
                >
                  {booking.status}
                </Badge>
                <h2 className="mt-3 text-xl font-black text-slate-950">
                  {booking.topic}
                </h2>
                <p className="mt-1 text-slate-500 font-medium">
                  {booking.learnerName} • {booking.schedule}
                </p>
              </div>
              <Link
                href={`/dashboard/tutor/bookings/${booking.id}`}
                className={buttonVariants({ variant: "secondary", className: "rounded-xl" })}
              >
                Lihat Detail & Tindakan
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
