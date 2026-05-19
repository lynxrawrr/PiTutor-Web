import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
