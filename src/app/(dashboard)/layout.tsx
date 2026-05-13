import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { AppRole } from "@/auth.config";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const impersonation =
    session.user.impersonatorId != null
      ? { adminLabel: session.user.impersonatorName?.trim() || "المشرف" }
      : null;

  return (
    <DashboardShell
      role={session.user.role as AppRole}
      userName={session.user.name}
      userEmail={session.user.email}
      impersonation={impersonation}
    >
      {children}
    </DashboardShell>
  );
}
