"use client";

import { Camera, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateAccountAction, updateAvatarUrl } from "@/lib/actions/user.actions";
import { formatZodError } from "@/lib/utils/error";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal mengupload foto.");
      
      const { url } = await res.json();
      await updateAvatarUrl(url);
      toast.success("Foto profil diperbarui!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal upload.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      try {
        await updateAccountAction({
          name,
          email,
          password: password || undefined,
        });
        toast.success("Profil berhasil diperbarui!");
        setPassword("");
        setConfirmPassword("");
        router.refresh();
      } catch (error) {
        toast.error(formatZodError(error));
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card className="p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative group">
            <div className="relative size-32 overflow-hidden rounded-3xl ring-4 ring-slate-100 shadow-inner">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-3xl font-black text-blue-600">
                  {user.name.charAt(0)}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 flex size-10 cursor-pointer items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl transition hover:bg-blue-700 active:scale-95">
              <Camera className="size-5" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-black text-slate-950">Foto Profil</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Gunakan foto yang jelas agar teman belajarmu mengenalimu.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-8 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">Nama Lengkap</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">Email Kampus</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">Password Baru</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                placeholder="Minimal 6 karakter"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">Konfirmasi Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-4 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                placeholder="Ulangi password baru"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl shadow-xl shadow-blue-600/20"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
