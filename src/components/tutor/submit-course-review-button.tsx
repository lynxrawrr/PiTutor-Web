"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitCourseForReview } from "@/lib/actions/course.actions";

type SubmitCourseReviewButtonProps = {
  courseId: string;
  disabled?: boolean;
};

export function SubmitCourseReviewButton({
  courseId,
  disabled,
}: SubmitCourseReviewButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <Button
        size="icon"
        aria-label="Submit review"
        disabled={disabled || isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            try {
              await submitCourseForReview(courseId);
              router.refresh();
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Course gagal disubmit.",
              );
            }
          });
        }}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
      </Button>
      {message ? (
        <span className="absolute right-0 top-12 z-10 w-52 rounded-xl bg-orange-50 p-3 text-xs font-bold text-orange-700 shadow-lg">
          {message}
        </span>
      ) : null}
    </div>
  );
}
