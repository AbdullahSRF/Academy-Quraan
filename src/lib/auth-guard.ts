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

/** جلسة طالب صالحة. */
export async function requireStudentSession(): Promise<AuthedSession | null> {
  const s = await auth();
  if (!isAuthed(s) || s.user.role !== "STUDENT") return null;
  return s;
}

/** جلسة ولي أمر صالحة. */
export async function requireParentSession(): Promise<AuthedSession | null> {
  const s = await auth();
  if (!isAuthed(s) || s.user.role !== "PARENT") return null;
  return s;
}

/** مشرف أو جلسة مطابقة للدور المطلوب. */
export async function requireRoleOrAdmin(role: AppRole): Promise<AuthedSession | null> {
  const s = await auth();
  if (!isAuthed(s)) return null;
  if (s.user.role === "ADMIN" || s.user.role === role) return s;
  return null;
}
