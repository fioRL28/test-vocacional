import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const envPath = path.join(projectRoot, ".env");
const outputPath = path.join(projectRoot, "data-inicial.csv");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    process.env[key.trim()] ??= value;
  }
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","));

  return [headers.join(","), ...body].join("\n");
}

const query = `
WITH dimension_scores AS (
  SELECT
    sds."sessionId" AS session_id,
    MAX(CASE WHEN d.code = 'realista' THEN sds."averageScore"::float END) AS riasec_realista,
    MAX(CASE WHEN d.code = 'investigativo' THEN sds."averageScore"::float END) AS riasec_investigativo,
    MAX(CASE WHEN d.code = 'artistico' THEN sds."averageScore"::float END) AS riasec_artistico,
    MAX(CASE WHEN d.code = 'social' THEN sds."averageScore"::float END) AS riasec_social,
    MAX(CASE WHEN d.code = 'emprendedor' THEN sds."averageScore"::float END) AS riasec_emprendedor,
    MAX(CASE WHEN d.code = 'convencional' THEN sds."averageScore"::float END) AS riasec_convencional,
    MAX(CASE WHEN d.code = 'apertura' THEN sds."averageScore"::float END) AS big_five_apertura,
    MAX(CASE WHEN d.code = 'responsabilidad' THEN sds."averageScore"::float END) AS big_five_responsabilidad,
    MAX(CASE WHEN d.code = 'extraversion' THEN sds."averageScore"::float END) AS big_five_extraversion,
    MAX(CASE WHEN d.code = 'amabilidad' THEN sds."averageScore"::float END) AS big_five_amabilidad,
    MAX(CASE WHEN d.code = 'neuroticismo' THEN sds."averageScore"::float END) AS big_five_neuroticismo,
    MAX(CASE WHEN d.code = 'incertidumbre' THEN sds."averageScore"::float END) AS incertidumbre_vocacional,
    MAX(CASE WHEN d.code = 'presion' THEN sds."averageScore"::float END) AS presion_externa,
    MAX(CASE WHEN d.code = 'tolerancia' THEN sds."averageScore"::float END) AS tolerancia_dificultad
  FROM session_dimension_scores sds
  JOIN dimensions d ON d.id = sds."dimensionId"
  GROUP BY sds."sessionId"
),
likert_answers AS (
  SELECT
    ta."sessionId" AS session_id,
    COUNT(*) AS likert_answer_count,
    jsonb_agg(
      jsonb_build_object(
        'question_id', ta."questionId",
        'dimension', d.code,
        'value', ta."answerValue",
        'question_order', ta."questionOrder",
        'answered_at', ta."answeredAt"
      )
      ORDER BY ta."questionOrder"
    ) AS likert_answers_json
  FROM test_answers ta
  JOIN questions q ON q.id = ta."questionId"
  LEFT JOIN dimensions d ON d.id = q."dimensionId"
  WHERE q.kind = 'LIKERT'
  GROUP BY ta."sessionId"
),
open_answers AS (
  SELECT
    toa."sessionId" AS session_id,
    COUNT(*) AS open_answer_count,
    string_agg(toa."answerText", ' | ' ORDER BY toa."order") AS open_answers_text,
    jsonb_agg(
      jsonb_build_object(
        'question_id', toa."questionId",
        'trigger', toa.trigger,
        'answer_text', toa."answerText",
        'answer_order', toa."order",
        'answered_at', toa."answeredAt"
      )
      ORDER BY toa."order"
    ) AS open_answers_json
  FROM test_open_answers toa
  JOIN questions q ON q.id = toa."questionId"
  WHERE q.kind = 'OPEN'
  GROUP BY toa."sessionId"
)
SELECT
  ts.id::text AS session_id,
  COALESCE(ts."participantCode", ts.id::text) AS anonymous_participant_id,
  ts."startedAt" AS created_at,
  ts."finishedAt" AS finished_at,
  ts.status::text AS session_status,
  ts."isPilotData" AS is_pilot_data,
  ts.grade,
  ts."schoolCode" AS school_code,
  ts."ageRange" AS age_range,
  ts."totalQuestions" AS total_questions,
  final_profile.code AS final_profile_code,
  final_profile.name AS final_profile_name,
  predicted_profile.code AS predicted_profile_code,
  predicted_profile.name AS predicted_profile_name,
  tr."confidenceScore"::float AS confidence_score,
  tr."modelUsed" AS model_used,
  tr."recommendationText" AS recommendation_text,
  ds.riasec_realista,
  ds.riasec_investigativo,
  ds.riasec_artistico,
  ds.riasec_social,
  ds.riasec_emprendedor,
  ds.riasec_convencional,
  ds.big_five_apertura,
  ds.big_five_responsabilidad,
  ds.big_five_extraversion,
  ds.big_five_amabilidad,
  ds.big_five_neuroticismo,
  ds.incertidumbre_vocacional,
  ds.presion_externa,
  ds.tolerancia_dificultad,
  COALESCE(la.likert_answer_count, 0) AS likert_answer_count,
  COALESCE(oa.open_answer_count, 0) AS open_answer_count,
  la.likert_answers_json::text AS likert_answers_json,
  oa.open_answers_text,
  oa.open_answers_json::text AS open_answers_json
FROM test_sessions ts
LEFT JOIN vocational_profiles final_profile ON final_profile.id = ts."finalProfileId"
LEFT JOIN test_results tr ON tr."sessionId" = ts.id
LEFT JOIN vocational_profiles predicted_profile ON predicted_profile.id = tr."predictedProfileId"
LEFT JOIN dimension_scores ds ON ds.session_id = ts.id
LEFT JOIN likert_answers la ON la.session_id = ts.id
LEFT JOIN open_answers oa ON oa.session_id = ts.id
ORDER BY ts."startedAt";
`;

async function main() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta definido en .env.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(query);
    fs.writeFileSync(outputPath, `\ufeff${toCsv(result.rows)}`, "utf8");
    console.log(`Exported ${result.rowCount} rows to ${outputPath}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
