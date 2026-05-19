import { Skeleton } from "@/components/ui/skeleton";

export default function QuizSessionLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
      <Skeleton className="h-[560px] rounded-2xl" />
      <Skeleton className="h-[360px] rounded-2xl" />
    </div>
  );
}
