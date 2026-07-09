"use server";

import { revalidatePath } from "next/cache";
import { requerirAdminActual } from "@/backend/admin/auth";
import { prisma } from "@/backend/db/prisma";

const kindMap = {
  likert: "LIKERT",
  open: "OPEN",
} as const;

const stageMap = {
  contexto: "CONTEXT",
  exploracion: "EXPLORATION",
  profundizacion: "DEEPENING",
} as const;

const validKinds = ["LIKERT", "OPEN"] as const;
const validStages = ["EXPLORATION", "DEEPENING", "CONTEXT"] as const;

function normalizeKind(value: FormDataEntryValue | null) {
  const upperValue = String(value ?? "").toUpperCase();

  return validKinds.find((kind) => kind === upperValue) ?? null;
}

function normalizeStage(value: FormDataEntryValue | null) {
  const upperValue = String(value ?? "").toUpperCase();

  return validStages.find((stage) => stage === upperValue) ?? null;
}

export async function crearPregunta(formData: FormData): Promise<void> {
  await requerirAdminActual();

  const text = String(formData.get("text") ?? "").trim();
  const dimensionId = Number(formData.get("dimensionId"));
  const dimensionCode = String(formData.get("dimension") ?? "").trim();
  const kind = String(formData.get("kind") ?? "likert").toLowerCase() as keyof typeof kindMap;
  const rawStage = String(formData.get("stage") ?? "exploracion").toLowerCase();
  const stageAliases = {
    confirmation: "profundizacion",
    context: "contexto",
    deepening: "profundizacion",
    exploration: "exploracion",
  } as const;
  const stage = (stageAliases[rawStage as keyof typeof stageAliases] ?? rawStage) as keyof typeof stageMap;

  if (!text || !kindMap[kind] || !stageMap[stage]) {
    return;
  }

  const dimension = Number.isInteger(dimensionId)
    ? await prisma.dimension.findUnique({ where: { id: dimensionId } })
    : dimensionCode
    ? await prisma.dimension.findUnique({ where: { code: dimensionCode } })
    : null;

  await prisma.question.create({
    data: {
      dimensionId: dimension?.id ?? null,
      isActive: true,
      kind: kindMap[kind],
      stage: stageMap[stage],
      text,
    },
  });

  revalidatePath("/admin/preguntas");
}

export async function cambiarEstadoPregunta(formData: FormData) {
  await requerirAdminActual();

  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  if (!Number.isInteger(id)) return;

  await prisma.question.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/preguntas");
}

export async function actualizarPregunta(formData: FormData): Promise<void> {
  await requerirAdminActual();

  const id = Number(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim();
  const dimensionIdValue = String(formData.get("dimensionId") ?? "");
  const dimensionId = dimensionIdValue ? Number(dimensionIdValue) : null;
  const kind = normalizeKind(formData.get("kind"));
  const stage = normalizeStage(formData.get("stage"));
  const isActive = formData.get("isActive") === "true";

  if (
    !Number.isInteger(id) ||
    !text ||
    !kind ||
    !stage ||
    (dimensionId !== null && !Number.isInteger(dimensionId))
  ) {
    return;
  }

  await prisma.question.update({
    where: { id },
    data: {
      dimensionId,
      isActive,
      kind,
      stage,
      text,
    },
  });

  revalidatePath("/admin/preguntas");
}
