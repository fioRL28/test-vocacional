import fs from "fs";
import path from "path";
import { obtenerMejorPerfil, obtenerPuntajeConsistencia } from "../../lib/vocational/engine";
import type { Answer, Dimension, LikertAnswer } from "../../lib/vocational/types";

const projectRoot = path.resolve(__dirname, "../..");
const datasetPath = path.join(projectRoot, "ml/data/processed/vocational_experimental_100_dataset.csv");
const cleanDatasetPath = path.join(projectRoot, "ml/data/processed/vocational_clean_dataset.csv");
const rawDatasetPath = path.join(projectRoot, "ml/data/raw/vocational_raw_dataset.csv");
const metricsPath = path.join(projectRoot, "ml/outputs/experimental_model_metrics_100.csv");
const confusionMatrixPath = path.join(projectRoot, "ml/outputs/confusion_matrix_100.csv");
const outputDir = path.join(projectRoot, "ml/outputs");

const measurementSummaryPath = path.join(outputDir, "independent_variable_measurements.csv");
const detailPath = path.join(outputDir, "independent_variable_measurement_details.csv");
const reportPath = path.join(outputDir, "independent_variable_measurement_report.txt");

type CsvRow = Record<string, string>;

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"" && inQuotes && nextCharacter === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (character === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers.map((header) => escapeCsv(String(row[header] ?? ""))).join(","),
  );

  return [headers.join(","), ...body].join("\n") + "\n";
}

function escapeCsv(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
}

function parseLikertAnswers(row: CsvRow): Answer[] {
  const parsed = JSON.parse(row.likert_answers_json || "[]");

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((answer): LikertAnswer[] => {
    const value = Number(answer.value);
    const questionId = Number(answer.question_id ?? answer.questionId);
    const order = Number(answer.question_order ?? answer.order);
    const dimension = String(answer.dimension ?? "") as Dimension;

    if (!Number.isFinite(value) || !Number.isFinite(questionId) || !dimension) return [];

    return [{
      kind: "likert",
      questionId,
      dimension,
      value,
      order: Number.isFinite(order) ? order : questionId,
    }];
  });
}

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function round(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

function getBestMetric(metrics: CsvRow[]) {
  return [...metrics].sort((left, right) => Number(right.f1_macro) - Number(left.f1_macro))[0];
}

function getConfusionAccuracy(confusionRows: CsvRow[], modelName: string) {
  const rows = confusionRows.filter((row) => row.model === modelName);
  const total = rows.reduce((sum, row) => sum + Number(row.count), 0);
  const correct = rows
    .filter((row) => row.true_label === row.predicted_label)
    .reduce((sum, row) => sum + Number(row.count), 0);

  return { total, correct, accuracyPercent: total ? (correct / total) * 100 : 0 };
}

function main() {
  const dataset = parseCsv(fs.readFileSync(datasetPath, "utf8"));
  const cleanDataset = parseCsv(fs.readFileSync(cleanDatasetPath, "utf8"));
  const rawDataset = parseCsv(fs.readFileSync(rawDatasetPath, "utf8"));
  const metrics = parseCsv(fs.readFileSync(metricsPath, "utf8"));
  const confusionRows = parseCsv(fs.readFileSync(confusionMatrixPath, "utf8"));

  const detailRows = dataset.map((row) => {
    const answers = parseLikertAnswers(row);
    const consistency = obtenerPuntajeConsistencia(answers);
    const profileResult = obtenerMejorPerfil(answers);
    const selectedProfile = profileResult.ranked.find((profile) => profile.id === row.final_profile_code);

    return {
      participant_id: row.anonymous_participant_id,
      final_profile_code: row.final_profile_code,
      recommended_profile_code: profileResult.best.id,
      consistency_score: round(consistency.consistencyScore, 2),
      affinity_score_recommended_profile: round(profileResult.best.score, 4),
      affinity_score_final_profile: round(selectedProfile?.score ?? 0, 4),
      profile_confidence: round(profileResult.confidence, 2),
      strong_or_possible_contradiction: consistency.possibleContradiction ? "yes" : "no",
    };
  });

  const consistencyScores = detailRows.map((row) => Number(row.consistency_score));
  const affinityRecommendedScores = detailRows.map((row) =>
    Number(row.affinity_score_recommended_profile),
  );
  const affinityFinalScores = detailRows.map((row) => Number(row.affinity_score_final_profile));
  const bestMetric = getBestMetric(metrics);
  const confusionAccuracy = getConfusionAccuracy(confusionRows, bestMetric.model);
  const qualityPercent = rawDataset.length ? (cleanDataset.length / rawDataset.length) * 100 : 0;

  const summaryRows = [
    {
      dimension: "Consistencia de respuestas",
      indicator: "Coherencia entre respuestas",
      result: round(average(consistencyScores), 2),
      unit: "%",
      evidence: "lib/vocational/engine.ts:obtenerPuntajeConsistencia; ml/outputs/independent_variable_measurement_details.csv",
    },
    {
      dimension: "Afinidad vocacional",
      indicator: "Compatibilidad perfil-recomendacion",
      result: round(average(affinityRecommendedScores), 4),
      unit: "puntos ponderados",
      evidence: "lib/vocational/engine.ts:puntuarPerfil/obtenerMejorPerfil; ml/outputs/independent_variable_measurement_details.csv",
    },
    {
      dimension: "Calidad de procesamiento",
      indicator: "Datos procesados correctamente",
      result: round(qualityPercent, 2),
      unit: "%",
      evidence: "ml/outputs/data_quality_report.txt; ml/scripts/preprocessing.py",
    },
    {
      dimension: "Precision del perfil profesional",
      indicator: "Exactitud del modelo",
      result: round(confusionAccuracy.accuracyPercent, 2),
      unit: "%",
      evidence: "ml/outputs/experimental_model_metrics_100.csv; ml/outputs/confusion_matrix_100.csv",
    },
  ];

  fs.writeFileSync(detailPath, toCsv(detailRows), "utf8");
  fs.writeFileSync(measurementSummaryPath, toCsv(summaryRows), "utf8");

  const report = [
    "Resultados de medicion de la variable independiente",
    "=".repeat(58),
    `Dataset utilizado: ${datasetPath}`,
    `Total de registros utilizados en entrenamiento: ${dataset.length}`,
    `Total de registros originales para calidad: ${rawDataset.length}`,
    `Total de registros validos procesados: ${cleanDataset.length}`,
    "",
    "Metricas del mejor modelo",
    `- Modelo: ${bestMetric.model}`,
    `- Accuracy: ${Number(bestMetric.accuracy).toFixed(4)}`,
    `- Precision macro: ${Number(bestMetric.precision_macro).toFixed(4)}`,
    `- Recall macro: ${Number(bestMetric.recall_macro).toFixed(4)}`,
    `- F1 macro: ${Number(bestMetric.f1_macro).toFixed(4)}`,
    `- Matriz de confusion: ${confusionMatrixPath}`,
    `- Aciertos del mejor modelo: ${confusionAccuracy.correct}/${confusionAccuracy.total}`,
    "",
    "Indicadores calculados",
    `- Consistencia promedio: ${round(average(consistencyScores), 2)}%`,
    `- Afinidad vocacional promedio del perfil recomendado: ${round(average(affinityRecommendedScores), 4)} puntos ponderados`,
    `- Afinidad vocacional promedio del perfil registrado: ${round(average(affinityFinalScores), 4)} puntos ponderados`,
    `- Calidad de procesamiento: ${round(qualityPercent, 2)}% (${cleanDataset.length}/${rawDataset.length} x 100)`,
    `- Precision del perfil profesional: ${round(confusionAccuracy.accuracyPercent, 2)}% (${confusionAccuracy.correct}/${confusionAccuracy.total} x 100)`,
    "",
    "Archivos generados",
    `- ${measurementSummaryPath}`,
    `- ${detailPath}`,
  ].join("\n") + "\n";

  fs.writeFileSync(reportPath, report, "utf8");

  console.log(report);
}

main();
