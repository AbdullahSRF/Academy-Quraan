import { z } from "zod";

export const studentStatusSchema = z.enum(["REGULAR", "PAUSED", "FROZEN", "WITHDRAWN", "ARCHIVED"]);

export const studentUpsertSchema = z.object({
  fullName: z.string().min(2).max(120),
  age: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(3).max(120).optional(),
  ),
  phone: z.string().max(32).optional().nullable(),
  parentPhone: z.string().max(32).optional().nullable(),
  level: z.string().max(80).optional().nullable(),
  status: studentStatusSchema.default("REGULAR"),
  subscriptionPlanId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : String(v).trim()),
    z.string().min(1).optional(),
  ),
});

export type StudentUpsertInput = z.infer<typeof studentUpsertSchema>;
