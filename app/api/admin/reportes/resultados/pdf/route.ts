import { obtenerAdminActual } from "@/backend/admin/auth";
import {
  obtenerFiltrosReporte,
  obtenerResultadosReporte,
} from "@/backend/admin/reports";
import type { TestSessionStatus } from "@/backend/generated/prisma/client";

type ReportRow = {
  confidence: string;
  date: string;
  id: string;
  model: string;
  profile: string;
  status: string;
};

export async function GET(request: Request) {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const results = await obtenerResultadosReporte(
    obtenerFiltrosReporte(new URL(request.url).searchParams),
    200,
  );

  const rows = results.map((result): ReportRow => ({
    confidence: result.confidenceScore ? `${Number(result.confidenceScore).toFixed(1)}%` : "-",
    date: formatDate(result.createdAt),
    id: result.session.participantCode ?? `RF-${result.sessionId.slice(0, 8).toUpperCase()}`,
    model: formatModelName(result.modelUsed),
    profile: result.predictedProfile.name,
    status: formatStatus(result.session.status),
  }));

  const pdf = createResultsPdf(rows);

  return new Response(pdf, {
    headers: {
      "Content-Disposition": 'attachment; filename="rutafuturo-resultados.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}

function createResultsPdf(rows: ReportRow[]) {
  const pages = chunkRows(rows, 28).map((pageRows, index, pages) =>
    buildPageContent(pageRows, index + 1, pages.length, rows.length),
  );
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids ${pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ")} /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...pages.flatMap((content, index) => {
      const pageObjectNumber = 4 + index * 2;
      const contentObjectNumber = pageObjectNumber + 1;

      return [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
        `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
      ];
    }),
  ];

  return buildPdf(objects);
}

function buildPageContent(
  rows: ReportRow[],
  page: number,
  totalPages: number,
  totalRows: number,
) {
  const commands = [
    text(40, 802, 18, "Reporte de resultados anonimos"),
    text(40, 780, 9, "RutaFuturo no almacena nombres, correos ni DNI de estudiantes."),
    text(40, 764, 9, `Resultados exportados: ${totalRows}`),
    text(468, 802, 9, `Pagina ${page} de ${totalPages}`),
    line(40, 748, 555, 748),
    text(40, 728, 8, "ID sesion"),
    text(118, 728, 8, "Perfil sugerido"),
    text(286, 728, 8, "Confianza"),
    text(346, 728, 8, "Modelo"),
    text(444, 728, 8, "Fecha"),
    text(520, 728, 8, "Estado"),
    line(40, 718, 555, 718),
  ];

  rows.forEach((row, index) => {
    const y = 699 - index * 23;

    commands.push(
      text(40, y, 7, truncate(row.id, 16)),
      text(118, y, 7, truncate(row.profile, 34)),
      text(286, y, 7, row.confidence),
      text(346, y, 7, truncate(row.model, 20)),
      text(444, y, 7, row.date),
      text(520, y, 7, row.status),
      line(40, y - 8, 555, y - 8),
    );
  });

  if (totalRows === 0) {
    commands.push(text(40, 690, 10, "No hay resultados anonimos con los filtros seleccionados."));
  }

  return commands.join("\n");
}

function buildPdf(objects: string[]) {
  const header = "%PDF-1.4\n";
  let body = "";
  const offsets = [0];
  let cursor = Buffer.byteLength(header, "latin1");

  objects.forEach((object, index) => {
    offsets.push(cursor);
    const entry = `${index + 1} 0 obj\n${object}\nendobj\n`;
    body += entry;
    cursor += Buffer.byteLength(entry, "latin1");
  });

  const xrefOffset = cursor;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
  ].join("\n");
  const trailer = `\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(`${header}${body}${xref}${trailer}`, "latin1");
}

function chunkRows(rows: ReportRow[], size: number) {
  if (!rows.length) return [[]];

  const chunks: ReportRow[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

function text(x: number, y: number, size: number, value: string) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function line(x1: number, y1: number, x2: number, y2: number) {
  return `0.6 w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function escapePdfText(value: string) {
  return sanitizePdfText(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function sanitizePdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function truncate(value: string, maxLength: number) {
  const sanitized = sanitizePdfText(value);
  return sanitized.length > maxLength ? `${sanitized.slice(0, maxLength - 3)}...` : sanitized;
}

function formatStatus(status: TestSessionStatus) {
  const labels: Record<TestSessionStatus, string> = {
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
    IN_PROGRESS: "En progreso",
  };

  return labels[status];
}

function formatModelName(value: string) {
  const labels: Record<string, string> = {
    decision_tree: "Arbol de decision",
    knn: "KNN",
    logistic_regression: "Regresion logistica",
    random_forest: "Random Forest",
    svm: "SVM",
  };

  return labels[value] ?? value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
