"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createMentorSchedule } from "@/lib/actions/mentoring.actions";

export function ScheduleForm() {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await createMentorSchedule({
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
        });
        setStartsAt("");
        setEndsAt("");
        setMessage("Jadwal berhasil ditambahkan.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Jadwal gagal ditambahkan.",
        );
      }
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
      <label className="block">
        <span className="sr-only">Waktu mulai</span>
        <input
          required
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-purple-500"
        />
      </label>
      <label className="block">
        <span className="sr-only">Waktu selesai</span>
        <input
          required
          type="datetime-local"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-purple-500"
        />
      </label>
      <Button variant="purple" type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CalendarPlus className="size-4" />
        )}
        Tambah Jadwal
      </Button>
      {message ? (
        <p className="md:col-span-3 rounded-2xl bg-purple-50 p-3 text-sm font-bold text-purple-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
