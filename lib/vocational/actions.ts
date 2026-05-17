"use server";

import { redirect } from "next/navigation";
import { maxLikertQuestions } from "./data";
import {
  detectContradictions,
  encodeAnswers,
  getBestProfile,
  getLikertAnswers,
  processSubmittedAnswer,
  selectNextQuestion,
  shouldFinishTest,
} from "./engine";
import {
  createTestSession,
  finalizeSession,
  persistAnswer,
  persistSessionProgress,
  seedVocationalCatalog,
} from "./persistence";
import type { Answer, SearchParams } from "./types";

let catalogReady = false;

async function ensureCatalogReady() {
  if (catalogReady) return;

  await seedVocationalCatalog();
  catalogReady = true;
}

function formDataToSearchParams(formData: FormData): SearchParams {
  const params: SearchParams = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      params[key] = value;
    }
  });

  return params;
}

export async function submitVocationalAnswer(formData: FormData) {
  const searchParams = formDataToSearchParams(formData);
  const comment = formData.get("comment");

  if (typeof comment === "string") {
    const trimmedComment = comment.trim();
    searchParams.comment = trimmedComment || undefined;
  }

  const previousAnswers = processSubmittedAnswer({
    state: String(formData.get("state") ?? ""),
  });
  const answers = processSubmittedAnswer(searchParams);
  const newAnswer = answers.at(-1);
  let sessionId = String(formData.get("sessionId") ?? "");

  await ensureCatalogReady();

  if (!sessionId) {
    sessionId = await createTestSession();
  }

  const previousAnswerAtPosition = newAnswer
    ? previousAnswers.find((answer) => answer.questionId === newAnswer.questionId)
    : undefined;
  const answerChanged =
    newAnswer &&
    JSON.stringify(previousAnswerAtPosition) !== JSON.stringify(newAnswer);

  if (newAnswer && (answers.length > previousAnswers.length || answerChanged)) {
    await persistAnswer(sessionId, newAnswer as Answer);
  }

  await persistSessionProgress(sessionId, answers);

  const nextQuestion = selectNextQuestion(answers);
  const result = getBestProfile(answers);
  const contradictions = detectContradictions(result.averages, answers);
  const likertCount = getLikertAnswers(answers).length;
  const canFinishAdaptively = shouldFinishTest(
    answers,
    result.averages,
    result.ranked,
    contradictions,
  );
  const isFinished =
    !nextQuestion ||
    likertCount >= maxLikertQuestions ||
    canFinishAdaptively;

  if (isFinished) {
    await finalizeSession(sessionId, answers);
  }

  const state = encodeAnswers(answers);
  redirect(`/?sessionId=${sessionId}&state=${state}`);
}
