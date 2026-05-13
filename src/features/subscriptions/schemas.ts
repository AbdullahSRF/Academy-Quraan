import { z } from "zod";

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
