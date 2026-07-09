import { obtenerAdminActual } from "@/backend/admin/auth";
import { generarCsvResultados, obtenerFiltrosReporte } from "@/backend/admin/reports";

export async function GET(request: Request) {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const csv = await generarCsvResultados(
    obtenerFiltrosReporte(new URL(request.url).searchParams),
  );

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": 'attachment; filename="rutafuturo-resultados.xls"',
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    },
  });
}
