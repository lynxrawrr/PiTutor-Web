export const COURSE_CATEGORIES = [
  "Teknik",
  "Computer",
  "Ekonomi & Bisnis",
  "Kedokteran",
  "Hukum",
  "Desain",
  "Ilmu Komunikasi",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
