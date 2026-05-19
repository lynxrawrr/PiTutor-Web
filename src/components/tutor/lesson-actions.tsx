"use client";

import { Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteLesson } from "@/lib/actions/course.actions";

export function LessonActions({
  lessonId,
  courseSlug,
}: {
  lessonId: string;
  courseSlug: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus materi ini?")) return;
    setIsDeleting(true);
    try {
      await deleteLesson(lessonId);
      toast.success("Materi berhasil dihapus.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`/dashboard/tutor/courses/${courseSlug}/lessons/${lessonId}/edit`)}
        className="size-8 text-slate-400 hover:text-blue-600"
      >
        <Edit className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        onClick={handleDelete}
        className="size-8 text-slate-400 hover:text-red-600"
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    </div>
  );
}
