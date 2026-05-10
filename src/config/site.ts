/** ثوابت العلامة والواجهة — تعديل من مكان واحد. */

export const siteConfig = {
  name: "أكاديمية التحفيظ",
  nameShort: "التحفيظ",
  description: "منصة إدارية للتحفيظ والحصص والحضور والمالية.",
  defaultLocale: "ar",
  /** مسار الصفحة الرئيسية للوحة بعد تسجيل الدخول حسب الدور يُحدد في middleware/الروابط */
  urls: {
    marketing: "/",
    login: "/login",
    adminHome: "/admin",
    parentHome: "/parent",
    studentHome: "/student",
  },
} as const;

export type SiteConfig = typeof siteConfig;
