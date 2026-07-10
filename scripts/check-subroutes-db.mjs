import fs from "node:fs";
import pg from "pg";

function loadEnv() {
  if (!fs.existsSync(".env")) return;

  for (const rawLine of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...valueParts] = line.split("=");
    process.env[key.trim()] ??= valueParts.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes("sslmode=require") || databaseUrl?.includes("ssl=true")
    ? { rejectUnauthorized: false }
    : undefined,
});

try {
  const result = await pool.query(`
    SELECT
      ts."participantCode",
      ts."startedAt",
      ts.status::text AS status,
      tr."resultPayload"
    FROM test_sessions ts
    LEFT JOIN test_results tr ON tr."sessionId" = ts.id
    ORDER BY ts."startedAt" DESC
    LIMIT 10
  `);

  console.table(result.rows.map((row) => ({
    participant: row.participantCode,
    startedAt: row.startedAt?.toISOString?.() ?? row.startedAt,
    status: row.status,
    hasPayload: row.resultPayload !== null,
    payloadKeys: row.resultPayload ? Object.keys(row.resultPayload).join(",") : "",
  })));
} finally {
  await pool.end();
}
