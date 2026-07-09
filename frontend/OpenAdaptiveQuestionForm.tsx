"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/vocational/types";

type OpenAdaptiveQuestionFormProps = {
  question: Question;
  state: string;
  actionUrl?: string;
};

export function OpenAdaptiveQuestionForm({
  question,
  state,
  actionUrl = "",
}: OpenAdaptiveQuestionFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [text, setText] = useState("");
  const [unsureDetail, setUnsureDetail] = useState("");

  const selectedOption = useMemo(
    () =>
      question.forcedChoiceOptions?.find(
        (option) => option.id === selectedOptionId,
      ),
    [question.forcedChoiceOptions, selectedOptionId],
  );

  const isUnknown = selectedOption?.isUnknown === true || selectedOptionId === "unknown";
  const opensTextInput =
    selectedOption?.opensTextInput === true || selectedOptionId === "write-own-answer";

  const hasForcedOptions =
    question.scaleType === "forced_choice" &&
    Array.isArray(question.forcedChoiceOptions) &&
    question.forcedChoiceOptions.length > 0;

  const canSubmit =
    hasForcedOptions
      ? Boolean(selectedOptionId) &&
        (!opensTextInput || text.trim().length > 0)
      : Boolean(text.trim() || selectedOptionId || unsureDetail.trim());

  return (
    <form method="GET" action={actionUrl} className="space-y-5">
      <input type="hidden" name="state" value={state} />
      <input type="hidden" name="kind" value="open" />
      <input type="hidden" name="questionId" value={question.id} />

      {selectedOptionId && (
        <input type="hidden" name="selectedOptionId" value={selectedOptionId} />
      )}

      {selectedOption?.text && (
        <input type="hidden" name="guidedChoice" value={selectedOption.text} />
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-violet-600">
          Pregunta adaptativa
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          {question.text}
        </h2>

        {question.contrastLabel && (
          <p className="mt-2 text-sm text-slate-500">
            {question.contrastLabel}
          </p>
        )}

        {hasForcedOptions ? (
          <div className="mt-6 grid gap-3">
            {question.forcedChoiceOptions?.map((option) => {
              const active = selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedOptionId(option.id);

                    if (!option.opensTextInput) {
                      setText("");
                    }

                    if (!option.isUnknown) {
                      setUnsureDetail("");
                    }
                  }}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                    active
                      ? "border-violet-500 bg-violet-50 text-violet-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50",
                  ].join(" ")}
                >
                  <span className="font-semibold">{option.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {question.guidedOptions?.map((option) => {
              const active = selectedOptionId === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOptionId(option)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                    active
                      ? "border-violet-500 bg-violet-50 text-violet-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50",
                  ].join(" ")}
                >
                  <span className="font-semibold">{option}</span>
                </button>
              );
            })}

            {selectedOptionId && (
              <input type="hidden" name="guidedChoice" value={selectedOptionId} />
            )}
          </div>
        )}

        {isUnknown && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Está bien no saberlo todavía. Elige qué se acerca más a lo que te pasa:
            </p>

            <div className="mt-3 grid gap-2">
              {question.unsureOptions?.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="unsureDetail"
                    value={option}
                    checked={unsureDetail === option}
                    onChange={() => setUnsureDetail(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        {opensTextInput && (
          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-800">
              Escribe tu respuesta
            </label>

            <textarea
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Escribe con tus palabras qué te atrae o qué dudas tienes..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        )}

        {!hasForcedOptions && (
          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-800">
              También puedes escribirlo con tus palabras
            </label>

            <textarea
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Ejemplo: me interesa enseñar, pero no sé si prefiero niños, jóvenes o adultos..."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
