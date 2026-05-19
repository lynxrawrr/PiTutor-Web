"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type VideoEmbedPlayerProps = {
  title: string;
  embedUrl?: string | null;
  className?: string;
};

export function VideoEmbedPlayer({
  title,
  embedUrl,
  className,
}: VideoEmbedPlayerProps) {
  const [loaded, setLoaded] = useState(false);

  if (!embedUrl) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-slate-600",
          className,
        )}
      >
        <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
          <AlertCircle className="size-8 text-orange-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-900">Video belum tersedia</p>
            <p className="mt-1 text-sm">
              URL video tidak valid atau belum bisa diubah menjadi embed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm",
        className,
      )}
    >
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-slate-900" />
      ) : null}
      <iframe
        className="aspect-video w-full"
        title={title}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
