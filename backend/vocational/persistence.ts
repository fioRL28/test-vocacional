import { prisma } from "@/backend/db/prisma";
import { randomUUID } from "crypto";
import {
  dimensionLabels,
  profiles,
  questions,
} from "@/lib/vocational/data";
import { Prisma } from "@/backend/generated/prisma/client";
import {
  obtenerMejorPerfil,
  obtenerRespuestasLikert,
  obtenerRespuestasAbiertas,
} from "@/lib/vocational/engine";
import type { Answer, Dimension, LikertAnswer, OpenAnswer } from "@/lib/vocational/types";

const stageMap = {
  exploracion: "EXPLORATION",
  profundizacion: "DEEPENING",
  contexto: "CONTEXT",
} as const;

const kindMap = {
  likert: "LIKERT",
  open: "OPEN",
} as const;

export async function sembrarCatalogoVocacional() {
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
        trigger: question.trigger ?? null,
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

export async function crearSesionDeTest() {
  const supportsAnonymousPilotFields = await existeColumnaSesionDeTest("participantCode");

  if (!supportsAnonymousPilotFields) {
    const sessionId = randomUUID();
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO test_sessions (id, status)
      VALUES (${sessionId}::uuid, 'IN_PROGRESS'::"TestSessionStatus")
      RETURNING id::text AS id
    `;

    return rows[0].id;
  }

  const sessionCount = await obtenerCantidadSesionesPiloto();
  const participantCode = `P${String(sessionCount + 1).padStart(3, "0")}`;
  const session = await prisma.testSession.create({
    data: {
      participantCode,
      status: "IN_PROGRESS",
    },
  });

  return session.id;
}

async function existeColumnaSesionDeTest(columnName: string) {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'test_sessions'
      AND column_name = ${columnName}
    LIMIT 1
  `;

  return rows.length > 0;
}

async function obtenerCantidadSesionesPiloto() {
  const hasPilotFlag = await existeColumnaSesionDeTest("isPilotData");

  if (!hasPilotFlag) {
    return prisma.testSession.count();
  }

  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM test_sessions
    WHERE "isPilotData" = true
  `;

  return Number(rows[0]?.count ?? 0);
}

export async function persistirRespuesta(sessionId: string, answer: Answer) {
  if (answer.kind === "likert") {
    await persistirRespuestaLikert(sessionId, answer);
    return;
  }

  await persistirRespuestaAbierta(sessionId, answer);
}

export async function sincronizarRespuestasPersistidas(sessionId: string, answers: Answer[]) {
  const questionIds = answers.map((answer) => answer.questionId);

  await prisma.testAnswer.deleteMany({
    where: {
      sessionId,
      ...(questionIds.length ? { questionId: { notIn: questionIds } } : {}),
    },
  });

  await prisma.testOpenAnswer.deleteMany({
    where: {
      sessionId,
      ...(questionIds.length ? { questionId: { notIn: questionIds } } : {}),
    },
  });
}

async function persistirRespuestaLikert(sessionId: string, answer: LikertAnswer) {
  await prisma.testAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId: answer.questionId,
      },
    },
    update: {
      answerValue: answer.value,
      comment: answer.comment ?? null,
      questionOrder: answer.order,
      suspiciousInput: answer.suspiciousInput ?? false,
      suspiciousReason: answer.suspiciousReason ?? null,
    },
    create: {
      sessionId,
      questionId: answer.questionId,
      answerValue: answer.value,
      comment: answer.comment ?? null,
      questionOrder: answer.order,
      suspiciousInput: answer.suspiciousInput ?? false,
      suspiciousReason: answer.suspiciousReason ?? null,
    },
  });

  await actualizarPuntajeDimension(sessionId, answer.dimension);
}

async function persistirRespuestaAbierta(sessionId: string, answer: OpenAnswer) {
  const selectedOption = obtenerOpcionForzadaPersistida(answer);

  await prisma.testOpenAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId: answer.questionId,
      },
    },
    update: {
      answerMode: mapearModoRespuestaAbierta(answer),
      trigger: answer.trigger,
      answerText: answer.text,
      order: answer.order,
      selectedOptionId: answer.selectedOptionId ?? null,
      selectedDimensionCode: selectedOption?.dimension ?? null,
      selectedSemanticFocus: selectedOption?.semanticFocus ?? Prisma.JsonNull,
      careerReference: answer.careerReference ?? null,
      observedMismatch: answer.observedMismatch ?? false,
      suspiciousInput: answer.suspiciousInput ?? false,
      suspiciousReason: answer.suspiciousReason ?? null,
    },
    create: {
      sessionId,
      questionId: answer.questionId,
      answerMode: mapearModoRespuestaAbierta(answer),
      trigger: answer.trigger,
      answerText: answer.text,
      order: answer.order,
      selectedOptionId: answer.selectedOptionId ?? null,
      selectedDimensionCode: selectedOption?.dimension ?? null,
      selectedSemanticFocus: selectedOption?.semanticFocus ?? Prisma.JsonNull,
      careerReference: answer.careerReference ?? null,
      observedMismatch: answer.observedMismatch ?? false,
      suspiciousInput: answer.suspiciousInput ?? false,
      suspiciousReason: answer.suspiciousReason ?? null,
    },
  });
}

function mapearModoRespuestaAbierta(answer: OpenAnswer) {
  if (answer.answerMode === "guided-option") return "FORCED_CHOICE";
  if (answer.answerMode === "unknown") return "GUIDED_REFLECTION";

  return "OPEN";
}

function obtenerOpcionForzadaPersistida(answer: OpenAnswer) {
  if (!answer.selectedOptionId) return null;

  const question = questions.find((item) => item.id === answer.questionId);

  return question?.forcedChoiceOptions?.find((option) => option.id === answer.selectedOptionId) ?? null;
}

async function actualizarPuntajeDimension(sessionId: string, dimensionCode: Dimension) {
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

export async function persistirProgresoSesion(sessionId: string, answers: Answer[]) {
  const supportsAnonymousPilotFields = await existeColumnaSesionDeTest("participantCode");

  if (!supportsAnonymousPilotFields) {
    await prisma.$executeRaw`
      UPDATE test_sessions
      SET "totalQuestions" = ${answers.length}
      WHERE id = ${sessionId}::uuid
    `;
    return;
  }

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      totalQuestions: answers.length,
    },
  });
}

export async function finalizarSesion(sessionId: string, answers: Answer[]) {
  const result = obtenerMejorPerfil(answers);
  const profile = await prisma.vocationalProfile.findUnique({
    where: { code: result.best.id },
  });

  if (!profile) return;

  const supportsAnonymousPilotFields = await existeColumnaSesionDeTest("participantCode");

  if (!supportsAnonymousPilotFields) {
    await prisma.$executeRaw`
      UPDATE test_sessions
      SET
        status = 'COMPLETED'::"TestSessionStatus",
        "finishedAt" = NOW(),
        "totalQuestions" = ${answers.length},
        "finalProfileId" = ${profile.id}
      WHERE id = ${sessionId}::uuid
    `;
  } else {
  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      finishedAt: new Date(),
      totalQuestions: answers.length,
      finalProfileId: profile.id,
    },
  });
  }

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

export function obtenerFilaDatasetDesdeRespuestas(sessionId: string, answers: Answer[]) {
  const result = obtenerMejorPerfil(answers);
  const likertAnswers = obtenerRespuestasLikert(answers);
  const openAnswers = obtenerRespuestasAbiertas(answers);

  return {
    sessionId,
    likertAnswers,
    openAnswers,
    predictedProfile: result.best.id,
    confidence: result.confidence,
    indicators: result.indicators,
    validationObservation: result.validationObservation,
  };
}

