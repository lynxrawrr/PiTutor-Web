"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  acceptBooking,
  completeBooking,
  rejectBooking,
} from "@/lib/actions/mentoring.actions";

export function BookingActions({
  bookingId,
  status,
  initialMeetingUrl = "",
}: {
  bookingId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  initialMeetingUrl?: string | null;
}) {
  const router = useRouter();
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl ?? "");
  const [pendingAction, setPendingAction] = useState<
    "accept" | "reject" | "complete" | null
  >(null);

  async function runAction(action: "accept" | "reject" | "complete") {
    setPendingAction(action);

    try {
      if (action === "accept") {
        if (!meetingUrl.startsWith("https://")) {
          toast.error("Masukkan link meeting yang valid (https://...)");
          return;
        }
        await acceptBooking(bookingId, meetingUrl);
        toast.success("Booking diterima!");
      } else if (action === "reject") {
        await rejectBooking(bookingId, "Jadwal mentor sudah penuh.");
        toast.info("Booking ditolak.");
      } else {
        await completeBooking(bookingId);
        toast.success("Sesi selesai!");
      }

      router.refresh();
    } catch (error) {
      toast.error("Gagal melakukan aksi.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "PENDING" && (
        <input
          type="url"
          placeholder="Link Google Meet (https://...)"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />
      )}
      <div className="flex gap-3">
        {status === "PENDING" ? (
          <>
            <Button
              variant="secondary"
              disabled={pendingAction !== null}
              onClick={() => runAction("reject")}
              className="flex-1"
            >
              {pendingAction === "reject" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              Reject
            </Button>
            <Button
              variant="purple"
              disabled={pendingAction !== null}
              onClick={() => runAction("accept")}
              className="flex-1 shadow-lg shadow-purple-600/10"
            >
              {pendingAction === "accept" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Accept
            </Button>
          </>
        ) : null}

        {status === "ACCEPTED" ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10"
            disabled={pendingAction !== null}
            onClick={() => runAction("complete")}
          >
            {pendingAction === "complete" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Selesaikan Sesi
          </Button>
        ) : null}
      </div>
    </div>
  );
}
