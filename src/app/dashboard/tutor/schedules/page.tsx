import { CalendarCheck2 } from "lucide-react";

import { ScheduleForm } from "@/components/mentoring/schedule-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTutorSchedules } from "@/lib/queries/mentoring.queries";

export default async function TutorSchedulesPage() {
  await requireRole(["TUTOR", "ADMIN"]);
  const schedules = await getTutorSchedules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">Jadwal Mentoring</h1>
        <p className="mt-2 text-slate-500">
          Atur slot ketersediaan yang dapat dipilih learner.
        </p>
      </div>

      <Card className="p-6">
        <ScheduleForm />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black uppercase text-purple-600">
                {schedule.day}
              </p>
              <Badge variant={schedule.isBooked ? "orange" : "green"}>
                {schedule.isBooked ? "Booked" : "Available"}
              </Badge>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {schedule.date}
            </h2>
            <p className="mt-2 font-semibold text-slate-500">{schedule.time}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-purple-600">
              Durasi {schedule.durationMinutes} menit
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-400">
              <CalendarCheck2 className="size-4" aria-hidden="true" />
              {schedule.mentorName}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
