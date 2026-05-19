"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createCourseSchema,
  createLessonSchema,
  enrollCourseSchema,
  type CreateCourseInput,
  type CreateLessonInput,
} from "@/lib/validations/course.validation";
import { getVideoEmbedUrl } from "@/lib/utils/video";

const updateCourseSchema = createCourseSchema.partial().extend({
  courseId: z.string().min(1),
});

const updateLessonSchema = createLessonSchema.partial().extend({
  lessonId: z.string().min(1),
});

export async function createCourse(input: CreateCourseInput) {
  const user = await requireRole(["TUTOR", "ADMIN"]);
  const data = createCourseSchema.parse(input);
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!tutor) {
    throw new Error("Profil tutor belum tersedia.");
  }

  const course = await prisma.course.create({
    data: {
      tutorId: tutor.id,
      title: data.title,
      slug: data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      description: data.description,
      category: data.category,
      level: data.level,
      thumbnailUrl: data.thumbnailUrl || null,
    },
  });

  revalidatePath("/dashboard/tutor/courses");
  return course;
}

export async function updateCourse(input: z.infer<typeof updateCourseSchema>) {
  await requireRole(["TUTOR", "ADMIN"]);
  const { courseId, ...data } = updateCourseSchema.parse(input);

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...data,
      thumbnailUrl: data.thumbnailUrl || undefined,
    },
  });

  revalidatePath(`/dashboard/tutor/courses/${courseId}`);
  return course;
}

export async function createLesson(courseId: string, input: CreateLessonInput) {
  await requireRole(["TUTOR", "ADMIN"]);
  const data = createLessonSchema.parse(input);
  const embedUrl = getVideoEmbedUrl(data.videoUrl);

  if (!embedUrl) {
    throw new Error("Video URL tidak valid.");
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      embedUrl,
      videoProvider: "YOUTUBE",
      moduleUrl: data.moduleUrl || null,
      order: data.order,
      duration: data.duration,
    },
  });

  revalidatePath(`/dashboard/tutor/courses/${courseId}`);
  return lesson;
}

export async function updateLesson(input: z.infer<typeof updateLessonSchema>) {
  await requireRole(["TUTOR", "ADMIN"]);
  const { lessonId, ...data } = updateLessonSchema.parse(input);

  const embedUrl = data.videoUrl ? getVideoEmbedUrl(data.videoUrl) : undefined;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...data,
      embedUrl,
      videoProvider: data.videoUrl ? "YOUTUBE" : undefined,
      moduleUrl: data.moduleUrl || undefined,
    },
  });

  revalidatePath(`/dashboard/tutor/courses/${lesson.courseId}`);
  return lesson;
}

export async function deleteLesson(lessonId: string) {
  await requireRole(["TUTOR", "ADMIN"]);

  const lesson = await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath(`/dashboard/tutor/courses/${lesson.courseId}`);
  return lesson;
}


export async function submitCourseForReview(courseId: string) {
  await requireRole(["TUTOR", "ADMIN"]);

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status: "WAITING_REVIEW", rejectionReason: null },
  });

  revalidatePath("/dashboard/tutor/courses");
  revalidatePath("/dashboard/admin/courses");
  return course;
}

export async function approveCourse(courseId: string, note?: string) {
  const admin = await requireRole(["ADMIN"]);

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "PUBLISHED",
      reviewLogs: {
        create: {
          adminId: admin.id,
          status: "PUBLISHED",
          note,
        },
      },
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/learner/courses");
  return course;
}

export async function rejectCourse(courseId: string, reason: string) {
  const admin = await requireRole(["ADMIN"]);

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      reviewLogs: {
        create: {
          adminId: admin.id,
          status: "REJECTED",
          note: reason,
        },
      },
    },
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/tutor/courses");
  return course;
}

export async function enrollCourse(input: { courseId: string }) {
  const user = await requireRole(["LEARNER"]);
  const data = enrollCourseSchema.parse(input);

  const enrollment = await prisma.enrollment.upsert({
    where: {
      learnerId_courseId: {
        learnerId: user.id,
        courseId: data.courseId,
      },
    },
    update: {},
    create: {
      learnerId: user.id,
      courseId: data.courseId,
    },
  });

  revalidatePath(`/dashboard/learner/courses/${data.courseId}`);
  return enrollment;
}

export async function markLessonComplete(input: {
  enrollmentId: string;
  lessonId: string;
}) {
  await requireRole(["LEARNER"]);

  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: input.enrollmentId,
        lessonId: input.lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  return calculateCourseProgress(input.enrollmentId);
}

export async function calculateCourseProgress(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { lessons: true } },
      progresses: true,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment tidak ditemukan.");
  }

  const totalLessons = enrollment.course.lessons.length;
  const completedLessonIds = new Set(
    enrollment.progresses
      .filter((progress) => progress.completed)
      .map((progress) => progress.lessonId),
  );
  const progress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessonIds.size / totalLessons) * 100);

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      status: progress === 100 ? "COMPLETED" : "ACTIVE",
      completedAt: progress === 100 ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/learner/courses/${enrollment.courseId}/learn`);
  return updatedEnrollment;
}

export async function submitCourseRating(input: {
  enrollmentId: string;
  rating: number;
  review?: string;
}) {
  await requireRole(["LEARNER"]);

  const enrollment = await prisma.enrollment.update({
    where: { id: input.enrollmentId },
    data: {
      rating: input.rating,
      review: input.review,
    },
  });

  revalidatePath(`/dashboard/learner/courses/${enrollment.courseId}/learn`);
  revalidatePath(`/dashboard/learner/courses/${enrollment.courseId}`);
  revalidatePath("/dashboard/learner/courses");
  
  return enrollment;
}
