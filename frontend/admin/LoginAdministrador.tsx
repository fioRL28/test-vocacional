"use client";

import Link from "next/link";
import { useActionState } from "react";

type AuthState = {
  error?: string;
  ok?: boolean;
};

export function LoginAdministrador({
  action,
}: {
  action: (previousState: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <main className="min-h-screen bg-[#fbfaff] px-4 py-4 text-[#111a44] sm:px-6">
      <header className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-[#eee8fb] bg-white px-5 py-4 shadow-[0_14px_40px_rgba(83,67,160,0.07)]">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#efe9ff] text-sm font-semibold text-[#7c3aed]">
            RF
          </div>
          <div>
            <p className="text-2xl font-semibold">RutaFuturo</p>
            <p className="text-sm font-medium text-[#667096]">Test vocacional</p>
          </div>
        </div>
        <Link href="/" className="rounded-xl px-4 py-3 text-sm font-bold text-[#667096] transition hover:bg-[#f6f1ff]">
          Volver al inicio
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 py-10 lg:grid-cols-[0.95fr_1fr] lg:py-14">
        <form
          action={formAction}
          className="rounded-2xl border border-[#e7e3f2] bg-white p-6 shadow-[0_22px_70px_rgba(83,67,160,0.09)] sm:p-10"
        >
          <div className="text-center">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Inicio de sesión
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#596386]">
              Ingresa con tu cuenta autorizada para acceder al panel de gestión de RutaFuturo.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            <Field
              label="Administrador"
              name="email"
              placeholder="admin"
              type="text"
            />
            <Field
              label="Contraseña"
              name="password"
              placeholder="Contraseña"
              type="password"
            />
          </div>

          {state.error && (
            <p className="mt-5 rounded-xl border border-[#ffd6df] bg-[#fff3f5] px-4 py-3 text-sm font-bold text-[#b4233c]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-[#7c3aed] px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_35px_rgba(124,58,237,0.24)] transition hover:bg-[#6d28d9] disabled:opacity-60"
          >
            {pending ? "Validando..." : "Ingresar"}
          </button>
        </form>

        <section className="rounded-2xl border border-[#eee8fb] bg-white/70 p-6 shadow-[0_22px_70px_rgba(83,67,160,0.06)]">
          <div className="mx-auto grid aspect-[1.25] max-w-xl place-items-center rounded-2xl bg-[#f4efff]">
            <div className="text-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-4xl shadow-sm">
                #
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Gestión segura y anónima</h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#596386]">
                Los administradores revisan métricas agregadas, sesiones anónimas y rendimiento del modelo sin identificar estudiantes.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-5 rounded-2xl border border-[#eee8fb] bg-white p-6">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#efe9ff] text-sm font-semibold text-[#7c3aed]">
              ID
            </div>
            <div>
              <p className="font-semibold text-[#7c3aed]">Acceso restringido a personal autorizado</p>
              <p className="mt-2 text-sm leading-6 text-[#596386]">
                Esta área es exclusiva para el personal autorizado de RutaFuturo.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({
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
    <label className="grid gap-2 text-sm font-semibold text-[#111a44]">
      {label}
      <input
        className="min-h-14 rounded-xl border border-[#d8d2e7] bg-white px-4 text-base font-medium outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#ddd0ff]"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
