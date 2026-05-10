import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

// Prisma skips default `.env` loading when this file exists; load it so plain
// `npx prisma db push` / `migrate` pick up `DATABASE_URL` like `npm run db:push`.
loadEnv({ path: resolve(process.cwd(), ".env") });

/**
 * Seed path lives here (Prisma 7 deprecates package.json#prisma.seed).
 * Omit `datasource` so `prisma generate` works in CI/postinstall without DATABASE_URL;
 * connection URL remains in prisma/schema.prisma for migrate/db commands.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});
