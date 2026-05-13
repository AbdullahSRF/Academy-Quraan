import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { AdminAccountsClient } from "@/features/parents/components/admin-accounts-page-client";
import { listParentsWithAccounts, listStudentsMinimalForLinking } from "@/features/parents/data";

export default async function AdminAccountsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const [parents, students] = await Promise.all([listParentsWithAccounts(), listStudentsMinimalForLinking()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="الحسابات وأولياء الأمور"
        description="إنشاء حسابات ولي الأمر، ربطهم بالطلاب، وإدارة كلمات المرور والتعطيل."
      />
      <AdminAccountsClient parents={parents} students={students} />
    </div>
  );
}
