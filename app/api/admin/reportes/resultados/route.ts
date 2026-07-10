import { obtenerAdminActual } from "@/backend/admin/auth";
import { generarCsvResultados, obtenerFiltrosReporte } from "@/backend/admin/reports";

export async function GET(request: Request) {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const csv = await generarCsvResultados(
    obtenerFiltrosReporte(new URL(request.url).searchParams),
  );

  return csvResponse(csv, "rutafuturo-resultados.csv");
}

function csvResponse(content: string, fileName: string) {
  return new Response(`\uFEFF${content}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
