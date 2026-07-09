import { readFile, stat } from "fs/promises";
import path from "path";

const outputsDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "ml", "outputs");
const chartsDir = path.join(outputsDir, "charts");
const metricsPath = path.join(outputsDir, "experimental_model_metrics_100.csv");
const reportPath = path.join(outputsDir, "training_experiment_report_100.txt");

export type ModelMetricArtifact = {
  accuracy: number;
  f1Score: number;
  modelName: string;
  precision: number;
  recall: number;
};

export type TrainingArtifactSummary = {
  bestModel: ModelMetricArtifact | null;
  datasetRows: number;
  features: number;
  lastTraining: Date | null;
  metrics: ModelMetricArtifact[];
  realRows: number;
  syntheticRows: number;
  syntheticShare: number;
  trainTestSplit: string;
};

export async function obtenerResumenEntrenamientoMl(): Promise<TrainingArtifactSummary> {
  const [metrics, report, metadata] = await Promise.all([
    leerMetricasModelos(),
    leerReporteEntrenamiento(),
    stat(metricsPath).catch(() => null),
  ]);
  const bestModel = [...metrics].sort((left, right) => right.f1Score - left.f1Score)[0] ?? null;

  return {
    bestModel,
    datasetRows: extraerNumero(report, /Registros totales:\s*(\d+)/i),
    features: extraerNumero(report, /Features numericas:\s*(\d+)/i),
    lastTraining: metadata?.mtime ?? null,
    metrics,
    realRows: extraerNumero(report, /Registros reales:\s*(\d+)/i),
    syntheticRows: extraerNumero(report, /Registros sinteticos:\s*(\d+)/i),
    syntheticShare: extraerNumero(report, /Registros sinteticos:\s*\d+\s*\(([\d.]+)%\)/i),
    trainTestSplit: extraerTexto(report, /Train\/Test split:\s*(.+)/i) || "No registrado",
  };
}

export async function obtenerGraficoEntrenamiento(nombre: string) {
  const allowed = new Set([
    "curvas-aprendizaje",
    "comparacion-general",
    "matriz-confusion",
  ]);

  if (!allowed.has(nombre)) return null;

  const files: Record<string, string> = {
    "comparacion-general": "07_comparacion_general_metricas_modelos.png",
    "curvas-aprendizaje": "10_curvas_aprendizaje_logistic_regression.png",
    "matriz-confusion": "06_matriz_confusion_mejor_modelo_logistic_regression.png",
  };
  const fileName = files[nombre];
  const filePath = path.join(chartsDir, fileName);

  return {
    content: await readFile(filePath),
    fileName,
  };
}

async function leerMetricasModelos() {
  try {
    const content = await readFile(metricsPath, "utf8");
    const rows = parseCsv(content);

    return rows.map((row) => ({
      accuracy: Number(row.accuracy ?? 0),
      f1Score: Number(row.f1_macro ?? 0),
      modelName: String(row.model ?? ""),
      precision: Number(row.precision_macro ?? 0),
      recall: Number(row.recall_macro ?? 0),
    }));
  } catch {
    return [];
  }
}

async function leerReporteEntrenamiento() {
  try {
    return await readFile(reportPath, "utf8");
  } catch {
    return "";
  }
}

function parseCsv(content: string) {
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function extraerNumero(content: string, pattern: RegExp) {
  const match = content.match(pattern);
  return match ? Number(match[1]) : 0;
}

function extraerTexto(content: string, pattern: RegExp) {
  const match = content.match(pattern);
  return match?.[1]?.trim() ?? "";
}
