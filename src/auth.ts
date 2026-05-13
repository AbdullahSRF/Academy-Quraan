import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import authConfig from "@/auth.config";
import prisma from "@/infrastructure/db/prisma";
import type { AppRole } from "@/auth.config";
import { normalizeLoginEmail, normalizeLoginPassword, coerceCredentialField } from "@/lib/auth/login-normalize";
import { IMPERSONATION_SIGNIN_EMAIL } from "@/lib/auth/impersonation-constants";
import { verifyImpersonationToken } from "@/lib/auth/impersonation-token";
import { logger } from "@/lib/logger";

const credentialsSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

function isLikelyDatabaseConnectivityError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1017"].includes(e.code);
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /Can't reach database server|connection refused|ECONNREFUSED|ETIMEDOUT|timeout/i.test(msg);
}

function parseRemember(raw: unknown): boolean {
  const v = coerceCredentialField(raw);
  if (v === "0" || v.toLowerCase() === "false") return false;
  return true;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
        remember: { label: "تذكرني", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          const raw = credentials as Record<string, unknown> | undefined;
          const emailRaw = coerceCredentialField(
            raw?.email ?? raw?.Email ?? raw?.username ?? raw?.user ?? raw?.identifier,
          );
          const passwordRaw = coerceCredentialField(raw?.password ?? raw?.Password ?? raw?.pass);
          const remember = parseRemember(raw?.remember);

          const email = normalizeLoginEmail(emailRaw);
          const password = normalizeLoginPassword(passwordRaw);
          const parsed = credentialsSchema.safeParse({ email, password });
          if (!parsed.success) return null;

          if (parsed.data.email === IMPERSONATION_SIGNIN_EMAIL) {
            const payload = verifyImpersonationToken(parsed.data.password);
            if (!payload) return null;

            const [admin, target] = await Promise.all([
              prisma.user.findUnique({ where: { id: payload.adminId } }),
              prisma.user.findUnique({ where: { id: payload.targetUserId } }),
            ]);

            if (!admin || admin.role !== "ADMIN" || admin.disabled) return null;
            if (!target?.passwordHash || target.disabled) return null;
            if (target.role !== "STUDENT" && target.role !== "PARENT") return null;

            return {
              id: target.id,
              email: target.email ? target.email.trim().toLowerCase() : undefined,
              name: target.name ?? undefined,
              image: target.image ?? undefined,
              role: target.role as AppRole,
              remember: true,
              impersonatorId: admin.id,
              impersonatorName: admin.name,
              impersonatorEmail: admin.email,
            };
          }

          let user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });
          if (!user) {
            try {
              user = await prisma.user.findFirst({
                where: { email: { equals: parsed.data.email, mode: "insensitive" } },
              });
            } catch (e) {
              logger.warn("credentials: case-insensitive email lookup skipped", { err: String(e) });
            }
          }

          if (!user?.passwordHash) return null;
          if (user.disabled) return null;

          let valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid && parsed.data.password !== parsed.data.password.trim()) {
            valid = await bcrypt.compare(parsed.data.password.trim(), user.passwordHash);
          }
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email ? user.email.trim().toLowerCase() : undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role as AppRole,
            remember,
          };
        } catch (e) {
          if (isLikelyDatabaseConnectivityError(e)) {
            logger.error("credentials authorize: database unreachable", { err: String(e) });
          } else {
            logger.error("credentials authorize failed", { err: String(e) });
          }
          return null;
        }
      },
    }),
  ],
});
