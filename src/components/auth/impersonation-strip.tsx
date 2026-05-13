import { EndImpersonationButton } from "@/components/auth/end-impersonation-button";

export function ImpersonationStrip({ adminLabel }: { adminLabel: string }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-500/50 bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-950 dark:text-amber-100 md:px-6"
      role="status"
    >
      <p>
        وضع المشرف: أنت تتصفح المنصة كما يراها المستخدم الحالي. المشرف الأصلي: <span className="font-extrabold">{adminLabel}</span>
      </p>
      <EndImpersonationButton />
    </div>
  );
}
