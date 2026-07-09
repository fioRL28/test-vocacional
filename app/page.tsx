import Image from "next/image";
import Link from "next/link";
import brujulaImage from "@/img/brujula-direcciones.png";
import pensandoImage from "@/img/pensando.png";

const benefits = [
  {
    title: "100% anónimo",
    detail: "No pedimos nombres, correos ni datos personales.",
    icon: "ID",
  },
  {
    title: "Orientación inicial",
    detail: "Obtén una guía clara sobre tus intereses y áreas afines.",
    icon: "BR",
  },
  {
    title: "Basado en intereses",
    detail: "Preguntas diseñadas para conocer lo que te motiva y en qué destacas.",
    icon: "IN",
  },
  {
    title: "Mejores decisiones",
    detail: "Conoce opciones de estudio y carreras que pueden ayudarte a construir tu futuro.",
    icon: "OK",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaff] px-4 py-4 text-[#111a44] sm:px-6">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eee8fb] bg-white px-5 py-4 shadow-[0_14px_40px_rgba(83,67,160,0.07)]">
        <div className="flex items-center gap-3">
          <Image
            src={brujulaImage}
            alt="RutaFuturo"
            className="h-14 w-14 object-contain"
            priority
          />
          <div>
            <p className="text-2xl font-black">RutaFuturo</p>
            <p className="text-sm font-medium text-[#667096]">Test vocacional anónimo</p>
          </div>
        </div>
        <Link
          href="/ingresar"
          className="rounded-xl border border-[#d8cafa] px-5 py-3 text-sm font-black text-[#7c3aed] transition hover:bg-[#f4efff]"
        >
          Acceso
        </Link>
      </header>

      <section className="mx-auto mt-4 grid max-w-7xl items-center gap-8 rounded-2xl border border-[#eee8fb] bg-white/70 px-6 py-10 shadow-[0_18px_55px_rgba(83,67,160,0.06)] lg:grid-cols-[0.9fr_1fr] lg:px-24 lg:py-14">
        <div>
          <p className="text-lg font-black text-[#7c3aed]">¡Bienvenido a RutaFuturo!</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Descubre tus intereses y encuentra tu camino
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#394267]">
            Nuestro test vocacional te ayuda a identificar intereses, fortalezas y áreas
            de desarrollo para tomar mejores decisiones.
          </p>

          <div className="mt-6 rounded-2xl border border-[#ddd3f5] bg-[#fbf8ff] p-5">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#7c3aed] text-sm font-black text-white">
                ID
              </div>
              <div>
                <p className="font-black text-[#7c3aed]">100% anónimo y seguro</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5a7a]">
                  El test no solicita nombres ni correos. Tus respuestas se gestionan mediante
                  un identificador anónimo.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/test"
              className="inline-flex min-h-14 min-w-64 items-center justify-center rounded-xl bg-[#7c3aed] px-8 text-lg font-black text-white shadow-[0_16px_35px_rgba(124,58,237,0.24)] transition hover:bg-[#6d28d9]"
            >
              Iniciar test anónimo
            </Link>
          </div>

          <p className="mt-4 text-sm font-medium text-[#667096]">
            Sin registros. Sin datos personales. Solo tú y tus respuestas.
          </p>
        </div>

        <div className="grid place-items-center">
          <div className="relative grid aspect-[1.15] w-full max-w-xl place-items-center rounded-full bg-[#f1eaff]">
            <Image
              src={pensandoImage}
              alt="Estudiante explorando sus intereses"
              className="w-[78%] object-contain"
              priority
            />
            <span className="absolute left-6 top-12 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#7c3aed] shadow-sm">
              Intereses
            </span>
            <span className="absolute right-4 top-24 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#21a7d8] shadow-sm">
              Fortalezas
            </span>
            <span className="absolute bottom-14 left-10 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#27b889] shadow-sm">
              Futuro
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-4 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex min-h-40 gap-5 rounded-2xl border border-[#eee8fb] bg-white p-6 shadow-[0_14px_40px_rgba(83,67,160,0.06)]"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#efe9ff] text-sm font-black text-[#7c3aed]">
              {benefit.icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-[#7c3aed]">{benefit.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#4f5a7a]">{benefit.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eee8fb] bg-white px-6 py-5 shadow-[0_14px_40px_rgba(83,67,160,0.06)]">
        <div>
          <p className="text-lg font-black text-[#7c3aed]">Administración y seguridad</p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#4f5a7a]">
            Solo el administrador accede al panel de gestión y entrenamiento del modelo.
            Los resultados anónimos se utilizan para mejorar la experiencia y la precisión del sistema.
          </p>
        </div>
        <Link
          href="/ingresar"
          className="rounded-xl border border-[#d8cafa] px-6 py-3 text-sm font-black text-[#7c3aed] transition hover:bg-[#f4efff]"
        >
          Acceso
        </Link>
      </section>
    </main>
  );
}
