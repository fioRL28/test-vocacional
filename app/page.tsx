import Link from "next/link";
import Image from "next/image";
import { DelayedResultsLink } from "@/components/vocational/DelayedResultsLink";
import { QuestionView } from "@/components/vocational/QuestionView";
import { ResultView } from "@/components/vocational/ResultView";
import brujulaImage from "@/img/brujula-direcciones.png";
import pensandoImage from "@/img/pensando.png";
import { maxLikertQuestions } from "@/lib/vocational/data";
import {
  detectContradictions,
  encodeAnswers,
  getAnswerForQuestion,
  getBestProfile,
  getCurrentQuestionTarget,
  getEditableQuestion,
  getLikertAnswers,
  getSignals,
  processSubmittedAnswer,
  selectNextQuestion,
  shouldFinishTest,
} from "@/lib/vocational/engine";
import type { SearchParams } from "@/lib/vocational/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawSessionId = resolvedSearchParams.sessionId;
  const rawView = resolvedSearchParams.view;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
  const view = Array.isArray(rawView) ? rawView[0] : rawView;
  const answers = processSubmittedAnswer(resolvedSearchParams);
  const editQuestion = getEditableQuestion(answers, resolvedSearchParams);
  const result = getBestProfile(answers);
  const contradictions = detectContradictions(result.averages, answers);
  const nextQuestion = selectNextQuestion(answers);
  const likertCount = getLikertAnswers(answers).length;
  const canFinishAdaptively = shouldFinishTest(
    answers,
    result.averages,
    result.ranked,
    contradictions,
  );
  const questionTarget = getCurrentQuestionTarget(
    answers,
    result.averages,
    result.ranked,
    contradictions,
  );
  const isFinished =
    !editQuestion &&
    (!nextQuestion ||
      likertCount >= maxLikertQuestions ||
      canFinishAdaptively);
  const showResults = isFinished && view === "results";
  const currentQuestion = editQuestion ?? (isFinished ? null : nextQuestion);
  const currentAnswer = currentQuestion
    ? getAnswerForQuestion(answers, currentQuestion.id)
    : undefined;
  const questionNumber = currentAnswer?.order ?? Math.min(likertCount + 1, questionTarget);
  const progress = isFinished
    ? 100
    : Math.min(100, Math.round(((questionNumber - 1) / questionTarget) * 100));
  const encodedState = encodeAnswers(answers);
  const resultHref = buildHref({
    sessionId,
    state: encodedState,
    view: "results",
  });
  const lastAnswer = answers.at(-1);
  const backToQuestionsHref = lastAnswer
    ? buildHref({
        sessionId,
        state: encodedState,
        editQuestionId: String(lastAnswer.questionId),
      })
    : "/";

  return (
    <main className="min-h-screen bg-[#fbfaff] text-[#111a44]">
      {!isFinished && currentQuestion ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
          <AppSidebar
            active="test"
            canOpenResults={false}
            resultHref={resultHref}
          />

          <section className="grid gap-5">
            <header className="rounded-2xl border border-[#f0ecfb] bg-white/70 px-6 py-5 shadow-[0_12px_35px_rgba(83,67,160,0.05)]">
              <p className="text-2xl font-bold">¡Hola!</p>
              <p className="mt-1 text-sm text-[#6b7394]">
                Descubre tus talentos y encuentra tu camino ideal.
              </p>
            </header>

            <div className="rounded-2xl border border-[#e7e3f2] bg-white p-6 shadow-[0_18px_50px_rgba(83,67,160,0.10)] md:p-8">
              <QuestionView
                answers={answers}
                currentAnswer={currentAnswer}
                currentQuestion={currentQuestion}
                encodedState={encodedState}
                isEditing={Boolean(editQuestion)}
                progress={progress}
                questionNumber={questionNumber}
                sessionId={sessionId}
                totalQuestions={questionTarget}
              />
            </div>

            <PrivacyCard />
          </section>
        </section>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
          <AppSidebar
            active={showResults ? "results" : "test"}
            canOpenResults
            resultHref={resultHref}
          />

          <section>
            {showResults ? (
              <ResultView
                answers={answers}
                indicators={result.indicators}
                profile={result.best}
                ranked={result.ranked}
                signals={getSignals(answers)}
              />
            ) : (
              <CompletionView
                backToQuestionsHref={backToQuestionsHref}
                resultHref={resultHref}
                totalQuestions={answers.length}
              />
            )}
          </section>
        </section>
      )}
    </main>
  );
}

function AppSidebar({
  active,
  canOpenResults,
  resultHref,
}: {
  active: "test" | "results";
  canOpenResults: boolean;
  resultHref: string;
}) {
  return (
    <aside className="self-start rounded-2xl border border-[#ebe7fb] bg-white p-5 shadow-[0_16px_45px_rgba(83,67,160,0.08)]">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center">
          <Image
            src={brujulaImage}
            alt="Brújula de RutaFuturo"
            className="h-[52px] w-[52px] object-contain"
            priority={false}
          />
        </div>
        <div>
          <p className="text-xl font-bold">RutaFuturo</p>
          <p className="text-sm text-[#6b7394]">Test vocacional</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-3 text-sm font-semibold">
        {active === "results" ? (
          <span className="rounded-xl px-4 py-3 text-[#9aa2bd]">
            Test vocacional
          </span>
        ) : (
          <Link
            href="/"
            className="rounded-xl bg-[#f1ecff] px-4 py-3 text-[#7c3aed]"
          >
            Test vocacional
          </Link>
        )}
        {canOpenResults ? (
          active === "results" ? (
            <Link
              href={resultHref}
              className="rounded-xl bg-[#f1ecff] px-4 py-3 text-[#7c3aed]"
            >
              Mis resultados
            </Link>
          ) : (
            <DelayedResultsLink
              href={resultHref}
              className="rounded-xl px-4 py-3 text-[#273153] transition hover:bg-[#f7f3ff]"
              disabledClassName="rounded-xl px-4 py-3 text-[#9aa2bd]"
              loadingChildren="Preparando resultados..."
            >
              Mis resultados
            </DelayedResultsLink>
          )
        ) : (
          <span className="rounded-xl px-4 py-3 text-[#9aa2bd]">Mis resultados</span>
        )}
      </nav>

      <div className="mt-5 rounded-2xl border border-[#e4def5] bg-[#f7f3ff] p-4 text-sm leading-6 text-[#394267]">
        <p className="font-bold text-[#7c3aed]">Consejo</p>
        <p className="mt-2">
          Tomarte el tiempo para conocerte es el primer paso hacia tu mejor decisión profesional.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#e4def5] bg-[#fbfaff] p-4 text-center">
        <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-[#f1ecff]">
          <Image
            src={pensandoImage}
            alt="Estudiante pensando en sus intereses"
            className="h-28 w-28 object-contain"
            priority={false}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#273153]">
          Explora con calma tus intereses y fortalezas.
        </p>
      </div>
    </aside>
  );
}

function PrivacyCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_40px_rgba(83,67,160,0.07)]">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f1ecff] text-xl text-[#7c3aed]">
        ♢
      </div>
      <div>
        <p className="font-bold">Tus respuestas son confidenciales</p>
        <p className="mt-1 text-sm text-[#6b7394]">
          Este test es solo para ayudarte a descubrir tus intereses y sugerir áreas compatibles contigo.
        </p>
      </div>
    </div>
  );
}

function CompletionView({
  backToQuestionsHref,
  resultHref,
  totalQuestions,
}: {
  backToQuestionsHref: string;
  resultHref: string;
  totalQuestions: number;
}) {
  return (
    <div>
      <section className="rounded-2xl border border-[#e7e3f2] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(83,67,160,0.08)] md:px-10">
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-[#f1ecff] text-6xl text-[#7c3aed]">
          ✓
        </div>
        <h1 className="mt-8 text-3xl font-bold md:text-4xl">
          ¡Has completado todas las preguntas!
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#596386]">
          Gracias por tomarte el tiempo para responder el test vocacional. Tus respuestas nos ayudarán
          a identificar tus intereses, fortalezas y áreas que mejor se adaptan a ti.
        </p>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
          <CompletionStat
            icon="✓"
            title={`${totalQuestions} de ${totalQuestions}`}
            subtitle="Respuestas registradas"
          />
          <CompletionStat
            icon="○"
            title="Listo"
            subtitle="Análisis preparado"
          />
          <CompletionStat
            icon="◎"
            title="¡Excelente!"
            subtitle="Completaste el test"
          />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-center gap-5 rounded-2xl border border-[#d9cef7] bg-[#f7f3ff] p-5 text-left">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#d9c8ff] text-2xl text-[#7c3aed]">
            ✦
          </div>
          <div>
            <p className="font-bold">Estamos analizando tus respuestas</p>
            <p className="mt-2 text-sm leading-6 text-[#394267]">
              Esto puede tardar unos segundos. Pronto podrás ver tus resultados personalizados.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <Link
            href={backToQuestionsHref}
            className="rounded-xl border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
          >
            ← Volver a preguntas
          </Link>
          <DelayedResultsLink
            href={resultHref}
            className="rounded-xl bg-[#7c3aed] px-6 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
            disabledClassName="rounded-xl bg-[#e7defb] px-6 py-3 font-bold text-[#b9a6e8]"
            loadingChildren="Preparando resultados..."
          >
            Ver mis resultados →
          </DelayedResultsLink>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-left text-sm text-[#596386]">
          Tus respuestas son confidenciales y se utilizan únicamente para generar tus resultados.
        </p>
      </section>
    </div>
  );
}

function CompletionStat({
  icon,
  subtitle,
  title,
}: {
  icon: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 text-left">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f1ecff] text-2xl font-bold text-[#7c3aed]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold">{title}</p>
        <p className="mt-1 text-sm text-[#596386]">{subtitle}</p>
      </div>
    </div>
  );
}

function buildHref(params: {
  editQuestionId?: string;
  sessionId?: string;
  state?: string;
  view?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.sessionId) searchParams.set("sessionId", params.sessionId);
  if (params.state) searchParams.set("state", params.state);
  if (params.editQuestionId) searchParams.set("editQuestionId", params.editQuestionId);
  if (params.view) searchParams.set("view", params.view);

  const query = searchParams.toString();

  return query ? `/?${query}` : "/";
}
