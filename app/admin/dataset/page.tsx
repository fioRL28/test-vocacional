import Link from "next/link";

import {
  cerrarSesionAdministrador,
  requerirAdminActual,
} from "@/backend/admin/auth";
import { obtenerResumenDatasetCsv } from "@/backend/admin/datasets";
import { registrarEntrenamientoDesdeArtefactos } from "@/backend/admin/modelActions";
import { AdminShell } from "@/frontend/admin/AdminShell";

export const dynamic = "force-dynamic";

type DatasetSummary = Awaited<ReturnType<typeof obtenerResumenDatasetCsv>>[number];
type SampleRow = DatasetSummary["sample"][number];
type DatePoint = DatasetSummary["dateDistribution"][number];

export default async function DatasetPage() {
  const currentAdmin = await requerirAdminActual();
  const datasets = await obtenerResumenDatasetCsv();
  const mainDataset = datasets[0];
  const statusSummary = mainDataset?.statusSummary ?? {
    discardedRows: 0,
    incompleteRows: 0,
    readyRows: 0,
    totalRows: 0,
    validRows: 0,
  };

  const totalRows = statusSummary.totalRows;
  const totalColumns = mainDataset?.columns ?? 0;
  const validRows = statusSummary.validRows;
  const incompleteRows = statusSummary.incompleteRows;
  const discardedRows = statusSummary.discardedRows;
  const readyRows = statusSummary.readyRows;

  const sampleRows = mainDataset?.sample.slice(0, 5) ?? [];
  const features = mainDataset?.features ?? [];
  const profileDistribution = mainDataset?.profileDistribution ?? [];
  const dateDistribution = mainDataset?.dateDistribution ?? [];

  return (
    <AdminShell
      active="Dataset"
      currentAdmin={currentAdmin}
      logoutAction={cerrarSesionAdministrador}
      fullWidth
    >
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#071033]">
            Dataset
          </h1>
          <p className="mt-1 text-sm font-medium text-[#66708f]">
            Revisa la calidad, limpieza y composición de los registros anónimos del sistema.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded7f4] bg-white px-5 text-xs font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
            href="/api/admin/dataset/actual"
          >
            <span aria-hidden="true">↓</span>
            Exportar CSV
          </Link>

          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded7f4] bg-white px-5 text-xs font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
          >
            <span aria-hidden="true">▣</span>
            Validar dataset
          </button>

          <form action={registrarEntrenamientoDesdeArtefactos}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#7c3aed] px-5 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition hover:bg-[#6d28d9]"
            >
              <span aria-hidden="true">↑</span>
              Enviar a entrenamiento
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon="database"
          label="Registros totales"
          value={totalRows.toLocaleString("es-PE")}
          tone="purple"
        />

        <KpiCard
          icon="check"
          label="Registros válidos"
          value={validRows.toLocaleString("es-PE")}
          detail={`${percent(validRows, Math.max(totalRows, 1))}% del total`}
          tone="green"
        />

        <KpiCard
          icon="warning"
          label="Registros incompletos"
          value={incompleteRows.toLocaleString("es-PE")}
          detail={`${percent(incompleteRows, Math.max(totalRows, 1))}% del total`}
          tone="orange"
        />

        <KpiCard
          icon="trash"
          label="Registros descartados"
          value={discardedRows.toLocaleString("es-PE")}
          detail={`${percent(discardedRows, Math.max(totalRows, 1))}% del total`}
          tone="red"
        />

        <KpiCard
          icon="trend"
          label="Listos para entrenamiento"
          value={readyRows.toLocaleString("es-PE")}
          detail={`${percent(readyRows, Math.max(totalRows, 1))}% del total`}
          tone="blue"
        />
      </section>


      <section className="mt-4 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr_1fr_0.95fr_auto] xl:items-end">
          <SegmentedFilter
            label="Estado del registro"
            options={["Todos", "Válido", "Incompleto", "Descartado"]}
          />

          <Select label="Perfil vocacional">
            <option>Todos</option>
            {profileDistribution.map((item) => (
              <option key={item.label}>{item.label}</option>
            ))}
          </Select>

          <Select label="Fecha">
            <option>Últimos 30 días</option>
            <option>Últimos 7 días</option>
            <option>Histórico</option>
          </Select>

          <SegmentedFilter label="Uso en entrenamiento" options={["Todos", "Sí", "No"]} />

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-7 text-xs font-bold text-white transition hover:bg-[#6d28d9]"
          >
            <span aria-hidden="true">▽</span>
            Filtrar
          </button>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr_1.35fr]">
        <ChartCard title="Distribución por perfil vocacional">
          {profileDistribution.length ? (
            <DonutChart
              centerLabel="perfiles"
              data={profileDistribution.map((item, index) => ({
                ...item,
                color: DONUT_COLORS[index % DONUT_COLORS.length],
              }))}
            />
          ) : (
            <EmptyText>Sin perfiles detectados en la muestra del dataset.</EmptyText>
          )}
        </ChartCard>

        <ChartCard title="Estado de registros">
          <DonutChart
            centerLabel="registros"
            data={[
              { label: "Válidos", value: validRows, color: "#14945a" },
              { label: "Incompletos", value: incompleteRows, color: "#f59e0b" },
              { label: "Descartados", value: discardedRows, color: "#d92d55" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Registros por fecha">
          <LineChart data={dateDistribution} />
        </ChartCard>
      </section>

      <section className="mt-4 grid gap-4">
        <article className="rounded-2xl border border-[#e7e2f4] bg-white shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
          <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
                Registros del dataset
              </h2>
              <p className="mt-1 text-xs font-medium text-[#66708f]">
                Muestra anónima de registros usados para revisión.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-[11px] font-bold text-[#7c3aed]">
              Mostrando {sampleRows.length} de {totalRows.toLocaleString("es-PE")} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-[#faf8ff] text-left text-[#53607e]">
                  {[
                    "ID sesión",
                    "Estado",
                    "Perfil sugerido",
                    "Preguntas respondidas",
                    "Confianza",
                    "Fecha",
                    "Uso en entrenamiento",
                    "Acciones",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.03em] first:pl-4 last:pr-4"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sampleRows.map((row, index) => {
                  const status = getRecordStatus(row);
                  const confidence = getConfidence(row);

                  return (
                    <tr key={index} className="transition hover:bg-[#fbfaff]">
                      <td className="border-b border-[#eef0f6] px-3 py-2.5 font-bold text-[#071033] first:pl-4">
                        {getSessionId(row, index)}
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#071033]">
                        <span className="line-clamp-2">{getProfile(row)}</span>
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#4c5578]">
                        {getAnsweredQuestions(row, totalColumns)}
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5">
                        <ConfidenceBadge value={confidence} />
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#4c5578]">
                        <span className="line-clamp-2">{getDateValue(row)}</span>
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5">
                        <TrainingUseBadge value={status === "Válido"} />
                      </td>
                      <td className="border-b border-[#eef0f6] px-3 py-2.5 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-[#cdbdf9] px-3 py-1.5 text-[11px] font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
                          >
                            Ver detalle
                          </button>
                          {status !== "Válido" ? (
                            <button
                              type="button"
                              className="rounded-lg border border-[#d8d2e7] px-3 py-1.5 text-[11px] font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
                            >
                              Revisar
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!sampleRows.length && (
              <p className="py-10 text-center text-xs font-medium text-[#6e7696]">
                No hay registros disponibles para mostrar.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e7e2f4] bg-white shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
          <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
                Features utilizadas
              </h2>
              <p className="mt-1 text-xs font-medium text-[#66708f]">
                Variables consideradas para el entrenamiento.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-[11px] font-bold text-[#7c3aed]">
              {features.length} features
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-[#faf8ff] text-left text-[#53607e]">
                  {["Feature", "Grupo", "Tipo", "Descripción", "Usada"].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.03em] first:pl-4 last:pr-4"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {features.slice(0, 8).map((feature) => (
                  <tr key={feature.name} className="transition hover:bg-[#fbfaff]">
                    <td className="border-b border-[#eef0f6] px-3 py-2.5 font-bold text-[#071033] first:pl-4">
                      {feature.name}
                    </td>
                    <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#4c5578]">
                      {feature.group}
                    </td>
                    <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#4c5578]">
                      {feature.type}
                    </td>
                    <td className="border-b border-[#eef0f6] px-3 py-2.5 font-medium text-[#4c5578]">
                      <span className="line-clamp-2">{feature.description}</span>
                    </td>
                    <td className="border-b border-[#eef0f6] px-3 py-2.5 pr-4">
                      <TrainingUseBadge value />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!features.length && (
              <p className="py-10 text-center text-xs font-medium text-[#6e7696]">
                No se encontraron features en el dataset.
              </p>
            )}
          </div>
        </article>
      </section>

    </AdminShell>
  );
}

function KpiCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail?: string;
  icon: "database" | "check" | "warning" | "trash" | "trend";
  label: string;
  tone: "purple" | "green" | "orange" | "red" | "blue";
  value: string;
}) {
  const toneClass = {
    purple: "bg-[#efe8ff] text-[#7c3aed]",
    green: "bg-[#dcf7ea] text-[#14945a]",
    orange: "bg-[#fff0d8] text-[#d97604]",
    red: "bg-[#ffe5ee] text-[#d92d55]",
    blue: "bg-[#e6f4ff] text-[#1684d6]",
  }[tone];

  return (
    <article className="flex min-h-[94px] items-center gap-3 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClass}`}>
        <DatasetIcon name={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#66708f]">{label}</p>
        <p className="mt-1 text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-[#071033]">
          {value}
        </p>
        {detail ? <p className="mt-0.5 text-[11px] font-semibold text-[#14945a]">{detail}</p> : null}
      </div>
    </article>
  );
}

function SegmentedFilter({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <p className="text-xs font-bold text-[#071033]">{label}</p>
      <div
        className="grid min-h-10 overflow-hidden rounded-xl border border-[#d8d2e7] bg-white"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`min-w-0 px-2 text-center text-[11px] font-bold leading-tight transition ${
              index === 0
                ? "bg-[#f6f3ff] text-[#7c3aed]"
                : "border-l border-[#e8e2f5] text-[#071033] hover:bg-[#fbfaff]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Select({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#071033]">
      {label}
      <select className="min-h-10 rounded-xl border border-[#d8d2e7] bg-white px-4 text-xs font-medium text-[#071033] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]">
        {children}
      </select>
    </label>
  );
}

function ChartCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
      <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

const DONUT_COLORS = [
  "#7c3aed",
  "#22a7d8",
  "#14945a",
  "#f59e0b",
  "#ef5da8",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

function DonutChart({
  centerLabel,
  data,
}: {
  centerLabel: string;
  data: Array<{
    color: string;
    label: string;
    value: number;
  }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(total, 1);
  const gradient = buildDonutGradient(data, safeTotal);

  return (
    <div className="grid min-h-[250px] gap-4">
      <div
        className="relative mx-auto h-[158px] w-[158px] rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-[43px] grid place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-xl font-bold text-[#071033]">
              {total.toLocaleString("es-PE")}
            </p>
            <p className="text-[10px] font-semibold text-[#6e7696]">
              {centerLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((item) => {
          const itemPercent = total ? (item.value / total) * 100 : 0;

          return (
            <div
              key={item.label}
              className="flex min-w-0 items-center gap-2 text-[11px]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold text-[#4c5578]">
                {item.label}
              </span>
              <span className="shrink-0 font-bold text-[#071033]">
                {itemPercent.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildDonutGradient(
  data: Array<{ color: string; value: number }>,
  total: number,
) {
  if (!data.length) {
    return "conic-gradient(#eef0f6 0deg 360deg)";
  }

  let cursor = 0;

  const segments = data.map((item) => {
    const start = cursor;
    const degrees = (item.value / total) * 360;
    const end = cursor + degrees;
    cursor = end;

    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function HorizontalBar({
  label,
  max,
  tone = "purple",
  value,
}: {
  label: string;
  max: number;
  tone?: "purple" | "green" | "orange" | "red";
  value: number;
}) {
  const width = Math.max(4, (value / Math.max(max, 1)) * 100);
  const color = {
    purple: "bg-[#7c3aed]",
    green: "bg-[#14945a]",
    orange: "bg-[#f59e0b]",
    red: "bg-[#d92d55]",
  }[tone];

  return (
    <div>
      <div className="mb-1.5 flex justify-between gap-3 text-xs font-medium text-[#5d6685]">
        <span className="truncate">{label}</span>
        <span className="shrink-0 font-bold text-[#071033]">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#eef0f6]">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function LineChart({ data }: { data: DatePoint[] }) {
  const points = data.length ? data : [{ label: "Sin datos", value: 0 }];
  const highestValue = Math.max(1, ...points.map((point) => point.value));
  const axisMax = getNiceAxisMax(highestValue);
  const yTicks = buildYAxisTicks(axisMax);
  const chartPoints = points
    .map((point, index) => linePoint(point.value, index, points.length, axisMax))
    .join(" ");

  return (
    <div>
      <svg
        viewBox="0 0 560 250"
        className="h-[230px] w-full overflow-visible"
        role="img"
        aria-label="Registros por fecha"
      >
        {yTicks.map((tick) => {
          const y = yPosition(tick, axisMax);

          return (
            <g key={tick}>
              <line
                x1="48"
                x2="528"
                y1={y}
                y2={y}
                stroke="#e8ebf3"
                strokeWidth="1.2"
              />
              <text
                x="34"
                y={y + 4}
                textAnchor="end"
                fill="#6e7696"
                fontSize="10"
                fontWeight="600"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path
          d={`M48,190 L528,190 L528,${yPosition(points[points.length - 1]?.value ?? 0, axisMax)} ${chartPoints
            .split(" ")
            .reverse()
            .join(" L")} Z`}
          fill="#7c3aed"
          opacity="0.08"
        />

        <polyline
          points={chartPoints}
          fill="none"
          stroke="#7c3aed"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {points.map((point, index) => {
          const [x, y] = linePoint(point.value, index, points.length, axisMax)
            .split(",")
            .map(Number);

          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="4" fill="#7c3aed" />
              <text
                x={x}
                y={y - 11}
                textAnchor="middle"
                fill="#071033"
                fontSize="10"
                fontWeight="700"
              >
                {point.value}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => (
          <text
            key={`${point.label}-label`}
            x={48 + index * (480 / Math.max(1, points.length - 1))}
            y="224"
            textAnchor="middle"
            fill="#6e7696"
            fontSize="10"
            fontWeight="600"
          >
            {point.label}
          </text>
        ))}
      </svg>

      <p className="mt-1 text-[11px] font-medium text-[#6e7696]">
        La escala se ajusta automáticamente según la cantidad máxima de registros.
      </p>
    </div>
  );
}

function linePoint(value: number, index: number, total: number, axisMax: number) {
  const x = 48 + index * (480 / Math.max(1, total - 1));
  const y = yPosition(value, axisMax);

  return `${x},${y}`;
}

function yPosition(value: number, axisMax: number) {
  return 190 - (value / Math.max(axisMax, 1)) * 150;
}

function getNiceAxisMax(value: number) {
  if (value <= 10) return 10;
  if (value <= 20) return 20;
  if (value <= 50) return Math.ceil(value / 10) * 10;
  if (value <= 100) return Math.ceil(value / 20) * 20;
  if (value <= 500) return Math.ceil(value / 50) * 50;

  return Math.ceil(value / 100) * 100;
}

function buildYAxisTicks(axisMax: number) {
  const step = axisMax / 4;

  return [axisMax, axisMax - step, axisMax - step * 2, axisMax - step * 3, 0].map((tick) =>
    Math.round(tick),
  );
}

function StatusBadge({ status }: { status: "Válido" | "Incompleto" | "Descartado" }) {
  const styles = {
    Válido: "bg-[#ddf8e9] text-[#108a53]",
    Incompleto: "bg-[#fff0d8] text-[#b05d00]",
    Descartado: "bg-[#ffe5ee] text-[#d92d55]",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const label = value >= 80 ? "Alta" : value >= 60 ? "Media" : value > 0 ? "Baja" : "—";
  const styles =
    value >= 80
      ? "bg-[#ddf8e9] text-[#108a53]"
      : value >= 60
        ? "bg-[#fff0d8] text-[#b05d00]"
        : value > 0
          ? "bg-[#ffe5ee] text-[#d92d55]"
          : "bg-[#eef0f6] text-[#6e7696]";

  return <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${styles}`}>{label}</span>;
}

function TrainingUseBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
        value ? "bg-[#ddf8e9] text-[#108a53]" : "bg-[#eef0f6] text-[#6e7696]"
      }`}
    >
      {value ? "Sí" : "No"}
    </span>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-xs font-medium text-[#6e7696]">{children}</p>;
}

function DatasetIcon({
  name,
}: {
  name: "database" | "check" | "warning" | "trash" | "trend";
}) {
  const common = {
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.1,
    viewBox: "0 0 24 24",
  };

  if (name === "database") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
        <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 15H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    );
  }

  if (name === "trend") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 17 10 11l4 4 6-8" />
        <path d="M14 7h6v6" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="m12 3 10 18H2z" />
      <path d="M12 9v5" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function percent(value: number, total: number) {
  return ((value / total) * 100).toFixed(1);
}

function getFeatures(dataset: DatasetSummary | undefined) {
  const headers = dataset?.sample[0]?.map((cell) => cell.header) ?? [];

  return headers
    .filter((header) => isUsefulFeature(header))
    .map((header) => ({
      description: describeFeature(header),
      group: groupFeature(header),
      name: header,
      type: "Numérica",
    }));
}

function isUsefulFeature(header: string) {
  const lower = header.toLowerCase();

  return (
    lower.includes("score") ||
    lower.includes("realista") ||
    lower.includes("investigador") ||
    lower.includes("artistico") ||
    lower.includes("social") ||
    lower.includes("emprendedor") ||
    lower.includes("convencional") ||
    lower.includes("apertura") ||
    lower.includes("responsabilidad") ||
    lower.includes("extravers") ||
    lower.includes("amabilidad") ||
    lower.includes("neurotic") ||
    lower.includes("presion") ||
    lower.includes("incertidumbre") ||
    lower.includes("tolerancia")
  );
}

function groupFeature(header: string) {
  const lower = header.toLowerCase();

  if (
    lower.includes("realista") ||
    lower.includes("investigador") ||
    lower.includes("artistico") ||
    lower.includes("social") ||
    lower.includes("emprendedor") ||
    lower.includes("convencional")
  ) {
    return "RIASEC";
  }

  if (
    lower.includes("apertura") ||
    lower.includes("responsabilidad") ||
    lower.includes("extravers") ||
    lower.includes("amabilidad") ||
    lower.includes("neurotic")
  ) {
    return "Big Five";
  }

  if (
    lower.includes("presion") ||
    lower.includes("incertidumbre") ||
    lower.includes("tolerancia")
  ) {
    return "Contextual";
  }

  return "Variable";
}

function describeFeature(header: string) {
  const lower = header.toLowerCase();

  if (lower.includes("realista")) return "Puntaje de dimensión Realista";
  if (lower.includes("investigador")) return "Puntaje de dimensión Investigador";
  if (lower.includes("artistico")) return "Puntaje de dimensión Artística";
  if (lower.includes("social")) return "Puntaje de dimensión Social";
  if (lower.includes("emprendedor")) return "Puntaje de dimensión Emprendedora";
  if (lower.includes("convencional")) return "Puntaje de dimensión Convencional";
  if (lower.includes("apertura")) return "Rasgo de apertura";
  if (lower.includes("presion")) return "Señal de presión externa";
  if (lower.includes("incertidumbre")) return "Nivel de incertidumbre";
  if (lower.includes("tolerancia")) return "Tolerancia a la dificultad";

  return "Variable usada para análisis o entrenamiento";
}

function buildProfileDistribution(rows: SampleRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const profile = getProfile(row);
    if (!profile || profile === "—") return;

    counts.set(profile, (counts.get(profile) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function getCell(row: SampleRow, patterns: RegExp[]) {
  const cell = row.find((item) =>
    patterns.some((pattern) => pattern.test(item.header.toLowerCase())),
  );

  return cleanDatasetText(cell?.value?.toString().trim() || "");
}

function cleanDatasetText(value: string) {
  return value
    .replace(/dataset inicial/gi, "Dataset actual")
    .replace(/data inicial/gi, "Dataset actual")
    .replace(/inicial/gi, "actual");
}

function getSessionId(row: SampleRow, index: number) {
  const rawId =
    getCell(row, [/participant/, /session/, /sesion/, /^id$/]) ||
    `P${String(index + 1).padStart(3, "0")}`;

  if (rawId.length <= 12) return rawId;

  return `RF-${rawId.slice(0, 8).toUpperCase()}`;
}

function getProfile(row: SampleRow) {
  return (
    getCell(row, [/perfil/, /profile/, /predicted/]) ||
    "—"
  );
}

function getRecordStatus(row: SampleRow): "Válido" | "Incompleto" | "Descartado" {
  const rawStatus = getCell(row, [/estado/, /status/]).toLowerCase();

  if (rawStatus.includes("cancel") || rawStatus.includes("descart")) return "Descartado";
  if (rawStatus.includes("progress") || rawStatus.includes("progreso") || rawStatus.includes("incompleto")) return "Incompleto";

  return "Válido";
}

function getConfidence(row: SampleRow) {
  const rawValue = getCell(row, [/confidence/, /confianza/]);
  const value = Number(rawValue.replace("%", "").replace(",", "."));

  return Number.isFinite(value) ? value : 0;
}

function getAnsweredQuestions(row: SampleRow, totalColumns: number) {
  const answered = getCell(row, [/preguntas/, /questions/, /answers/]);
  if (answered) return answered;

  return `${Math.max(0, totalColumns - 1)} / ${Math.max(0, totalColumns - 1)}`;
}

function getDateValue(row: SampleRow) {
  const rawDate = getCell(row, [/fecha/, /date/, /created/, /finished/]);
  if (!rawDate) return "—";

  const cleaned = rawDate.replaceAll('"', "").trim();
  const parsed = new Date(cleaned);

  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    }).format(parsed);
  }

  return cleaned;
}

function buildDatePointsUnused(rows: SampleRow[]) {
  if (!rows.length) {
    return [
      { label: "Día 1", value: 0 },
      { label: "Día 2", value: 0 },
      { label: "Día 3", value: 0 },
      { label: "Día 4", value: 0 },
      { label: "Día 5", value: 0 },
    ];
  }

  return rows.map((row, index) => ({
    label: getDateValue(row) !== "—" ? `R${index + 1}` : `R${index + 1}`,
    value: index + 1,
  }));
}

const legacyDatasetDerivers = [
  getFeatures,
  buildProfileDistribution,
  buildDatePointsUnused,
];

void legacyDatasetDerivers;
