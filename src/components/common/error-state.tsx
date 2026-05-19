import { AlertCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="flex items-center gap-3 border-orange-200 bg-orange-50 p-5 font-semibold text-orange-700">
      <AlertCircle className="size-5" />
      {message}
    </Card>
  );
}
