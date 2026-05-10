"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type FinanceActionState = { ok: boolean; error: string | null };

export async function createInvoiceAction(_prev: FinanceActionState, formData: FormData): Promise<FinanceActionState> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const amountStr = String(formData.get("amount") ?? "").trim();
  const dueStr = String(formData.get("dueDate") ?? "").trim();

  if (!studentId || !title || !amountStr) {
    return { ok: false, error: "الطالب والعنوان والمبلغ مطلوبة." };
  }

  const amount = new Prisma.Decimal(amountStr);
  if (!amount.gt(0)) {
    return { ok: false, error: "المبلغ يجب أن يكون أكبر من صفر." };
  }

  let dueDate: Date | null = null;
  if (dueStr) {
    const d = new Date(`${dueStr}T12:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "تاريخ الاستحقاق غير صالح." };
    }
    dueDate = d;
  }

  try {
    await prisma.invoice.create({
      data: {
        studentId,
        title,
        amount,
        dueDate,
        status: "ISSUED",
      },
    });
    revalidatePath("/admin/finance");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر إنشاء الفاتورة." };
  }
}
