import { Skeleton } from "@/components/ui/skeleton";

export default function MentorProfileLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Skeleton className="h-[520px] rounded-2xl" />
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}
