import { NextResponse } from "next/server";
import { auth } from "@/auth-session";
import prisma from "@/infrastructure/db/prisma";
import { logger } from "@/lib/logger";
import { rateLimitHit } from "@/lib/rate-limit";

type StudentHit = { id: string; fullName: string; status: string };

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimitHit(`admin-search:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ students: [] as StudentHit[], invoices: [] });
  }

  try {
    const [students, invoices] = await Promise.all([
      prisma.student.findMany({
        where: { fullName: { contains: q, mode: "insensitive" } },
        take: 10,
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true, status: true },
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { student: { fullName: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 10,
        orderBy: { issuedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          amount: true,
          studentId: true,
          student: { select: { fullName: true } },
        },
      }),
    ]);

    const invoiceHits = invoices.map((i) => ({
      id: i.id,
      title: i.title,
      status: i.status,
      amount: i.amount.toString(),
      studentId: i.studentId,
      studentFullName: i.student.fullName,
    }));

    return NextResponse.json({ students, invoices: invoiceHits });
  } catch (e) {
    logger.error("admin search failed", { err: String(e) });
    return NextResponse.json({ error: "تعذر تنفيذ البحث" }, { status: 500 });
  }
}
