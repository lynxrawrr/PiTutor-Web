import type { CourseDto } from "@/types/dtos";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CourseWithRelations = Awaited<ReturnType<typeof fetchCourses>>[number];

async function fetchCourses() {
  return prisma.course.findMany({
    include: {
      tutor: {
        include: {
          user: true,
        },
      },
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
      enrollments: {
        include: {
          progresses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function mapCourse(course: CourseWithRelations, learnerId?: string): CourseDto {
  const lessonDuration = course.lessons.reduce(
    (total, lesson) => total + (lesson.duration ?? 0),
    0,
  );
  const enrollment = learnerId
    ? course.enrollments.find((item) => item.learnerId === learnerId)
    : undefined;
  const completedLessonIds = new Set(
    enrollment?.progresses
      .filter((progress) => progress.completed)
      .map((progress) => progress.lessonId) ?? [],
  );

  const ratedEnrollments = course.enrollments.filter((e) => e.rating !== null);
  const totalRating = ratedEnrollments.reduce((acc, curr) => acc + (curr.rating ?? 0), 0);
  const avgRating = ratedEnrollments.length > 0 ? Number((totalRating / ratedEnrollments.length).toFixed(1)) : 0;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    level: course.level,
    status: course.status,
    thumbnailUrl:
      course.thumbnailUrl ??
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    rating: avgRating,
    reviews: ratedEnrollments.length || 0,
    duration: Math.max(1, Math.ceil(lessonDuration / 60)),
    tutorId: course.tutorId,
    tutorName: course.tutor.user.name,
    progress: enrollment?.progress ?? 0,
    enrolled: Boolean(enrollment),
    enrollmentId: enrollment?.id,
    totalEnrollments: course.enrollments.length,
    lessons: course.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? "",
      videoUrl: lesson.videoUrl,
      embedUrl: lesson.embedUrl,
      moduleUrl: lesson.moduleUrl ?? "#",
      duration: lesson.duration ?? 0,
      order: lesson.order,
      completed: completedLessonIds.has(lesson.id),
    })),
  };
}

export async function getCourseList() {
  const user = await getCurrentUser();
  const courses = await fetchCourses();

  return courses
    .filter((course) => course.status === "PUBLISHED")
    .map((course) => mapCourse(course, user?.id));
}

export async function getTutorCourses() {
  const user = await getCurrentUser();
  const courses = await fetchCourses();
  const scopedCourses =
    user?.role === "TUTOR"
      ? courses.filter((course) => course.tutor.userId === user.id)
      : courses;

  return scopedCourses.map((course) => mapCourse(course, user?.id));
}

export async function getCourseDetail(slug: string) {
  const user = await getCurrentUser();
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      tutor: {
        include: {
          user: true,
        },
      },
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
      enrollments: {
        include: {
          progresses: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course tidak ditemukan.");
  }

  return mapCourse(course, user?.id);
}

export async function getCoursesWaitingReview() {
  const courses = await fetchCourses();

  return courses
    .filter((course) => course.status === "WAITING_REVIEW")
    .map((course) => mapCourse(course));
}
