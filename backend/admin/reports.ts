import { prisma } from "@/backend/db/prisma";
import type { Prisma, TestSessionStatus } from "@/backend/generated/prisma/client";

export type ReportFilters = {
  from?: string;
  model?: string;
  profile?: string;
  status?: string;
  to?: string;
};

export function obtenerFiltrosReporte(params: URLSearchParams): ReportFilters {
  return {
    from: params.get("from")?.trim() || undefined,
    model: params.get("model")?.trim() || undefined,
    profile: params.get("profile")?.trim() || undefined,
    status: params.get("status")?.trim() || undefined,
    to: params.get("to")?.trim() || undefined,
  };
}

export function construirWhereResultadosReporte(filters: ReportFilters) {
  const resultWhere: Prisma.TestResultWhereInput = {};
  const sessionWhere: Prisma.TestSessionWhereInput = {};

  if (filters.profile) {
    resultWhere.predictedProfile = { is: { code: filters.profile } };
  }

  if (filters.model) {
    resultWhere.modelUsed = filters.model;
  }

  if (isSessionStatus(filters.status)) {
    sessionWhere.status = filters.status;
  }

  const createdAt = dateRange<"TestResult">(filters.from, filters.to);
  if (createdAt) {
    resultWhere.createdAt = createdAt;
  }

  if (Object.keys(sessionWhere).length > 0) {
    resultWhere.session = { is: sessionWhere };
  }

  return resultWhere;
}

export function construirWhereSesionesReporte(filters: ReportFilters) {
  const sessionWhere: Prisma.TestSessionWhereInput = {};

  if (isSessionStatus(filters.status)) {
    sessionWhere.status = filters.status;
  }

  const sessionDate = dateRange<"TestSession">(filters.from, filters.to);
  if (sessionDate) {
    if (filters.status === "COMPLETED") {
      sessionWhere.finishedAt = sessionDate;
    } else {
      sessionWhere.startedAt = sessionDate;
    }
  }

  return sessionWhere;
}

export async function obtenerResultadosReporte(filters: ReportFilters, take = 50) {
  return prisma.testResult.findMany({
    where: construirWhereResultadosReporte(filters),
    orderBy: { createdAt: "desc" },
    take,
    include: {
      predictedProfile: true,
      session: true,
    },
  });
}

export async function generarCsvSesiones() {
  const sessions = await prisma.testSession.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      finalProfile: { select: { name: true } },
      result: {
        include: {
          predictedProfile: { select: { name: true } },
        },
      },
    },
  });

  return toCsv(
    [
      "id_anonimo",
      "estado",
      "inicio",
      "fin",
      "total_preguntas",
      "perfil_sugerido",
      "confianza",
      "modelo",
    ],
    sessions.map((session) => [
      session.participantCode ?? `RF-${session.id.slice(0, 8).toUpperCase()}`,
      session.status,
      session.startedAt.toISOString(),
      session.finishedAt?.toISOString() ?? "",
      session.totalQuestions,
      session.result?.predictedProfile.name ?? session.finalProfile?.name ?? "",
      session.result?.confidenceScore?.toString() ?? "",
      session.result?.modelUsed ?? "",
    ]),
  );
}

export async function generarCsvResultados(filters: ReportFilters = {}) {
  const results = await obtenerResultadosReporte(filters, 1000);

  return toCsv(
    [
      "id_anonimo",
      "fecha_sesion",
      "perfil_sugerido",
      "confianza",
      "claridad",
      "estabilidad",
      "modelo",
      "total_preguntas",
    ],
    results.map((result) => [
      result.session.participantCode ?? `RF-${result.sessionId.slice(0, 8).toUpperCase()}`,
      result.session.startedAt.toISOString(),
      result.predictedProfile.name,
      result.confidenceScore?.toString() ?? "",
      result.profileClarityScore?.toString() ?? "",
      result.resultStabilityScore?.toString() ?? "",
      result.modelUsed,
      result.session.totalQuestions,
    ]),
  );
}

export async function generarCsvModelos() {
  const experiments = await prisma.mlExperiment.findMany({
    orderBy: { trainedAt: "desc" },
    include: {
      datasetSnapshot: { select: { version: true, rowCount: true, source: true } },
    },
  });

  return toCsv(
    [
      "modelo",
      "version_dataset",
      "accuracy",
      "precision",
      "recall",
      "f1_score",
      "filas_dataset",
      "fuente_dataset",
      "entrenado_en",
    ],
    experiments.map((experiment) => [
      experiment.modelName,
      experiment.datasetVersion,
      experiment.accuracy.toString(),
      experiment.precision.toString(),
      experiment.recall.toString(),
      experiment.f1Score.toString(),
      experiment.datasetSnapshot?.rowCount ?? "",
      experiment.datasetSnapshot?.source ?? "",
      experiment.trainedAt.toISOString(),
    ]),
  );
}

export async function obtenerDatosModelosAdmin() {
  const [
    experiments,
    snapshots,
    featureCount,
    generatedResults,
    completedSessions,
    confidenceSummary,
    modelUsage,
  ] = await Promise.all([
    prisma.mlExperiment.findMany({
      orderBy: { trainedAt: "desc" },
      include: {
        datasetSnapshot: {
          select: {
            rowCount: true,
            source: true,
            version: true,
          },
        },
      },
    }),
    prisma.mlDatasetSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        createdAt: true,
        id: true,
        rowCount: true,
        source: true,
        version: true,
      },
    }),
    prisma.mlTrainingFeature.count(),
    prisma.testResult.count(),
    prisma.testSession.count({ where: { status: "COMPLETED" } }),
    prisma.testResult.aggregate({
      _avg: {
        confidenceScore: true,
      },
    }),
    prisma.testResult.groupBy({
      by: ["modelUsed"],
      _count: { _all: true },
      orderBy: { _count: { modelUsed: "desc" } },
    }),
  ]);

  return {
    experiments: experiments.map((experiment) => ({
      accuracy: Number(experiment.accuracy),
      datasetRows: experiment.datasetSnapshot?.rowCount ?? 0,
      datasetVersion: experiment.datasetVersion,
      f1Score: Number(experiment.f1Score),
      id: experiment.id,
      modelName: experiment.modelName,
      precision: Number(experiment.precision),
      recall: Number(experiment.recall),
      trainedAt: experiment.trainedAt,
    })),
    featureCount,
    liveUsage: {
      completedSessions,
      generatedResults,
      averageConfidence: Number(confidenceSummary._avg.confidenceScore ?? 0),
      modelUsage: modelUsage.map((item) => ({
        modelName: item.modelUsed,
        results: item._count._all,
      })),
    },
    snapshots,
  };
}

export function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");
}

function escapeCsvCell(value: string | number) {
  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function isSessionStatus(value: string | undefined): value is TestSessionStatus {
  return value === "COMPLETED" || value === "IN_PROGRESS" || value === "CANCELLED";
}

function dateRange<Model extends "TestResult" | "TestSession">(
  from?: string,
  to?: string,
): Prisma.DateTimeFilter<Model> | undefined {
  const range: Prisma.DateTimeFilter<Model> = {};

  if (from) {
    range.gte = new Date(`${from}T00:00:00.000-05:00`);
  }

  if (to) {
    range.lte = new Date(`${to}T23:59:59.999-05:00`);
  }

  return Object.keys(range).length > 0 ? range : undefined;
}
