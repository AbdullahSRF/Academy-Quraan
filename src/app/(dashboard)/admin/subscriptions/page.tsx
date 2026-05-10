import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { listStudentSubscriptions, listSubscriptionPlans } from "@/features/subscriptions/data";
import {
  serializePlansForClient,
  serializeSubscriptionsForClient,
} from "@/features/subscriptions/serialize-for-client";
import { listStudentsForFinance } from "@/features/finance/data";
import { SubscriptionsAdminClient } from "@/features/subscriptions/components/subscriptions-admin-client";

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const [plansRaw, subscriptionsRaw, students] = await Promise.all([
    listSubscriptionPlans(),
    listStudentSubscriptions(100),
    listStudentsForFinance(),
  ]);

  const plans = serializePlansForClient(plansRaw);
  const subscriptions = serializeSubscriptionsForClient(subscriptionsRaw);

  return (
    <div className="space-y-8">
      <PageHeader
        title="الاشتراكات"
        description="باقات شهرية وربطها بالطلاب — تُستخدم في ملخص المالية (MRR تقريبي من أسعار الباقات)."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/finance">المالية</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/students">الطلاب</Link>
            </Button>
          </div>
        }
      />

      <SubscriptionsAdminClient plans={plans} subscriptions={subscriptions} students={students} />
    </div>
  );
}
