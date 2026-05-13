"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/infrastructure/db/prisma";
import { requireAdminSession } from "@/lib/auth-guard";
import { auth } from "@/auth";

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
  revalidatePath("/admin/user-accounts");
  revalidatePath("/student");
  revalidatePath("/parent");
  return { ok: true, error: null };
}

export async function markAdminInboxMessageReadAction(messageId: string): Promise<AdminMessageActionState> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: "غير مصرّح." };

  const msg = await prisma.adminInboxMessage.findUnique({
    where: { id: messageId },
    select: { id: true, recipientUserId: true, readAt: true },
  });
  if (!msg || msg.recipientUserId !== uid) return { ok: false, error: "الرسالة غير موجودة." };
  if (msg.readAt) return { ok: true, error: null };

  await prisma.adminInboxMessage.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  });
  revalidatePath("/student");
  revalidatePath("/parent");
  return { ok: true, error: null };
}

export async function markAdminInboxMessageReadFormAction(formData: FormData): Promise<void> {
  const messageId = String(formData.get("messageId") ?? "").trim();
  if (!messageId) return;
  await markAdminInboxMessageReadAction(messageId);
}
