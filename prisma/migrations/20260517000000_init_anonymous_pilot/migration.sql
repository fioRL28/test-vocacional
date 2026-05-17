-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TestSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuestionStage" AS ENUM ('EXPLORATION', 'DEEPENING', 'CONTEXT');

-- CreateEnum
CREATE TYPE "QuestionKind" AS ENUM ('LIKERT', 'OPEN');

-- CreateTable
CREATE TABLE "dimensions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "kind" "QuestionKind" NOT NULL DEFAULT 'LIKERT',
    "stage" "QuestionStage" NOT NULL DEFAULT 'EXPLORATION',
    "trigger" VARCHAR(80),
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dimensionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocational_profiles" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,

    CONSTRAINT "vocational_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_dimensions" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "dimensionId" INTEGER NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,

    CONSTRAINT "profile_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" UUID NOT NULL,
    "participantCode" VARCHAR(80),
    "grade" VARCHAR(50),
    "schoolCode" VARCHAR(80),
    "ageRange" VARCHAR(20),
    "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isPilotData" BOOLEAN NOT NULL DEFAULT true,
    "status" "TestSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "finalProfileId" INTEGER,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_answers" (
    "id" SERIAL NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerValue" INTEGER NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_open_answers" (
    "id" SERIAL NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionId" INTEGER NOT NULL,
    "trigger" VARCHAR(80) NOT NULL,
    "answerText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_open_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_dimension_scores" (
    "id" SERIAL NOT NULL,
    "sessionId" UUID NOT NULL,
    "dimensionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DECIMAL(4,2) NOT NULL DEFAULT 0,

    CONSTRAINT "session_dimension_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" SERIAL NOT NULL,
    "sessionId" UUID NOT NULL,
    "predictedProfileId" INTEGER NOT NULL,
    "confidenceScore" DECIMAL(5,2),
    "recommendationText" TEXT,
    "modelUsed" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_experiments" (
    "id" SERIAL NOT NULL,
    "modelName" VARCHAR(100) NOT NULL,
    "datasetVersion" VARCHAR(80) NOT NULL,
    "accuracy" DECIMAL(6,4) NOT NULL,
    "precision" DECIMAL(6,4) NOT NULL,
    "recall" DECIMAL(6,4) NOT NULL,
    "f1Score" DECIMAL(6,4) NOT NULL,
    "confusionMatrix" JSONB NOT NULL,
    "artifactPath" VARCHAR(255),
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_experiments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dimensions_code_key" ON "dimensions"("code");

-- CreateIndex
CREATE INDEX "questions_dimensionId_idx" ON "questions"("dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "vocational_profiles_code_key" ON "vocational_profiles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "profile_dimensions_profileId_dimensionId_key" ON "profile_dimensions"("profileId", "dimensionId");

-- CreateIndex
CREATE INDEX "test_sessions_status_idx" ON "test_sessions"("status");

-- CreateIndex
CREATE INDEX "test_sessions_participantCode_idx" ON "test_sessions"("participantCode");

-- CreateIndex
CREATE INDEX "test_sessions_isPilotData_idx" ON "test_sessions"("isPilotData");

-- CreateIndex
CREATE INDEX "test_answers_questionId_idx" ON "test_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_answers_sessionId_questionId_key" ON "test_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_answers_sessionId_questionOrder_key" ON "test_answers"("sessionId", "questionOrder");

-- CreateIndex
CREATE INDEX "test_open_answers_questionId_idx" ON "test_open_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_open_answers_sessionId_questionId_key" ON "test_open_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_open_answers_sessionId_order_key" ON "test_open_answers"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "session_dimension_scores_sessionId_dimensionId_key" ON "session_dimension_scores"("sessionId", "dimensionId");

-- CreateIndex
CREATE UNIQUE INDEX "test_results_sessionId_key" ON "test_results"("sessionId");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_dimensions" ADD CONSTRAINT "profile_dimensions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "vocational_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_dimensions" ADD CONSTRAINT "profile_dimensions_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_finalProfileId_fkey" FOREIGN KEY ("finalProfileId") REFERENCES "vocational_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_open_answers" ADD CONSTRAINT "test_open_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_open_answers" ADD CONSTRAINT "test_open_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_dimension_scores" ADD CONSTRAINT "session_dimension_scores_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_dimension_scores" ADD CONSTRAINT "session_dimension_scores_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_predictedProfileId_fkey" FOREIGN KEY ("predictedProfileId") REFERENCES "vocational_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
