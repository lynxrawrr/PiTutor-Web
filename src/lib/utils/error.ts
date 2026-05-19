import { z } from "zod";

export function formatZodError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message ?? "Input tidak valid.";
  }
  
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].message) {
        return parsed[0].message;
      }
    } catch {
      // Not JSON, return original message
    }
    return error.message;
  }
  
  return "Terjadi kesalahan yang tidak diketahui.";
}
