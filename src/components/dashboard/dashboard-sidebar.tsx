"use client";

import {
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PitutorLogo } from "@/components/common/pitutor-logo";
import type { CurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItemsByRole = {
  LEARNER: [
    { label: "Dashboard", href: "/dashboard/learner", icon: LayoutDashboard },
    { label: "Courses", href: "/dashboard/learner/courses", icon: BookOpen },
    { label: "Mentoring", href: "/dashboard/learner/mentoring", icon: Users },
    { label: "Bank Soal", href: "/dashboard/learner/quizzes", icon: CircleHelp },
  ],
  TUTOR: [
    { label: "Dashboard", href: "/dashboard/tutor", icon: LayoutDashboard },
    { label: "My Courses", href: "/dashboard/tutor/courses", icon: BookOpen },
    { label: "Schedules", href: "/dashboard/tutor/schedules", icon: CircleHelp },
    { label: "Bookings", href: "/dashboard/tutor/bookings", icon: Users },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Course Review", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "Mentors", href: "/dashboard/admin/mentors", icon: Users },
    { label: "Quizzes", href: "/dashboard/admin/quizzes", icon: CircleHelp },
  ],
};

export function DashboardSidebar({
  user,
  mobile = false,
  onNavigate,
}: {
  user: CurrentUser;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isPendingTutor = user.role === "TUTOR" && pathname === "/dashboard/tutor/pending";
  const navItems = isPendingTutor ? [] : navItemsByRole[user.role];

  return (
    <aside
      className={cn(
        "w-72 shrink-0 border-r border-slate-100 bg-white",
        mobile ? "flex h-full flex-col" : "hidden lg:flex lg:flex-col",
      )}
    >
      <div className="flex h-24 items-center px-10">
        <PitutorLogo />
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-6 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.label === "Dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-14 items-center gap-4 rounded-2xl px-4 text-base font-bold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-600/25"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <Icon
                className={cn("size-5", isActive ? "text-white" : "text-slate-400")}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-14 items-center gap-4 rounded-2xl px-4 text-base font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-5" aria-hidden="true" />
          Keluar
        </Link>
      </div>
    </aside>
  );
}
