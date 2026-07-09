import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";
import { DashboardIcon } from "./DashboardIcon";

type ActivityPoint = {
  label: string;
  sessions: number;
  completed: number;
};

type DistributionItem = {
  label: string;
  percent: number;
  value: number;
};

type RecentSession = {
  date: string;
  id: string;
  questions: number;
  status: string;
  suggestedProfile: string | null;
};

type AlertTone = "success" | "warning" | "info";

export type AdminDashboardData = {
  activity: ActivityPoint[];
  alerts: Array<{
    detail: string;
    title: string;
    tone: AlertTone;
  }>;
  dateRange: string;
  generatedAt: string;
  model: {
    accuracy: number;
    datasetRows: number;
    f1Score: number;
    features: number;
    lastTraining: string;
    metrics: Array<{
      accuracy: number;
      f1Score: number;
      modelName: string;
      precision: number;
      recall: number;
    }>;
    name: string;
    precision: number;
    realRows: number;
    recall: number;
    syntheticRows: number;
    syntheticShare: number;
    trainTestSplit: string;
    version: string;
  };
  profileDistribution: DistributionItem[];
  recentSessions: RecentSession[];
  summary: {
    activeQuestions: number;
    adminUsers: number;
    anonymousSessions: number;
    completedTests: number;
    datasetRecords: number;
    generatedPredictions: number;
    modelAccuracy: number;
  };
};

type CurrentAdmin = {
  email: string;
  name: string;
  role: string;
};

const distributionColors = [
  "#7c3aed",
  "#22a7d8",
  "#49c98b",
  "#f5a524",
  "#35b8d5",
  "#e85cad",
];

export function AdminDashboard({
  currentAdmin,
  data,
  logoutAction,
}: {
  currentAdmin: CurrentAdmin;
  data: AdminDashboardData;
  logoutAction: () => Promise<void>;
}) {
  return (
    <AdminShell
      active="Dashboard"
      currentAdmin={currentAdmin}
      logoutAction={logoutAction}
    >
      <Header generatedAt={data.generatedAt} />

      <SummaryGrid data={data} />

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.72fr_0.95fr]">
        <Panel title="Actividad de tests">
          <LineChart points={data.activity} />
        </Panel>

        <Panel title="Modelo activo">
          <ModelStatus model={data.model} />
        </Panel>

        <Panel title="Distribución vocacional">
          <DistributionChart items={data.profileDistribution} />
        </Panel>
      </section>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-[auto_1.6fr_1.05fr]">
        <div className="grid w-fit gap-3">
          <QuickStatCard
            accent="purple"
            href="/admin/dataset"
            icon="database"
            label="Dataset"
            meta="Registros"
            value={formatNumber(data.summary.datasetRecords)}
          />

          <QuickStatCard
            accent="pink"
            href="/admin/preguntas"
            icon="questions"
            label={
              <>
                Banco de
                <br />
                preguntas
              </>
            }
            meta="Preguntas"
            value={formatNumber(data.summary.activeQuestions)}
          />

          <QuickStatCard
            accent="green"
            href="/admin/accesos"
            icon="access"
            label="Accesos"
            meta="Usuarios"
            value={formatNumber(data.summary.adminUsers)}
          />
        </div>

        <Panel title="Últimas sesiones anónimas">
          <RecentSessions rows={data.recentSessions.slice(0, 4)} />
        </Panel>

        <Panel title="Alertas recientes">
          <AlertList alerts={data.alerts.slice(0, 3)} />
        </Panel>
      </section>

      <p className="py-4 text-center text-[11px] font-medium text-[#7a829f]">
        RutaFuturo - Panel administrativo anonimizado - Actualizado{" "}
        {data.generatedAt}
      </p>
    </AdminShell>
  );
}

function Header({ generatedAt }: { generatedAt: string }) {
  const rangeItems = [
    { href: "/admin?rango=1", label: "Hoy" },
    { href: "/admin?rango=7", label: "Últimos 7 días" },
    { href: "/admin?rango=30", label: "Últimos 30 días" },
  ];

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-[1.95rem] font-semibold leading-tight tracking-[-0.02em] text-[#071033]">
          Dashboard administrativo
        </h2>
        <p className="mt-1 text-sm font-medium text-[#66708f]">
          Resumen general del sistema RutaFuturo
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-grid grid-cols-3 overflow-hidden rounded-xl border border-[#e4e6f0] bg-white p-1 text-xs font-semibold text-[#66708f] shadow-[0_10px_28px_rgba(31,40,89,0.04)]">
          {rangeItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-lg px-5 py-2 text-center transition hover:bg-[#f6f3ff] hover:text-[#7c3aed]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl border border-[#e4e6f0] bg-white px-4 py-2.5 text-xs font-semibold text-[#66708f] shadow-[0_10px_28px_rgba(31,40,89,0.04)] transition hover:bg-[#f6f3ff]"
        >
          <span className="h-2 w-2 rounded-full bg-[#24c06f]" />
          <span>Actualizado {generatedAt}</span>
          <span className="text-[#7c3aed]">↻</span>
        </Link>
      </div>
    </header>
  );
}

function SummaryGrid({ data }: { data: AdminDashboardData }) {
  const warningCount = data.alerts.filter((alert) => alert.tone === "warning")
    .length;

  const cards = [
    {
      accent: "purple" as const,
      icon: "users",
      label: "Sesiones anónimas",
      meta: `${data.dateRange}: ${formatNumber(sumActivity(data.activity, "sessions"))}`,
      value: formatNumber(data.summary.anonymousSessions),
      isText: false,
    },
    {
      accent: "pink" as const,
      icon: "clipboard",
      label: "Tests completados",
      meta: `${data.dateRange}: ${formatNumber(sumActivity(data.activity, "completed"))}`,
      value: formatNumber(data.summary.completedTests),
      isText: false,
    },
    {
      accent: "green" as const,
      icon: "document",
      label: "Resultados emitidos",
      meta: "Predicciones registradas",
      value: formatNumber(data.summary.generatedPredictions),
      isText: false,
    },
    {
      accent: "blue" as const,
      icon: "model",
      label: "Modelo activo",
      meta: data.summary.modelAccuracy
        ? `${data.summary.modelAccuracy.toFixed(1)}% accuracy`
        : "Sin métricas",
      value: data.model.name,
      isText: true,
    },
    {
      accent: "orange" as const,
      icon: "warning",
      label: "Alertas activas",
      meta: "Requieren atención",
      value: formatNumber(warningCount || data.alerts.length),
      isText: false,
    },
  ];

  return (
    <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </section>
  );
}

function KpiCard({
  accent,
  icon,
  label,
  meta,
  value,
  isText,
}: {
  accent: "purple" | "pink" | "green" | "blue" | "orange";
  icon: string;
  label: string;
  meta: string;
  value: string;
  isText: boolean;
}) {
  return (
    <article className="flex min-h-[94px] items-center gap-3 rounded-2xl border border-[#e7e9f3] bg-white p-4 shadow-[0_10px_28px_rgba(31,40,89,0.045)]">
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${accentClass(
          accent,
        )}`}
      >
        <DashboardIcon name={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#4c5578]">{label}</p>
        <p
          className={`mt-1 leading-tight text-[#071033] ${
            isText
              ? "text-[1.05rem] font-semibold"
              : "text-[1.35rem] font-semibold tracking-[-0.02em]"
          }`}
        >
          {value}
        </p>
        <p
          className={`mt-0.5 text-[11px] font-semibold ${
            accent === "orange" ? "text-[#d97604]" : "text-[#14945a]"
          }`}
        >
          {meta}
        </p>
      </div>
    </article>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-[#e7e9f3] bg-white p-4 shadow-[0_10px_28px_rgba(31,40,89,0.045)]">
      <h2 className="mb-3 text-[1.02rem] font-semibold tracking-[-0.01em] text-[#071033]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LineChart({ points }: { points: ActivityPoint[] }) {
  const safePoints = points.length
    ? points
    : [{ label: "", sessions: 0, completed: 0 }];

  const max =
    Math.max(
      1,
      ...safePoints.flatMap((point) => [point.sessions, point.completed]),
    ) * 1.15;

  const sessionPoints = safePoints
    .map((point, index) =>
      chartPoint(point.sessions, index, safePoints.length, max),
    )
    .join(" ");

  const completedPoints = safePoints
    .map((point, index) =>
      chartPoint(point.completed, index, safePoints.length, max),
    )
    .join(" ");

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-6 text-[11px] font-semibold text-[#55607f]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
          Sesiones anónimas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22a7d8]" />
          Tests completados
        </span>
      </div>

      <svg
        viewBox="0 0 640 230"
        className="h-[210px] w-full overflow-visible"
        role="img"
        aria-label="Actividad de tests"
      >
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="42"
            x2="610"
            y1={28 + line * 38}
            y2={28 + line * 38}
            stroke="#e8ebf3"
            strokeWidth="1.2"
          />
        ))}

        <polyline
          points={sessionPoints}
          fill="none"
          stroke="#7c3aed"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        <polyline
          points={completedPoints}
          fill="none"
          stroke="#22a7d8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {safePoints.map((point, index) => {
          const [x, y] = chartPoint(
            point.sessions,
            index,
            safePoints.length,
            max,
          )
            .split(",")
            .map(Number);

          return (
            <circle
              key={`${point.label}-sessions`}
              cx={x}
              cy={y}
              r="4"
              fill="#7c3aed"
            />
          );
        })}

        {safePoints.map((point, index) => {
          const [x, y] = chartPoint(
            point.completed,
            index,
            safePoints.length,
            max,
          )
            .split(",")
            .map(Number);

          return (
            <circle
              key={`${point.label}-completed`}
              cx={x}
              cy={y}
              r="4"
              fill="#22a7d8"
            />
          );
        })}

        {safePoints.map((point, index) => (
          <text
            key={point.label || index}
            x={54 + index * (540 / Math.max(1, safePoints.length - 1))}
            y="214"
            textAnchor="middle"
            fill="#6e7696"
            fontSize="11"
            fontWeight="600"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function chartPoint(value: number, index: number, total: number, max: number) {
  const x = 54 + index * (540 / Math.max(1, total - 1));
  const y = 188 - (value / max) * 150;

  return `${x},${y}`;
}

function ModelStatus({ model }: { model: AdminDashboardData["model"] }) {
  const rows = [
    ["Accuracy", formatMetric(model.accuracy)],
    ["Precisión", formatMetric(model.precision)],
    ["Recall", formatMetric(model.recall)],
    ["F1 Score", formatMetric(model.f1Score)],
    ["Último entrenamiento", model.lastTraining],
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f4ff] text-[#1684d6]">
          <DashboardIcon name="model" />
        </span>

        <div>
          <p className="text-[11px] font-semibold text-[#4c5578]">
            Modelo seleccionado
          </p>
          <p className="text-[1.05rem] font-semibold leading-tight text-[#7c3aed]">
            {model.name}
          </p>
        </div>
      </div>

      <div className="grid gap-2 text-xs">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef0f6] pb-2.5 last:border-0"
          >
            <span className="font-semibold text-[#6e7696]">{label}</span>
            <span className="text-right font-semibold text-[#273153]">
              {value}
            </span>
          </div>
        ))}
      </div>

      <Link
        className="mt-4 inline-flex rounded-lg border border-[#bfa7ff] px-4 py-2 text-xs font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]"
        href="/admin/modelos"
      >
        Ver en Modelos
      </Link>
    </div>
  );
}

function DistributionChart({ items }: { items: DistributionItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const gradient = buildDonutGradient(items);

  return (
    <div>
      <div className="grid items-center gap-5 sm:grid-cols-[145px_1fr]">
        <div
          className="relative mx-auto rounded-full"
          style={{ background: gradient, width: 136, height: 136 }}
        >
          <div className="absolute inset-9 grid place-items-center rounded-full bg-white text-center">
            <div>
              <p className="text-lg font-semibold text-[#101742]">
                {formatNumber(total)}
              </p>
              <p className="text-[11px] font-semibold text-[#6e7696]">tests</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {items.length ? (
            items.slice(0, 6).map((item, index) => (
              <div
                key={item.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2 font-semibold text-[#4c5578]">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        distributionColors[index % distributionColors.length],
                    }}
                  />
                  <span className="truncate">{item.label}</span>
                </span>

                <span className="font-semibold text-[#101742]">
                  {item.percent.toFixed(1)}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs font-medium text-[#6e7696]">
              Aún no hay predicciones para distribuir.
            </p>
          )}
        </div>
      </div>

      <Link
        className="mt-4 inline-flex rounded-lg border border-[#bfa7ff] px-4 py-2 text-xs font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]"
        href="/admin/reportes"
      >
        Ver resultados
      </Link>
    </div>
  );
}

function QuickStatCard({
  accent,
  href,
  icon,
  label,
  meta,
  value,
}: {
  accent: "purple" | "pink" | "green";
  href: string;
  icon: string;
  label: ReactNode;
  meta: string;
  value: string;
}) {
  return (
    <article className="w-[360px] rounded-2xl border border-[#e7e9f3] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(31,40,89,0.045)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${accentClass(
              accent,
            )}`}
          >
            <DashboardIcon name={icon} />
          </div>

          <p className="w-[78px] text-sm font-semibold leading-tight text-[#273153]">
            {label}
          </p>
        </div>

        <div className="flex shrink-0 items-baseline gap-1">
          <p className="text-xl font-semibold leading-none tracking-[-0.02em] text-[#071033]">
            {value}
          </p>

          <p className="whitespace-nowrap text-xs font-medium text-[#6e7696]">
            {meta}
          </p>
        </div>

        <Link
          className="shrink-0 rounded-lg border border-[#bfa7ff] px-3 py-2 text-center text-xs font-semibold leading-4 text-[#7c3aed] transition hover:bg-[#f6f3ff]"
          href={href}
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

function RecentSessions({ rows }: { rows: RecentSession[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="bg-[#f6f3ff] text-left text-[#4c5578]">
            {["ID sesión", "Estado", "Perfil sugerido", "Fecha / Hora"].map(
              (header) => (
                <th
                  key={header}
                  className="px-3 py-2.5 text-[11px] font-semibold first:rounded-l-lg last:rounded-r-lg"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border-b border-[#eef0f6] px-3 py-2.5 font-semibold text-[#101742]">
                {row.id}
              </td>
              <td className="border-b border-[#eef0f6] px-3 py-2.5">
                <StatusBadge status={row.status} />
              </td>
              <td className="border-b border-[#eef0f6] px-3 py-2.5 font-semibold text-[#273153]">
                {row.suggestedProfile ?? "—"}
              </td>
              <td className="border-b border-[#eef0f6] px-3 py-2.5 font-semibold text-[#55607f]">
                {row.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && (
        <p className="py-6 text-center text-xs font-medium text-[#6e7696]">
          Sin sesiones anónimas recientes.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Completado"
      ? "bg-[#ddf8e9] text-[#108a53]"
      : status === "En progreso"
        ? "bg-[#fff0d8] text-[#b05d00]"
        : "bg-[#e8eeff] text-[#4168d8]";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function AlertList({ alerts }: { alerts: AdminDashboardData["alerts"] }) {
  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <AlertItem key={alert.title} alert={alert} />
      ))}

      {!alerts.length && (
        <p className="text-xs font-medium text-[#6e7696]">
          No hay alertas recientes.
        </p>
      )}

      <Link
        className="pt-1 text-xs font-medium text-[#7c3aed]"
        href="/admin/reportes"
      >
        Ver todas las alertas
      </Link>
    </div>
  );
}

function AlertItem({
  alert,
}: {
  alert: {
    detail: string;
    title: string;
    tone: AlertTone;
  };
}) {
  const styles: Record<AlertTone, string> = {
    success: "bg-[#ddf8e9] text-[#108a53]",
    warning: "bg-[#fff0d8] text-[#b05d00]",
    info: "bg-[#e8f4ff] text-[#1684d6]",
  };

  return (
    <article className="flex gap-3">
      <div
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          styles[alert.tone]
        }`}
      >
        <DashboardIcon
          name={
            alert.tone === "success"
              ? "shield"
              : alert.tone === "warning"
                ? "warning"
                : "access"
          }
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold text-[#101742]">{alert.title}</p>
          <span className="shrink-0 text-[11px] font-medium text-[#7a829f]">
            Ahora
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-[#5d6685]">
          {alert.detail}
        </p>
      </div>
    </article>
  );
}

function accentClass(accent: "purple" | "pink" | "green" | "blue" | "orange") {
  const styles = {
    purple: "bg-[#efe8ff] text-[#7c3aed]",
    pink: "bg-[#ffe8f3] text-[#d63384]",
    green: "bg-[#dcf7ea] text-[#14945a]",
    blue: "bg-[#e6f4ff] text-[#1684d6]",
    orange: "bg-[#fff0d8] text-[#d97604]",
  };

  return styles[accent];
}

function buildDonutGradient(items: DistributionItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!items.length || total <= 0) {
    return "conic-gradient(#eef1f8 0deg 360deg)";
  }

  let cursor = 0;

  const segments = items.slice(0, 6).map((item, index) => {
    const degrees = (item.value / total) * 360;
    const start = cursor;
    const end = cursor + degrees;

    cursor = end;

    return `${
      distributionColors[index % distributionColors.length]
    } ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function sumActivity(points: ActivityPoint[], key: "sessions" | "completed") {
  return points.reduce((total, point) => total + point[key], 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE").format(value || 0);
}

function formatMetric(value: number) {
  return value ? `${value.toFixed(1)}%` : "—";
}
