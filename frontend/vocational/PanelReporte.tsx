"use client";

import { dimensionLabels, questions } from "@/lib/vocational/data";
import {
  analizarRespuestaLibreVocacional,
  analizarTextoFocoSemantico,
  analizarTextoNarrativo,
} from "@/lib/vocational/responsePatterns";
import type { LayeredResultSubroute } from "@/lib/vocational/occupationalCatalog";
import type { Answer, Dimension, Profile, ResultIndicators } from "@/lib/vocational/types";

export function PanelReporte({
  answers,
  areas,
  indicators,
  macroProfileLabel,
  mainResultName,
  mainResultTitle,
  profile,
  reasons,
  resultLabel,
  strengths,
  subroutes,
  resultMeaning,
}: {
  answers: Answer[];
  areas: Array<{
    name: string;
    description: string;
    width: number;
    affinity?: number;
    requiredEvidenceMet?: boolean;
    activities: string[];
  }>;
  indicators: ResultIndicators;
  macroProfileLabel?: string | null;
  mainResultName: string;
  mainResultTitle: string;
  profile: Profile & { score: number };
  reasons: string[];
  resultLabel: string;
  strengths: string[];
  subroutes: LayeredResultSubroute[];
  resultMeaning: { primary: string; action: string };
}) {
  const compatibleAreaNames = areas.map((area) => area.name);
  const scoredSubroutes = subroutes
    .slice()
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);

  return (
    <aside className="print-report hidden rounded-lg border border-[#dfe5ef] bg-white p-4 shadow-sm print:block">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A78BFA]">
          Reporte vocacional
        </p>
        <h2 className="mt-2 text-xl font-bold">Test vocacional</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Resumen para comparar opciones y tomar una mejor decisión.
        </p>
        <p className="mt-2 rounded-md bg-[#f8fafc] px-3 py-2 text-xs leading-5 text-[#475569]">
          Este reporte es una orientación inicial basada en tus respuestas; no declara una carrera definitiva.
        </p>
      </div>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Resultado</h3>
        <div className="mt-3 space-y-2 text-sm">
          <LineaReporte label="Resultado" value={mainResultTitle} />
          <LineaReporte label="Etiqueta" value={resultLabel} />
          {macroProfileLabel ? (
            <LineaReporte label="Área amplia relacionada" value={profile.name} />
          ) : null}
          <LineaReporte label="Área de referencia" value={mainResultName} />
          <LineaReporte label="Puntaje de ruta amplia" value={`${profile.score.toFixed(1)} pts`} />
          <LineaReporte
            label="Áreas compatibles"
            value={compatibleAreaNames.length > 0 ? compatibleAreaNames.join(", ") : "No definido"}
          />
          <LineaReporte label="Nivel de claridad" value={`${indicators.profileClarity.toFixed(0)}%`} />
          <LineaReporte
            label="Dudas al decidir"
            value={`${indicators.vocationalUncertainty.toFixed(0)}%`}
          />
          <LineaReporte
            label="Presión externa"
            value={`${indicators.externalPressure.toFixed(0)}%`}
          />
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Ruta y subrutas según puntaje</h3>
        <div className="mt-3 space-y-2">
          <div className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
            <p className="font-semibold">{profile.name}</p>
            <p className="mt-1 text-[#64748B]">
              Ruta amplia de referencia: {profile.score.toFixed(1)} pts.
            </p>
          </div>

          {scoredSubroutes.length > 0 ? (
            scoredSubroutes.map((subroute) => (
              <div
                key={subroute.id}
                className="rounded-md border border-[#dfe5ef] px-3 py-2 text-xs leading-5"
              >
                <p className="font-semibold">
                  {subroute.name} · {subroute.relevance.toFixed(0)}%
                </p>
                <p className="mt-1 text-[#64748B]">
                  Familia: {subroute.familyName}
                  {subroute.rawAffinity !== undefined
                    ? ` · Afinidad base: ${subroute.rawAffinity.toFixed(0)}%`
                    : ""}
                </p>
                {subroute.compatibilityTrace ? (
                  <p className="mt-1 text-[#64748B]">
                    Dimensiones {subroute.compatibilityTrace.dimensionScore}% · patrón{" "}
                    {subroute.compatibilityTrace.combinedPatternScore}% · evidencia{" "}
                    {subroute.compatibilityTrace.explicitEvidenceScore}% · confirmación{" "}
                    {subroute.compatibilityTrace.adaptiveConfirmationScore}% · penalización{" "}
                    {subroute.compatibilityTrace.penaltyScore}%.
                  </p>
                ) : null}
                <p className="mt-1 text-[#64748B]">
                  Estado:{" "}
                  {obtenerNivelCompatibilidadReporte(
                    subroute.relevance,
                    subroute.compatibilityTrace?.requiredEvidenceMet,
                  )}
                </p>
                {subroute.reasons.length > 0 ? (
                  <p className="mt-1 text-[#475569]">
                    Sustento: {subroute.reasons.slice(0, 2).join("; ")}.
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5 text-[#64748B]">
              No se detectaron subrutas concretas con puntaje suficiente.
            </p>
          )}
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Por qué apareció este resultado</h3>
        <div className="mt-3 space-y-2">
          {reasons.map((reason) => (
            <p key={reason} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
              {reason}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Áreas compatibles según tus respuestas</h3>
        <div className="mt-3 space-y-2">
          {areas.map((area) => (
            <div key={area.name} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
              <p className="font-semibold">{area.name}</p>
              <p className="mt-1 text-[#475569]">{area.description}</p>
              <p className="mt-1 text-[#64748B]">
                Nivel:{" "}
                {obtenerNivelCompatibilidadReporte(
                  area.affinity ?? area.width,
                  area.requiredEvidenceMet,
                )}
              </p>
              <p className="mt-1 text-[#64748B]">
                Actividades: {area.activities.slice(0, 3).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Interpretación</h3>
        <div className="mt-3 space-y-2 text-xs leading-5">
          <p className="rounded-md bg-[#f2f5f8] px-3 py-2">{resultMeaning.primary}</p>
          <p className="rounded-md bg-[#f2f5f8] px-3 py-2">{resultMeaning.action}</p>
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Fortalezas</h3>
        <div className="mt-3 space-y-2">
          {strengths.map((strength) => (
            <p key={strength} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
              {strength}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Respuestas</h3>
        <div className="mt-3 space-y-3">
          {answers.map((answer) => {
            const question = questions.find((item) => item.id === answer.questionId);

            return (
              <div
                key={`${answer.questionId}-${answer.order}`}
                className="rounded-md border border-[#dfe5ef] p-3 text-xs leading-5"
              >
                <p className="font-semibold">
                  {answer.order}. {question?.text ?? `Pregunta ${answer.questionId}`}
                </p>
                {answer.kind === "likert" ? (
                  <div className="mt-2 space-y-1 text-[#64748B]">
                    <p>
                      {obtenerEtiquetaRespuesta(answer.dimension)}:{" "}
                      <span className="font-semibold text-[#17202a]">{answer.value} de 5</span>
                    </p>
                    {answer.comment && (
                      <p>
                        Comentario:{" "}
                        <span className="font-semibold text-[#17202a]">{answer.comment}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-1 text-[#64748B]">
                    <p>
                      {obtenerEtiquetaRespuestaAbierta(answer, question?.scaleType)}{" "}
                      <span className="font-semibold text-[#17202a]">
                        {answer.answerMode === "typed-text"
                          ? answer.text
                          : question?.scaleType === "forced_choice"
                          ? answer.text.replace(/^Opción guiada:\s*/, "")
                          : answer.text}
                      </span>
                    </p>
                    <AnalisisRespuestaReporte answer={answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export function BotonImprimirReporte() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-[#7c3aed] px-5 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
    >
      Guardar reporte en PDF
    </button>
  );
}

function LineaReporte({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2">
      <span className="min-w-28 text-[#64748B]">{label}:</span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}

function AnalisisRespuestaReporte({
  answer,
}: {
  answer: Extract<Answer, { kind: "open" }>;
}) {
  const text = [answer.text, answer.selectedOptionText, answer.careerReference]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  const narrative = analizarTextoNarrativo(text);
  const semantic = analizarTextoFocoSemantico(text);
  const free = answer.answerMode === "typed-text" ? analizarRespuestaLibreVocacional(text) : null;
  const matchedItems = [
    ...narrative.matchedPatterns.map((pattern) => `patrón narrativo: ${pattern}`),
    ...semantic.semanticFocus.map((focus) => `foco: ${focus}`),
    ...(free?.suggestedRoutes ?? []).map((route) => `ruta sugerida: ${route}`),
  ];

  return (
    <>
      <p>
        Tipo:{" "}
        <span className="font-semibold text-[#17202a]">
          {obtenerTipoRespuestaAbierta(answer)}
        </span>
      </p>
      {matchedItems.length > 0 ? (
        <p>
          Diccionario:{" "}
          <span className="font-semibold text-[#17202a]">
            {matchedItems.slice(0, 5).join(", ")}
          </span>
        </p>
      ) : (
        <p>Diccionario: sin coincidencias semánticas directas.</p>
      )}
    </>
  );
}

function obtenerNivelCompatibilidadReporte(
  affinity: number,
  requiredEvidenceMet = true,
) {
  if (!requiredEvidenceMet) return "Ruta inicial tentativa";
  if (affinity >= 88) return "Alta compatibilidad";
  if (affinity >= 70) return "Compatible";
  return "Opción por explorar";
}

function obtenerEtiquetaRespuesta(dimension: Dimension) {
  const studentLabels: Partial<Record<Dimension, string>> = {
    apertura: "Curiosidad por explorar",
    responsabilidad: "Organización y constancia",
    extraversion: "Participación con otras personas",
    amabilidad: "Cooperación y apoyo",
    neuroticismo: "Preocupación al decidir",
    incertidumbre: "Claridad vocacional",
    presion: "Influencia externa",
    tolerancia: "Persistencia ante la dificultad",
  };

  return studentLabels[dimension] ?? dimensionLabels[dimension];
}

function obtenerEtiquetaRespuestaAbierta(
  answer: Extract<Answer, { kind: "open" }>,
  scaleType: string | undefined,
) {
  if (answer.answerMode === "typed-text") return "Respuesta escrita:";
  if (scaleType === "forced_choice") return "Opción seleccionada:";

  return "Respuesta abierta:";
}

function obtenerTipoRespuestaAbierta(answer: Extract<Answer, { kind: "open" }>) {
  if (answer.answerMode === "typed-text") return "abierta escrita";
  if (answer.answerMode === "unknown") return "abierta de incertidumbre";
  return "semiabierta guiada";
}




