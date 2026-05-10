import { NextResponse } from "next/server";

/** للتحقق السريع أن الخادم يعمل (بدون قاعدة بيانات). */
export function GET() {
  return NextResponse.json({ ok: true });
}
