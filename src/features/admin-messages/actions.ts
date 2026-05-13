"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/infrastructure/db/prisma";
import { requireAdminSession } from "@/lib/auth-guard";

export type AdminMessageActionState = { ok: boolean; error: string | null };

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(8000),
});

export async function adminSendInboxMessageAction(_prev: AdminMessageActionState, formData: FormData): Promise<AdminMessageActionState> {
  const admin = await requireAdminSession();
  if (!admin) return { ok: false, error: "غير مصرّح." };
  const recipientUserId = String(formData.get("recipientUserId") ?? "").trim();
  const parsed = schema.safeParse({ title: formData.get("title"), body: formData.get("body") });
  if (!recipientUserId || !parsed.success) return { ok: false, error: "العنوان والنص والمستلم مطلوبة." };

  const recipient = await prisma.user.findUnique({
    where: { id: recipientUserId },
    select: { id: true, role: true },
  });
  if (!recipient || (recipient.role !== "STUDENT" && recipient.role !== "PARENT")) {
    return { ok: false, error: "المستلم غير صالح." };
  }

  await prisma.adminInboxMessage.create({
    data: {
      recipientUserId,
      senderUserId: admin.user.id,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });
  revalidatePath("/admin/students");
  return { ok: true, error: null };
}
