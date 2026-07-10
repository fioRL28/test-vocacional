import Link from "next/link";
import { DashboardIcon } from "./DashboardIcon";

export type AdminSection =
  | "Accesos"
  | "Banco de preguntas"
  | "Configuracion"
  | "Configuración"
  | "Dashboard"
  | "Dataset"
  | "Modelos"
  | "Reportes";

const items: Array<{
  href: string;
  icon: string;
  label: AdminSection;
}> = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/reportes", icon: "reports", label: "Reportes" },
  { href: "/admin/modelos", icon: "models", label: "Modelos" },
  { href: "/admin/dataset", icon: "dataset", label: "Dataset" },
  { href: "/admin/preguntas", icon: "questions", label: "Banco de preguntas" },
  { href: "/admin/accesos", icon: "access", label: "Accesos" },
  { href: "/admin/configuracion", icon: "warning", label: "Configuración" },
];

export function AdminSidebarNav({
  active,
  horizontal = false,
}: {
  active: AdminSection;
  horizontal?: boolean;
}) {
  const normalizedActive = normalize(active);

  return (
    <nav
      className={
        horizontal
          ? "flex min-w-max gap-2 pb-1"
          : "grid gap-1"
      }
      aria-label="Navegacion administrativa"
    >
      {items.map((item) => {
        const isActive = normalize(item.label) === normalizedActive;

        return (
          <Link
            key={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-[#7c3aed] text-white shadow-[0_10px_24px_rgba(124,58,237,0.18)]"
                : "text-[#4c5578] hover:bg-[#f6f3ff] hover:text-[#7c3aed]"
            } ${horizontal ? "whitespace-nowrap" : ""}`}
            href={item.href}
          >
            <DashboardIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
