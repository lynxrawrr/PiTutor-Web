"use client";

import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createCourse,
  createLesson,
  updateCourse,
  updateLesson,
} from "@/lib/actions/course.actions";
import { COURSE_CATEGORIES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error";

type TutorCourseFormProps = {
  mode: "course" | "lesson";
  courseId?: string;
  initialData?: {
    id: string;
    title: string;
    description: string;
    category?: string;
    level?: string;
    thumbnailUrl?: string | null;
    videoUrl?: string;
    moduleUrl?: string | null;
    order?: number;
    duration?: number | null;
    courseId?: string;
  };
};

export function TutorCourseForm({
  mode,
  courseId,
  initialData,
}: TutorCourseFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    try {
      let uploadedThumbnailUrl = String(formData.get("thumbnailUrl") ?? "");
      const thumbnailFile = formData.get("thumbnailFile") as File;
      if (thumbnailFile && thumbnailFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", thumbnailFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (res.ok) {
          const { url } = await res.json();
          uploadedThumbnailUrl = url;
        } else {
          throw new Error("Gagal mengupload thumbnail.");
        }
      }

      let uploadedModuleUrl = String(formData.get("moduleUrl") ?? "");
      const moduleFile = formData.get("moduleFile") as File;
      if (moduleFile && moduleFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", moduleFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (res.ok) {
          const { url } = await res.json();
          uploadedModuleUrl = url;
        } else {
          throw new Error("Gagal mengupload file modul.");
        }
      }

      if (mode === "course") {
        const courseData = {
          ...data,
          category: String(formData.get("category") ?? ""),
          level:
            (formData.get("level") as
              | "BEGINNER"
              | "INTERMEDIATE"
              | "ADVANCED") ?? "BEGINNER",
          thumbnailUrl: uploadedThumbnailUrl,
        };

        if (initialData?.id) {
          await updateCourse({ ...courseData, courseId: initialData.id });
          toast.success("Course berhasil diperbarui!");
          router.push(`/dashboard/tutor/courses/${initialData.id}`);
        } else {
          const course = await createCourse(courseData);
          toast.success("Course berhasil dibuat!");
          router.push(`/dashboard/tutor/courses/${course.id}`);
        }
      } else {
        const lessonData = {
          ...data,
          videoUrl: String(formData.get("videoUrl") ?? ""),
          moduleUrl: uploadedModuleUrl,
          order: Number(formData.get("order") ?? 1),
          duration: Number(formData.get("duration") ?? 10),
        };

        if (initialData?.id) {
          await updateLesson({ ...lessonData, lessonId: initialData.id });
          toast.success("Materi berhasil diperbarui!");
          router.push(`/dashboard/tutor/courses/${initialData.courseId}`);
        } else {
          if (!courseId) throw new Error("Course tidak ditemukan.");
          await createLesson(courseId, lessonData);
          toast.success("Materi berhasil ditambahkan!");
          router.push(`/dashboard/tutor/courses/${courseId}`);
        }
      }

      router.refresh();
    } catch (caughtError) {
      setSaving(false);
      const msg = formatZodError(caughtError);
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <Card className="mx-auto max-w-3xl p-7 shadow-xl shadow-blue-600/5">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            {mode === "course" ? "Master Course" : "Lesson Module"}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {initialData ? "Edit" : mode === "course" ? "Rancang" : "Tambah"}{" "}
            {mode === "course" ? "Course" : "Materi"}
          </h1>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              {mode === "course" ? "Judul Course" : "Judul Materi"}
            </span>
            <input
              name="title"
              required
              defaultValue={initialData?.title}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              placeholder={
                mode === "course"
                  ? "Contoh: Struktur Data Dasar"
                  : "Contoh: Pengenalan Array"
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              Deskripsi Singkat
            </span>
            <textarea
              name="description"
              required
              defaultValue={initialData?.description}
              className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50/30 p-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              placeholder="Tuliskan ringkasan materi dan target pembelajaran."
            />
          </label>

          {mode === "course" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Kategori
                </span>
                <select
                  name="category"
                  required
                  defaultValue={initialData?.category}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                >
                  <option value="">Pilih Kategori</option>
                  {COURSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Tingkat Kesulitan
                </span>
                <select
                  name="level"
                  defaultValue={initialData?.level}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                >
                  <option value="BEGINNER">Pemula (Beginner)</option>
                  <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                  <option value="ADVANCED">Mahir (Advanced)</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-600">
                  Thumbnail Course (Upload Foto)
                </span>
                <input
                  name="thumbnailFile"
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <input
                  name="thumbnailUrl"
                  type="hidden"
                  defaultValue={initialData?.thumbnailUrl ?? ""}
                />
              </label>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  YouTube Video URL
                </span>
                <input
                  name="videoUrl"
                  required
                  type="url"
                  defaultValue={initialData?.videoUrl}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Urutan Tampil
                </span>
                <input
                  name="order"
                  required
                  type="number"
                  min={1}
                  defaultValue={initialData?.order ?? 1}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-600">
                  Module File (PDF/Docs)
                </span>
                <input
                  name="moduleFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <input
                  name="moduleUrl"
                  type="hidden"
                  defaultValue={initialData?.moduleUrl ?? ""}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Durasi (Menit)
                </span>
                <input
                  name="duration"
                  required
                  type="number"
                  min={1}
                  defaultValue={initialData?.duration ?? 15}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                />
              </label>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 ring-1 ring-red-100">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full shadow-xl shadow-blue-600/20"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Plus className="size-5" />
          )}
          {initialData
            ? "Simpan Perubahan"
            : mode === "course"
              ? "Publikasikan Course"
              : "Simpan Materi"}
        </Button>
      </form>
    </Card>
  );
}
