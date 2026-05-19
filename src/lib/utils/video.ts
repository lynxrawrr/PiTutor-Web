export type SupportedVideoProvider =
  | "YOUTUBE"
  | "VIMEO"
  | "GOOGLE_DRIVE"
  | "CUSTOM_EMBED";

export function detectVideoProvider(url: string): SupportedVideoProvider | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtube.com" || hostname === "youtu.be") {
      return "YOUTUBE";
    }

    if (hostname === "vimeo.com") {
      return "VIMEO";
    }

    if (hostname === "drive.google.com") {
      return "GOOGLE_DRIVE";
    }

    return null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? null;
      }
    }

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export function getVideoEmbedUrl(url: string): string | null {
  const provider = detectVideoProvider(url);

  if (provider === "YOUTUBE") {
    return getYoutubeEmbedUrl(url);
  }

  return null;
}
