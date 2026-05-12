import { handlers } from "@/auth";

/** Prisma + bcrypt لا يعملان على Edge — إلزام Node يمنع فشلًا صامتًا يظهر كـ «بريد أو كلمة مرور خاطئة». */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
