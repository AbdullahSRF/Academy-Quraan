import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { UserAccountsTable } from "@/features/admin/components/user-accounts-table";
import { listSchoolUserAccounts } from "@/features/admin/user-accounts-data";

export default async function AdminUserAccountsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const raw = await listSchoolUserAccounts();
  const rows = raw.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="دليل حسابات الدخول"
        description="جدول موحّد لطلاب وأولياء الأمور: البريد، الحالة، تغيير المرور، التعطيل، الحذف، وإرسال ملاحظات إدارية."
      />
      <p className="text-sm font-bold text-muted">
        كلمات المرور تُخزَّن مشفّرة بـ bcrypt فقط. عند التوليد التلقائي تُعرض مرة واحدة في نافذة الحفظ — انسخها لولي الأمر أو الطالب عبر قناة آمنة.
      </p>
      <UserAccountsTable rows={rows} />
    </div>
  );
}
