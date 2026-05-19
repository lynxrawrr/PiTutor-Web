"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { approveCourse, rejectCourse } from "@/lib/actions/course.actions";

export function CourseReviewActions({
  courseId,
  disabled,
}: {
  courseId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(
    null,
  );

  async function runAction(action: "approve" | "reject") {
    setPendingAction(action);

    try {
      if (action === "approve") {
        await approveCourse(courseId, "Course sudah sesuai standar MVP.");
        toast.success("Course berhasil di-approve!");
      } else {
        await rejectCourse(courseId, "Tambahkan detail lesson dan modul pendukung.");
        toast.info("Course ditolak.");
      }

      router.refresh();
    } catch (error) {
      toast.error("Gagal melakukan aksi review.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        disabled={disabled || pendingAction !== null}
        onClick={() => runAction("reject")}
      >
        {pendingAction === "reject" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <XCircle className="size-4" />
        )}
        Reject
      </Button>
      <Button
        disabled={disabled || pendingAction !== null}
        onClick={() => runAction("approve")}
      >
        {pendingAction === "approve" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        Approve
      </Button>
    </>
  );
}
