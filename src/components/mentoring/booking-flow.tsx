"use client";

import { useMachine } from "@xstate/react";
import { CalendarDays, CheckCircle2, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bookMentoringSession } from "@/lib/actions/mentoring.actions";
import type { MentorDto } from "@/types/dtos";
import { mentoringBookingMachine } from "@/lib/machines/mentoring-booking.machine";
import { cn } from "@/lib/utils";

const stateLabels: Record<string, string> = {
  viewingMentors: "Pilih Mentor",
  viewingProfile: "Melihat Profil",
  selectingSchedule: "Pilih Jadwal",
  fillingForm: "Isi Detail Sesi",
  submittingBooking: "Mengirim...",
  waitingConfirmation: "Menunggu Konfirmasi",
  scheduled: "Jadwal Dikonfirmasi",
  rejected: "Booking Ditolak",
  completed: "Sesi Selesai",
  reviewed: "Review Terkirim",
};

export function BookingFlow({ mentor }: { mentor: MentorDto }) {
  const [snapshot, send] = useMachine(mentoringBookingMachine);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selectedSlotId = snapshot.context.slotId;
  const selectedSlot = mentor.schedules.find((slot) => slot.id === selectedSlotId);

  function startBooking() {
    send({ type: "SELECT_MENTOR", mentorId: mentor.id });
    send({ type: "VIEW_SCHEDULE" });
  }

  async function submitBooking() {
    if (!selectedSlotId) {
      setError("Pilih jadwal terlebih dahulu.");
      return;
    }

    send({ type: "SUBMIT" });
    setError(null);

    try {
      await bookMentoringSession({
        tutorId: mentor.id,
        scheduleId: selectedSlotId,
        topic,
        goals: "Sesi mentoring dari form Pitutor.",
      });
      send({ type: "SUCCESS" });
      toast.success("Booking berhasil dikirim!");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Booking gagal dikirim.";
      setError(message);
      send({ type: "FAILED", error: message });
      toast.error(message);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Pilih Jadwal Sesi
          </h2>
          <p className="mt-2 text-slate-500">
            Status:{" "}
            <span className="font-black text-purple-700">
              {stateLabels[String(snapshot.value)] || String(snapshot.value)}
            </span>
          </p>
        </div>
        <Badge variant="purple">60 Menit</Badge>
      </div>

      {snapshot.matches("viewingMentors") || snapshot.matches("viewingProfile") ? (
        <Button variant="purple" className="mt-6 w-full" onClick={startBooking}>
          Mulai Booking
        </Button>
      ) : null}

      {snapshot.matches("selectingSchedule") ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {mentor.schedules.map((slot) => (
            <button
              key={slot.id}
              onClick={() => send({ type: "SELECT_SLOT", slotId: slot.id })}
              className={cn(
                "rounded-2xl border p-4 text-center transition",
                selectedSlotId === slot.id
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-slate-200 bg-white hover:border-purple-200",
              )}
            >
              <span className="block text-xs font-black uppercase text-slate-400">
                {slot.day}
              </span>
              <span className="mt-1 block text-lg font-black">{slot.date}</span>
              <span className="mt-2 block text-sm font-semibold text-slate-500">
                {slot.time}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {snapshot.matches("fillingForm") ? (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              Topik mentoring
            </span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-purple-500"
            />
          </label>
          <div className="rounded-2xl bg-purple-50 p-4 text-sm font-semibold text-purple-700">
            <CalendarDays className="mr-2 inline size-4" aria-hidden="true" />
            {selectedSlot?.date}, {selectedSlot?.time}
          </div>
          <Button
            variant="purple"
            className="w-full"
            disabled={!topic || !selectedSlotId}
            onClick={submitBooking}
          >
            Konfirmasi Booking
          </Button>
          {error ? (
            <div className="rounded-2xl bg-orange-50 p-4 font-bold text-orange-700">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}

      {snapshot.matches("submittingBooking") ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-600">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Mengirim booking...
        </div>
      ) : null}

      {snapshot.matches("waitingConfirmation") ? (
        <div className="mt-6 rounded-2xl bg-blue-50 p-5">
          <CheckCircle2 className="size-8 text-blue-600" aria-hidden="true" />
          <h3 className="mt-3 text-xl font-black text-slate-950">
            Booking terkirim
          </h3>
          <p className="mt-2 text-slate-600">
            Booking sudah tersimpan di database. Mentor akan menerima atau
            menolak sesi ini dari dashboard tutor.
          </p>
        </div>
      ) : null}

      {snapshot.matches("scheduled") ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
          <CheckCircle2 className="size-8 text-emerald-600" aria-hidden="true" />
          <h3 className="mt-3 text-xl font-black text-slate-950">
            Sesi terjadwal
          </h3>
          <p className="mt-2 text-slate-600">
            Link Google Meet akan muncul setelah mentor menambahkan detail sesi.
          </p>
          <Button
            className="mt-4"
            onClick={() => send({ type: "COMPLETE_SESSION" })}
          >
            Tandai Selesai
          </Button>
        </div>
      ) : null}

      {snapshot.matches("completed") || snapshot.matches("reviewed") ? (
        <div className="mt-6 rounded-2xl bg-orange-50 p-5">
          <div className="flex items-center gap-1 text-orange-500">
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} className="size-5 fill-current" />
            ))}
          </div>
          <h3 className="mt-3 text-xl font-black text-slate-950">
            Review mentoring
          </h3>
          <Button
            className="mt-4"
            variant="purple"
            onClick={() => send({ type: "GIVE_REVIEW" })}
            disabled={snapshot.matches("reviewed")}
          >
            {snapshot.matches("reviewed") ? "Review terkirim" : "Kirim Review"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

