import {
  cerrarSesionAdministrador,
  requerirAdminActual,
} from "@/backend/admin/auth";
import { registrarEntrenamientoDesdeArtefactos } from "@/backend/admin/modelActions";
import { obtenerDatosModelosAdmin } from "@/backend/admin/reports";
import { AdminShell } from "@/frontend/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ModelosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentAdmin = await requerirAdminActual();
  const params = await searchParams;
  const rawModelFilter = first(params.modelo);
  const modelFilter = rawModelFilter && rawModelFilter !== "Todos" ? rawModelFilter : undefined;
  const activeModelId = Number(first(params.activo));
  const detailModelId = Number(first(params.detalle));
  const expandedChartKey = first(params.grafico);
  const data = await obtenerDatosModelosAdmin();
  const experimentRows = data.experiments.filter((experiment) =>
    modelFilter ? experiment.modelName === modelFilter : true,
  );

  const bestExperiment = [...experimentRows].sort(
    (a, b) => b.f1Score - a.f1Score,
  )[0];

  const activeExperiment =
    data.experiments.find((experiment) => experiment.id === activeModelId) ??
    bestExperiment;
  const detailExperiment = data.experiments.find(
    (experiment) => experiment.id === detailModelId,
  );
  const modelOptions = Array.from(
    new Set(data.experiments.map((experiment) => experiment.modelName)),
  );
  const activeModelQuery = activeExperiment
    ? `?modelo=${encodeURIComponent(activeExperiment.modelName)}`
    : "";
  const chartCards = [
    {
      key: "curvas-aprendizaje",
      src: `/api/admin/modelos/graficos/curvas-aprendizaje${activeModelQuery}`,
      subtitle: "Entrenamiento vs. validación",
      title: "Curvas de aprendizaje",
    },
    {
      key: "comparacion-general",
      src: `/api/admin/modelos/graficos/comparacion-general${activeModelQuery}`,
      subtitle: "Accuracy, precisión, recall y F1",
      title: "Comparación general",
    },
    {
      key: "matriz-confusion",
      src: `/api/admin/modelos/graficos/matriz-confusion${activeModelQuery}`,
      subtitle: "Errores y aciertos del modelo",
      title: "Matriz de confusión",
    },
  ];
  const expandedChart = chartCards.find((chart) => chart.key === expandedChartKey);

  return (
    <AdminShell
      active="Modelos"
      currentAdmin={currentAdmin}
      logoutAction={cerrarSesionAdministrador}
      fullWidth
    >
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#071033]">
            Modelos
          </h1>
          <p className="mt-1 text-sm font-medium text-[#66708f]">
            Supervisa el rendimiento del modelo y administra entrenamientos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <form action={registrarEntrenamientoDesdeArtefactos}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#7c3aed] px-5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition hover:bg-[#6d28d9]"
            >
              <span aria-hidden="true">↻</span>
              Entrenar de nuevo
            </button>
          </form>

          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded7f4] bg-white px-5 text-xs font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
            href="#resumen-modelos"
          >
            <span aria-hidden="true">⇄</span>
            Comparar modelos
          </a>

          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded7f4] bg-white px-5 text-xs font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
            href="/api/admin/reportes/modelos"
          >
            <span aria-hidden="true">↓</span>
            Exportar métricas
          </a>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        <InfoCard
          icon="target"
          label="Modelo activo"
          value={activeExperiment?.modelName ?? "Sin modelo activo"}
          detail={
            activeExperiment
              ? `${asPercent(activeExperiment.accuracy)} accuracy`
              : "Entrena un modelo para comenzar"
          }
          tone="purple"
        />

        <InfoCard
          icon="database"
          label="Dataset usado"
          value={`${activeExperiment?.datasetRows?.toLocaleString("es-PE") ?? 0} registros válidos`}
          detail="Respuestas anónimas del test"
          tone="green"
        />

        <InfoCard
          icon="calendar"
          label="Último entrenamiento"
          value={
            activeExperiment
              ? formatDate(activeExperiment.trainedAt)
              : "Sin entrenamiento"
          }
          detail={activeExperiment ? "Listo para revisión" : "Pendiente"}
          tone="orange"
        />
      </section>

      <section className="mt-4 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1.35fr] xl:items-end">
          <form className="contents">
          <Select label="Modelo" name="modelo" value={modelFilter ?? ""}>
            <option>Todos</option>
            {modelOptions.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
            <option>Regresión logística</option>
            <option>SVM</option>
            <option>Random Forest</option>
            <option>KNN</option>
            <option>Árbol de decisión</option>
          </Select>

          <Select label="Dataset">
            <option>Dataset actual</option>
            <option>Solo registros válidos</option>
            <option>Último entrenamiento</option>
          </Select>

          <button className="min-h-10 rounded-xl bg-[#7c3aed] px-5 text-xs font-bold text-white transition hover:bg-[#6d28d9]">
            Filtrar
          </button>
          </form>

          <div className="rounded-xl bg-[#fbf8ff] px-4 py-3 text-xs font-medium text-[#53607e]">
            <span className="mr-2 font-bold text-[#7c3aed]">ⓘ</span>
            Revisa métricas, matriz de confusión y curvas antes de activar un
            modelo.
          </div>
        </div>
      </section>

      {detailExperiment ? (
        <section
          id="detalle-modelo"
          className="mt-4 rounded-2xl border border-[#d9cef7] bg-white p-5 shadow-[0_10px_28px_rgba(37,44,97,0.04)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
                Detalle del modelo
              </h2>
              <p className="mt-1 text-xs font-medium text-[#66708f]">
                Experimento #{detailExperiment.id}
              </p>
            </div>
            <a
              className="w-fit rounded-lg border border-[#ded7f4] px-3 py-2 text-xs font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
              href={`/admin/modelos${buildModelQuery({
                active: activeExperiment?.id,
                model: modelFilter,
              })}`}
            >
              Cerrar detalle
            </a>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Modelo" value={detailExperiment.modelName} />
            <DetailItem label="Accuracy" value={asPercent(detailExperiment.accuracy)} />
            <DetailItem label="Precision" value={asPercent(detailExperiment.precision)} />
            <DetailItem label="Recall" value={asPercent(detailExperiment.recall)} />
            <DetailItem label="F1 Score" value={asPercent(detailExperiment.f1Score)} />
            <DetailItem label="Dataset" value={detailExperiment.datasetVersion} />
            <DetailItem
              label="Registros"
              value={detailExperiment.datasetRows.toLocaleString("es-PE")}
            />
            <DetailItem label="Entrenado" value={formatDate(detailExperiment.trainedAt)} />
          </div>
        </section>
      ) : null}

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        {chartCards.map((chart) => (
          <TrainingChartCard
            key={chart.key}
            expandHref={`/admin/modelos${buildModelQuery({
              active: activeExperiment?.id,
              chart: chart.key,
              detail: detailExperiment?.id,
              model: modelFilter,
            })}#visor-grafico`}
            src={chart.src}
            subtitle={chart.subtitle}
            title={chart.title}
          />
        ))}
      </section>

      {expandedChart ? (
        <section
          id="visor-grafico"
          className="mt-4 rounded-2xl border border-[#d9cef7] bg-white p-5 shadow-[0_10px_28px_rgba(37,44,97,0.04)]"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[1.1rem] font-bold tracking-[-0.01em] text-[#071033]">
                {expandedChart.title}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#66708f]">
                {expandedChart.subtitle}
              </p>
            </div>
            <a
              className="w-fit rounded-lg border border-[#ded7f4] px-3 py-2 text-xs font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
              href={`/admin/modelos${buildModelQuery({
                active: activeExperiment?.id,
                detail: detailExperiment?.id,
                model: modelFilter,
              })}`}
            >
              Cerrar ampliación
            </a>
          </div>

          <div className="overflow-auto rounded-xl border border-[#eef0f6] bg-[#fbfaff] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={expandedChart.title}
              className="mx-auto min-h-[620px] min-w-[980px] object-contain"
              src={expandedChart.src}
            />
          </div>
        </section>
      ) : null}

      <section
        id="resumen-modelos"
        className="mt-4 rounded-2xl border border-[#e7e2f4] bg-white shadow-[0_10px_28px_rgba(37,44,97,0.04)]"
      >
        <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
              Resumen de modelos
            </h2>
            <p className="mt-1 text-xs font-medium text-[#66708f]">
              Compara resultados antes de activar un modelo principal.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-[11px] font-bold text-[#7c3aed]">
            {experimentRows.length} modelos registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="bg-[#faf8ff] text-left text-[#53607e]">
                {[
                  "Modelo",
                  "Accuracy",
                  "F1 Score",
                  "Dataset usado",
                  "Último entrenamiento",
                  "Estado",
                  "Acciones",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.03em] first:pl-5 last:pr-5"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {experimentRows.map((experiment) => {
                const isActive = activeExperiment?.id === experiment.id;
                const isDiscarded = experiment.f1Score < 0.65;

                return (
                  <tr
                    key={experiment.id}
                    className="transition hover:bg-[#fbfaff]"
                  >
                    <td className="border-b border-[#eef0f6] px-4 py-3 first:pl-5">
                      <div>
                        <p className="font-bold text-[#071033]">
                          {experiment.modelName}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#7a829f]">
                          Experimento #{experiment.id}
                        </p>
                      </div>
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3">
                      <MetricText value={experiment.accuracy} strong={isActive} />
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3">
                      <MetricText value={experiment.f1Score} strong={isActive} />
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3 font-medium text-[#4c5578]">
                      {experiment.datasetRows.toLocaleString("es-PE")} registros válidos
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3 font-medium text-[#4c5578]">
                      {formatDate(experiment.trainedAt)}
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3">
                      <StatusBadge
                        status={
                          isActive
                            ? "Activo"
                            : isDiscarded
                              ? "Descartado"
                              : "Evaluado"
                        }
                      />
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-3 pr-5">
                      <div className="flex flex-wrap gap-2">
                        <a
                          className="rounded-lg border border-[#cdbdf9] px-3 py-1.5 text-[11px] font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
                          href={`/admin/modelos${buildModelQuery({
                            active: activeExperiment?.id,
                            detail: experiment.id,
                            model: modelFilter,
                          })}#detalle-modelo`}
                        >
                          Ver detalle
                        </a>

                        {!isActive && !isDiscarded ? (
                          <a
                            href={`/admin/modelos${buildModelQuery({
                              active: experiment.id,
                              model: modelFilter,
                            })}#resumen-modelos`}
                            className="rounded-lg border border-[#cdbdf9] px-3 py-1.5 text-[11px] font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
                          >
                            Activar
                          </a>
                        ) : null}

                        {isActive ? (
                          <span className="rounded-lg border border-[#bfe8cc] px-3 py-1.5 text-[11px] font-bold text-[#108a53]">
                            En uso
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!experimentRows.length && (
            <p className="py-10 text-center text-xs font-medium text-[#6e7696]">
              Aún no hay experimentos de modelos registrados.
            </p>
          )}
        </div>

        <div className="border-t border-[#eef0f6] bg-[#fbf8ff] px-4 py-3 text-xs font-medium text-[#53607e]">
          <span className="mr-2 font-bold text-[#7c3aed]">ⓘ</span>
          El modelo activo solo debe cambiar cuando el administrador confirma
          que sus métricas son adecuadas.
        </div>
      </section>
    </AdminShell>
  );
}

function InfoCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: "target" | "database" | "calendar";
  label: string;
  tone: "purple" | "green" | "orange";
  value: string;
}) {
  const toneClass = {
    purple: "bg-[#efe8ff] text-[#7c3aed]",
    green: "bg-[#dcf7ea] text-[#14945a]",
    orange: "bg-[#fff0d8] text-[#d97604]",
  }[tone];

  return (
    <article className="flex min-h-[100px] items-center gap-4 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${toneClass}`}>
        <ModelIcon name={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#66708f]">{label}</p>
        <p className="mt-1 truncate text-[1.25rem] font-bold tracking-[-0.02em] text-[#071033]">
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold text-[#7c3aed]">{detail}</p>
      </div>
    </article>
  );
}

function Select({
  children,
  label,
  name,
  value,
}: {
  children: React.ReactNode;
  label: string;
  name?: string;
  value?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#071033]">
      {label}

      <select
        className="min-h-10 rounded-xl border border-[#d8d2e7] bg-white px-4 text-xs font-medium text-[#071033] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]"
        defaultValue={value}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

function TrainingChartCard({
  expandHref,
  src,
  subtitle,
  title,
}: {
  expandHref: string;
  src: string;
  subtitle: string;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
              {title}
            </h2>
            <p className="mt-1 text-xs font-medium text-[#66708f]">{subtitle}</p>
          </div>
          <a
            className="shrink-0 rounded-lg border border-[#cdbdf9] px-3 py-1.5 text-[11px] font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
            href={expandHref}
          >
            Ampliar
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#eef0f6] bg-[#fbfaff]">
        <a href={expandHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={title} className="h-[320px] w-full object-contain" src={src} />
        </a>
      </div>
    </article>
  );
}

function MetricText({
  strong = false,
  value,
}: {
  strong?: boolean;
  value: number;
}) {
  return (
    <span
      className={
        strong
          ? "font-bold text-[#7c3aed]"
          : "font-semibold text-[#4c5578]"
      }
    >
      {asPercent(value)}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef0f6] bg-[#fbfaff] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#7a829f]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#071033]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "Activo" | "Evaluado" | "Descartado" }) {
  const styles = {
    Activo: "bg-[#ddf8e9] text-[#108a53]",
    Evaluado: "bg-[#e8eefc] text-[#4168d8]",
    Descartado: "bg-[#fff0d8] text-[#b05d00]",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

function ModelIcon({ name }: { name: "target" | "database" | "calendar" }) {
  const common = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
    viewBox: "0 0 24 24",
  };

  if (name === "target") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </svg>
    );
  }

  if (name === "database") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
        <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M16 14h.01" />
      <path d="M12 14h.01" />
    </svg>
  );
}

function asPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildModelQuery({
  active,
  chart,
  detail,
  model,
}: {
  active?: number;
  chart?: string;
  detail?: number;
  model?: string;
}) {
  const params = new URLSearchParams();

  if (model) params.set("modelo", model);
  if (active) params.set("activo", String(active));
  if (detail) params.set("detalle", String(detail));
  if (chart) params.set("grafico", chart);

  const query = params.toString();

  return query ? `?${query}` : "";
}
