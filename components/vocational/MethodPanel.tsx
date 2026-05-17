export function MethodPanel() {
  const steps = [
    "Exploracion inicial RIASEC",
    "Preguntas conductuales y situacionales",
    "Ruta adaptativa segun senales dominantes",
    "Preguntas abiertas por contexto emocional",
    "Resultado narrativo, perfiles hibridos y dataset",
  ];

  return (
    <div className="rounded-lg border border-[#dfe5ef] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Orden metodologico</h2>
      <div className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-md bg-[#f2f5f8] px-3 py-2 text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A78BFA] text-xs font-bold text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



