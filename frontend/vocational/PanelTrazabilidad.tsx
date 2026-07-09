import { dimensionLabels } from "@/lib/vocational/data";
import type { Answer } from "@/lib/vocational/types";

export function PanelTrazabilidad({ answers }: { answers: Answer[] }) {
  return (
    <div className="rounded-lg border border-[#dfe5ef] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Trazabilidad</h2>
      <div className="mt-4 max-h-[320px] space-y-2 overflow-auto pr-1">
        {answers.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            Aqui se registra orden, tipo de pregunta, dimension, valor y texto
            abierto cuando corresponda.
          </p>
        ) : (
          answers.map((answer) => (
            <div
              key={`${answer.questionId}-${answer.order}`}
              className="rounded-md bg-[#f2f5f8] px-3 py-2 text-sm"
            >
              <div className="flex justify-between gap-3 font-medium">
                <span>#{answer.order}</span>
                <span>
                  {answer.kind === "likert"
                    ? dimensionLabels[answer.dimension]
                    : `Abierta: ${answer.trigger}`}
                </span>
                <span>{answer.kind === "likert" ? `${answer.value}/5` : "texto"}</span>
              </div>
              {answer.kind === "open" && (
                <p className="mt-2 line-clamp-2 text-[#64748B]">{answer.text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}



