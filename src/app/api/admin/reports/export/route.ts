import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/auth-session";
import { buildAdminSummaryForExport, summaryToCsvRows } from "@/features/reports/admin-summary-export";
import { logger } from "@/lib/logger";
import { rateLimitHit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function toCsv(rows: string[][]): string {
  const esc = (c: string) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return rows.map((r) => r.map(esc).join(",")).join("\n") + "\n";
}

/** تصدير ملخص لوحة (CSV أو PDF نصّي بسيط UTF-8 محدود للخطوط الافتراضية). */
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimitHit(`report-export:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") ?? "csv").toLowerCase();
  const type = (searchParams.get("type") ?? "summary").toLowerCase();

  if (type !== "summary") {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  try {
    const data = await buildAdminSummaryForExport();

    if (format === "csv") {
      const csv = "\uFEFF" + toCsv(summaryToCsvRows(data));
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="academy-summary-${data.generatedAt.slice(0, 10)}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595.28, 841.89]);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      let y = 800;
      const lines = [
        "Quran Academy — Admin summary (30d window)",
        `Generated (UTC): ${data.generatedAt}`,
        `Students (non-archived): ${data.studentsTotal}`,
        `Students regular: ${data.studentsRegular}`,
        `Attendance rows (30d): ${data.attendanceRows30d}`,
        `Memorization sessions completed (30d): ${data.memorizationSessions30d}`,
        `Revenue sum (30d): ${data.revenue30d}`,
        `Open invoices: ${data.openInvoices}`,
        "",
        "Note: For full Arabic PDFs, embed a TTF font (e.g. Noto Naskh) via pdf-lib.",
      ];
      for (const line of lines) {
        page.drawText(line.slice(0, 500), { x: 48, y, size: 11, font, color: rgb(0.1, 0.1, 0.12) });
        y -= 18;
      }
      const bytes = await pdf.save();
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="academy-summary-${data.generatedAt.slice(0, 10)}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (e) {
    logger.error("report export failed", { err: String(e) });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
