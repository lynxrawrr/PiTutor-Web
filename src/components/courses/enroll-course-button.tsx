"use client";

import { Loader2, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { enrollCourse } from "@/lib/actions/course.actions";

export function EnrollCourseButton({
  courseId,
  slug,
  enrolled,
}: {
  courseId: string;
  slug: string;
  enrolled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (enrolled) {
      router.push(`/dashboard/learner/courses/${slug}/learn`);
      return;
    }

    setPending(true);

    try {
      await enrollCourse({ courseId });
      toast.success("Berhasil mendaftar kursus!");
      router.push(`/dashboard/learner/courses/${slug}/learn`);
      router.refresh();
    } catch (error) {
      toast.error("Gagal mendaftar kursus.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button size="lg" onClick={handleClick} disabled={pending}>
      {pending ? (
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <PlayCircle className="size-5" aria-hidden="true" />
      )}
      {enrolled ? "Lanjutkan Belajar" : "Enroll Course"}
    </Button>
  );
}
