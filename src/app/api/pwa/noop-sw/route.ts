import { NextResponse } from "next/server";
import { NOOP_SERVICE_WORKER_BODY } from "@/lib/pwa/noop-service-worker";

export const runtime = "edge";

/** يُستدعى داخليًا عبر rewrite من `/sw.js` عندما يكون PWA معطّلًا */
export function GET() {
  return new NextResponse(NOOP_SERVICE_WORKER_BODY, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
