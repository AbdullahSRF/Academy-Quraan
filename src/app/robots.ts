import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login"],
    },
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
