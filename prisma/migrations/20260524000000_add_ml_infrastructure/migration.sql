-- Add ML infrastructure tables for future dataset snapshots and feature exports.

ALTER TABLE "ml_experiments"
ADD COLUMN "datasetSnapshotId" INTEGER;

CREATE TABLE "ml_dataset_snapshots" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(80) NOT NULL,
    "source" VARCHAR(120) NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "featureSchema" JSONB,
    "labelPolicy" VARCHAR(120),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_dataset_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ml_training_features" (
    "id" SERIAL NOT NULL,
    "datasetSnapshotId" INTEGER NOT NULL,
    "sessionId" UUID,
    "featureVector" JSONB NOT NULL,
    "finalProfileName" VARCHAR(150),
    "careerReference" VARCHAR(150),
    "expectedFamily" VARCHAR(150),
    "expectedSubroute" VARCHAR(150),
    "observedMismatch" BOOLEAN NOT NULL DEFAULT false,
    "split" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_training_features_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ml_dataset_snapshots_version_key" ON "ml_dataset_snapshots"("version");
CREATE INDEX "ml_experiments_datasetSnapshotId_idx" ON "ml_experiments"("datasetSnapshotId");
CREATE INDEX "ml_training_features_datasetSnapshotId_idx" ON "ml_training_features"("datasetSnapshotId");
CREATE INDEX "ml_training_features_sessionId_idx" ON "ml_training_features"("sessionId");
CREATE INDEX "ml_training_features_observedMismatch_idx" ON "ml_training_features"("observedMismatch");

ALTER TABLE "ml_experiments"
ADD CONSTRAINT "ml_experiments_datasetSnapshotId_fkey"
FOREIGN KEY ("datasetSnapshotId") REFERENCES "ml_dataset_snapshots"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ml_training_features"
ADD CONSTRAINT "ml_training_features_datasetSnapshotId_fkey"
FOREIGN KEY ("datasetSnapshotId") REFERENCES "ml_dataset_snapshots"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
