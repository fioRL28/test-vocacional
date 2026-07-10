"use server";

import { redirect } from "next/navigation";
import {
  codificarRespuestas,
  procesarRespuestaEnviada,
  seleccionarSiguientePregunta,
} from "@/lib/vocational/engine";
import {
  crearSesionDeTest,
  finalizarSesion,
  persistirRespuesta,
  persistirProgresoSesion,
  sembrarCatalogoVocacional,
  sincronizarRespuestasPersistidas,
} from "@/backend/vocational/persistence";
import type { Answer, SearchParams } from "@/lib/vocational/types";

let catalogReady = false;

async function asegurarCatalogoListo() {
  if (catalogReady) return;

  await sembrarCatalogoVocacional();
  catalogReady = true;
}

function convertirFormDataAParametrosBusqueda(formData: FormData): SearchParams {
  const params: SearchParams = {};

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      params[key] = value;
    }
  });

  return params;
}

export async function enviarRespuestaVocacional(formData: FormData) {
  const searchParams = convertirFormDataAParametrosBusqueda(formData);
  const comment = formData.get("comment");

  if (typeof comment === "string") {
    const trimmedComment = comment.trim();
    searchParams.comment = trimmedComment || undefined;
  }

  const previousAnswers = procesarRespuestaEnviada({
    state: String(formData.get("state") ?? ""),
  });
  const answers = procesarRespuestaEnviada(searchParams);
  const newAnswer = answers.at(-1);
  let sessionId = String(formData.get("sessionId") ?? "");

  await asegurarCatalogoListo();

  if (!sessionId) {
    sessionId = await crearSesionDeTest();
  }

  const previousAnswerAtPosition = newAnswer
    ? previousAnswers.find((answer) => answer.questionId === newAnswer.questionId)
    : undefined;
  const answerChanged =
    newAnswer &&
    JSON.stringify(previousAnswerAtPosition) !== JSON.stringify(newAnswer);

  if (newAnswer) {
    await sincronizarRespuestasPersistidas(sessionId, answers);
  }

  if (newAnswer && (answers.length > previousAnswers.length || answerChanged)) {
    await persistirRespuesta(sessionId, newAnswer as Answer);
  }

  await persistirProgresoSesion(sessionId, answers);

  const nextQuestion = seleccionarSiguientePregunta(answers);
  const isFinished = !nextQuestion;

  if (isFinished) {
    await finalizarSesion(sessionId, answers);
  }

  const state = codificarRespuestas(answers);
  redirect(`/test?sessionId=${sessionId}&state=${state}`);
}

