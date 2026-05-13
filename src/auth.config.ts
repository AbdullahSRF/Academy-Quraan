import type { NextAuthConfig } from "next-auth";
import type { DefaultSession } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";

export type AppRole = "ADMIN" | "STUDENT" | "PARENT";

const DAY = 24 * 60 * 60;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      /** معرّف المشرف الأصلي عند التصفح كطالب/ولي أمر */
      impersonatorId: string | null;
      impersonatorName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    remember?: boolean;
    impersonatorId?: string;
    impersonatorName?: string | null;
    impersonatorEmail?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    remember?: string | boolean;
    impersonatorId?: string;
    impersonatorName?: string;
    impersonatorEmail?: string;
  }
}

export default {
  trustHost: true,
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    /** أقصى مدة مرجعية — المدة الفعلية تُضبط في callback JWT حسب «تذكرني». */
    maxAge: 90 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      const payload = session as { endImpersonation?: boolean } | undefined;

      if (trigger === "update" && payload?.endImpersonation === true) {
        if (typeof token.impersonatorId === "string" && token.impersonatorId.length > 0) {
          token.id = token.impersonatorId;
          token.role = "ADMIN";
          token.name = typeof token.impersonatorName === "string" ? token.impersonatorName : token.name;
          token.email = typeof token.impersonatorEmail === "string" ? token.impersonatorEmail : token.email;
          delete token.impersonatorId;
          delete token.impersonatorName;
          delete token.impersonatorEmail;
        }
        const remember = token.remember === true || token.remember === "1";
        const maxAgeSec = remember ? 90 * DAY : 7 * DAY;
        token.exp = Math.floor(Date.now() / 1000) + maxAgeSec;
        return token;
      }

      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;

        const r = (user as { remember?: boolean | string }).remember;
        const remember = r === undefined || r === true || r === "1";

        token.remember = remember ? "1" : "0";

        if (user.impersonatorId) {
          token.impersonatorId = user.impersonatorId;
          token.impersonatorName = user.impersonatorName ?? undefined;
          token.impersonatorEmail = user.impersonatorEmail ?? undefined;
          token.exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
          return token;
        }

        const maxAgeSec = remember ? 90 * DAY : 7 * DAY;
        token.exp = Math.floor(Date.now() / 1000) + maxAgeSec;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;
        session.user.impersonatorId = typeof token.impersonatorId === "string" ? token.impersonatorId : null;
        session.user.impersonatorName = typeof token.impersonatorName === "string" ? token.impersonatorName : null;
      }
      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers">;
