"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MessageSquareText, Star } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitMentorReview } from "@/lib/actions/mentoring.actions";
import { useBookings } from "@/hooks/use-mentoring";

const statusVariant = {
  PENDING: "orange",
  ACCEPTED: "green",
  REJECTED: "slate",
  COMPLETED: "purple",
  CANCELLED: "slate",
} as const;

export function LearnerBookingsPanel() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useBookings();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [review, setReview] = useState("Sesi mentoringnya jelas dan membantu.");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function sendReview(bookingId: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        await submitMentorReview(bookingId, { rating, review });
        await queryClient.invalidateQueries({
          queryKey: ["mentoring", "bookings"],
        });
        setActiveBookingId(null);
        setMessage("Review berhasil dikirim.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Review gagal dikirim.",
        );
      }
    });
  }

  if (isLoading || bookings.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Status Booking
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Pantau konfirmasi mentor dan kirim review setelah sesi selesai.
          </p>
        </div>
        <Badge>{bookings.length} booking</Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <Badge variant={statusVariant[booking.status]}>
              {booking.status}
            </Badge>
            <h3 className="mt-3 font-black text-slate-950">{booking.topic}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {booking.mentorName} - {booking.schedule}
            </p>
            {booking.meetingUrl ? (
              <a
                href={booking.meetingUrl}
                className="mt-3 inline-flex text-sm font-black text-blue-600"
                target="_blank"
              >
                Buka meeting
              </a>
            ) : null}

            {booking.status === "COMPLETED" && !booking.reviewedAt ? (
              <div className="mt-4">
                {activeBookingId === booking.id ? (
                  <div className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/50">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500">
                        Beri Rating
                      </span>
                      <div className="mt-2 flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform active:scale-90"
                          >
                            <Star
                              className={cn(
                                "size-6",
                                star <= rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500">
                        Tulis Review
                      </span>
                      <textarea
                        value={review}
                        onChange={(event) => setReview(event.target.value)}
                        placeholder="Apa pendapatmu tentang mentor ini?"
                        className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-600/5"
                      />
                    </div>
                    <Button
                      className="w-full shadow-lg shadow-blue-600/10"
                      disabled={isPending}
                      onClick={() => sendReview(booking.id)}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Kirim Review
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setActiveBookingId(booking.id)}
                  >
                    <MessageSquareText className="size-4" />
                    Beri Review
                  </Button>
                )}
              </div>
            ) : null}

            {booking.reviewedAt ? (
              <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-600">
                Review terkirim: {booking.rating}/5
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">
          {message}
        </p>
      ) : null}
    </Card>
  );
}
