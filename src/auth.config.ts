import type { NextAuthConfig } from "next-auth";
import type { DefaultSession } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";

export type AppRole = "ADMIN" | "STUDENT" | "PARENT";

const DAY = 24 * 60 * 60;

declare module "next-auth" {
  interface Session {
    user: Omit<NonNullable<DefaultSession["user"]>, never> & {
      id: string;
      role: AppRole;
    };
  }

  interface User {
    role: AppRole;
    remember?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    remember?: string | boolean;
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
    signIn: "/login/admin",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;

        const r = (user as { remember?: boolean | string }).remember;
        const remember = r === undefined || r === true || r === "1";

        token.remember = remember ? "1" : "0";

        const maxAgeSec = remember ? 90 * DAY : 7 * DAY;
        token.exp = Math.floor(Date.now() / 1000) + maxAgeSec;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers">;
