import { prisma } from "@/backend/db/prisma";
import {
  cerrarSesionAdministrador,
  requerirAdminActual,
} from "@/backend/admin/auth";
import { obtenerResumenEntrenamientoMl } from "@/backend/admin/mlArtifacts";
import { AdminDashboard, type AdminDashboardData } from "@/frontend/admin/AdminDashboard";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string | string[] }>;
}) {
  const currentAdmin = await requerirAdminActual();
  const params = await searchParams;
  const rangeDays = parseRangeDays(first(params.rango));
  const data = await obtenerDatosDashboardAdmin(rangeDays);

  return (
    <AdminDashboard
      currentAdmin={currentAdmin}
      data={data}
      logoutAction={cerrarSesionAdministrador}
    />
  );
}

async function obtenerDatosDashboardAdmin(rangeDays: number): Promise<AdminDashboardData> {
  const today = startOfDay(new Date());
  const days = Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(today.getTime() - (rangeDays - 1 - index) * DAY_MS);
    return {
      date,
      key: date.toISOString().slice(0, 10),
      label: formatShortDate(date),
    };
  });
  const rangeStart = days[0].date;
  const rangeEnd = new Date(today.getTime() + DAY_MS);

  const [
    totalSessions,
    completedSessions,
    generatedPredictions,
    weeklySessions,
    weeklyCompleted,
    profileRows,
    recentSessions,
    latestExperiment,
    datasetRows,
    activeQuestions,
    adminUsers,
    trainingSummary,
  ] = await Promise.all([
    prisma.testSession.count(),
    prisma.testSession.count({ where: { status: "COMPLETED" } }),
    prisma.testResult.count(),
    prisma.testSession.findMany({
      where: { startedAt: { gte: rangeStart, lt: rangeEnd } },
      select: { startedAt: true },
    }),
    prisma.testSession.findMany({
      where: {
        status: "COMPLETED",
        finishedAt: { gte: rangeStart, lt: rangeEnd },
      },
      select: { finishedAt: true },
    }),
    prisma.testResult.groupBy({
      by: ["predictedProfileId"],
      _count: { _all: true },
      orderBy: { _count: { predictedProfileId: "desc" } },
    }),
    prisma.testSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 6,
      select: {
        id: true,
        participantCode: true,
        startedAt: true,
        status: true,
        totalQuestions: true,
        finalProfile: {
          select: { name: true },
        },
        result: {
          select: {
            predictedProfile: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.mlExperiment.findFirst({
      orderBy: { trainedAt: "desc" },
      include: {
        datasetSnapshot: {
          select: { rowCount: true, version: true },
        },
      },
    }),
    prisma.mlTrainingFeature.count(),
    prisma.question.count({ where: { isActive: true } }),
    prisma.adminUser.count(),
    obtenerResumenEntrenamientoMl(),
  ]);

  const profiles = await prisma.vocationalProfile.findMany({
    where: {
      id: { in: profileRows.map((row) => row.predictedProfileId) },
    },
    select: { id: true, name: true },
  });
  const profileNameById = new Map(profiles.map((profile) => [profile.id, profile.name]));
  const totalProfileResults = profileRows.reduce((total, row) => total + row._count._all, 0);
  const bestModel = trainingSummary.bestModel;
  const modelAccuracy = bestModel
    ? Math.round(bestModel.accuracy * 1000) / 10
    : latestExperiment
      ? Math.round(Number(latestExperiment.accuracy) * 1000) / 10
      : 0;

  return {
    generatedAt: formatDateTime(new Date()),
    dateRange:
      rangeDays === 1
        ? days[0].label
        : `${days[0].label} - ${days.at(-1)?.label ?? days[0].label}`,
    summary: {
      activeQuestions,
      adminUsers,
      anonymousSessions: totalSessions,
      completedTests: completedSessions,
      datasetRecords: trainingSummary.datasetRows || latestExperiment?.datasetSnapshot?.rowCount || datasetRows,
      modelAccuracy,
      generatedPredictions,
    },
    activity: days.map((day) => ({
      label: day.label,
      sessions: weeklySessions.filter((session) => isSameDay(session.startedAt, day.date)).length,
      completed: weeklyCompleted.filter((session) => session.finishedAt && isSameDay(session.finishedAt, day.date)).length,
    })),
    profileDistribution: profileRows.slice(0, 6).map((row) => ({
      label: profileNameById.get(row.predictedProfileId) ?? "Perfil sin etiqueta",
      value: row._count._all,
      percent: totalProfileResults ? Math.round((row._count._all / totalProfileResults) * 1000) / 10 : 0,
    })),
    model: {
      accuracy: bestModel ? Math.round(bestModel.accuracy * 1000) / 10 : latestExperiment ? Math.round(Number(latestExperiment.accuracy) * 1000) / 10 : 0,
      datasetRows: trainingSummary.datasetRows || latestExperiment?.datasetSnapshot?.rowCount || datasetRows,
      f1Score: bestModel ? Math.round(bestModel.f1Score * 1000) / 10 : latestExperiment ? Math.round(Number(latestExperiment.f1Score) * 1000) / 10 : 0,
      features: trainingSummary.features || activeQuestions,
      lastTraining: trainingSummary.lastTraining ? formatDateTime(trainingSummary.lastTraining) : latestExperiment ? formatDateTime(latestExperiment.trainedAt) : "Sin entrenamiento registrado",
      metrics: trainingSummary.metrics.map((metric) => ({
        accuracy: Math.round(metric.accuracy * 1000) / 10,
        f1Score: Math.round(metric.f1Score * 1000) / 10,
        modelName: formatModelName(metric.modelName),
        precision: Math.round(metric.precision * 1000) / 10,
        recall: Math.round(metric.recall * 1000) / 10,
      })),
      name: bestModel ? formatModelName(bestModel.modelName) : latestExperiment?.modelName ?? "Reglas adaptativas",
      precision: bestModel ? Math.round(bestModel.precision * 1000) / 10 : latestExperiment ? Math.round(Number(latestExperiment.precision) * 1000) / 10 : 0,
      realRows: trainingSummary.realRows,
      recall: bestModel ? Math.round(bestModel.recall * 1000) / 10 : latestExperiment ? Math.round(Number(latestExperiment.recall) * 1000) / 10 : 0,
      syntheticRows: trainingSummary.syntheticRows,
      syntheticShare: trainingSummary.syntheticShare,
      trainTestSplit: trainingSummary.trainTestSplit,
      version: latestExperiment?.datasetVersion ?? latestExperiment?.datasetSnapshot?.version ?? "experimental-100",
    },
    recentSessions: recentSessions.map((session) => ({
      id: session.participantCode ?? `RF-${session.id.slice(0, 5).toUpperCase()}`,
      status: formatStatus(session.status),
      suggestedProfile: session.result?.predictedProfile.name ?? session.finalProfile?.name ?? null,
      questions: session.totalQuestions,
      date: formatDateTime(session.startedAt),
    })),
    alerts: [
      {
        tone: "success",
        title: "Privacidad activa",
        detail: "El seguimiento se mantiene con sesiones anonimas y sin datos personales.",
      },
      {
        tone: totalProfileResults < 30 ? "warning" : "info",
        title: totalProfileResults < 30 ? "Dataset en crecimiento" : "Dataset actualizado",
        detail: `${totalProfileResults} predicciones disponibles para revisar distribucion vocacional.`,
      },
      {
        tone: bestModel || latestExperiment ? "info" : "warning",
        title: "Entrenamiento registrado",
        detail: bestModel || latestExperiment
          ? `${bestModel ? formatModelName(bestModel.modelName) : "Motor adaptativo"} listo para monitoreo administrativo.`
          : "Aun no hay entrenamiento ML registrado para monitorear.",
      },
    ],
  };
}

function formatModelName(value: string) {
  const labels: Record<string, string> = {
    decision_tree: "Árbol de decisión",
    knn: "KNN",
    logistic_regression: "Regresión logística",
    random_forest: "Random Forest",
    svm: "SVM",
  };

  return labels[value] ?? value;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(left: Date, right: Date) {
  return left.toISOString().slice(0, 10) === right.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: "Completado",
    IN_PROGRESS: "En progreso",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseRangeDays(value: string | undefined) {
  if (value === "1") return 1;
  if (value === "30") return 30;

  return 7;
}
