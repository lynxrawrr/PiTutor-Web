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
    <Card className="flex min-h-[400px] flex-col p-6 shadow-xl shadow-blue-600/5">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Pilih Jadwal Sesi
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-400">
              STATUS:{" "}
              <span className="font-black text-purple-700 uppercase tracking-wider">
                {stateLabels[String(snapshot.value)] || String(snapshot.value)}
              </span>
            </p>
          </div>
          <Badge variant="purple" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest">60 Menit</Badge>
        </div>

        {snapshot.matches("selectingSchedule") ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {mentor.schedules.map((slot) => (
              <button
                key={slot.id}
                onClick={() => send({ type: "SELECT_SLOT", slotId: slot.id })}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all",
                  selectedSlotId === slot.id
                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                    : "border-slate-100 bg-white hover:border-purple-100",
                )}
              >
                <span className="block text-[10px] font-black uppercase text-slate-400">
                  {slot.day}
                </span>
                <span className="mt-0.5 block text-base font-black">{slot.date}</span>
                <span className="mt-1 block text-[11px] font-bold text-slate-500">
                  {slot.time}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {snapshot.matches("fillingForm") ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Topik Mentoring
              </span>
              <input
                value={topic}
                placeholder="Contoh: Diskusi materi React"
                onChange={(event) => setTopic(event.target.value)}
                className="mt-1.5 h-12 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-medium outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-600/5"
              />
            </label>
            <div className="rounded-xl bg-purple-50 p-4 text-xs font-bold text-purple-700">
              <CalendarDays className="mr-2 inline size-4" aria-hidden="true" />
              {selectedSlot?.date}, {selectedSlot?.time}
            </div>
            {error ? (
              <div className="rounded-xl bg-orange-50 p-3 text-xs font-bold text-orange-700">
                {error}
              </div>
            ) : null}
          </div>
        ) : null}

        {snapshot.matches("submittingBooking") ? (
          <div className="mt-10 flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="size-10 animate-spin text-purple-600" aria-hidden="true" />
            <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Mengirim booking...</p>
          </div>
        ) : null}

        {snapshot.matches("waitingConfirmation") ? (
          <div className="mt-10 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">
              Booking Terkirim
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
              Mentor akan meninjau permintaan Anda. <br /> Cek status secara berkala di dashboard.
            </p>
          </div>
        ) : null}

        {snapshot.matches("scheduled") ? (
          <div className="mt-10 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">
              Sesi Terjadwal
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
              Link Google Meet akan segera tersedia. <br /> Bersiaplah untuk sesi belajar Anda!
            </p>
          </div>
        ) : null}

        {snapshot.matches("completed") || snapshot.matches("reviewed") ? (
          <div className="mt-10 text-center">
            <div className="flex justify-center gap-1 text-amber-400 mb-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className="size-6 fill-current" />
              ))}
            </div>
            <h3 className="text-xl font-black text-slate-950">
              Review Mentoring
            </h3>
          </div>
        ) : null}
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        {snapshot.matches("viewingMentors") || snapshot.matches("viewingProfile") ? (
          <Button variant="purple" className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-purple-600/20" onClick={startBooking}>
            Mulai Booking
          </Button>
        ) : null}

        {snapshot.matches("selectingSchedule") ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="h-12 rounded-xl font-bold" onClick={() => send({ type: "BACK" })}>
              Kembali
            </Button>
            <Button variant="purple" className="h-12 rounded-xl font-black" disabled={!selectedSlotId} onClick={() => send({ type: "PROCEED" })}>
              Lanjut
            </Button>
          </div>
        ) : null}

        {snapshot.matches("fillingForm") ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="h-12 rounded-xl font-bold" onClick={() => send({ type: "BACK" })}>
              Kembali
            </Button>
            <Button
              variant="purple"
              className="h-12 rounded-xl font-black shadow-lg shadow-purple-600/10"
              disabled={!topic || !selectedSlotId}
              onClick={submitBooking}
            >
              Konfirmasi
            </Button>
          </div>
        ) : null}

        {snapshot.matches("scheduled") ? (
          <Button
            variant="purple"
            className="w-full h-12 rounded-xl font-black"
            onClick={() => send({ type: "COMPLETE_SESSION" })}
          >
            Tandai Selesai
          </Button>
        ) : null}

        {(snapshot.matches("completed") || snapshot.matches("reviewed")) ? (
          <Button
            className="w-full h-12 rounded-xl font-black"
            variant="purple"
            onClick={() => send({ type: "GIVE_REVIEW" })}
            disabled={snapshot.matches("reviewed")}
          >
            {snapshot.matches("reviewed") ? "Review Terkirim" : "Kirim Review"}
          </Button>
        ) : null}
        
        {(snapshot.matches("waitingConfirmation")) ? (
          <Button
            className="w-full h-12 rounded-xl font-black"
            variant="secondary"
            asChild
          >
            <a href="/dashboard/learner/mentoring">Lihat Status Booking</a>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

