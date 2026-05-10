import { siteConfig } from "@/config/site";

/** بيانات منظمة أساسية لصفحة الهبوط — آمنة للواجهة العامة */
export function OrganizationJsonLd() {
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!origin) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: origin,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
