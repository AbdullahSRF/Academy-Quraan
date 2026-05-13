import { auth } from "@/auth";
import type { AppRole } from "@/auth.config";
import type { Session } from "next-auth";

export type AuthedSession = Session & { user: NonNullable<Session["user"]> & { id: string; role: AppRole } };

function isAuthed(s: Session | null): s is AuthedSession {
  return !!s?.user?.id && !!s.user.role;
}

/** جلسة أدمن صالحة — للإجراءات والـ API. */
export async function requireAdminSession(): Promise<AuthedSession | null> {
  const s = await auth();
  if (!isAuthed(s) || s.user.role !== "ADMIN") return null;
  return s;
}
