"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/infrastructure/db/prisma";
import { assignSubscriptionSchema, createPlanSchema, updateSubscriptionStatusSchema } from "@/features/subscriptions/schemas";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("غير مصرّح.");
  }
}

export async function createSubscriptionPlanFormAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false as const, error: "غير مصرّح." };
  }

  const parsed = createPlanSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || "",
    description: formData.get("description") || "",
    priceMonthly: formData.get("priceMonthly"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(" ") || "بيانات غير صالحة." };
  }

  const code = parsed.data.code?.trim() || null;
  try {
    await prisma.subscriptionPlan.create({
      data: {
        name: parsed.data.name.trim(),
        code: code && code.length > 0 ? code : null,
        description: parsed.data.description?.trim() || null,
        priceMonthly: parsed.data.priceMonthly,
      },
    });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002" ? "رمز الباقة مستخدم." : "تعذر الحفظ.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
  return { ok: true as const, error: null as string | null };
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
  return { ok: true as const, error: null as string | null };
}
