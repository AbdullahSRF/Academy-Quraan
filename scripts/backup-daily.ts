/**
 * Daily logical backup helper.
 *
 * Requires PostgreSQL client tools (`pg_dump`) on PATH, or run backups from your host/CI
 * using the same DATABASE_URL.
 *
 * Example (Windows PowerShell):
 *   $env:DATABASE_URL="postgresql://..."
 *   npm run backup
 *
 * Example (cron / Task Scheduler):
 *   cd /path/to/quran-academy && npm run backup
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "backups");
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replaceAll(":", "-");
const outFile = path.join(outDir, `backup-${stamp}.sql`);

try {
  execFileSync("pg_dump", [databaseUrl, "--no-owner", "--format=p", `--file=${outFile}`], {
    stdio: "inherit",
  });
  console.log("Backup written:", outFile);
} catch (e) {
  console.error("pg_dump failed. Install PostgreSQL client tools or run a managed backup (RDS snapshots, etc.).");
  console.error(e);
  process.exit(1);
}
