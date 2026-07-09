import { obtenerAdminActual } from "@/backend/admin/auth";
import { generarCsvSesiones } from "@/backend/admin/reports";

export async function GET() {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const csv = await generarCsvSesiones();

  return csvResponse(csv, "rutafuturo-sesiones.csv");
}

function csvResponse(content: string, fileName: string) {
  return new Response(`\uFEFF${content}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
