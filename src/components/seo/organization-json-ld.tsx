import { siteConfig } from "@/config/site";
import { getPublicSiteUrl } from "@/lib/app-url";

/** بيانات منظمة أساسية لصفحة الهبوط — آمنة للواجهة العامة */
export function OrganizationJsonLd() {
  const origin = getPublicSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: origin,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
