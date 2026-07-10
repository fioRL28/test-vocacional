"use client";

import { useActionState } from "react";

type AuthState = {
  error?: string;
  ok?: boolean;
};

export function CreateAdminUserClientForm({
  action,
}: {
  action: (previousState: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4">
      <AdminField label="Nombre" name="name" placeholder="Nombre del responsable" type="text" />
      <AdminField label="Correo institucional" name="email" placeholder="nombre@institucion.edu" type="email" />
      <AdminField label="Contrasena temporal" name="password" placeholder="Minimo 8 caracteres" type="password" />

      {state.error && (
        <p className="rounded-xl border border-[#ffd6df] bg-[#fff3f5] px-4 py-3 text-sm font-semibold text-[#b4233c]">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl border border-[#c9f1d9] bg-[#effcf5] px-4 py-3 text-sm font-semibold text-[#108a53]">
          Usuario creado correctamente.
        </p>
      )}

      <button
        disabled={pending}
        type="submit"
        className="rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear acceso"}
      </button>
      <p className="text-xs font-medium leading-5 text-[#6e7696]">
        Comparte la contrasena inicial por un canal seguro. No se crean accesos para estudiantes.
      </p>
    </form>
  );
}

function AdminField({
  label,
  name,
  placeholder,
  type,
}: {
  label: string;
  name: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#273153]">
      {label}
      <input
        className="min-h-12 rounded-xl border border-[#d8d2e7] bg-white px-4 text-sm font-medium outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
