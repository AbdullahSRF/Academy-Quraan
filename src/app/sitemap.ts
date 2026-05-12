import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublicSiteUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const now = new Date();
  return [
    { url: `${base}${siteConfig.urls.marketing}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}${siteConfig.urls.login}`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
