import { z } from "zod";

/** تحقق من متغيرات الخادم الحرجة عند الاستيراد (استدعِ من `instrumentation` أو قبل عمليات حساسة). */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
}

export function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") return;
  const auth = process.env.AUTH_SECRET?.trim() ?? "";
  if (auth.length < 16) {
    throw new Error("AUTH_SECRET must be set to a strong value in production.");
  }
}
