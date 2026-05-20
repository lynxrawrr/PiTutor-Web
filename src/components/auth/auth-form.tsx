"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  GraduationCap,
  Loader2,
  LogIn,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SelectableRoleInput } from "@/lib/validations/auth.validation";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const roleOptions: Array<{
  role: SelectableRoleInput;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    role: "LEARNER",
    label: "Learner",
    description: "Belajar course, mentoring, dan bank soal.",
    icon: GraduationCap,
  },
  {
    role: "TUTOR",
    label: "Tutor",
    description: "Membuat course dan membuka sesi mentoring.",
    icon: Users,
  },
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SelectableRoleInput>("LEARNER");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isSignUp = mode === "sign-up";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl?.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";

  async function signInWithCredentials(
    nextEmail = email,
    nextPassword = password,
  ) {
    setIsPending(true);
    setMessage(null);

    const response = await signIn("credentials", {
      email: nextEmail,
      password: nextPassword,
      redirect: false,
      callbackUrl,
    });

    setIsPending(false);

    if (response?.error) {
      setMessage("Email atau password tidak sesuai.");
      toast.error("Masuk gagal. Cek email dan password.");
      return;
    }

    toast.success("Berhasil masuk!");
    router.replace(callbackUrl);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      setMessage("Konfirmasi password tidak cocok.");
      toast.error("Password tidak sama.");
      return;
    }

    if (!isSignUp) {
      await signInWithCredentials();
      return;
    }

    setIsPending(true);
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        institution,
        major,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const msg = payload?.message ?? "Pendaftaran gagal.";
      setIsPending(false);
      setMessage(msg);
      toast.error(msg);
      return;
    }

    setIsPending(false);
    toast.success("Pendaftaran berhasil!");
    await signInWithCredentials(email, password);
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {isSignUp ? "Daftar Akun Baru." : "Selamat Datang Kembali."}
        </h1>
        <p className="mt-3 text-base font-medium text-slate-500">
          {isSignUp
            ? "Isi detail di bawah untuk memulai perjalananmu."
            : "Gunakan email terdaftar untuk masuk ke sistem."}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {isSignUp ? (
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Nama Lengkap
            </label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
              placeholder="Ahmad Kurniawan"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
            placeholder="nama@email.com"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {isSignUp ? (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Konfirmasi Password
              </label>
              <input
                required
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
                placeholder="••••••••"
              />
            </div>
          ) : null}
        </div>

        {isSignUp ? (
          <>
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Pilih Role Utama
              </label>
              <div className="grid gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.role === role;

                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => setRole(option.role)}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300",
                        isActive
                          ? "border-blue-600 bg-blue-50/50 shadow-inner"
                          : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-md",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-12 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600",
                        )}
                      >
                        <Icon className="size-6 shrink-0" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "block font-black text-sm transition-colors",
                            isActive ? "text-blue-900" : "text-slate-900",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 line-clamp-1 leading-tight mt-0.5">
                          {option.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Institusi
                </label>
                <input
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
                  placeholder="Nama Kampus"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Jurusan
                </label>
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 shadow-sm"
                  placeholder="Program Studi"
                />
              </div>
            </div>
          </>
        ) : null}

        {message ? (
          <div className="rounded-xl bg-orange-50 p-4 text-xs font-black text-orange-700 border border-orange-100 animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        ) : null}

        <Button
          className={cn(
            "w-full h-14 rounded-xl text-base font-black shadow-2xl transition-all active:scale-[0.98] mt-4 border-none text-white",
            isSignUp
              ? "bg-gradient-to-r from-emerald-600 to-blue-600 shadow-emerald-600/20"
              : "bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-600/20",
          )}
          size="lg"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : isSignUp ? (
            <UserPlus className="mr-2 size-5" />
          ) : (
            <LogIn className="mr-2 size-5" />
          )}
          {isSignUp ? "Buat Akun Sekarang" : "Masuk ke Dashboard"}
        </Button>
      </form>
    </div>
  );
}
