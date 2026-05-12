import { databasePingResponse } from "@/lib/health/db-ping";

export const runtime = "nodejs";

/** GET /api/health/database — نفس منطق ?db=1 */
export async function GET() {
  return databasePingResponse();
}
