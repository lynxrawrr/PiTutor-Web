import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth";

export default async function LearnerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(["LEARNER"]);

  return children;
}
