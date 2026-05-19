import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("Cleaning database...");
  
  // Ordered delete to respect foreign keys if any cascades are missing
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.quizCategory.deleteMany();
  await prisma.mentoringBooking.deleteMany();
  await prisma.mentorSchedule.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.adminReviewLog.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.learnerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding admin account...");
  const passwordHash = await hash("password123", 12);

  await prisma.user.create({
    data: {
      id: "admin-pitutor",
      email: "admin@pitutor.edu",
      passwordHash,
      name: "Admin Pitutor",
      role: "ADMIN",
      roleSelected: true,
      institution: "Admin Platform",
      major: "Operations",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
    },
  });

  console.log("Database cleaned and admin seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
