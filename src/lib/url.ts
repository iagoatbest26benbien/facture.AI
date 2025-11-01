export function getSiteUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // On Vercel, prefer the deployment URL when available (works server-side)
  const vercelUrl = (process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || "").trim();
  if (vercelUrl) {
    const cleaned = vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${cleaned}`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // As a final fallback: avoid localhost in production builds
  if (process.env.NODE_ENV === "production") {
    return "https://factureai.vercel.app";
  }
  return "http://localhost:3000";
}

export function withSiteUrl(path: string): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}


