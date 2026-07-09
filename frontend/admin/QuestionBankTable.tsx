"use client";

import {
  dimensionLabels,
  obtenerDimensionVisiblePregunta,
  obtenerTipoVisiblePregunta,
  questions as catalogQuestions,
} from "@/lib/vocational/data";
import type { Dimension, Question } from "@/lib/vocational/types";
import { useState } from "react";

type QuestionRow = {
  dimensionCode: string | null;
  dimensionId: number | null;
  dimensionName: string | null;
  id: number;
  isActive: boolean;
  kind: string;
  stage: string;
  text: string;
};

type DimensionOption = {
  id: number;
  name: string;
};

type QuestionBankTableProps = {
  createAction: (formData: FormData) => Promise<void>;
  dimensions: DimensionOption[];
  initialEditingQuestionId?: number;
  questions: QuestionRow[];
  stageLabels: Record<string, string>;
  toggleAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
};

type FormState = {
  dimensionId: string;
  id: number | null;
  isActive: string;
  kind: string;
  stage: string;
  text: string;
};

const emptyFormState: FormState = {
  dimensionId: "",
  id: null,
  isActive: "true",
  kind: "LIKERT",
  stage: "EXPLORATION",
  text: "",
};

export function QuestionBankTable({
  createAction,
  dimensions,
  initialEditingQuestionId,
  questions,
  stageLabels,
  toggleAction,
  updateAction,
}: QuestionBankTableProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    getFormStateFromQuestion(
      questions.find((question) => question.id === initialEditingQuestionId),
    ),
  );
  const isEditing = formState.id !== null;

  function startEditing(question: QuestionRow) {
    setFormState(getFormStateFromQuestion(question));

    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  function resetForm() {
    setFormState(emptyFormState);
  }

  return (
    <section className="mt-6 space-y-5">
      <article className="rounded-2xl border border-[#e7e2f4] bg-white p-6 shadow-[0_18px_55px_rgba(37,44,97,0.06)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#121a3a]">
              {isEditing ? "Editar pregunta" : "Agregar pregunta"}
            </h2>
            <p className="mt-1 text-[12px] text-[#6e7696]">
              {isEditing
                ? `Modificando Q-${formState.id}. Guarda los cambios para actualizar el banco.`
                : "Registra una nueva pregunta y asignala a una dimension del test."}
            </p>
          </div>

          {isEditing ? (
            <button
              type="button"
              onClick={resetForm}
              className="w-fit rounded-lg border border-[#ded7f4] px-3 py-2 text-[12px] font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]"
            >
              Cancelar edicion
            </button>
          ) : null}
        </div>

        <form action={isEditing ? updateAction : createAction} className="space-y-5">
          {isEditing ? (
            <>
              <input name="id" type="hidden" value={formState.id ?? ""} />
              <input name="isActive" type="hidden" value={formState.isActive} />
            </>
          ) : null}

          <div>
            <label className="mb-2 block text-[12px] font-semibold text-[#121a3a]">
              Pregunta
            </label>

            <textarea
              name="text"
              required
              rows={3}
              placeholder="Escribe la pregunta..."
              value={formState.text}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  text: event.target.value,
                }))
              }
              className="h-[86px] w-full resize-none rounded-xl border border-[#ded7f4] bg-white px-4 py-3 text-[13px] font-medium text-[#101936] outline-none transition placeholder:text-[#a3a8bd] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede7ff]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-[12px] font-semibold text-[#121a3a]">
                Dimension
              </label>

              <select
                name="dimensionId"
                value={formState.dimensionId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    dimensionId: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#ded7f4] bg-white px-4 text-[13px] font-medium text-[#101936] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede7ff]"
              >
                <option value="">Sin dimension</option>

                {dimensions.map((dimension) => (
                  <option key={dimension.id} value={dimension.id}>
                    {dimension.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-[#121a3a]">
                Tipo de respuesta
              </label>

              <select
                name="kind"
                required
                value={formState.kind}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    kind: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#ded7f4] bg-white px-4 text-[13px] font-medium text-[#101936] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede7ff]"
              >
                <option value="LIKERT">Escala</option>
                <option value="OPEN">Abierta</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-[#121a3a]">
                Etapa
              </label>

              <select
                name="stage"
                required
                value={formState.stage}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    stage: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#ded7f4] bg-white px-4 text-[13px] font-medium text-[#101936] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede7ff]"
              >
                <option value="EXPLORATION">{stageLabels.EXPLORATION}</option>
                <option value="DEEPENING">{stageLabels.DEEPENING}</option>
                <option value="CONTEXT">{stageLabels.CONTEXT}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-1">
            <button className="h-10 w-[280px] rounded-xl bg-[#7c3aed] px-5 text-[13px] font-semibold text-white transition hover:bg-[#6d28d9]">
              {isEditing ? "Guardar" : "Agregar pregunta"}
            </button>
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-[#e7e2f4] bg-white p-6 shadow-[0_18px_55px_rgba(37,44,97,0.06)]">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#121a3a]">
              Preguntas registradas
            </h2>
          </div>

          <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-[12px] font-medium text-[#7c3aed]">
            {questions.length} preguntas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr className="bg-[#f6f3ff] text-left text-[#4c5578]">
                {[
                  "Codigo",
                  "Pregunta",
                  "Dimension",
                  "Tipo",
                  "Estado",
                  "Acciones",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold first:rounded-l-xl last:rounded-r-xl"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="text-[#101936]">
                  <td className="border-b border-[#eef0f6] px-4 py-4 font-semibold">
                    Q-{question.id}
                  </td>

                  <td className="max-w-[390px] border-b border-[#eef0f6] px-4 py-4 leading-relaxed">
                    {question.text}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-4">
                    {obtenerDimensionVisiblePregunta(
                      obtenerPreguntaVisibleDesdeFila(question),
                    )}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-4">
                    {obtenerTipoVisiblePregunta(
                      obtenerPreguntaVisibleDesdeFila(question),
                    )}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-4">
                    <span
                      className={
                        question.isActive
                          ? "rounded-full bg-[#ddf8e9] px-3 py-1 text-[12px] font-medium text-[#108a53]"
                          : "rounded-full bg-[#eef0f6] px-3 py-1 text-[12px] font-medium text-[#6e7696]"
                      }
                    >
                      {question.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(question)}
                        className="rounded-lg border border-[#ded7f4] px-3 py-2 text-[12px] font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]"
                      >
                        Editar
                      </button>

                      <form action={toggleAction}>
                        <input name="id" type="hidden" value={question.id} />
                        <input
                          name="isActive"
                          type="hidden"
                          value={String(!question.isActive)}
                        />

                        <button className="rounded-lg border border-[#ded7f4] px-3 py-2 text-[12px] font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]">
                          {question.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {questions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[13px] text-[#6e7696]"
                  >
                    Aun no hay preguntas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function getFormStateFromQuestion(question: QuestionRow | undefined): FormState {
  if (!question) return emptyFormState;

  return {
    dimensionId: question.dimensionId ? String(question.dimensionId) : "",
    id: question.id,
    isActive: String(question.isActive),
    kind: question.kind,
    stage: question.stage,
    text: question.text,
  };
}

function obtenerPreguntaVisibleDesdeFila(question: QuestionRow): Question {
  const catalogQuestion = catalogQuestions.find((item) => item.id === question.id);
  const dimension = obtenerDimensionDesdeCodigo(question.dimensionCode);

  return {
    ...(catalogQuestion ?? {
      id: question.id,
      kind: question.kind === "LIKERT" ? "likert" : "open",
      stage: "contexto",
      text: question.text,
    }),
    dimension: dimension ?? catalogQuestion?.dimension,
    kind: question.kind === "LIKERT" ? "likert" : "open",
    text: question.text,
  };
}

function obtenerDimensionDesdeCodigo(code: string | null): Dimension | undefined {
  if (code && code in dimensionLabels) {
    return code as Dimension;
  }

  return undefined;
}
