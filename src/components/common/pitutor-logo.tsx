import Image from "next/image";
import { cn } from "@/lib/utils";

type PitutorLogoProps = {
  className?: string;
  compact?: boolean;
  white?: boolean;
};

export function PitutorLogo({ className, compact = false, white = false }: PitutorLogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className="relative size-10 flex-shrink-0">
        <Image
          src="/logo/pitutor.png"
          alt="Pitutor Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {!compact ? (
        <span className={cn(
          "text-2xl font-black tracking-tight",
          white ? "text-white" : "text-slate-900"
        )}>
          Pitutor
        </span>
      ) : null}
    </div>
  );
}
