import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { logger } from "@/lib/logger";

/** استجابة موحّدة لفحص اتصال Prisma/Neon — يُستدعى من /api/health?db=1 و /api/health/database */
export async function databasePingResponse(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return NextResponse.json({ ok: true, database: "up" });
  } catch (e) {
    const code = e instanceof Prisma.PrismaClientKnownRequestError ? e.code : "UNKNOWN";
    logger.error("health database check failed", { code, message: e instanceof Error ? e.message : String(e) });
    return NextResponse.json(
      {
        ok: false,
        database: "down",
        code,
        hint: "تحقق من DATABASE_URL (Neon، sslmode=require، إتاحة الشبكة من Vercel).",
      },
      { status: 503 },
    );
  }
}
