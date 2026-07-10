/*
  Warnings:

  - Added the required column `updatedAt` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `test_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `test_open_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `test_results` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OpenAnswerMode" AS ENUM ('OPEN', 'FORCED_CHOICE', 'GUIDED_REFLECTION');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "contrastLabel" VARCHAR(150),
ADD COLUMN     "model" VARCHAR(80),
ADD COLUMN     "optionalComment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promptStyle" VARCHAR(80),
ADD COLUMN     "scaleType" VARCHAR(80),
ADD COLUMN     "semanticFocus" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "test_answers" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "suspiciousInput" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspiciousReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "test_open_answers" ADD COLUMN     "answerMode" "OpenAnswerMode" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "careerReference" VARCHAR(150),
ADD COLUMN     "observedMismatch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedDimensionCode" VARCHAR(80),
ADD COLUMN     "selectedOptionId" VARCHAR(120),
ADD COLUMN     "selectedSemanticFocus" JSONB,
ADD COLUMN     "suspiciousInput" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspiciousReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "test_results" ADD COLUMN     "profileClarityScore" DECIMAL(5,2),
ADD COLUMN     "resultPayload" JSONB,
ADD COLUMN     "resultStabilityScore" DECIMAL(5,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "test_sessions" ADD COLUMN     "adaptivePhase" VARCHAR(80),
ADD COLUMN     "broadInterestPattern" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "closingReason" VARCHAR(120),
ADD COLUMN     "consistencyScore" DECIMAL(5,2),
ADD COLUMN     "externalPressure" DECIMAL(5,2),
ADD COLUMN     "lowCoreConfidence" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileClarityScore" DECIMAL(5,2),
ADD COLUMN     "vocationalUncertainty" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "question_options" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionCode" VARCHAR(120) NOT NULL,
    "text" TEXT NOT NULL,
    "dimensionCode" VARCHAR(80),
    "semanticFocus" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex
CREATE INDEX "question_options_dimensionCode_idx" ON "question_options"("dimensionCode");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_questionId_optionCode_key" ON "question_options"("questionId", "optionCode");

-- CreateIndex
CREATE INDEX "questions_kind_idx" ON "questions"("kind");

-- CreateIndex
CREATE INDEX "questions_stage_idx" ON "questions"("stage");

-- CreateIndex
CREATE INDEX "questions_trigger_idx" ON "questions"("trigger");

-- CreateIndex
CREATE INDEX "test_answers_sessionId_idx" ON "test_answers"("sessionId");

-- CreateIndex
CREATE INDEX "test_open_answers_sessionId_idx" ON "test_open_answers"("sessionId");

-- CreateIndex
CREATE INDEX "test_open_answers_answerMode_idx" ON "test_open_answers"("answerMode");

-- CreateIndex
CREATE INDEX "test_open_answers_observedMismatch_idx" ON "test_open_answers"("observedMismatch");

-- CreateIndex
CREATE INDEX "test_sessions_closingReason_idx" ON "test_sessions"("closingReason");

-- CreateIndex
CREATE INDEX "test_sessions_broadInterestPattern_idx" ON "test_sessions"("broadInterestPattern");

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
