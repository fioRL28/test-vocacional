from __future__ import annotations

from pathlib import Path

import pandas as pd

from database_connection import load_query


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATASET_PATH = PROJECT_ROOT / "ml" / "data" / "raw" / "vocational_raw_dataset.csv"


EXPORT_QUERY = """
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
),
profile_scores AS (
  SELECT
    sds."sessionId" AS session_id,
    vp.code AS profile_code,
    vp.name AS profile_name,
    SUM(sds."averageScore"::float * pd.weight::float) AS profile_score
  FROM session_dimension_scores sds
  JOIN profile_dimensions pd ON pd."dimensionId" = sds."dimensionId"
  JOIN vocational_profiles vp ON vp.id = pd."profileId"
  GROUP BY sds."sessionId", vp.code, vp.name
),
ranked_profiles AS (
  SELECT
    ps.*,
    MAX(ps.profile_score) OVER (PARTITION BY ps.session_id) AS top_profile_score,
    ROW_NUMBER() OVER (PARTITION BY ps.session_id ORDER BY ps.profile_score DESC) AS profile_rank
  FROM profile_scores ps
),
compatible_routes AS (
  SELECT
    rp.session_id,
    string_agg(rp.profile_code, ',' ORDER BY rp.profile_rank) AS compatible_route_codes,
    string_agg(rp.profile_name, ' | ' ORDER BY rp.profile_rank) AS compatible_route_names
  FROM ranked_profiles rp
  WHERE rp.profile_rank > 1
    AND rp.profile_score >= rp.top_profile_score - 2.0
  GROUP BY rp.session_id
)
SELECT
  ts.id::text AS session_id,
  COALESCE(ts."participantCode", ts.id::text) AS anonymous_participant_id,
  ts."startedAt" AS created_at,
  ts."finishedAt" AS finished_at,
  ts.status::text AS session_status,
  ts."totalQuestions" AS total_questions,
  final_profile.code AS final_profile_code,
  final_profile.name AS final_profile_name,
  predicted_profile.code AS predicted_profile_code,
  predicted_profile.name AS predicted_profile_name,
  tr."confidenceScore"::float AS confidence_score,
  tr."modelUsed" AS model_used,
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
  oa.open_answers_json::text AS open_answers_json,
  cr.compatible_route_codes,
  cr.compatible_route_names
FROM test_sessions ts
LEFT JOIN vocational_profiles final_profile ON final_profile.id = ts."finalProfileId"
LEFT JOIN test_results tr ON tr."sessionId" = ts.id
LEFT JOIN vocational_profiles predicted_profile ON predicted_profile.id = tr."predictedProfileId"
LEFT JOIN dimension_scores ds ON ds.session_id = ts.id
LEFT JOIN likert_answers la ON la.session_id = ts.id
LEFT JOIN open_answers oa ON oa.session_id = ts.id
LEFT JOIN compatible_routes cr ON cr.session_id = ts.id
WHERE ts.status = 'COMPLETED'
ORDER BY ts."startedAt";
"""


def export_raw_dataset(output_path: Path = RAW_DATASET_PATH) -> pd.DataFrame:
    """Export one anonymized training candidate row per completed test session."""
    dataset = load_query(EXPORT_QUERY)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(output_path, index=False, encoding="utf-8")
    return dataset


def main() -> None:
    dataset = export_raw_dataset()
    print(f"Exported {len(dataset)} rows to {RAW_DATASET_PATH}")


if __name__ == "__main__":
    main()
