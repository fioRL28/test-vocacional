import {
  actualizarRolAdministrador,
  cambiarEstadoAdministrador,
  cerrarSesionAdministrador,
  crearUsuarioAdministrador,
  requerirAdminActual,
  restablecerPasswordAdministrador,
} from "@/backend/admin/auth";
import { prisma } from "@/backend/db/prisma";
import { AdminPageHeader, AdminShell } from "@/frontend/admin/AdminShell";
import { CreateAdminUserClientForm } from "@/frontend/admin/CreateAdminUserClientForm";

export const dynamic = "force-dynamic";

export default async function AccesosPage() {
  const currentAdmin = await requerirAdminActual();

  const users = await prisma.adminUser.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <AdminShell
      active="Accesos"
      currentAdmin={currentAdmin}
      logoutAction={cerrarSesionAdministrador}
    >
      <AdminPageHeader
        detail="Gestiona usuarios autorizados del panel administrativo. Los estudiantes no tienen cuentas."
        title="Accesos"
      />

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Usuarios registrados" value={totalUsers} />
        <SummaryCard label="Usuarios activos" value={activeUsers} tone="success" />
        <SummaryCard label="Usuarios inactivos" value={inactiveUsers} tone="muted" />
      </section>

      <section className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className="overflow-hidden rounded-2xl border border-[#e7e2f4] bg-white shadow-[0_18px_55px_rgba(37,44,97,0.06)]">
          <div className="flex flex-col gap-2 border-b border-[#eef0f6] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#071033]">
                Usuarios del panel
              </h2>
              <p className="mt-1 text-sm font-medium text-[#6e7696]">
                Administra roles, estados y contraseñas temporales.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#f6f3ff] px-3 py-1 text-xs font-medium text-[#7c3aed]">
              {totalUsers} usuarios
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-left text-[#53607e]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Correo institucional
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Último ingreso
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.04em]">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#fbfaff]"
                  >
                    <td className="border-b border-[#eef0f6] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eee8ff] text-xs font-semibold text-[#7c3aed]">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#071033]">
                            {user.name}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-[#7a829f]">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-4">
                      <p className="max-w-[230px] truncate font-semibold text-[#4c5578]">
                        {user.email}
                      </p>
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-4">
                      <form
                        action={actualizarRolAdministrador}
                        className="flex items-center gap-2"
                      >
                        <input name="id" type="hidden" value={user.id} />

                        <select
                          className="h-9 rounded-xl border border-[#d8d2e7] bg-white px-3 text-xs font-medium text-[#273153] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]"
                          defaultValue={user.role}
                          name="role"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="ANALISTA">ANALISTA</option>
                          <option value="LECTOR">LECTOR</option>
                        </select>

                        <button className="h-9 rounded-xl border border-[#ded7f4] bg-white px-3 text-xs font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]">
                          Guardar
                        </button>
                      </form>
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-4">
                      <span className={getStatusClass(user.isActive)}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="border-b border-[#eef0f6] px-4 py-4">
                      <p className="font-semibold text-[#55607f]">
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "Sin ingreso"}
                      </p>
                    </td>

                    <td className="border-b border-[#eef0f6] px-6 py-4">
                      <div className="grid gap-2">
                        <form action={cambiarEstadoAdministrador}>
                          <input name="id" type="hidden" value={user.id} />
                          <input
                            name="isActive"
                            type="hidden"
                            value={String(!user.isActive)}
                          />

                          <button className="w-full rounded-xl border border-[#ded7f4] bg-white px-3 py-2 text-xs font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]">
                            {user.isActive ? "Desactivar usuario" : "Activar usuario"}
                          </button>
                        </form>

                        <form
                          action={restablecerPasswordAdministrador}
                          className="flex items-center gap-2"
                        >
                          <input name="id" type="hidden" value={user.id} />

                          <input
                            className="h-9 w-[150px] rounded-xl border border-[#d8d2e7] px-3 text-xs font-semibold outline-none transition placeholder:text-[#a0a6bb] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#eee8ff]"
                            name="password"
                            placeholder="Nueva contraseña"
                            type="password"
                          />

                          <button className="h-9 rounded-xl bg-[#7c3aed] px-3 text-xs font-semibold text-white transition hover:bg-[#6d28d9]">
                            Restablecer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {!users.length && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-sm font-semibold text-[#6e7696]"
                      colSpan={6}
                    >
                      No hay usuarios administrativos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="rounded-2xl border border-[#e7e2f4] bg-white p-6 shadow-[0_18px_55px_rgba(37,44,97,0.06)] xl:sticky xl:top-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#071033]">
              Crear acceso
            </h2>
            <p className="mt-1 text-sm font-medium leading-6 text-[#6e7696]">
              Registra usuarios internos que podrán ingresar al panel
              administrativo.
            </p>
          </div>

          <CreateAdminUserClientForm action={crearUsuarioAdministrador} />
        </aside>
      </section>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "muted";
}) {
  const toneClass = {
    default: "bg-[#eee8ff] text-[#7c3aed]",
    success: "bg-[#ddf8e9] text-[#108a53]",
    muted: "bg-[#eef0f6] text-[#6e7696]",
  };

  return (
    <article className="rounded-2xl border border-[#e7e2f4] bg-white p-5 shadow-[0_12px_36px_rgba(37,44,97,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7a829f]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071033]">
            {value}
          </p>
        </div>

        <div className={`h-10 w-10 rounded-full ${toneClass[tone]}`} />
      </div>
    </article>
  );
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "AD";
}

function getStatusClass(isActive: boolean) {
  return isActive
    ? "inline-flex rounded-full bg-[#ddf8e9] px-3 py-1 text-xs font-medium text-[#108a53]"
    : "inline-flex rounded-full bg-[#eef0f6] px-3 py-1 text-xs font-medium text-[#6e7696]";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}
