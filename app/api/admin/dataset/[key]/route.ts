import { obtenerAdminActual } from "@/backend/admin/auth";
import { obtenerCsvDataset, type CsvDatasetKey } from "@/backend/admin/datasets";

const allowedKeys = new Set(["actual", "inicial"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const { key } = await params;
  if (!allowedKeys.has(key)) {
    return new Response("Dataset no encontrado", { status: 404 });
  }

  const dataset = await obtenerCsvDataset(key as CsvDatasetKey);

  return new Response(`\uFEFF${dataset.content}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${dataset.fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
