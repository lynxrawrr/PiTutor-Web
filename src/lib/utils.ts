import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "WAITING_REVIEW":
      return "Waiting Review";
    case "PUBLISHED":
      return "Published";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}
