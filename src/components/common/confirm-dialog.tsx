"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  label,
  confirmLabel = "Konfirmasi",
  onConfirm,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="font-bold text-slate-700">Lanjutkan aksi ini?</p>
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => {
            onConfirm?.();
            setOpen(false);
          }}
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
