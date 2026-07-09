"use client";

import { useActionState } from "react";

type State = {
  error?: string;
  ok?: boolean;
};

export function QuestionCreateForm({
  action,
  dimensions,
}: {
  action: (previousState: State, formData: FormData) => Promise<State>;
  dimensions: Array<{ code: string; id: number; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-5 grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Pregunta
        <textarea
          className="min-h-28 rounded-xl border border-[#d8d2e7] px-4 py-3 text-sm font-medium outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
          name="text"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Dimensión
        <select className="min-h-12 rounded-xl border border-[#d8d2e7] px-4 text-sm" name="dimension">
          <option value="">Sin dimensión</option>
          {dimensions.map((dimension) => (
            <option key={dimension.id} value={dimension.code}>
              {dimension.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Tipo de respuesta
        <select className="min-h-12 rounded-xl border border-[#d8d2e7] px-4 text-sm" name="kind">
          <option value="likert">Escala</option>
          <option value="open">Abierta</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Etapa
        <select className="min-h-12 rounded-xl border border-[#d8d2e7] px-4 text-sm" name="stage">
          <option value="exploracion">Exploración</option>
          <option value="profundizacion">Profundización</option>
          <option value="contexto">Contexto</option>
        </select>
      </label>
      {state.error && <p className="text-sm font-semibold text-[#b4233c]">{state.error}</p>}
      {state.ok && <p className="text-sm font-semibold text-[#108a53]">Pregunta creada.</p>}
      <button className="rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white" disabled={pending}>
        {pending ? "Guardando..." : "Agregar pregunta"}
      </button>
    </form>
  );
}
