"use client";

import { useQuery } from "@tanstack/react-query";

import type { QuizDto } from "@/types/dtos";

type ApiResponse<T> = {
  data: T;
  totalPoints?: number;
};

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Data quiz gagal dimuat.");
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload;
}

export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: () => fetchJson<QuizDto[]>("/api/quizzes"),
    refetchInterval: 5000,
  });
}
