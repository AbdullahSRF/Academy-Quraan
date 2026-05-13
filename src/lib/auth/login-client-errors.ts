/** استخراج رسالة خطأ واضحة من رد `signIn` عند `redirect: false` (يُرجع `error` و`code` من Auth.js). */
export function loginErrorMessageFromSignInResult(res: {
  error?: string | null;
  code?: string | null;
  url?: string | null;
}): string {
  if (res.error === "Configuration") {
    return "إعداد المصادقة غير مكتمل على الخادم (تحقق من AUTH_SECRET وNEXTAUTH_URL).";
  }
  if (res.error === "AccessDenied") {
    return "تم رفض الدخول. هذه المنصة للمشرفين فقط.";
  }

  const code =
    res.code ??
    (() => {
      if (!res.url) return null;
      try {
        const u = res.url.startsWith("http") ? new URL(res.url) : new URL(res.url, window.location.origin);
        return u.searchParams.get("code");
      } catch {
        return null;
      }
    })();

  switch (code) {
    case "invalid_form":
      return "أدخل بريدًا صالحًا وكلمة مرور غير فارغة.";
    case "account_disabled":
      return "تم تعطيل هذا الحساب. تواصل مع الإدارة.";
    case "not_admin":
      return "هذا الحساب ليس بحساب مشرف. المنصة للمشرفين فقط.";
    case "invalid_credentials":
      return "البريد أو كلمة المرور غير صحيحة.";
    default:
      if (res.error === "CredentialsSignin") {
        return "البريد أو كلمة المرور غير صحيحة.";
      }
      return "تعذر تسجيل الدخول. حاول مرة أخرى.";
  }
}
