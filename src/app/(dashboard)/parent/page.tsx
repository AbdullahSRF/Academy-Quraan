import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, Users } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { loadParentDashboardRows } from "@/features/parent/parent-dashboard-data";
import { AdminInboxSection } from "@/components/messaging/admin-inbox-section";
import { formatEgp } from "@/lib/format-egp";

const statusLabel: Record<string, string> = {
  REGULAR: "منتظم",
  PAUSED: "متوقف",
  FROZEN: "مجمد",
  WITHDRAWN: "منسحب",
};

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

const attLabel: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  EXCUSED: "معذور",
  LATE: "متأخر",
};

const invStatus: Record<string, string> = {
  DRAFT: "مسودة",
  ISSUED: "صادرة",
  PAID: "مدفوعة",
  OVERDUE: "متأخرة",
  CANCELLED: "ملغاة",
};

export default async function ParentDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "PARENT" || !session.user.id) {
    redirect("/login");
  }

  const enriched = await loadParentDashboardRows(session.user.id);

  return (
    <div className="space-y-10">
      <PageHeader
        title="لوحة ولي الأمر"
        description="حضور، واجبات، آخر التسميع، التقييمات، والفواتير المفتوحة — للاطلاع؛ تسجيل الحصة من حساب المشرف."
      />

      <AdminInboxSection userId={session.user.id} />

      {enriched.length === 0 ? (
        <Card className="border-dashed border-amber-500/40 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-amber-700 dark:text-amber-300" aria-hidden />
              لا يوجد أبناء مرتبطون بعد
            </CardTitle>
            <CardDescription>يتم الربط من إدارة الأكاديمية بين حسابك وسجلات الطلاب.</CardDescription>
          </CardHeader>
          <CardContent className="text-base font-bold leading-relaxed text-muted">
            عند اكتمال الربط ستظهر هنا بطاقة لكل ابن مع الحضور والواجب والمدفوعات.
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-6" aria-labelledby="children-heading">
          <h2 id="children-heading" className="text-xl font-bold text-foreground">
            أبنائي ({enriched.length})
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {enriched.map((c) => (
              <Card key={c.id} className="flex flex-col border-border shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-lg text-foreground">{c.fullName}</CardTitle>
                    <Badge variant="secondary">{statusLabel[c.status] ?? c.status}</Badge>
                  </div>
                  <CardDescription className="font-bold text-muted">{c.level ? `المستوى: ${c.level}` : "—"}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="space-y-1 border-b border-border pb-3 text-sm font-bold text-muted">
                    {c.subscriptionPlanName ? (
                      <>
                        <p className="text-foreground">الاشتراك: {c.subscriptionPlanName}</p>
                        {c.subscriptionSessionsPerMonth != null ? (
                          <p>الحصص الشهرية المستهدفة: {c.subscriptionSessionsPerMonth}</p>
                        ) : null}
                        {c.subscriptionPriceLabel ? <p>السعر المرجعي: {c.subscriptionPriceLabel}</p> : null}
                      </>
                    ) : (
                      <p>لا يوجد اشتراك نشط مسجل لهذا الطالب.</p>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted-bg/40 p-3">
                      <p className="text-xs font-bold uppercase text-muted">التغطية</p>
                      <p className="text-2xl font-bold tabular-nums text-primary">{c.livePercent}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted-bg/40 p-3">
                      <p className="text-xs font-bold uppercase text-muted">آخر تقييم</p>
                      <p className="text-lg font-bold text-foreground">{c.lastRating ? ratingAr[c.lastRating] ?? c.lastRating : "—"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-muted">آخر حضور (حد أقصى 21 يومًا)</p>
                    <div className="flex flex-wrap gap-1">
                      {c.attendanceStrip.length === 0 ? (
                        <span className="text-sm font-bold text-muted">لا سجلات.</span>
                      ) : (
                        c.attendanceStrip.map((a) => (
                          <span
                            key={a.date}
                            title={`${a.date} — ${attLabel[a.status] ?? a.status}`}
                            className="rounded-md border border-border bg-card px-1.5 py-1 text-[10px] font-bold leading-none text-foreground"
                            dir="ltr"
                          >
                            {a.date.slice(5)}
                            <span className="ms-0.5 text-primary">{attLabel[a.status]?.slice(0, 1) ?? "?"}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-accent/30 p-3">
                    <p className="text-xs font-bold uppercase text-muted">الواجب الحالي</p>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-foreground">{c.homework ?? "— لا يوجد واجب مسجّل —"}</p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-muted">آخر التسميعات</p>
                    <ul className="space-y-1 text-xs font-bold text-muted">
                      {c.recentSessions.length === 0 ? (
                        <li>—</li>
                      ) : (
                        c.recentSessions.map((s, i) => (
                          <li key={`${s.sessionDate}-${i}`} className="flex flex-wrap justify-between gap-2 border-b border-border/80 py-1 last:border-0">
                            <span dir="ltr">{s.sessionDate}</span>
                            <span>{s.rating ? ratingAr[s.rating] ?? s.rating : "—"}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-muted">المدفوعات (فواتير مفتوحة)</p>
                    {c.openInvoices.length === 0 ? (
                      <p className="text-sm font-bold text-muted">لا توجد فواتير صادرة أو متأخرة مسجّلة.</p>
                    ) : (
                      <ul className="space-y-2">
                        {c.openInvoices.map((inv) => (
                          <li
                            key={inv.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted-bg/30 px-3 py-2 text-xs font-bold"
                          >
                            <span className="text-foreground">{inv.title}</span>
                            <span className="tabular-nums text-primary" dir="ltr">
                              {formatEgp(inv.amount)}
                            </span>
                            <Badge variant={inv.status === "OVERDUE" ? "warning" : "outline"}>{invStatus[inv.status] ?? inv.status}</Badge>
                            {inv.dueDate ? (
                              <span className="w-full text-[10px] text-muted" dir="ltr">
                                استحقاق: {inv.dueDate}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button asChild className="flex-1 gap-2">
                      <Link href={`/parent/children/${c.id}/memorization`}>
                        <BookOpenCheck className="size-4" aria-hidden />
                        التفاصيل الكاملة
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="border-border bg-muted-bg/40">
        <CardHeader>
          <CardTitle className="text-base">استفسار مالي</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>لتفاصيل الدفع أو التسوية تواصل مع إدارة الأكاديمية.</span>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/">الصفحة العامة</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
