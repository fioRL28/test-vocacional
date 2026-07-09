import type { ReactNode } from "react";
import { AdminSidebarNav, type AdminSection } from "./AdminSidebarNav";

type CurrentAdmin = {
  email: string;
  name: string;
  role: string;
};

type AdminShellProps = {
  active: AdminSection;
  children: ReactNode;
  currentAdmin: CurrentAdmin;
  fullWidth?: boolean;
  logoutAction: () => Promise<void>;
};

export function AdminShell({
  active,
  children,
  currentAdmin,
  fullWidth = false,
  logoutAction,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#101742]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[276px] shrink-0 border-r border-[#e7e9f3] bg-white px-5 py-6 lg:flex lg:flex-col">
          <div>
            <BrandBlock />
            <AdminSidebarNav active={active} />
          </div>

          <div className="mt-auto rounded-xl border border-[#e7e9f3] bg-[#fbfaff] p-3">
            <p className="truncate text-sm font-semibold text-[#101742]">
              {currentAdmin.name}
            </p>
            <p className="truncate text-xs font-medium text-[#66708f]">
              {currentAdmin.email}
            </p>
            <form action={logoutAction} className="mt-3">
              <button className="w-full rounded-lg border border-[#ded7f4] bg-white px-3 py-2 text-xs font-medium text-[#7c3aed] transition hover:bg-[#f6f3ff]">
                Salir
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className={fullWidth ? "px-4 py-6 md:px-5 lg:px-6" : "px-4 py-6 md:px-6 lg:px-8"}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  detail,
  title,
}: {
  detail?: string;
  title: string;
}) {
  return (
    <header>
      <h1 className="text-3xl font-semibold leading-tight text-[#071033]">
        {title}
      </h1>
      {detail ? (
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#66708f]">
          {detail}
        </p>
      ) : null}
    </header>
  );
}

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-2" : "mb-7"}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7c3aed] text-sm font-semibold text-white">
          RF
        </span>
        <div>
          <p className="text-base font-semibold leading-tight text-[#071033]">
            RutaFuturo
          </p>
        </div>
      </div>
    </div>
  );
}
