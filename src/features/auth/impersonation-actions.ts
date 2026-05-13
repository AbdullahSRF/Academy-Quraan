"use server";

import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/infrastructure/db/prisma";
import { createImpersonationToken } from "@/lib/auth/impersonation-token";

export type BeginImpersonationResult =
  | { ok: true; token: string; targetRole: "STUDENT" | "PARENT" }
  | { ok: false; error: string };

export async function beginImpersonationAction(targetUserId: string): Promise<BeginImpersonationResult> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "غير مصرّح." };
  const id = targetUserId.trim();
  if (!id) return { ok: false, error: "معرّف المستخدم مفقود." };

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, disabled: true },
  });
  if (!target || target.disabled) return { ok: false, error: "المستخدم غير موجود أو معطّل." };
  if (target.role !== "STUDENT" && target.role !== "PARENT") {
    return { ok: false, error: "يمكن الاستبدال فقط لحسابات الطلاب وأولياء الأمور." };
  }

  const token = createImpersonationToken(admin.user.id, target.id);
  return { ok: true, token, targetRole: target.role };
}
