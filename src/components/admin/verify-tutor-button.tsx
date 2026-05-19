"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { verifyTutor } from "@/lib/actions/admin.actions";

export function VerifyTutorButton({
  tutorId,
  verified,
}: {
  tutorId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleVerify() {
    setPending(true);

    try {
      await verifyTutor(tutorId);
      toast.success("Tutor berhasil diverifikasi!");
      router.refresh();
    } catch (error) {
      toast.error("Gagal memverifikasi tutor.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button className="mt-5 w-full" disabled={verified || pending} onClick={handleVerify}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ShieldCheck className="size-4" />
      )}
      {verified ? "Verified" : "Verify Tutor"}
    </Button>
  );
}
