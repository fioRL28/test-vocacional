import { redirect } from "next/navigation";
import {
  crearPrimerAdministrador,
  existeUsuarioAdministrador,
  iniciarSesionAdministrador,
  obtenerAdminActual,
} from "@/backend/admin/auth";
import { LoginAdministrador } from "@/frontend/admin/LoginAdministrador";

export default async function IngresarPage() {
  const currentAdmin = await obtenerAdminActual();

  if (currentAdmin) {
    redirect("/admin");
  }

  const hasAdminUsers = await existeUsuarioAdministrador();

  return (
    <LoginAdministrador
      action={hasAdminUsers ? iniciarSesionAdministrador : crearPrimerAdministrador}
    />
  );
}
