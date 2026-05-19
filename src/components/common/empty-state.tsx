import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-8 text-center">
      <Icon className="mx-auto size-10 text-slate-300" />
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-slate-500">{description}</p>
    </Card>
  );
}
