import { DashboardAppFrame } from "@/components/layout/dashboard-app-frame";
import type { AppRole } from "@/auth.config";

type Props = {
  role: AppRole;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  impersonation?: { adminLabel: string } | null;
  children: React.ReactNode;
};

export function DashboardShell({ role, userName, userEmail, impersonation, children }: Props) {
  return (
    <DashboardAppFrame role={role} userName={userName} userEmail={userEmail} impersonation={impersonation}>
      {children}
    </DashboardAppFrame>
  );
}
