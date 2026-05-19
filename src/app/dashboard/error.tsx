"use client";

import { RotateCcw } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-5">
      <ErrorState message={error.message || "Halaman dashboard gagal dimuat."} />
      <Button onClick={reset}>
        <RotateCcw className="size-4" />
        Coba Lagi
      </Button>
    </div>
  );
}
