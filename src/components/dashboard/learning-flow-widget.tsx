"use client";

import { useMachine } from "@xstate/react";
import { CheckCircle2, Loader2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { courseLearningMachine } from "@/lib/machines/course-learning.machine";

export function LearningFlowWidget() {
  const [snapshot, send] = useMachine(courseLearningMachine);
  const stateLabel = String(snapshot.value);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-slate-400">
            Course Statechart
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">
            Flow belajar aktif
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            State saat ini:{" "}
            <span className="font-bold text-blue-700">{stateLabel}</span>
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {snapshot.matches("savingProgress") ? (
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          ) : snapshot.matches("courseCompleted") ? (
            <CheckCircle2 className="size-6" aria-hidden="true" />
          ) : (
            <PlayCircle className="size-6" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => send({ type: "CONTINUE_LEARNING" })}
          disabled={!snapshot.can({ type: "CONTINUE_LEARNING" })}
        >
          Lanjut
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => send({ type: "SELECT_LESSON", lessonId: "lesson-1" })}
          disabled={!snapshot.can({ type: "SELECT_LESSON", lessonId: "lesson-1" })}
        >
          Pilih Lesson
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => send({ type: "VIDEO_READY" })}
          disabled={!snapshot.can({ type: "VIDEO_READY" })}
        >
          Video Ready
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => send({ type: "MARK_COMPLETE" })}
          disabled={!snapshot.can({ type: "MARK_COMPLETE" })}
        >
          Complete
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => send({ type: "SAVE_SUCCESS" })}
          disabled={!snapshot.can({ type: "SAVE_SUCCESS" })}
        >
          Saved
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => send({ type: "COURSE_COMPLETED" })}
          disabled={!snapshot.can({ type: "COURSE_COMPLETED" })}
        >
          Finish
        </Button>
      </div>
    </Card>
  );
}
