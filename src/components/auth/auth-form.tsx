"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/lib/auth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const roleOptions: Array<{
  role: AppRole;
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
  {
    role: "ADMIN",
    label: "Admin",
    description: "Mengelola review, user, mentor, dan quiz.",
    icon: ShieldCheck,
  },
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("LEARNER");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isSignUp = mode === "sign-up";
  const selectedRole = useMemo(
    () => roleOptions.find((option) => option.role === role),
    [role],
  );

  async function signInWithCredentials(nextEmail = email, nextPassword = password) {
    setIsPending(true);
    setMessage(null);

    const response = await signIn("credentials", {
      email: nextEmail,
      password: nextPassword,
      redirect: false,
    });

    setIsPending(false);

    if (response?.error) {
      setMessage("Email atau password tidak sesuai.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setIsPending(false);
      setMessage(payload?.message ?? "Pendaftaran gagal.");
      return;
    }

    setIsPending(false);
    await signInWithCredentials(email, password);
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          {isSignUp ? (
            <UserPlus className="size-6" aria-hidden="true" />
          ) : (
            <LogIn className="size-6" aria-hidden="true" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            {isSignUp ? "Daftar Pitutor" : "Masuk Pitutor"}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Auth.js Credentials + PostgreSQL
          </p>
        </div>
      </div>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        {isSignUp ? (
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Nama</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
              placeholder="Nama lengkap"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-bold text-slate-600">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
            placeholder="email@student.univ.edu"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-600">Password</span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
            placeholder="Minimal 6 karakter"
          />
        </label>

        {isSignUp ? (
          <>
            <div>
              <span className="text-sm font-bold text-slate-600">Role</span>
              <div className="mt-2 grid gap-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.role === role;

                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => setRole(option.role)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200",
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span>
                        <span className="block font-black">{option.label}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Institusi
                </span>
                <input
                  value={institution}
                  onChange={(event) => setInstitution(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
                  placeholder="Kampus"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">Jurusan</span>
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-blue-500"
                  placeholder="Prodi"
                />
              </label>
            </div>
          </>
        ) : null}

        {message ? (
          <div className="rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
            {message}
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-5 animate-spin" /> : null}
          {isSignUp
            ? `Daftar sebagai ${selectedRole?.label ?? "User"}`
            : "Masuk"}
        </Button>
      </form>
    </Card>
  );
}
