"use server";

import { revalidatePath } from "next/cache";
import { requerirAdminActual } from "@/backend/admin/auth";
import { obtenerResumenDatasetCsv } from "@/backend/admin/datasets";
import { prisma } from "@/backend/db/prisma";
import { obtenerResumenEntrenamientoMl } from "@/backend/admin/mlArtifacts";

async function obtenerDatasetActualParaModelo() {
  const [training, datasets] = await Promise.all([
    obtenerResumenEntrenamientoMl(),
    obtenerResumenDatasetCsv(),
  ]);
  const datasetActual = datasets[0];
  const rowCount = datasetActual?.statusSummary.totalRows ?? training.datasetRows;

  return {
    fileName: datasetActual?.fileName ?? "data_test.csv",
    incompleteRows: datasetActual?.statusSummary.incompleteRows ?? 0,
    rowCount,
    training,
    validRows: datasetActual?.statusSummary.validRows ?? rowCount,
  };
}

export async function crearSnapshotDataset() {
  await requerirAdminActual();
  const dataset = await obtenerDatasetActualParaModelo();
  const version = `snapshot-${new Date().toISOString().slice(0, 10)}-${Date.now()}`;

  await prisma.mlDatasetSnapshot.create({
    data: {
      labelPolicy: "anonymous-vocational-profile",
      notes: `Snapshot anonimo. Completos: ${dataset.validRows}. Incompletos: ${dataset.incompleteRows}.`,
      rowCount: dataset.rowCount,
      source: dataset.fileName,
      version,
    },
  });

  revalidatePath("/admin/dataset");
  revalidatePath("/admin/modelos");
}

export async function registrarEntrenamientoDesdeArtefactos() {
  await requerirAdminActual();
  const dataset = await obtenerDatasetActualParaModelo();
  const version = `experimental-100-${Date.now()}`;
  const snapshot = await prisma.mlDatasetSnapshot.create({
    data: {
      labelPolicy: "main_profile_code",
      notes: `Entrenamiento registrado desde artefactos locales. Dataset actual: ${dataset.rowCount} registros. Split: ${dataset.training.trainTestSplit}.`,
      rowCount: dataset.rowCount,
      source: dataset.fileName,
      version,
    },
  });

  for (const metric of dataset.training.metrics) {
    await prisma.mlExperiment.create({
      data: {
        accuracy: metric.accuracy,
        confusionMatrix: {},
        datasetSnapshotId: snapshot.id,
        datasetVersion: version,
        f1Score: metric.f1Score,
        modelName: metric.modelName,
        precision: metric.precision,
        recall: metric.recall,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/modelos");
}
