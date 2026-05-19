import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-5 font-semibold text-slate-500 shadow-sm">
      <Loader2 className="size-5 animate-spin text-blue-600" />
      {label}
    </div>
  );
}
