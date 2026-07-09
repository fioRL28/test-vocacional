import {
  actualizarPregunta,
  cambiarEstadoPregunta,
  crearPregunta,
} from "@/backend/admin/questions";
import { cerrarSesionAdministrador, requerirAdminActual } from "@/backend/admin/auth";
import { prisma } from "@/backend/db/prisma";
import { AdminPageHeader, AdminShell } from "@/frontend/admin/AdminShell";
import { QuestionBankTable } from "@/frontend/admin/QuestionBankTable";

export const dynamic = "force-dynamic";

const stageLabels: Record<string, string> = {
  CONTEXT: "Contexto",
  DEEPENING: "Profundizacion",
  EXPLORATION: "Exploracion",
};

export default async function PreguntasPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string | string[] }>;
}) {
  const currentAdmin = await requerirAdminActual();
  const params = await searchParams;
  const initialEditingQuestionId = Number(obtenerPrimerValor(params.editar));

  const [questions, dimensions] = await Promise.all([
    prisma.question.findMany({
      include: {
        dimension: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prisma.dimension.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminShell
      active="Banco de preguntas"
      currentAdmin={currentAdmin}
      logoutAction={cerrarSesionAdministrador}
    >
      <AdminPageHeader title="Banco de preguntas" />

      <QuestionBankTable
        key={Number.isInteger(initialEditingQuestionId) ? initialEditingQuestionId : "new"}
        createAction={crearPregunta}
        dimensions={dimensions.map((dimension) => ({
          id: dimension.id,
          name: dimension.name,
        }))}
        questions={questions.map((question) => ({
          dimensionCode: question.dimension?.code ?? null,
          dimensionId: question.dimensionId,
          dimensionName: question.dimension?.name ?? null,
          id: question.id,
          isActive: question.isActive,
          kind: question.kind,
          stage: question.stage,
          text: question.text,
        }))}
        stageLabels={stageLabels}
        toggleAction={cambiarEstadoPregunta}
        updateAction={actualizarPregunta}
        initialEditingQuestionId={
          Number.isInteger(initialEditingQuestionId)
            ? initialEditingQuestionId
            : undefined
        }
      />
    </AdminShell>
  );
}

function obtenerPrimerValor(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
