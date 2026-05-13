import { createHmac, timingSafeEqual } from "crypto";
import { getAuthSecret } from "@/lib/auth-env";

const PREFIX = "imp1";

export type ImpersonationPayload = {
  adminId: string;
  targetUserId: string;
  exp: number;
};

function secretKey(): string {
  const s = getAuthSecret();
  if (!s) throw new Error("AUTH_SECRET is required for impersonation tokens.");
  return `${s}:impersonation`;
}

function signBody(body: string): string {
  return createHmac("sha256", secretKey()).update(body).digest("hex");
}

/** رمز قصير العمر (دقائق) — لا يُخزَّن في قاعدة البيانات. */
export function createImpersonationToken(adminId: string, targetUserId: string, ttlMs = 5 * 60_000): string {
  const exp = Date.now() + ttlMs;
  const body = JSON.stringify({ adminId, targetUserId, exp } satisfies ImpersonationPayload);
  const b64 = Buffer.from(body, "utf8").toString("base64url");
  const sig = signBody(b64);
  return `${PREFIX}.${b64}.${sig}`;
}

export function verifyImpersonationToken(token: string): ImpersonationPayload | null {
  if (!token.startsWith(`${PREFIX}.`)) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const b64 = parts[1];
  const sig = parts[2];
  if (!b64 || !sig) return null;
  const expected = signBody(b64);
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  let parsed: ImpersonationPayload;
  try {
    parsed = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as ImpersonationPayload;
  } catch {
    return null;
  }
  if (!parsed.adminId || !parsed.targetUserId || typeof parsed.exp !== "number") return null;
  if (Date.now() > parsed.exp) return null;
  return parsed;
}
