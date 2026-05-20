import Link from "next/link";
import { submitVocationalAnswer } from "@/lib/vocational/actions";
import type { Answer, Question } from "@/lib/vocational/types";

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

export function QuestionView({
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
  const hasGuidedOptions = Boolean(currentQuestion.guidedOptions?.length);
  const currentLikertAnswer =
    currentAnswer?.kind === "likert" ? currentAnswer : undefined;
  const currentOpenAnswer =
    currentAnswer?.kind === "open" ? currentAnswer : undefined;
  const previousAnswer = getPreviousAnswer(answers, currentQuestion.id);
  const canGoBack = Boolean(previousAnswer);
  const backHref = previousAnswer
    ? `/?${new URLSearchParams({
        ...(sessionId ? { sessionId } : {}),
        state: encodedState,
        editQuestionId: String(previousAnswer.questionId),
      }).toString()}`
    : "/";
  const navigationLabel = isEditing ? "Actualizar respuesta" : "Guardar respuesta";
  const questionIcon = currentQuestion.kind === "open" ? "💬" : "🛠️";
  const visibleQuestionNumber = Math.min(questionNumber, totalQuestions);

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
        <form action={submitVocationalAnswer} className="mt-7 sm:mt-9">
          <input type="hidden" name="state" value={encodedState} />
          <input type="hidden" name="sessionId" value={sessionId ?? ""} />
          <input type="hidden" name="kind" value="likert" />
          <input type="hidden" name="questionId" value={currentQuestion.id} />
          {isEditing && (
            <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
          )}

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {likertOptions.map((option) => (
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

          <div className="mt-6 grid grid-cols-2 items-start gap-4 text-xs font-semibold sm:mt-7 sm:text-sm">
            <span className="text-left leading-5 text-[#ff5d73]">
              ← Totalmente en
              <span className="block">desacuerdo</span>
            </span>
            <span className="text-right leading-5 text-[#28a65b]">
              Totalmente de
              <span className="block">acuerdo →</span>
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
      ) : (
        <form action={submitVocationalAnswer} className="mt-8">
          <input type="hidden" name="state" value={encodedState} />
          <input type="hidden" name="sessionId" value={sessionId ?? ""} />
          <input type="hidden" name="kind" value="open" />
          <input type="hidden" name="questionId" value={currentQuestion.id} />
          {isEditing && (
            <input type="hidden" name="editQuestionId" value={currentQuestion.id} />
          )}
          {hasGuidedOptions && (
            <div className="grid gap-3 md:grid-cols-2">
              {currentQuestion.guidedOptions?.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#ded9eb] bg-white p-4 text-sm font-semibold leading-6 text-[#273153] transition hover:border-[#8b5cf6] hover:bg-[#f8f5ff]"
                >
                  <input
                    type="radio"
                    name="guidedChoice"
                    value={option}
                    className="mt-1 h-4 w-4 accent-[#7c3aed]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}
          {hasGuidedOptions && currentQuestion.unsureOptions && (
            <div className="mt-4 rounded-xl border border-[#e4def5] bg-[#f7f3ff] p-4">
              <p className="text-sm font-bold text-[#7c3aed]">
                Si elegiste que aún no estás seguro, puedes marcar una razón:
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {currentQuestion.unsureOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#ded9eb] bg-white px-3 py-2 text-sm font-medium text-[#394267]"
                  >
                    <input
                      type="radio"
                      name="unsureDetail"
                      value={option}
                      className="h-4 w-4 accent-[#7c3aed]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <textarea
            name="text"
            rows={hasGuidedOptions ? 4 : 7}
            defaultValue={currentOpenAnswer?.text ?? ""}
            className={`${hasGuidedOptions ? "mt-5" : ""} w-full rounded-xl border border-[#ded9eb] bg-white p-4 text-base outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]`}
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

function getPreviousAnswer(answers: Answer[], currentQuestionId: number) {
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
