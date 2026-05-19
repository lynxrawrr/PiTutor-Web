import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const user = await requireUser();

  if (!user.roleSelected) {
    redirect("/onboarding");
  }

  redirect(`/dashboard/${user.role.toLowerCase()}`);
}
