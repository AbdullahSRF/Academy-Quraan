"use client";

import Link from "next/link";
import { UserAccountRow } from "@/features/admin/components/user-account-row";
import type { UserAccountRowSerialized } from "@/features/admin/user-accounts-data";

export function UserAccountsTable({ rows }: { rows: UserAccountRowSerialized[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-border bg-card shadow-sm">
      <table className="w-full min-w-[920px] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-border bg-muted-bg/80">
            <th className="px-3 py-3 font-bold">الاسم</th>
            <th className="px-3 py-3 font-bold">البريد</th>
            <th className="px-3 py-3 font-bold">نوع الحساب</th>
            <th className="px-3 py-3 font-bold">الحالة</th>
            <th className="px-3 py-3 font-bold">تاريخ الإنشاء</th>
            <th className="px-3 py-3 text-end font-bold">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center font-bold text-muted">
                لا توجد حسابات طلاب أو أولياء أمور. أنشئ حسابًا من «الطلاب» أو «الحسابات».
              </td>
            </tr>
          ) : (
            rows.map((r) => <UserAccountRow key={r.userId} row={r} />)
          )}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-3 border-t border-border p-4 text-sm font-bold">
        <Link href="/admin/students" className="text-primary underline-offset-2 hover:underline">
          إضافة طالب
        </Link>
        <span className="text-muted">·</span>
        <Link href="/admin/accounts" className="text-primary underline-offset-2 hover:underline">
          إضافة ولي أمر وربطه
        </Link>
      </div>
    </div>
  );
}
