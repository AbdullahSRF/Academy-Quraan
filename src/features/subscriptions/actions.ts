"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/infrastructure/db/prisma";
import { assignSubscriptionSchema, updateSubscriptionStatusSchema } from "@/features/subscriptions/schemas";
import { assertFixedPlanId } from "@/features/subscriptions/data";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("غير مصرّح.");
  }
}

export async function assignStudentSubscriptionFormAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false as const, error: "غير مصرّح." };
  }

  const parsed = assignSubscriptionSchema.safeParse({
    studentId: formData.get("studentId"),
    planId: formData.get("planId"),
    startedAt: formData.get("startedAt") || undefined,
    endsAt: formData.get("endsAt") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(" ") || "بيانات غير صالحة." };
  }

  const planOk = await assertFixedPlanId(parsed.data.planId);
  if (!planOk) {
    return { ok: false as const, error: "يجب اختيار إحدى الباقات المعتمدة فقط." };
  }

  const started = parsed.data.startedAt?.trim()
    ? new Date(`${parsed.data.startedAt.trim()}T12:00:00.000Z`)
    : new Date();
  const ends =
    parsed.data.endsAt && parsed.data.endsAt.trim().length > 0
      ? new Date(`${parsed.data.endsAt.trim()}T12:00:00.000Z`)
      : null;

  await prisma.studentSubscription.create({
    data: {
      studentId: parsed.data.studentId,
      planId: parsed.data.planId,
      status: "ACTIVE",
      startedAt: started,
      endsAt: ends,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/reports");
  return { ok: true as const, error: null as string | null };
}

export async function updateStudentSubscriptionStatusFormAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false as const, error: "غير مصرّح." };
  }

  const parsed = updateSubscriptionStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "بيانات غير صالحة." };
  }

  const extra =
    parsed.data.status === "CANCELLED" ? { cancelledAt: new Date() } : parsed.data.status === "ACTIVE" ? { cancelledAt: null } : {};

  await prisma.studentSubscription.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, ...extra },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/reports");
  return { ok: true as const, error: null as string | null };
}
