import { cerrarSesionAdministrador, requerirAdminActual } from "@/backend/admin/auth";
import {
  construirWhereResultadosReporte,
  construirWhereSesionesReporte,
  obtenerResultadosReporte,
  type ReportFilters,
} from "@/backend/admin/reports";
import { prisma } from "@/backend/db/prisma";
import type { Prisma, TestSessionStatus } from "@/backend/generated/prisma/client";
import { AdminShell } from "@/frontend/admin/AdminShell";

export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const currentAdmin = await requerirAdminActual();
  const params = await searchParams;

  const profile = first(params.profile);
  const status = first(params.status);
  const model = first(params.model);
  const from = first(params.from);
  const to = first(params.to);
  const filters: ReportFilters = { from, model, profile, status, to };
  const resultWhere = construirWhereResultadosReporte(filters);
  const completedSessionWhere = construirWhereSesionesReporte({
    from,
    status: "COMPLETED",
    to,
  });
  const incompleteStartedAt = sessionDateRange(from, to);

  const [
    results,
    resultsCount,
    confidenceResults,
    profiles,
    models,
    profileGroups,
    completedSessions,
    incompleteSessions,
  ] = await Promise.all([
    obtenerResultadosReporte(filters, 50),
    prisma.testResult.count({
      where: resultWhere,
    }),
    prisma.testResult.findMany({
      where: resultWhere,
      select: {
        confidenceScore: true,
      },
    }),
    prisma.vocationalProfile.findMany({ orderBy: { name: "asc" } }),
    prisma.testResult.findMany({
      distinct: ["modelUsed"],
      select: { modelUsed: true },
      orderBy: { modelUsed: "asc" },
    }),
    prisma.testResult.groupBy({
      by: ["predictedProfileId"],
      where: resultWhere,
      _count: { _all: true },
      orderBy: { _count: { predictedProfileId: "desc" } },
    }),
    prisma.testSession.findMany({
      where: completedSessionWhere,
      select: { finishedAt: true },
      orderBy: { finishedAt: "asc" },
    }),
    prisma.testSession.count({
      where: {
        status: { not: "COMPLETED" },
        ...(incompleteStartedAt ? { startedAt: incompleteStartedAt } : {}),
      },
    }),
  ]);

  const profileNameById = new Map(profiles.map((item) => [item.id, item.name]));
  const query = new URLSearchParams(
    Object.entries({ from, model, profile, status, to }).flatMap(([key, value]) =>
      value ? [[key, value]] : [],
    ),
  ).toString();

  const completedCount = completedSessions.length;
  const mostFrequentProfile = profileGroups[0]
    ? profileNameById.get(profileGroups[0].predictedProfileId) ?? "Perfil"
    : "Sin resultados";

  const confidenceValues = confidenceResults
    .map((item) => Number(item.confidenceScore ?? 0))
    .filter((value) => value > 0);

  const averageConfidence = confidenceValues.length
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : 0;

  const confidenceGroups = [
    {
      label: "Alta (80% - 100%)",
      value: confidenceValues.filter((value) => value >= 80).length,
    },
    {
      label: "Media (60% - 79%)",
      value: confidenceValues.filter((value) => value >= 60 && value < 80).length,
    },
    {
      label: "Baja (<60%)",
      value: confidenceValues.filter((value) => value > 0 && value < 60).length,
    },
  ];

  const completedTrend = buildCompletedTrend(completedSessions);
  const maxProfileCount = Math.max(...profileGroups.map((item) => item._count._all), 1);
  const maxConfidenceCount = Math.max(...confidenceGroups.map((item) => item.value), 1);

  return (
    <AdminShell
      active="Reportes"
      currentAdmin={currentAdmin}
      logoutAction={cerrarSesionAdministrador}
      fullWidth
    >
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#071033]">
            Reportes
          </h1>
          <p className="mt-1 text-sm font-medium text-[#66708f]">
            Consulta resultados agregados del test vocacional anónimo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ExportButton href={`/api/admin/reportes/resultados/pdf${query ? `?${query}` : ""}`}>
            Exportar PDF
          </ExportButton>
          <ExportButton href={`/api/admin/reportes/resultados/excel${query ? `?${query}` : ""}`}>
            Exportar Excel
          </ExportButton>
          <ExportButton href={`/api/admin/reportes/resultados${query ? `?${query}` : ""}`}>
            Exportar CSV
          </ExportButton>
        </div>
      </header>

      <form className="grid gap-4 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)] xl:grid-cols-[0.85fr_0.85fr_1.2fr_1.05fr_1.05fr_auto]">
        <Input label="Desde" name="from" type="date" value={from} />
        <Input label="Hasta" name="to" type="date" value={to} />

        <Select label="Perfil vocacional" name="profile" value={profile}>
          <option value="">Todos</option>
          {profiles.map((item) => (
            <option key={item.id} value={item.code}>
              {item.name}
            </option>
          ))}
        </Select>

        <Select label="Estado del test" name="status" value={status}>
          <option value="">Todos</option>
          <option value="COMPLETED">Completado</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="CANCELLED">Cancelado</option>
        </Select>

        <Select label="Modelo usado" name="model" value={model}>
          <option value="">Todos</option>
          {models.map((item) => (
            <option key={item.modelUsed} value={item.modelUsed}>
              {formatModelName(item.modelUsed)}
            </option>
          ))}
        </Select>

        <div className="grid content-end">
          <button className="min-h-10 rounded-xl bg-[#7c3aed] px-5 text-xs font-bold text-white transition hover:bg-[#6d28d9]">
            Filtrar
          </button>
        </div>
      </form>

      

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon="clipboard"
          label="Tests completados"
          value={completedCount.toLocaleString("es-PE")}
          tone="purple"
        />
        <KpiCard
          icon="document"
          label="Resultados emitidos"
          value={resultsCount.toLocaleString("es-PE")}
          tone="green"
        />
        <KpiCard
          icon="profile"
          label="Perfil más frecuente"
          value={mostFrequentProfile}
          tone="blue"
          textValue
        />
        <KpiCard
          icon="shield"
          label="Promedio de confianza"
          value={averageConfidence ? `${averageConfidence.toFixed(1)}%` : "—"}
          tone="purple"
        />
        <KpiCard
          icon="warning"
          label="Sesiones incompletas"
          value={incompleteSessions.toLocaleString("es-PE")}
          tone="orange"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard title="Resultados por perfil vocacional">
          <div className="grid gap-3">
            {profileGroups.slice(0, 6).map((group) => (
              <HorizontalBar
                key={group.predictedProfileId}
                label={profileNameById.get(group.predictedProfileId) ?? "Perfil"}
                value={group._count._all}
                max={maxProfileCount}
              />
            ))}

            {!profileGroups.length && <EmptyText>Sin resultados para mostrar.</EmptyText>}
          </div>
        </ChartCard>

        <ChartCard title="Evolución de tests completados">
          <LineChart points={completedTrend} />
        </ChartCard>

        <ChartCard title="Distribución de confianza">
          <div className="grid gap-4">
            {confidenceGroups.map((item) => (
              <HorizontalBar
                key={item.label}
                label={item.label}
                value={item.value}
                max={maxConfidenceCount}
              />
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="mt-4 rounded-2xl border border-[#e7e2f4] bg-white shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
        <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
              Resultados anónimos
            </h2>
            <p className="mt-1 text-xs font-medium text-[#66708f]">
              Últimos resultados generados por el test.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-[11px] font-bold text-[#7c3aed]">
            Mostrando {results.length} de {resultsCount} resultados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="bg-[#faf8ff] text-left text-[#53607e]">
                {[
                  "ID sesión",
                  "Perfil sugerido",
                  "Nivel de confianza",
                  "Modelo usado",
                  "Fecha",
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
              {results.map((result) => (
                <tr key={result.id} className="transition hover:bg-[#fbfaff]">
                  <td className="border-b border-[#eef0f6] px-4 py-3 font-bold text-[#071033] first:pl-5">
                    {result.session.participantCode ??
                      `RF-${result.sessionId.slice(0, 8).toUpperCase()}`}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3 font-medium text-[#071033]">
                    {result.predictedProfile.name}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3">
                    <ConfidenceBadge value={Number(result.confidenceScore ?? 0)} />
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3 font-medium text-[#4c5578]">
                    {formatModelName(result.modelUsed)}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3 font-medium text-[#4c5578]">
                    {formatDate(result.createdAt)}
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3">
                    <StatusBadge status={result.session.status} />
                  </td>

                  <td className="border-b border-[#eef0f6] px-4 py-3 pr-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#cdbdf9] px-3 py-1.5 text-[11px] font-bold text-[#7c3aed] transition hover:bg-[#f6f3ff]"
                      >
                        Ver detalle
                      </button>

                      <a
                        className="rounded-lg border border-[#d8d2e7] px-3 py-1.5 text-[11px] font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
                        href={`/api/admin/reportes/resultados${query ? `?${query}` : ""}`}
                      >
                        Exportar
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!results.length && (
            <p className="py-10 text-center text-xs font-medium text-[#6e7696]">
              No hay resultados anónimos con los filtros seleccionados.
            </p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function ExportButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ded7f4] bg-white px-5 text-xs font-bold text-[#071033] transition hover:bg-[#f6f3ff]"
      href={href}
    >
      <span aria-hidden="true">↓</span>
      {children}
    </a>
  );
}

function KpiCard({
  icon,
  label,
  textValue = false,
  tone,
  value,
}: {
  icon: "clipboard" | "document" | "profile" | "shield" | "warning";
  label: string;
  textValue?: boolean;
  tone: "purple" | "green" | "blue" | "orange";
  value: string;
}) {
  const toneClass = {
    purple: "bg-[#efe8ff] text-[#7c3aed]",
    green: "bg-[#dcf7ea] text-[#14945a]",
    blue: "bg-[#e6f4ff] text-[#1684d6]",
    orange: "bg-[#fff0d8] text-[#d97604]",
  }[tone];

  return (
    <article className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-[#e7e2f4] bg-white p-4 shadow-[0_10px_28px_rgba(37,44,97,0.04)]">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClass}`}>
        <ReportIcon name={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#66708f]">{label}</p>
        <p
          className={`mt-1 leading-tight text-[#071033] ${
            textValue
              ? "text-[1rem] font-bold"
              : "text-[1.35rem] font-bold tracking-[-0.02em]"
          }`}
        >
          {value}
        </p>
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
  name: string;
  value?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#071033]">
      {label}
      <select
        className="min-h-10 rounded-xl border border-[#d8d2e7] bg-white px-4 text-xs font-medium text-[#071033] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]"
        defaultValue={value ?? ""}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

function Input({
  label,
  name,
  type,
  value,
}: {
  label: string;
  name: string;
  type: string;
  value?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#071033]">
      {label}
      <input
        className="min-h-10 rounded-xl border border-[#d8d2e7] bg-white px-4 text-xs font-medium text-[#071033] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]"
        defaultValue={value ?? ""}
        name={name}
        type={type}
      />
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
      <h2 className="text-[1rem] font-bold tracking-[-0.01em] text-[#071033]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function HorizontalBar({
  label,
  max,
  value,
}: {
  label: string;
  max: number;
  value: number;
}) {
  const width = Math.max(4, (value / Math.max(max, 1)) * 100);

  return (
    <div>
      <div className="mb-1.5 flex justify-between gap-3 text-xs font-medium text-[#5d6685]">
        <span className="truncate">{label}</span>
        <span className="shrink-0 font-bold text-[#071033]">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#eef0f6]">
        <div
          className="h-2.5 rounded-full bg-[#7c3aed]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function LineChart({
  points,
}: {
  points: Array<{ label: string; value: number }>;
}) {
  const safePoints = points.length ? points : [{ label: "", value: 0 }];
  const max = Math.max(1, ...safePoints.map((point) => point.value)) * 1.15;

  const chartPoints = safePoints
    .map((point, index) => linePoint(point.value, index, safePoints.length, max))
    .join(" ");

  return (
    <svg
      viewBox="0 0 420 210"
      className="h-[210px] w-full overflow-visible"
      role="img"
      aria-label="Evolución de tests completados"
    >
      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="36"
          x2="392"
          y1={28 + line * 42}
          y2={28 + line * 42}
          stroke="#e8ebf3"
          strokeWidth="1.2"
        />
      ))}

      <polyline
        points={chartPoints}
        fill="none"
        stroke="#7c3aed"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />

      {safePoints.map((point, index) => {
        const [x, y] = linePoint(point.value, index, safePoints.length, max)
          .split(",")
          .map(Number);

        return <circle key={point.label} cx={x} cy={y} r="4" fill="#7c3aed" />;
      })}

      {safePoints.map((point, index) => (
        <text
          key={`${point.label}-label`}
          x={42 + index * (340 / Math.max(1, safePoints.length - 1))}
          y="194"
          textAnchor="middle"
          fill="#6e7696"
          fontSize="10"
          fontWeight="600"
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function linePoint(value: number, index: number, total: number, max: number) {
  const x = 42 + index * (340 / Math.max(1, total - 1));
  const y = 166 - (value / max) * 130;

  return `${x},${y}`;
}

function ConfidenceBadge({ value }: { value: number }) {
  const tone =
    value >= 80
      ? "bg-[#ddf8e9] text-[#108a53]"
      : value >= 60
        ? "bg-[#e8eefc] text-[#4168d8]"
        : "bg-[#fff0d8] text-[#b05d00]";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tone}`}>
      {value ? `${value.toFixed(0)}%` : "—"}
    </span>
  );
}

function StatusBadge({ status }: { status: TestSessionStatus }) {
  const label = {
    COMPLETED: "Completado",
    IN_PROGRESS: "En progreso",
    CANCELLED: "Cancelado",
  }[status];

  const tone =
    status === "COMPLETED"
      ? "bg-[#ddf8e9] text-[#108a53]"
      : status === "IN_PROGRESS"
        ? "bg-[#fff0d8] text-[#b05d00]"
        : "bg-[#e8eefc] text-[#4168d8]";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-xs font-medium text-[#6e7696]">{children}</p>;
}

function ReportIcon({
  name,
}: {
  name: "clipboard" | "document" | "profile" | "shield" | "warning";
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

  if (name === "clipboard") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4a3 3 0 0 1 6 0" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (name === "document") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-5" />
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

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sessionDateRange(
  from?: string,
  to?: string,
): Prisma.DateTimeFilter<"TestSession"> | undefined {
  const range: Prisma.DateTimeFilter<"TestSession"> = {};

  if (from) {
    range.gte = new Date(`${from}T00:00:00.000-05:00`);
  }

  if (to) {
    range.lte = new Date(`${to}T23:59:59.999-05:00`);
  }

  return Object.keys(range).length > 0 ? range : undefined;
}

function buildCompletedTrend(sessions: Array<{ finishedAt: Date | null }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
      }).format(date),
      value: 0,
    };
  });

  const dayByKey = new Map(days.map((day) => [day.key, day]));

  sessions.forEach((session) => {
    if (!session.finishedAt) return;

    const key = session.finishedAt.toISOString().slice(0, 10);
    const day = dayByKey.get(key);

    if (day) {
      day.value += 1;
    }
  });

  return days.map(({ label, value }) => ({ label, value }));
}

function formatModelName(value: string) {
  const labels: Record<string, string> = {
    decision_tree: "Árbol de decisión",
    knn: "KNN",
    logistic_regression: "Regresión logística",
    random_forest: "Random Forest",
    svm: "SVM",
  };

  return labels[value] ?? value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
