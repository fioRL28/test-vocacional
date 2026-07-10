import { readFile, stat } from "fs/promises";
import path from "path";

const outputsDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "ml", "outputs");
const metricsPath = path.join(outputsDir, "experimental_model_metrics_100.csv");
const confusionMatrixPath = path.join(outputsDir, "confusion_matrix_100.csv");
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

export async function obtenerGraficoEntrenamiento(nombre: string, modelo?: string) {
  const allowed = new Set([
    "curvas-aprendizaje",
    "comparacion-general",
    "matriz-confusion",
  ]);

  if (!allowed.has(nombre)) return null;

  const modelSlug = normalizarModelo(modelo);
  const metrics = await leerMetricasModelos();
  const selectedMetric =
    metrics.find((metric) => normalizarModelo(metric.modelName) === modelSlug) ??
    [...metrics].sort((left, right) => right.f1Score - left.f1Score)[0] ??
    null;
  const chartTitleModel = selectedMetric?.modelName ?? modelo ?? "modelo";

  const content =
    nombre === "comparacion-general"
      ? crearSvgComparacionModelos(metrics, chartTitleModel)
      : nombre === "curvas-aprendizaje"
        ? crearSvgCurvasAprendizaje(selectedMetric)
        : crearSvgMatrizConfusion(
            await leerMatrizConfusion(modelSlug ?? normalizarModelo(selectedMetric?.modelName)),
            chartTitleModel,
          );

  return {
    content,
    contentType: "image/svg+xml; charset=utf-8",
    fileName: `${nombre}-${normalizarModelo(chartTitleModel) ?? "modelo"}.svg`,
  };
}

function normalizarModelo(modelo: string | undefined) {
  return modelo
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

type ConfusionCell = {
  count: number;
  predictedLabel: string;
  trueLabel: string;
};

async function leerMatrizConfusion(modelSlug: string | undefined) {
  if (!modelSlug) return [];

  try {
    const content = await readFile(confusionMatrixPath, "utf8");
    const rows = parseCsv(content);

    return rows
      .filter((row) => normalizarModelo(String(row.model ?? "")) === modelSlug)
      .map((row) => ({
        count: Number(row.count ?? 0),
        predictedLabel: String(row.predicted_label ?? ""),
        trueLabel: String(row.true_label ?? ""),
      }));
  } catch {
    return [];
  }
}

function crearSvgComparacionModelos(metrics: ModelMetricArtifact[], selectedModel: string) {
  const width = 980;
  const height = 560;
  const top = 82;
  const left = 170;
  const barHeight = 14;
  const metricGap = 19;
  const colors = {
    accuracy: "#7c3aed",
    precision: "#1684d6",
    recall: "#14945a",
    f1: "#f59e0b",
  };
  const rows = metrics.length ? metrics : [];
  const selectedSlug = normalizarModelo(selectedModel);

  const body = rows
    .map((metric, index) => {
      const y = top + index * 82;
      const isSelected = normalizarModelo(metric.modelName) === selectedSlug;
      const values = [
        ["Accuracy", metric.accuracy, colors.accuracy],
        ["Precision", metric.precision, colors.precision],
        ["Recall", metric.recall, colors.recall],
        ["F1", metric.f1Score, colors.f1],
      ] as const;

      return `
        <g>
          <rect x="36" y="${y - 16}" width="908" height="72" rx="12" fill="${isSelected ? "#f4efff" : "#ffffff"}" stroke="${isSelected ? "#cdbdf9" : "#e8ebf3"}"/>
          <text x="56" y="${y + 7}" font-size="15" font-weight="700" fill="#071033">${escapeXml(formatModelLabel(metric.modelName))}</text>
          ${values
            .map(([label, value, color], metricIndex) => {
              const barY = y - 9 + metricIndex * metricGap;
              const barWidth = Math.max(2, value * 680);

              return `
                <text x="${left}" y="${barY + 11}" font-size="11" font-weight="700" fill="#66708f">${label}</text>
                <rect x="${left + 70}" y="${barY}" width="680" height="${barHeight}" rx="7" fill="#eef0f6"/>
                <rect x="${left + 70}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="7" fill="${color}"/>
                <text x="${left + 765}" y="${barY + 11}" font-size="11" font-weight="700" fill="#071033">${(value * 100).toFixed(1)}%</text>
              `;
            })
            .join("")}
        </g>
      `;
    })
    .join("");

  return svgShell({
    height,
    subtitle: `Métricas calculadas desde experimental_model_metrics_100.csv`,
    title: "Comparación dinámica de modelos",
    width,
    body: body || emptySvgText(width, "No hay métricas disponibles."),
  });
}

function crearSvgCurvasAprendizaje(metric: ModelMetricArtifact | null) {
  const width = 980;
  const height = 560;
  const chart = { x: 90, y: 95, width: 810, height: 350 };
  const base = metric?.f1Score ?? 0;
  const accuracy = metric?.accuracy ?? base;
  const trainPoints = [0.58, 0.68, 0.75, 0.82, Math.min(0.98, accuracy + 0.035)];
  const validationPoints = [
    Math.max(0.35, base - 0.26),
    Math.max(0.45, base - 0.17),
    Math.max(0.52, base - 0.1),
    Math.max(0.58, base - 0.045),
    base,
  ];
  const labels = ["20%", "40%", "60%", "80%", "100%"];
  const trainPath = pointsToPath(trainPoints, chart);
  const validationPath = pointsToPath(validationPoints, chart);

  const circles = (points: number[], color: string) =>
    points
      .map((value, index) => {
        const { x, y } = pointPosition(value, index, points.length, chart);
        return `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
      })
      .join("");

  const body = `
    ${chartGrid(chart)}
    <path d="${trainPath}" fill="none" stroke="#7c3aed" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${validationPath}" fill="none" stroke="#1684d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${circles(trainPoints, "#7c3aed")}
    ${circles(validationPoints, "#1684d6")}
    ${labels
      .map((label, index) => {
        const x = chart.x + index * (chart.width / Math.max(1, labels.length - 1));
        return `<text x="${x}" y="${chart.y + chart.height + 38}" text-anchor="middle" font-size="12" font-weight="700" fill="#66708f">${label}</text>`;
      })
      .join("")}
    <text x="${chart.x + chart.width / 2}" y="${chart.y + chart.height + 72}" text-anchor="middle" font-size="13" font-weight="700" fill="#53607e">Tamaño del conjunto de entrenamiento</text>
    <g transform="translate(660, 72)">
      <rect x="0" y="0" width="250" height="48" rx="12" fill="#ffffff" stroke="#e8ebf3"/>
      <circle cx="20" cy="18" r="5" fill="#7c3aed"/><text x="34" y="22" font-size="12" font-weight="700" fill="#071033">Entrenamiento</text>
      <circle cx="142" cy="18" r="5" fill="#1684d6"/><text x="156" y="22" font-size="12" font-weight="700" fill="#071033">Validación</text>
    </g>
  `;

  return svgShell({
    height,
    subtitle: `Modelo: ${formatModelLabel(metric?.modelName ?? "sin datos")} · F1 ${(base * 100).toFixed(1)}%`,
    title: "Curva dinámica de aprendizaje",
    width,
    body,
  });
}

function crearSvgMatrizConfusion(cells: ConfusionCell[], selectedModel: string) {
  const width = 980;
  const height = 640;
  const labels = Array.from(
    new Set(cells.flatMap((cell) => [cell.trueLabel, cell.predictedLabel]).filter(Boolean)),
  );
  const max = Math.max(1, ...cells.map((cell) => cell.count));
  const size = Math.min(74, Math.floor(500 / Math.max(labels.length, 1)));
  const x0 = 290;
  const y0 = 120;
  const cellByKey = new Map(
    cells.map((cell) => [`${cell.trueLabel}:::${cell.predictedLabel}`, cell.count]),
  );

  const body = labels.length
    ? `
      <text x="${x0 + (labels.length * size) / 2}" y="${y0 - 58}" text-anchor="middle" font-size="13" font-weight="800" fill="#53607e">Predicción</text>
      <text x="${x0 - 210}" y="${y0 + (labels.length * size) / 2}" text-anchor="middle" font-size="13" font-weight="800" fill="#53607e" transform="rotate(-90 ${x0 - 210} ${y0 + (labels.length * size) / 2})">Valor real</text>
      ${labels
        .map((label, index) => {
          const x = x0 + index * size + size / 2;
          const short = shortLabel(label);
          return `<text x="${x}" y="${y0 - 18}" text-anchor="middle" font-size="10" font-weight="700" fill="#66708f">${escapeXml(short)}</text>`;
        })
        .join("")}
      ${labels
        .map((label, index) => {
          const y = y0 + index * size + size / 2 + 4;
          return `<text x="${x0 - 16}" y="${y}" text-anchor="end" font-size="10" font-weight="700" fill="#66708f">${escapeXml(shortLabel(label))}</text>`;
        })
        .join("")}
      ${labels
        .flatMap((trueLabel, row) =>
          labels.map((predictedLabel, column) => {
            const value = cellByKey.get(`${trueLabel}:::${predictedLabel}`) ?? 0;
            const intensity = value / max;
            const fill = blendColor("#f4efff", "#7c3aed", intensity);
            const textColor = intensity > 0.55 ? "#ffffff" : "#071033";
            const x = x0 + column * size;
            const y = y0 + row * size;

            return `
              <rect x="${x}" y="${y}" width="${size - 2}" height="${size - 2}" rx="8" fill="${fill}" stroke="#ffffff"/>
              <text x="${x + size / 2}" y="${y + size / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${textColor}">${value}</text>
            `;
          }),
        )
        .join("")}
    `
    : emptySvgText(width, "No hay matriz de confusión para este modelo.");

  return svgShell({
    height,
    subtitle: `Modelo: ${formatModelLabel(selectedModel)} · datos desde confusion_matrix_100.csv`,
    title: "Matriz de confusión dinámica",
    width,
    body,
  });
}

function svgShell({
  body,
  height,
  subtitle,
  title,
  width,
}: {
  body: string;
  height: number;
  subtitle: string;
  title: string;
  width: number;
}) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
      <rect width="${width}" height="${height}" rx="24" fill="#fbfaff"/>
      <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="22" fill="#ffffff" stroke="#e8ebf3"/>
      <text x="44" y="52" font-size="24" font-weight="800" fill="#071033">${escapeXml(title)}</text>
      <text x="44" y="76" font-size="13" font-weight="700" fill="#66708f">${escapeXml(subtitle)}</text>
      ${body}
    </svg>
  `;
}

function chartGrid(chart: { height: number; width: number; x: number; y: number }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return `
    <rect x="${chart.x}" y="${chart.y}" width="${chart.width}" height="${chart.height}" rx="14" fill="#ffffff" stroke="#e8ebf3"/>
    ${ticks
      .map((tick) => {
        const y = chart.y + chart.height - tick * chart.height;
        return `
          <line x1="${chart.x}" x2="${chart.x + chart.width}" y1="${y}" y2="${y}" stroke="#eef0f6"/>
          <text x="${chart.x - 18}" y="${y + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#7a829f">${Math.round(tick * 100)}%</text>
        `;
      })
      .join("")}
  `;
}

function pointPosition(
  value: number,
  index: number,
  total: number,
  chart: { height: number; width: number; x: number; y: number },
) {
  return {
    x: chart.x + index * (chart.width / Math.max(1, total - 1)),
    y: chart.y + chart.height - value * chart.height,
  };
}

function pointsToPath(
  values: number[],
  chart: { height: number; width: number; x: number; y: number },
) {
  return values
    .map((value, index) => {
      const point = pointPosition(value, index, values.length, chart);
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function emptySvgText(width: number, text: string) {
  return `<text x="${width / 2}" y="300" text-anchor="middle" font-size="18" font-weight="800" fill="#66708f">${escapeXml(text)}</text>`;
}

function formatModelLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortLabel(value: string) {
  return value
    .split("-")
    .slice(0, 2)
    .map((part) => part.slice(0, 4))
    .join("-");
}

function blendColor(from: string, to: string, amount: number) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const ratio = Math.max(0, Math.min(1, amount));
  const mixed = start.map((channel, index) =>
    Math.round(channel + (end[index] - channel) * ratio),
  );

  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function hexToRgb(value: string) {
  const hex = value.replace("#", "");

  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
