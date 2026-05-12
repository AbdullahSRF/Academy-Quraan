import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppleSplashLinks } from "@/components/pwa/apple-splash-links";
import { StripServiceWorkerScript } from "@/components/pwa/strip-service-worker-script";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { siteConfig } from "@/config/site";
import { getPublicSiteUrl } from "@/lib/app-url";

const appUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.nameShort}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.nameShort,
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.nameShort,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: appUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <StripServiceWorkerScript />
        <AppleSplashLinks />
      </head>
      <body className="min-h-dvh">
        <OrganizationJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
