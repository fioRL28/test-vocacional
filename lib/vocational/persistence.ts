import { prisma } from "@/lib/prisma";
import {
  dimensionLabels,
  profiles,
  questions,
} from "./data";
import {
  getBestProfile,
  getLikertAnswers,
  getOpenAnswers,
} from "./engine";
import type { Answer, Dimension, LikertAnswer, OpenAnswer } from "./types";

const stageMap = {
  exploracion: "EXPLORATION",
  profundizacion: "DEEPENING",
  contexto: "CONTEXT",
} as const;

const kindMap = {
  likert: "LIKERT",
  open: "OPEN",
} as const;

export async function seedVocationalCatalog() {
  const dimensions = Object.entries(dimensionLabels);

  for (const [code, name] of dimensions) {
    await prisma.dimension.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const dimensionRows = await prisma.dimension.findMany();
  const dimensionIdByCode = new Map(dimensionRows.map((dimension) => [dimension.code, dimension.id]));

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        text: question.text,
        kind: kindMap[question.kind],
        stage: stageMap[question.stage],
        trigger: question.trigger ?? null,
        dimensionId: question.dimension ? dimensionIdByCode.get(question.dimension) : null,
        isActive: true,
      },
      create: {
        id: question.id,
        text: question.text,
        kind: kindMap[question.kind],
        stage: stageMap[question.stage],
        trigger: question.trigger ?? null,
        dimensionId: question.dimension ? dimensionIdByCode.get(question.dimension) : null,
      },
    });
  }

  for (const profile of profiles) {
    const savedProfile = await prisma.vocationalProfile.upsert({
      where: { code: profile.id },
      update: {
        name: profile.name,
        description: profile.description,
      },
      create: {
        code: profile.id,
        name: profile.name,
        description: profile.description,
      },
    });

    for (const [dimensionCode, weight] of Object.entries(profile.dimensions)) {
      const dimensionId = dimensionIdByCode.get(dimensionCode);
      if (!dimensionId) continue;

      await prisma.profileDimension.upsert({
        where: {
          profileId_dimensionId: {
            profileId: savedProfile.id,
            dimensionId,
          },
        },
        update: { weight },
        create: {
          profileId: savedProfile.id,
          dimensionId,
          weight,
        },
      });
    }
  }
}

export async function createTestSession() {
  const sessionCount = await prisma.testSession.count({
    where: {
      isPilotData: true,
    },
  });
  const participantCode = `PILOT-${String(sessionCount + 1).padStart(4, "0")}`;
  const session = await prisma.testSession.create({
    data: {
      participantCode,
      status: "IN_PROGRESS",
    },
  });

  return session.id;
}

export async function persistAnswer(sessionId: string, answer: Answer) {
  if (answer.kind === "likert") {
    await persistLikertAnswer(sessionId, answer);
    return;
  }

  await persistOpenAnswer(sessionId, answer);
}

async function persistLikertAnswer(sessionId: string, answer: LikertAnswer) {
  await prisma.testAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId: answer.questionId,
      },
    },
    update: {
      answerValue: answer.value,
      questionOrder: answer.order,
    },
    create: {
      sessionId,
      questionId: answer.questionId,
      answerValue: answer.value,
      questionOrder: answer.order,
    },
  });

  await updateDimensionScore(sessionId, answer.dimension);
}

async function persistOpenAnswer(sessionId: string, answer: OpenAnswer) {
  await prisma.testOpenAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId: answer.questionId,
      },
    },
    update: {
      trigger: answer.trigger,
      answerText: answer.text,
      order: answer.order,
    },
    create: {
      sessionId,
      questionId: answer.questionId,
      trigger: answer.trigger,
      answerText: answer.text,
      order: answer.order,
    },
  });
}

async function updateDimensionScore(sessionId: string, dimensionCode: Dimension) {
  const dimension = await prisma.dimension.findUnique({
    where: { code: dimensionCode },
  });

  if (!dimension) return;

  const answers = await prisma.testAnswer.findMany({
    where: {
      sessionId,
      question: {
        dimensionId: dimension.id,
      },
    },
  });

  const score = answers.reduce((total, answer) => total + answer.answerValue, 0);
  const questionsAnswered = answers.length;
  const averageScore = questionsAnswered ? score / questionsAnswered : 0;

  await prisma.sessionDimensionScore.upsert({
    where: {
      sessionId_dimensionId: {
        sessionId,
        dimensionId: dimension.id,
      },
    },
    update: {
      score,
      questionsAnswered,
      averageScore,
    },
    create: {
      sessionId,
      dimensionId: dimension.id,
      score,
      questionsAnswered,
      averageScore,
    },
  });
}

export async function persistSessionProgress(sessionId: string, answers: Answer[]) {
  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      totalQuestions: answers.length,
    },
  });
}

export async function finalizeSession(sessionId: string, answers: Answer[]) {
  const result = getBestProfile(answers);
  const profile = await prisma.vocationalProfile.findUnique({
    where: { code: result.best.id },
  });

  if (!profile) return;

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      finishedAt: new Date(),
      totalQuestions: answers.length,
      finalProfileId: profile.id,
    },
  });

  await prisma.testResult.upsert({
    where: { sessionId },
    update: {
      predictedProfileId: profile.id,
      confidenceScore: result.confidence,
      recommendationText: result.best.description,
      modelUsed: "rules-riasec-big-five-v1",
    },
    create: {
      sessionId,
      predictedProfileId: profile.id,
      confidenceScore: result.confidence,
      recommendationText: result.best.description,
      modelUsed: "rules-riasec-big-five-v1",
    },
  });
}

export function getDatasetRowFromAnswers(sessionId: string, answers: Answer[]) {
  const result = getBestProfile(answers);
  const likertAnswers = getLikertAnswers(answers);
  const openAnswers = getOpenAnswers(answers);

  return {
    sessionId,
    likertAnswers,
    openAnswers,
    predictedProfile: result.best.id,
    confidence: result.confidence,
  };
}
