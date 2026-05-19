"use client";

import { useQuery } from "@tanstack/react-query";

import type { CourseDto } from "@/types/dtos";

type ApiResponse<T> = {
  data: T;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Data course gagal dimuat.");
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchJson<CourseDto[]>("/api/courses"),
    refetchInterval: 5000,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => fetchJson<CourseDto>(`/api/courses/${courseId}`),
    enabled: Boolean(courseId),
  });
}
