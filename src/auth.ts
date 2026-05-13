import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import { CredentialsSignin } from "next-auth";
import authConfig from "@/auth.config";
import prisma from "@/infrastructure/db/prisma";
import type { AppRole } from "@/auth.config";
import { normalizeLoginEmail, normalizeLoginPassword, coerceCredentialField } from "@/lib/auth/login-normalize";
import {
  AccountDisabledSignin,
  InvalidCredentialsSignin,
  InvalidLoginFormSignin,
  NotAdminSignin,
} from "@/lib/auth/credentials-login-errors";
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
          if (!parsed.success) {
            throw new InvalidLoginFormSignin();
          }

          let user: User | null = null;
          try {
            user = await prisma.user.findFirst({
              where: { email: { equals: parsed.data.email, mode: "insensitive" } },
            });
          } catch (e) {
            logger.warn("credentials: case-insensitive email lookup skipped", { err: String(e) });
          }
          if (!user) {
            user = await prisma.user.findUnique({
              where: { email: parsed.data.email },
            });
          }

          if (!user?.passwordHash) {
            throw new InvalidCredentialsSignin();
          }
          if (user.disabled) {
            throw new AccountDisabledSignin();
          }

          const pwd = parsed.data.password;
          const variants = Array.from(new Set([pwd, pwd.trim()].filter((p) => p.length > 0)));
          let valid = false;
          for (const candidate of variants) {
            if (await bcrypt.compare(candidate, user.passwordHash)) {
              valid = true;
              break;
            }
          }
          if (!valid) {
            throw new InvalidCredentialsSignin();
          }

          if (user.role !== "ADMIN") {
            throw new NotAdminSignin();
          }

          return {
            id: user.id,
            email: user.email ? user.email.trim().toLowerCase() : undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role as AppRole,
            remember,
          };
        } catch (e) {
          if (e instanceof CredentialsSignin) {
            throw e;
          }
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
