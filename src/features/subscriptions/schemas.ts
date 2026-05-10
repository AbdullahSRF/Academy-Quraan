import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(120),
  code: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  priceMonthly: z.coerce.number().min(0, "السعر غير صالح"),
});

export const assignSubscriptionSchema = z.object({
  studentId: z.string().min(1),
  planId: z.string().min(1),
  startedAt: z.string().optional(),
  endsAt: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateSubscriptionStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"]),
});
