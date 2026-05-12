import { NextResponse } from "next/server";
import { databasePingResponse } from "@/lib/health/db-ping";

export const runtime = "nodejs";

/**
 * GET /api/health → الخادم حيّ (بدون DB).
 * GET /api/health?db=1 → نفس فحص قاعدة البيانات (مفيد إن كان المسار الفرعي /database غير منشور بعد على Vercel).
 */
export async function GET(request: Request) {
  const db = new URL(request.url).searchParams.get("db");
  if (db === "1" || db === "true") {
    return databasePingResponse();
  }
  return NextResponse.json({ ok: true });
}
