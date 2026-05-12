import { logger } from "@/lib/logger";

function stripTrailingSlash(s: string): string {
  return s.replace(/\/$/, "");
}

/**
 * أصل الموقع للميتاداتا والروابط المطلقة.
 * الأسبقية: NEXT_PUBLIC_APP_URL → AUTH_URL / NEXTAUTH_URL → VERCEL_URL.
 * في التطوير فقط: http://localhost:3000 عند غياب القيم أعلاه.
 */
export function getPublicSiteUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromPublic) return stripTrailingSlash(fromPublic);

  const fromAuth = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL)?.trim();
  if (fromAuth) return stripTrailingSlash(fromAuth);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = stripTrailingSlash(vercel.replace(/^https?:\/\//i, ""));
    return `https://${host}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  logger.error(
    "getPublicSiteUrl: production build/runtime without NEXT_PUBLIC_APP_URL, NEXTAUTH_URL, or VERCEL_URL",
  );
  throw new Error(
    "Set NEXT_PUBLIC_APP_URL or NEXTAUTH_URL (or deploy on Vercel) for canonical URLs in production.",
  );
}
