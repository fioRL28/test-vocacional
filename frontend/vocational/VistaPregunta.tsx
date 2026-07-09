"use client";

import Link from "next/link";
import { useState } from "react";
import { enviarRespuestaVocacional } from "@/backend/vocational/actions";
import type { Answer, ResponseScaleType, Question } from "@/lib/vocational/types";

const likertOptions = [
  {
    value: 1,
    icon: "😞",
    label: "Totalmente en desacuerdo",
    color: "from-[#ff7a7a] to-[#ff5d73]",
  },
  {
    value: 2,
    icon: "🙁",
    label: "En desacuerdo",
    color: "from-[#ffbd7a] to-[#ffa24c]",
  },
  {
    value: 3,
    icon: "😐",
    label: "Neutral",
    color: "from-[#ffe082] to-[#ffd24a]",
  },
  {
    value: 4,
    icon: "🙂",
    label: "De acuerdo",
    color: "from-[#b5e86b] to-[#82d94e]",
  },
  {
    value: 5,
    icon: "🤩",
    label: "Totalmente de acuerdo",
    color: "from-[#74df93] to-[#4fcf78]",
  },
];

const scaleLabels: Record<Exclude<ResponseScaleType, "forced_choice">, Record<number, string>> = {
  interest: {
    1: "No me interesaría",
    2: "Me interesaría poco",
    3: "Me interesaría algo",
    4: "Me interesaría bastante",
    5: "Me interesaría mucho",
  },
  frequency: {
    1: "Nunca o casi nunca",
    2: "Pocas veces",
    3: "A veces",
    4: "Casi siempre",
    5: "Siempre o casi siempre",
  },
  intensity: {
    1: "Nada",
    2: "Poco",
    3: "Moderadamente",
    4: "Bastante",
    5: "Mucho",
  },
};

const scaleAnchors: Record<Exclude<ResponseScaleType, "forced_choice">, { low: string; high: string }> = {
  interest: {
    low: "No me interesaría",
    high: "Me interesaría mucho",
  },
  frequency: {
    low: "Nunca o casi nunca",
    high: "Siempre o casi siempre",
  },
  intensity: {
    low: "Nada",
    high: "Mucho",
  },
};

export function VistaPregunta({
  answers,
  currentAnswer,
  currentQuestion,
  encodedState,
  isEditing,
  progress,
  questionNumber,
  sessionId,
  totalQuestions,
}: {
  answers: Answer[];
  currentAnswer?: Answer;
  currentQuestion: Question;
  encodedState: string;
  isEditing: boolean;
  progress: number;
  questionNumber: number;
  sessionId?: string;
  totalQuestions: number;
}) {
  const allowsOptionalComment = Boolean(currentQuestion.optionalComment);
  const isForcedChoiceQuestion = currentQuestion.scaleType === "forced_choice";
  const guidedChoices =
    isForcedChoiceQuestion
      ? []
      : currentQuestion.forcedChoiceOptions?.map((option) => option.text) ??
        currentQuestion.guidedOptions ??
        [];
  const hasGuidedOptions = guidedChoices.length > 0;
  const currentLikertAnswer =
    currentAnswer?.kind === "likert" ? currentAnswer : undefined;
  const currentOpenAnswer =
    currentAnswer?.kind === "open" ? currentAnswer : undefined;
  const previousAnswer = obtenerRespuestaAnterior(answers, currentQuestion.id);
  const canGoBack = Boolean(previousAnswer);
  const backHref = previousAnswer
    ? `/test?${new URLSearchParams({
        ...(sessionId ? { sessionId } : {}),
        state: encodedState,
        editQuestionId: String(previousAnswer.questionId),
      }).toString()}`
    : "/test";
  const navigationLabel = isEditing ? "Actualizar respuesta" : "Guardar respuesta";
  const questionIcon = currentQuestion.kind === "open" ? "💬" : "🛠️";
  const visibleQuestionNumber = Math.min(questionNumber, totalQuestions);
  const scaleType = obtenerTipoEscalaLikert(currentQuestion.scaleType);
  const currentLikertOptions = obtenerOpcionesLikert(scaleType);
  const anchors = scaleAnchors[scaleType];

  return (
    <div className="mx-auto max-w-5xl py-1">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-[#7c3aed]">
          <span>
            Pregunta {visibleQuestionNumber} de {totalQuestions}
          </span>
          <span>{progress}% completado</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f0eef8]">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid place-items-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-[#efe9ff] text-4xl shadow-inner sm:h-28 sm:w-28 sm:text-5xl">
          {questionIcon}
        </div>
      </div>

      <h2 className="mx-auto mt-6 max-w-3xl text-center text-xl font-bold leading-snug sm:text-2xl md:text-3xl">
        {currentQuestion.text}
      </h2>

      {currentQuestion.kind === "likert" && currentQuestion.dimension ? (
        <form
          action={enviarRespuestaVocacional}
          className="mt-7 sm:mt-9"
          suppressHydrationWarning
        >
          <input type="hidden" name="state" value={encodedState} />
          <input type="hidden" name="sessionId" value={sessionId ?? ""} />
          <input type="hidden" name="kind" value="likert" />
          <input type="hidden" name="questionId" value={currentQuestion.id} />
          {isEditing && (
            <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
          )}

          <p className="mb-4 text-center text-sm font-semibold text-[#6b7394]">
            {obtenerIndicacionEscala(scaleType)}
          </p>

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {currentLikertOptions.map((option) => (
              <button
                key={option.value}
                type="submit"
                name="value"
                value={option.value}
                className={`min-h-24 rounded-xl border bg-white px-1.5 py-3 text-center shadow-[0_10px_24px_rgba(83,67,160,0.08)] transition hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:shadow-[0_16px_34px_rgba(83,67,160,0.14)] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] sm:min-h-40 sm:px-4 sm:py-4 ${
                  currentLikertAnswer?.value === option.value
                    ? "border-[#8b5cf6] ring-2 ring-[#ddd0ff]"
                    : "border-[#ded9eb]"
                }`}
                aria-label={`${navigationLabel}: ${option.value}, ${option.label}`}
              >
                <span
                  className={`mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br text-xl shadow-sm sm:h-14 sm:w-14 sm:text-3xl ${option.color}`}
                >
                  {option.icon}
                </span>
                <span className="mt-2 block text-lg font-bold sm:mt-3 sm:text-xl">
                  {option.value}
                </span>
                <span className="mt-2 hidden min-h-10 text-sm font-medium leading-5 text-[#394267] sm:block">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden">
            <span className="text-left leading-5 text-[#ff5d73]">
              ← Totalmente en
              <span className="block">{anchors.low}</span>
            </span>
            <span className="text-right leading-5 text-[#28a65b]">
              {anchors.high}
              <span className="block">acuerdo →</span>
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 items-start gap-4 text-xs font-semibold sm:mt-7 sm:text-sm">
            <span className="text-left leading-5 text-[#ff5d73]">
              {"<-"} {anchors.low}
            </span>
            <span className="text-right leading-5 text-[#28a65b]">
              {anchors.high} {"->"}
            </span>
          </div>

          {allowsOptionalComment && (
            <textarea
              name="comment"
              rows={4}
              defaultValue={currentLikertAnswer?.comment ?? ""}
              className="mt-7 w-full rounded-xl border border-[#ded9eb] bg-white p-4 text-base outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
              placeholder="Si gustas, puedes explicar un poco tu respuesta."
            />
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {canGoBack ? (
              <Link
                href={backHref}
                className="inline-flex min-w-44 items-center justify-center rounded-lg border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                ← Anterior
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm font-semibold text-[#7c3aed]">
              Elige una opción para continuar
            </p>
          </div>
        </form>
      ) : isForcedChoiceQuestion ? (
        <VistaEleccionForzada
          backHref={backHref}
          canGoBack={canGoBack}
          currentAnswer={currentOpenAnswer}
          currentQuestion={currentQuestion}
          encodedState={encodedState}
          isEditing={isEditing}
          navigationLabel={navigationLabel}
          sessionId={sessionId}
        />
      ) : hasGuidedOptions ? (
        <VistaPreguntaAbiertaGuiada
          backHref={backHref}
          canGoBack={canGoBack}
          currentAnswer={currentOpenAnswer}
          currentQuestion={currentQuestion}
          encodedState={encodedState}
          guidedChoices={guidedChoices}
          isEditing={isEditing}
          navigationLabel={navigationLabel}
          sessionId={sessionId}
        />
      ) : (
        <form
          action={enviarRespuestaVocacional}
          className="mt-8"
          suppressHydrationWarning
        >
          <input type="hidden" name="state" value={encodedState} />
          <input type="hidden" name="sessionId" value={sessionId ?? ""} />
          <input type="hidden" name="kind" value="open" />
          <input type="hidden" name="questionId" value={currentQuestion.id} />
          {isEditing && (
            <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
          )}
          <textarea
            name="text"
            rows={7}
            defaultValue={currentOpenAnswer?.text ?? ""}
            className="w-full rounded-xl border border-[#ded9eb] bg-white p-4 text-base outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
            placeholder="Si quieres, puedes explicar un poco más."
          />
          {!hasGuidedOptions && currentQuestion.helperPrompts && (
            <div className="mt-4 rounded-xl border border-[#e4def5] bg-[#f7f3ff] p-4">
              <p className="text-sm font-bold text-[#7c3aed]">
                Si te sale responder “no sé”, puedes elegir una pista:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentQuestion.helperPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="submit"
                    name="text"
                    value={prompt}
                    className="rounded-full border border-[#ded9eb] bg-white px-3 py-2 text-sm font-medium text-[#394267] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {canGoBack && (
              <Link
                href={backHref}
                className="rounded-lg border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                ← Anterior
              </Link>
            )}
            <button
              type="submit"
              className="rounded-lg bg-[#7c3aed] px-6 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
            >
              {navigationLabel}
            </button>
            <button
              type="submit"
              name="text"
              value="Sin respuesta"
              className="rounded-lg border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Omitir
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function VistaPreguntaAbiertaGuiada({
  backHref,
  canGoBack,
  currentAnswer,
  currentQuestion,
  encodedState,
  guidedChoices,
  isEditing,
  navigationLabel,
  sessionId,
}: {
  backHref: string;
  canGoBack: boolean;
  currentAnswer?: Extract<Answer, { kind: "open" }>;
  currentQuestion: Question;
  encodedState: string;
  guidedChoices: string[];
  isEditing: boolean;
  navigationLabel: string;
  sessionId?: string;
}) {
  const doubtGuidedChoices = guidedChoices.filter((option) =>
    esOpcionGuiadaDeDuda(option, currentQuestion),
  );
  const mainChoices = guidedChoices.filter(
    (option) => !doubtGuidedChoices.includes(option),
  );
  const doubtChoices = Array.from(
    new Set([...(currentQuestion.unsureOptions ?? []), ...doubtGuidedChoices]),
  );
  const initialMode =
    currentAnswer?.answerMode === "typed-text"
      ? "write"
      : currentAnswer && doubtChoices.includes(currentAnswer.text)
        ? "doubt"
        : "options";
  const [mode, setMode] = useState<"options" | "doubt" | "write">(initialMode);

  return (
    <form
      action={enviarRespuestaVocacional}
      className="mt-8"
      suppressHydrationWarning
    >
      <input type="hidden" name="state" value={encodedState} />
      <input type="hidden" name="sessionId" value={sessionId ?? ""} />
      <input type="hidden" name="kind" value="open" />
      <input type="hidden" name="questionId" value={currentQuestion.id} />
      {isEditing && (
        <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
      )}

      {mode === "options" && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {mainChoices.map((option) => (
              <button
                key={option}
                type="submit"
                name="guidedChoice"
                value={option}
                className="min-h-20 rounded-xl border border-[#ded9eb] bg-white p-4 text-left text-sm font-semibold leading-6 text-[#273153] shadow-[0_10px_24px_rgba(83,67,160,0.08)] transition hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:bg-[#f8f5ff] hover:shadow-[0_16px_34px_rgba(83,67,160,0.14)] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#e4def5] bg-[#faf8ff] p-4">
            <p className="text-sm font-bold text-[#667096]">
              ¿No encuentras una opción clara?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("doubt")}
                className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                Me cuesta priorizar
              </button>
              <button
                type="button"
                onClick={() => setMode("write")}
                className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                Prefiero escribir mi respuesta
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "doubt" && (
        <div className="rounded-xl border border-[#e4def5] bg-[#f7f3ff] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#273153]">
              ¿Qué describe mejor tu dificultad para priorizar?
            </h3>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Volver a ver opciones
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {doubtChoices.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#ded9eb] bg-white px-3 py-3 text-sm font-medium text-[#394267]"
              >
                <input
                  type="radio"
                  name="guidedChoice"
                  value={option}
                  required
                  className="h-4 w-4 accent-[#7c3aed]"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {mode === "write" && (
        <div className="rounded-xl border border-[#e4def5] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor={`guided-open-text-${currentQuestion.id}`}
              className="text-base font-bold text-[#273153]"
            >
              Escribe tu respuesta
            </label>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Volver a ver opciones
            </button>
          </div>
          <textarea
            id={`guided-open-text-${currentQuestion.id}`}
            name="text"
            rows={5}
            required
            defaultValue={
              currentAnswer?.answerMode === "typed-text" ? currentAnswer.text : ""
            }
            className="mt-4 w-full rounded-xl border border-[#ded9eb] bg-white p-4 text-base outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {canGoBack && (
          <Link
            href={backHref}
            className="rounded-lg border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
          >
            ← Anterior
          </Link>
        )}
        {mode !== "options" && (
          <button
            type="submit"
            className="rounded-lg bg-[#7c3aed] px-6 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
          >
            {navigationLabel}
          </button>
        )}
      </div>
    </form>
  );
}

function VistaEleccionForzada({
  backHref,
  canGoBack,
  currentAnswer,
  currentQuestion,
  encodedState,
  isEditing,
  navigationLabel,
  sessionId,
}: {
  backHref: string;
  canGoBack: boolean;
  currentAnswer?: Extract<Answer, { kind: "open" }>;
  currentQuestion: Question;
  encodedState: string;
  isEditing: boolean;
  navigationLabel: string;
  sessionId?: string;
}) {
  const initialMode =
    currentAnswer?.selectedOptionId === "unknown"
      ? "unknown"
      : currentAnswer?.selectedOptionId === "write-own-answer"
        ? "write"
        : "options";
  const [mode, setMode] = useState<"options" | "unknown" | "write">(initialMode);
  const mainOptions =
    currentQuestion.forcedChoiceOptions?.filter(
      (option) => option.id !== "unknown" && option.id !== "write-own-answer",
    ) ?? [];

  return (
    <form
      action={enviarRespuestaVocacional}
      className="mt-8"
      suppressHydrationWarning
    >
      <input type="hidden" name="state" value={encodedState} />
      <input type="hidden" name="sessionId" value={sessionId ?? ""} />
      <input type="hidden" name="kind" value="open" />
      <input type="hidden" name="questionId" value={currentQuestion.id} />
      {isEditing && (
        <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
      )}

      {mode === "options" && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {mainOptions.map((option) => (
              <button
                key={option.id}
                type="submit"
                name="selectedOptionId"
                value={option.id}
                className="min-h-24 rounded-xl border border-[#ded9eb] bg-white p-4 text-left text-sm font-semibold leading-6 text-[#273153] shadow-[0_10px_24px_rgba(83,67,160,0.08)] transition hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:bg-[#f8f5ff] hover:shadow-[0_16px_34px_rgba(83,67,160,0.14)] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#e4def5] bg-[#faf8ff] p-4">
            <p className="text-sm font-bold text-[#667096]">
              ¿No encuentras una opción clara?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("unknown")}
                className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                No sé todavía
              </button>
              <button
                type="button"
                onClick={() => setMode("write")}
                className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
              >
                Prefiero escribir mi respuesta
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "unknown" && (
        <div className="rounded-xl border border-[#e4def5] bg-[#f7f3ff] p-5">
          <input type="hidden" name="selectedOptionId" value="unknown" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#273153]">
              ¿Qué describe mejor tu duda?
            </h3>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Volver a ver opciones
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(currentQuestion.unsureOptions ?? []).map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#ded9eb] bg-white px-3 py-3 text-sm font-medium text-[#394267]"
              >
                <input
                  type="radio"
                  name="unsureDetail"
                  value={option}
                  required
                  className="h-4 w-4 accent-[#7c3aed]"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {mode === "write" && (
        <div className="rounded-xl border border-[#e4def5] bg-white p-5">
          <input type="hidden" name="selectedOptionId" value="write-own-answer" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor={`forced-choice-text-${currentQuestion.id}`}
              className="text-base font-bold text-[#273153]"
            >
              Escribe tu respuesta
            </label>
            <button
              type="button"
              onClick={() => setMode("options")}
              className="rounded-lg border border-[#d7d2e7] bg-white px-4 py-2 text-sm font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Volver a ver opciones
            </button>
          </div>
          <textarea
            id={`forced-choice-text-${currentQuestion.id}`}
            name="text"
            rows={5}
            required
            defaultValue={
              currentAnswer?.selectedOptionId === "write-own-answer"
                ? currentAnswer.text
                : ""
            }
            className="mt-4 w-full rounded-xl border border-[#ded9eb] bg-white p-4 text-base outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {canGoBack && (
          <Link
            href={backHref}
            className="rounded-lg border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
          >
            ← Anterior
          </Link>
        )}
        {mode !== "options" && (
          <button
            type="submit"
            className="rounded-lg bg-[#7c3aed] px-6 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
          >
            {navigationLabel}
          </button>
        )}
      </div>
    </form>
  );
}

function obtenerRespuestaAnterior(answers: Answer[], currentQuestionId: number) {
  const currentIndex = answers.findIndex(
    (answer) => answer.questionId === currentQuestionId,
  );

  if (currentIndex > 0) {
    return answers[currentIndex - 1];
  }

  if (currentIndex === -1) {
    return answers.at(-1);
  }

  return undefined;
}

function esOpcionGuiadaDeDuda(option: string, question: Question) {
  if (question.id !== 105 && question.trigger !== "prioritization") {
    return false;
  }

  const normalized = option
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return [
    "me cuesta priorizar",
    "aun no puedo",
    "no puedo elegir",
    "me cuesta elegir",
    "varias opciones",
  ].some((pattern) => normalized.includes(pattern));
}

function obtenerOpcionesLikert(scaleType: Exclude<ResponseScaleType, "forced_choice">) {
  return likertOptions.map((option) => ({
    ...option,
    label: scaleLabels[scaleType][option.value],
  }));
}

function obtenerIndicacionEscala(scaleType: Exclude<ResponseScaleType, "forced_choice">) {
  const prompts: Record<Exclude<ResponseScaleType, "forced_choice">, string> = {
    interest: "Responde según cuánto te interesaría realizar esta actividad.",
    frequency: "Responde según la frecuencia con que esto suele ocurrirte.",
    intensity: "Responde según la intensidad con que esto aparece en tu decisión.",
  };

  return prompts[scaleType];
}

function obtenerTipoEscalaLikert(scaleType: Question["scaleType"]) {
  return scaleType === "interest" || scaleType === "frequency" || scaleType === "intensity"
    ? scaleType
    : "intensity";
}
