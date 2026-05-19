import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  helper: string;
  tone?: "blue" | "green" | "orange" | "purple";
};

const toneClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

export function StatCard({
  icon: Icon,
  value,
  label,
  helper,
  tone = "blue",
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div
        className={cn(
          "mb-5 flex size-12 items-center justify-center rounded-2xl shadow-sm",
          toneClasses[tone],
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <p className="text-4xl font-black tracking-normal text-slate-950">
        {value}
      </p>
      <p className="mt-1 font-bold text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold", toneClasses[tone])}>
        {helper}
      </p>
    </Card>
  );
}
