"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Search, Settings, X, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  user: CurrentUser;
  onMenuClick?: () => void;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export function DashboardTopbar({ user, onMenuClick }: DashboardTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      const payload = await res.json();
      return payload.data as Notification[];
    },
    refetchInterval: 10000,
  });

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-24 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md md:px-10">
      <div className="flex flex-1 items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Buka navigasi"
          onClick={onMenuClick}
        >
          <Menu className="size-6 text-slate-600" aria-hidden="true" />
        </Button>

        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              aria-hidden="true"
            />
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none ring-offset-white transition-all placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              placeholder="Cari materi, mentor, atau soal..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-blue-600"
            aria-label="Notifikasi"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="size-6" aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-blue-950/10 ring-1 ring-slate-950/5">
              <div className="flex items-center justify-between">
                <p className="font-black text-slate-950">Notifikasi</p>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="rounded-2xl bg-blue-50/50 p-3 ring-1 ring-blue-100">
                      <p className="text-xs font-black text-blue-700">{n.title}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-600 leading-tight">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-3 text-center text-xs font-bold text-slate-500">
                    Belum ada notifikasi baru lainnya.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-100" />

        {/* User Floating Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="group flex items-center gap-4 pl-2 outline-none"
          >
            <div className="hidden flex-col items-end text-right md:flex">
              <p className="text-sm font-bold leading-none text-slate-950 group-hover:text-blue-600 transition-colors">
                {user.name}
              </p>
              <p className="mt-1.5 inline-flex items-center rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-700">
                {user.institution ?? user.role}
              </p>
            </div>
            <div className="relative size-12 overflow-hidden rounded-2xl ring-4 ring-slate-50 transition-all group-hover:ring-blue-100 group-active:scale-95 shadow-sm">
              {user.avatarUrl ? (
                <Image
                  className="object-cover"
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-64 rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl shadow-blue-950/10 ring-1 ring-slate-950/5 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-50">
                <p className="font-black text-slate-950 truncate">{user.name}</p>
                <p className="text-xs font-bold text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="size-5" />
                  Pengaturan Profil
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="size-5" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
