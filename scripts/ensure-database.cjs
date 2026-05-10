/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const pg = require("pg");

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL غير موجود في ملف .env");
  process.exit(1);
}

const u = new URL(raw.replace(/^postgresql:/i, "postgres:"));
const targetDb = (u.pathname || "").replace(/^\//, "").split("?")[0];
if (!targetDb || !/^[a-zA-Z0-9_]+$/.test(targetDb)) {
  console.error("اسم قاعدة البيانات في DATABASE_URL غير صالح:", targetDb);
  process.exit(1);
}

u.pathname = "/postgres";

async function main() {
  const client = new pg.Client({ connectionString: u.toString() });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log("تم إنشاء قاعدة البيانات:", targetDb);
    } else {
      console.log("قاعدة البيانات موجودة مسبقًا:", targetDb);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
