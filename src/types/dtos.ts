export type AppRole = "LEARNER" | "TUTOR" | "ADMIN";

export type CourseDto = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "WAITING_REVIEW" | "PUBLISHED" | "REJECTED";
  thumbnailUrl: string;
  rating: number;
  reviews: number;
  duration: number;
  tutorId: string;
  tutorName: string;
  progress: number;
  enrolled: boolean;
  enrollmentId?: string;
  totalEnrollments: number;
  lessons: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    embedUrl: string | null;
    moduleUrl: string;
    duration: number;
    order: number;
    completed?: boolean;
  }[];
};

export type MentorDto = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  verified: boolean;
  availableTomorrow: boolean;
  schedules: {
    id: string;
    date: string;
    day: string;
    time: string;
  }[];
};

export type BookingDto = {
  id: string;
  learnerName: string;
  mentorName: string;
  topic: string;
  schedule: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  meetingUrl?: string | null;
  rating?: number | null;
  review?: string | null;
  reviewedAt?: string | null;
};

export type QuizQuestionDto = {
  id: string;
  prompt: string;
  explanation: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

export type QuizDto = {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "Mudah" | "Menengah" | "Sulit";
  totalQuestions: number;
  participants: number;
  timeLimit: number;
  questions: QuizQuestionDto[];
};
