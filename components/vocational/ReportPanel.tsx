"use client";

import { dimensionLabels, questions } from "@/lib/vocational/data";
import type { Answer, Profile, ResultIndicators } from "@/lib/vocational/types";

export function ReportPanel({
  answers,
  areas,
  compatiblePaths,
  indicators,
  profile,
  ranked,
  signals,
  strengths,
}: {
  answers: Answer[];
  areas: string[];
  compatiblePaths: string[];
  indicators: ResultIndicators;
  profile: Profile & { score: number };
  ranked: Array<Profile & { score: number }>;
  signals: string[];
  strengths: string[];
}) {
  const additionalRoutes = ranked
    .filter((item) => item.id !== profile.id)
    .slice(0, 3)
    .map((item) => item.name);
  const compatibleRouteNames = compatiblePaths.length > 0 ? compatiblePaths : additionalRoutes;

  return (
    <aside className="print-report hidden rounded-lg border border-[#dfe5ef] bg-white p-4 shadow-sm print:block">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A78BFA]">
          Reporte vocacional
        </p>
        <h2 className="mt-2 text-xl font-bold">Test vocacional</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Resumen de respuestas y resultados generados.
        </p>
        <p className="mt-2 rounded-md bg-[#f8fafc] px-3 py-2 text-xs leading-5 text-[#475569]">
          Este reporte contiene información complementaria utilizada por el sistema para interpretar los resultados.
        </p>
      </div>

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Resultado</h3>
        <div className="mt-3 space-y-2 text-sm">
          <ReportLine label="Perfil principal" value={profile.name} />
          <ReportLine
            label="Rutas compatibles adicionales"
            value={compatibleRouteNames.length > 0 ? compatibleRouteNames.join(", ") : "No definido"}
          />
          <ReportLine label="Claridad del perfil" value={`${indicators.profileClarity.toFixed(0)}%`} />
          <ReportLine
            label="Incertidumbre vocacional"
            value={`${indicators.vocationalUncertainty.toFixed(0)}%`}
          />
          <ReportLine
            label="Presión externa"
            value={`${indicators.externalPressure.toFixed(0)}%`}
          />
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
        <h3 className="font-semibold">Áreas compatibles</h3>
        <div className="mt-3 space-y-2">
          {areas.map((area) => (
            <p key={area} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
              {area}
            </p>
          ))}
        </div>
      </section>

      {compatibleRouteNames.length > 0 && (
        <section className="mt-5 border-t border-[#dfe5ef] pt-4">
          <h3 className="font-semibold">Rutas compatibles adicionales</h3>
          <div className="mt-3 space-y-2">
            {compatibleRouteNames.map((path) => (
              <p key={path} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
                {path}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 border-t border-[#dfe5ef] pt-4">
        <h3 className="font-semibold">Señales</h3>
        <div className="mt-3 space-y-2">
          {signals.map((signal) => (
            <p key={signal} className="rounded-md bg-[#f2f5f8] px-3 py-2 text-xs leading-5">
              {signal}
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
                      {dimensionLabels[answer.dimension]}:{" "}
                      <span className="font-semibold text-[#17202a]">{answer.value}/5</span>
                    </p>
                    {answer.comment && (
                      <p>
                        Comentario:{" "}
                        <span className="font-semibold text-[#17202a]">{answer.comment}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[#64748B]">
                    Respuesta abierta:{" "}
                    <span className="font-semibold text-[#17202a]">{answer.text}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export function PrintReportButton() {
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

function ReportLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2">
      <span className="min-w-28 text-[#64748B]">{label}:</span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}



