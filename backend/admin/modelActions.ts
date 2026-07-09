"use server";

import { revalidatePath } from "next/cache";
import { requerirAdminActual } from "@/backend/admin/auth";
import { prisma } from "@/backend/db/prisma";
import { obtenerResumenEntrenamientoMl } from "@/backend/admin/mlArtifacts";

export async function crearSnapshotDataset() {
  await requerirAdminActual();
  const training = await obtenerResumenEntrenamientoMl();
  const version = `snapshot-${new Date().toISOString().slice(0, 10)}-${Date.now()}`;

  await prisma.mlDatasetSnapshot.create({
    data: {
      labelPolicy: "anonymous-vocational-profile",
      notes: `Snapshot anónimo. Reales: ${training.realRows}. Sintéticos: ${training.syntheticRows}.`,
      rowCount: training.datasetRows,
      source: "data.csv",
      version,
    },
  });

  revalidatePath("/admin/dataset");
  revalidatePath("/admin/modelos");
}

export async function registrarEntrenamientoDesdeArtefactos() {
  await requerirAdminActual();
  const training = await obtenerResumenEntrenamientoMl();
  const version = `experimental-100-${Date.now()}`;
  const snapshot = await prisma.mlDatasetSnapshot.create({
    data: {
      labelPolicy: "main_profile_code",
      notes: `Entrenamiento registrado desde artefactos locales. Split: ${training.trainTestSplit}.`,
      rowCount: training.datasetRows,
      source: "ml/data/processed/vocational_experimental_100_dataset.csv",
      version,
    },
  });

  for (const metric of training.metrics) {
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
