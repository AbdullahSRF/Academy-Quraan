import { DashboardAppFrame } from "@/components/layout/dashboard-app-frame";
import type { AppRole } from "@/auth.config";

type Props = {
  role: AppRole;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  children: React.ReactNode;
};

export function DashboardShell({ role, userName, userEmail, children }: Props) {
  return (
    <DashboardAppFrame role={role} userName={userName} userEmail={userEmail}>
      {children}
    </DashboardAppFrame>
  );
}
