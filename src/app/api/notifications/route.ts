import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ data: [] }, { status: 401 });

  const notifications: { id: string; title: string; message: string; time: string }[] = [];

  // Logic based on role
  if (user.role === "ADMIN") {
    const waitingCourses = await prisma.course.findMany({
      where: { status: "WAITING_REVIEW" },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    waitingCourses.forEach((c) => {
      notifications.push({
        id: `course-review-${c.id}`,
        title: "Course Baru Menunggu Review",
        message: `${c.title} butuh persetujuan Anda.`,
        time: c.updatedAt.toISOString(),
      });
    });
  }

  if (user.role === "TUTOR") {
    const pendingBookings = await prisma.mentoringBooking.findMany({
      where: { tutor: { userId: user.id }, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    pendingBookings.forEach((b) => {
      notifications.push({
        id: `booking-pending-${b.id}`,
        title: "Permintaan Mentoring Baru",
        message: `Seseorang ingin melakukan mentoring topik: ${b.topic}`,
        time: b.createdAt.toISOString(),
      });
    });
  }

  if (user.role === "LEARNER") {
    const updatedBookings = await prisma.mentoringBooking.findMany({
      where: { learnerId: user.id, status: { not: "PENDING" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    updatedBookings.forEach((b) => {
      notifications.push({
        id: `booking-status-${b.id}`,
        title: `Status Booking: ${b.status}`,
        message: `Mentoring topik ${b.topic} telah di-${b.status.toLowerCase()}.`,
        time: b.updatedAt.toISOString(),
      });
    });
  }

  return NextResponse.json({ data: notifications });
}
