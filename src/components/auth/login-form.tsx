"use client";

import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/auth.config";
import { normalizeLoginEmail, normalizeLoginPassword } from "@/lib/auth/login-normalize";

export type LoginVisualVariant = "default" | "admin" | "student" | "parent";

function dashboardForRole(role: AppRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "STUDENT") return "/student";
  return "/parent";
}

const variantBar: Record<LoginVisualVariant, string> = {
  default: "from-primary via-emerald-600 to-primary",
  admin: "from-primary via-teal-600 to-primary",
  student: "from-sky-600 via-blue-600 to-indigo-600",
  parent: "from-violet-600 via-purple-600 to-fuchsia-600",
};

const variantCard: Record<LoginVisualVariant, string> = {
  default: "border-border ring-border/80",
  admin: "border-primary/25 ring-primary/15",
  student: "border-sky-500/30 ring-sky-500/10",
  parent: "border-violet-500/30 ring-violet-500/10",
};

type LoginFormProps = {
  /** عند التسجيل من بوابة محددة: رفض الدخول إن لم يطابق دور المستخدم */
  enforceRole?: AppRole;
  /** مظهر البطاقة والشريط العلوي */
  visualVariant?: LoginVisualVariant;
  /** نص الزر */
  submitLabel?: string;
};

export function LoginForm({ enforceRole, visualVariant = "default", submitLabel }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackParam = searchParams.get("callbackUrl");
  const safeCallback =
    callbackParam && callbackParam.startsWith("/") && !callbackParam.startsWith("//") ? callbackParam : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fallbackUrl = enforceRole ? dashboardForRole(enforceRole) : "/";
    const callbackUrl = safeCallback ?? fallbackUrl;

    const res = await signIn("credentials", {
      email: normalizeLoginEmail(email),
      password: normalizeLoginPassword(password),
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setLoading(false);
      if (res.error === "Configuration") {
        setError("إعداد المصادقة غير مكتمل على الخادم (تحقق من AUTH_SECRET وNEXTAUTH_URL).");
        return;
      }
      if (res.error === "AccessDenied") {
        setError("تم رفض الدخول. جرّب بوابة تسجيل الدخول المناسبة (مشرف / طالب / ولي أمر).");
        return;
      }
      setError("البريد أو كلمة المرور غير صحيحة.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (!role) {
      setLoading(false);
      setError("تعذر إنشاء الجلسة. حاول مرة أخرى.");
      return;
    }

    if (enforceRole && role !== enforceRole) {
      await signOut({ redirect: false });
      setLoading(false);
      setError("هذا الحساب لا يملك صلاحية الدخول من هذه البوابة. اختر نوع الدخول الصحيح من صفحة تسجيل الدخول.");
      return;
    }

    const target = safeCallback && safeCallback.startsWith("/") ? safeCallback : dashboardForRole(role);
    window.location.href = res?.url ?? target;
  }

  const v = visualVariant;

  return (
    <Card
      className={cn(
        "w-full overflow-hidden rounded-2xl border-2 bg-card shadow-2xl shadow-black/10 ring-1",
        variantCard[v],
      )}
    >
      <div className={cn("h-1.5 w-full bg-gradient-to-l", variantBar[v])} aria-hidden />
      <form onSubmit={(e) => void onSubmit(e)} aria-labelledby="login-form-title">
        <h2 id="login-form-title" className="sr-only">
          بيانات تسجيل الدخول
        </h2>
        <CardContent className="space-y-6 p-6 sm:p-8">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm font-bold text-destructive"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-5 rounded-2xl border border-border bg-muted-bg/50 p-5 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="size-4 shrink-0 text-primary" aria-hidden />
                كلمة المرور
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col border-t border-border bg-muted-bg/30 px-6 py-5 sm:px-8">
          <Button type="submit" className="h-12 w-full text-base font-bold" disabled={loading}>
            {loading ? "جاري التحقق…" : submitLabel ?? "دخول إلى المنصة"}
          </Button>
          <p className="mt-4 text-center text-xs font-bold text-muted">في حالة نسيان كلمة المرور تواصل مع إدارة الأكاديمية.</p>
        </CardFooter>
      </form>
    </Card>
  );
}
