import { readFile, stat } from "fs/promises";
import path from "path";

const CSV_FILES = {
  actual: {
    filePath: "C:\\Users\\fiore\\Pictures\\data_test.csv",
    fileName: "data_test.csv",
  },
  inicial: {
    filePath: path.join(/*turbopackIgnore: true*/ process.cwd(), "data-inicial.csv"),
    fileName: "data-inicial.csv",
  },
} as const;

export type CsvDatasetKey = keyof typeof CSV_FILES;
type CsvCell = { header: string; value: string };
type CsvRow = CsvCell[];

export type DatasetStatusSummary = {
  incompleteRows: number;
  readyRows: number;
  totalRows: number;
  validRows: number;
};

export type DatasetDistributionItem = {
  label: string;
  value: number;
};

export type DatasetFeatureSummary = {
  description: string;
  group: string;
  name: string;
  type: string;
};

export async function obtenerResumenDatasetCsv() {
  const entries = await Promise.all(
    Object.entries(CSV_FILES).map(async ([key, file]) => {
      const metadata = await stat(file.filePath);
      const content = await readFile(file.filePath, "utf8");
      const { headers, rows } = parseCsv(content);
      const statusSummary = buildStatusSummary(rows);

      return {
        columns: headers.length,
        dateDistribution: buildDateDistribution(rows),
        features: buildFeatures(headers),
        fileName: file.fileName,
        key: key as CsvDatasetKey,
        profileDistribution: buildProfileDistribution(rows),
        rows: rows.length,
        sample: rows.slice(0, 20),
        sizeKb: Math.round(metadata.size / 1024),
        statusSummary,
        updatedAt: metadata.mtime,
      };
    }),
  );

  return entries;
}

export async function obtenerCsvDataset(key: CsvDatasetKey) {
  const file = CSV_FILES[key];

  return {
    content: await readFile(file.filePath, "utf8"),
    fileName: file.fileName,
  };
}

function parseCsv(content: string) {
  const rows = parseCsvRows(content);
  const headers = rows[0] ?? [];

  return {
    headers,
    rows: rows.slice(1).map((row) =>
      headers.map((header, index) => ({
        header,
        value: row[index] ?? "",
      })),
    ),
  };
}

function parseCsvRows(content: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((items) => items.some((item) => item.trim()));
}

function buildStatusSummary(rows: CsvRow[]): DatasetStatusSummary {
  const validRows = rows.filter((row) => getRecordStatus(row) === "valid").length;
  const incompleteRows = Math.max(0, rows.length - validRows);
  const readyRows = rows.filter(isReadyForTraining).length;

  return {
    incompleteRows,
    readyRows,
    totalRows: rows.length,
    validRows,
  };
}

function buildProfileDistribution(rows: CsvRow[]): DatasetDistributionItem[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    if (!isReadyForTraining(row)) return;

    const profile = getProfile(row);
    if (!profile) return;

    counts.set(profile, (counts.get(profile) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);
}

function buildDateDistribution(rows: CsvRow[]): DatasetDistributionItem[] {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const date = parseDatasetDate(getCell(row, [/created_at/, /created/, /fecha/, /date/]));
    if (!date) return;

    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-8)
    .map(([date, value]) => ({
      label: formatDateLabel(date),
      value,
    }));
}

function buildFeatures(headers: string[]): DatasetFeatureSummary[] {
  return headers
    .filter((header) => isUsefulFeature(header))
    .map((header) => ({
      description: describeFeature(header),
      group: groupFeature(header),
      name: header,
      type: inferFeatureType(header),
    }));
}

function getRecordStatus(row: CsvRow) {
  const rawStatus = getCell(row, [/session_status/, /estado/, /status/]).toLowerCase();

  if (
    rawStatus.includes("cancel") ||
    rawStatus.includes("descart") ||
    rawStatus.includes("progress") ||
    rawStatus.includes("progreso") ||
    rawStatus.includes("incomplete")
  ) {
    return "incomplete";
  }

  return "valid";
}

function isReadyForTraining(row: CsvRow) {
  return (
    getRecordStatus(row) === "valid" &&
    Boolean(getProfile(row)) &&
    Number(getCell(row, [/likert_answer_count/, /total_questions/, /questions/])) > 0
  );
}

function getProfile(row: CsvRow) {
  return cleanDatasetText(
    getCell(row, [
      /^final_profile_name$/,
      /^predicted_profile_name$/,
      /perfil/,
      /profile/,
    ]),
  );
}

function getCell(row: CsvRow, patterns: RegExp[]) {
  const cell = row.find((item) =>
    patterns.some((pattern) => pattern.test(item.header.toLowerCase())),
  );

  return cleanDatasetText(cell?.value?.toString().trim() || "");
}

function cleanDatasetText(value: string) {
  return value
    .replace(/^"+|"+$/g, "")
    .replace(/dataset inicial/gi, "Dataset actual")
    .replace(/data inicial/gi, "Dataset actual")
    .replace(/inicial/gi, "actual");
}

function parseDatasetDate(value: string) {
  const cleaned = value.replaceAll('"', "").trim();
  if (!cleaned) return null;

  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
}

function isUsefulFeature(header: string) {
  const lower = header.toLowerCase();

  return (
    lower.includes("score") ||
    lower.includes("realista") ||
    lower.includes("investigativo") ||
    lower.includes("investigador") ||
    lower.includes("artistico") ||
    lower.includes("social") ||
    lower.includes("emprendedor") ||
    lower.includes("convencional") ||
    lower.includes("apertura") ||
    lower.includes("responsabilidad") ||
    lower.includes("extravers") ||
    lower.includes("amabilidad") ||
    lower.includes("neurotic") ||
    lower.includes("presion") ||
    lower.includes("incertidumbre") ||
    lower.includes("tolerancia")
  );
}

function groupFeature(header: string) {
  const lower = header.toLowerCase();

  if (
    lower.includes("realista") ||
    lower.includes("investigativo") ||
    lower.includes("investigador") ||
    lower.includes("artistico") ||
    lower.includes("social") ||
    lower.includes("emprendedor") ||
    lower.includes("convencional")
  ) {
    return "RIASEC";
  }

  if (
    lower.includes("apertura") ||
    lower.includes("responsabilidad") ||
    lower.includes("extravers") ||
    lower.includes("amabilidad") ||
    lower.includes("neurotic")
  ) {
    return "Big Five";
  }

  if (
    lower.includes("presion") ||
    lower.includes("incertidumbre") ||
    lower.includes("tolerancia")
  ) {
    return "Contextual";
  }

  return "Variable";
}

function inferFeatureType(header: string) {
  const lower = header.toLowerCase();

  if (
    lower.includes("score") ||
    lower.includes("count") ||
    lower.includes("total") ||
    lower.includes("riasec") ||
    lower.includes("big_five") ||
    lower.includes("incertidumbre") ||
    lower.includes("presion") ||
    lower.includes("tolerancia")
  ) {
    return "Numerica";
  }

  return "Categorica";
}

function describeFeature(header: string) {
  const lower = header.toLowerCase();

  if (lower.includes("realista")) return "Puntaje de dimension Realista";
  if (lower.includes("investigativo") || lower.includes("investigador")) {
    return "Puntaje de dimension Investigativa";
  }
  if (lower.includes("artistico")) return "Puntaje de dimension Artistica";
  if (lower.includes("social")) return "Puntaje de dimension Social";
  if (lower.includes("emprendedor")) return "Puntaje de dimension Emprendedora";
  if (lower.includes("convencional")) return "Puntaje de dimension Convencional";
  if (lower.includes("apertura")) return "Rasgo de apertura";
  if (lower.includes("responsabilidad")) return "Rasgo de responsabilidad";
  if (lower.includes("extravers")) return "Rasgo de extraversion";
  if (lower.includes("amabilidad")) return "Rasgo de amabilidad";
  if (lower.includes("neurotic")) return "Rasgo de neuroticismo";
  if (lower.includes("presion")) return "Senal de presion externa";
  if (lower.includes("incertidumbre")) return "Nivel de incertidumbre vocacional";
  if (lower.includes("tolerancia")) return "Tolerancia a la dificultad";

  return "Variable usada para analisis o entrenamiento";
}
