import { obtenerAdminActual } from "@/backend/admin/auth";
import { obtenerGraficoEntrenamiento } from "@/backend/admin/mlArtifacts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const admin = await obtenerAdminActual();
  if (!admin) return new Response("No autorizado", { status: 401 });

  const { name } = await params;
  const { searchParams } = new URL(request.url);
  const chart = await obtenerGraficoEntrenamiento(
    name,
    searchParams.get("modelo") ?? undefined,
  );
  if (!chart) return new Response("Gráfico no encontrado", { status: 404 });

  return new Response(chart.content, {
    headers: {
      "Content-Disposition": `inline; filename="${chart.fileName}"`,
      "Content-Type": chart.contentType,
    },
  });
}
