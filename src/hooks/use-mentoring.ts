"use client";

import { useQuery } from "@tanstack/react-query";

import type { BookingDto, MentorDto } from "@/types/dtos";

type ApiResponse<T> = {
  data: T;
};

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export function useMentors() {
  return useQuery({
    queryKey: ["mentoring", "mentors"],
    queryFn: () =>
      fetchJson<MentorDto[]>(
        "/api/mentoring/mentors",
        "Data mentor gagal dimuat.",
      ),
    refetchInterval: 5000,
  });
}

export function useBookings() {
  return useQuery({
    queryKey: ["mentoring", "bookings"],
    queryFn: () =>
      fetchJson<BookingDto[]>(
        "/api/mentoring/bookings",
        "Data booking gagal dimuat.",
      ),
    refetchInterval: 5000,
  });
}
