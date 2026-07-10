import { cerrarSesionAdministrador, requerirAdminActual } from "@/backend/admin/auth";
import { obtenerResumenEntrenamientoMl } from "@/backend/admin/mlArtifacts";
import { AdminPageHeader, AdminShell } from "@/frontend/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const currentAdmin = await requerirAdminActual();
  const training = await obtenerResumenEntrenamientoMl();

  const settings = [
    ["Nombre del sistema", "RutaFuturo"],
    ["Logo", "RutaFuturo institucional"],
    ["Color principal", "#7c3aed"],
    ["Modo anónimo activado", "Sí"],
    ["Modelo activo por defecto", training.bestModel?.modelName ?? "Reglas adaptativas"],
    ["Umbral mínimo de confianza", "60%"],
    ["Tiempo de sesión administrativa", "8 horas"],
    ["Intentos máximos de login", "5"],
    ["Registro de actividad", "Activado"],
  ];

  return (
    <AdminShell active="Configuración" currentAdmin={currentAdmin} logoutAction={cerrarSesionAdministrador}>
      <AdminPageHeader
        detail="Parámetros generales del sistema y políticas de anonimato."
        title="Configuración"
      />

      <section className="mt-6 rounded-2xl border border-[#e7e2f4] bg-white p-6 shadow-[0_18px_55px_rgba(37,44,97,0.06)]">
        <div className="grid gap-4 md:grid-cols-2">
          {settings.map(([label, value]) => (
            <label key={label} className="grid gap-2 text-sm font-medium text-[#273153]">
              {label}
              <input
                className="min-h-12 rounded-xl border border-[#d8d2e7] bg-[#fbfaff] px-4 text-sm font-medium text-[#4c5578]"
                defaultValue={value}
                readOnly
              />
            </label>
          ))}
        </div>
        <p className="mt-5 rounded-xl bg-[#f6f3ff] px-4 py-3 text-sm font-medium text-[#5d6685]">
          La configuración persistente puede conectarse a una tabla de parámetros cuando se defina la política final de despliegue.
        </p>
      </section>
    </AdminShell>
  );
}
