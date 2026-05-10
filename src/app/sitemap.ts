import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}${siteConfig.urls.marketing}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}${siteConfig.urls.login}`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
