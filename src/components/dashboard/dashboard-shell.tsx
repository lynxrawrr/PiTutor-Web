"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/auth";

type DashboardShellProps = {
  user: CurrentUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLearningPage = pathname.split("/").some((segment) => segment === "learn");

  if (isLearningPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} />
        <div className="min-w-0 flex-1">
          <DashboardTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
          <main className="w-full px-6 py-8 md:px-12">
            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Tutup navigasi"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 bg-white shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-6 z-10"
              aria-label="Tutup navigasi"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
            <DashboardSidebar
              user={user}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
