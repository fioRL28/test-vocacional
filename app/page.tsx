import Image from "next/image";
import Link from "next/link";
import brujulaImage from "@/img/brujula-direcciones.png";
import pensandoImage from "@/img/pensando.png";

const benefits = [
  {
    title: "100% anónimo",
    detail: "No pedimos nombres, correos ni datos personales.",
    image: "/benefits/anonimo.svg",
  },
  {
    title: "Orientación inicial",
    detail: "Obtén una guía clara sobre tus intereses y áreas afines.",
    image: "/benefits/orientacion.svg",
  },
  {
    title: "Basado en intereses",
    detail: "Preguntas diseñadas para conocer lo que te motiva y en qué destacas.",
    image: "/benefits/intereses.svg",
  },
  {
    title: "Mejores decisiones",
    detail: "Conoce opciones de estudio y carreras que pueden ayudarte a construir tu futuro.",
    image: "/benefits/decisiones.svg",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fdfbff] px-4 py-3 text-[#111a44] sm:px-6">
      <header className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#f0e8ff] bg-white px-5 py-3 shadow-sm sm:py-4">
        <div className="flex items-center gap-3">
          <Image
            src={brujulaImage}
            alt="RutaFuturo"
            className="h-12 w-12 object-contain"
            priority
          />
          <div>
            <p className="text-xl font-black">RutaFuturo</p>
            <p className="text-xs font-medium text-[#667096]">Test vocacional anónimo</p>
          </div>
        </div>
        <Link
          href="/ingresar"
          className="inline-flex min-h-10 items-center rounded-xl border border-[#ded0fb] px-5 py-2 text-sm font-medium text-[#8b5cf6] transition hover:bg-[#f6f1ff]"
        >
          Acceso
        </Link>
      </header>

      <section className="mx-auto mt-3 grid max-w-[1500px] items-center gap-6 rounded-2xl border border-[#f0e8ff] bg-white/75 px-5 py-7 shadow-sm sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-16 lg:py-9 xl:px-20">
        <div>
          <p className="text-sm font-semibold text-[#8b5cf6] sm:text-base">¡Bienvenido a RutaFuturo!</p>
          <h1 className="mt-4 max-w-xl text-2xl font-semibold leading-[1.15] sm:text-3xl xl:text-4xl">
            Descubre tus intereses y encuentra tu camino
          </h1>
          <p className="mt-4 max-w-xl text-sm font-normal leading-relaxed text-[#394267] sm:text-base">
            Nuestro test vocacional te ayuda a identificar intereses, fortalezas y áreas
            de desarrollo para tomar mejores decisiones.
          </p>

          <div className="mt-5 max-w-xl rounded-2xl border border-[#eadfff] bg-[#fcf9ff] p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#8b5cf6] text-xs font-semibold text-white">
                ID
              </div>
              <div>
                <p className="text-base font-semibold text-[#8b5cf6]">100% anónimo y seguro</p>
                <p className="mt-1.5 text-sm font-normal leading-relaxed text-[#4f5a7a]">
                  El test no solicita nombres ni correos. Tus respuestas se gestionan mediante
                  un identificador anónimo.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/test"
              className="inline-flex min-h-11 min-w-48 items-center justify-center rounded-xl bg-[#8b5cf6] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#7c3aed] hover:shadow-lg"
            >
              Iniciar test anónimo
            </Link>
          </div>

          <p className="mt-3 text-sm font-normal text-[#667096]">
            Sin registros, sin datos personales, solo tú y tus respuestas.
          </p>
        </div>

        <div className="grid place-items-center">
          <div className="relative grid aspect-[1.15] w-full max-w-md place-items-center rounded-full bg-[#f4efff] p-4">
            <Image
              src={pensandoImage}
              alt="Estudiante explorando sus intereses"
              className="w-[74%] object-contain"
              priority
            />
            <span className="absolute left-6 top-12 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-[#8b5cf6] shadow-sm">
              Intereses
            </span>
            <span className="absolute right-4 top-24 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-[#21a7d8] shadow-sm">
              Fortalezas
            </span>
            <span className="absolute bottom-14 left-10 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-[#27b889] shadow-sm">
              Futuro
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-3 grid max-w-[1500px] gap-3 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex min-h-32 gap-4 rounded-2xl border border-[#f0e8ff] bg-white p-6 shadow-sm"
          >
            <Image
              src={benefit.image}
              alt=""
              className="h-[52px] w-[52px] shrink-0 rounded-full bg-[#f3edff] p-3 object-contain"
              width={52}
              height={52}
            />
            <div>
              <h2 className="text-base font-semibold text-[#8b5cf6]">{benefit.title}</h2>
              <p className="mt-2 text-sm font-normal leading-relaxed text-[#4f5a7a]">{benefit.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-3 flex max-w-[1500px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#f0e8ff] bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-lg font-semibold text-[#8b5cf6]">Administración y seguridad</p>
          <p className="mt-1.5 max-w-4xl text-sm font-normal leading-relaxed text-[#4f5a7a]">
            Solo el administrador accede al panel de gestión y entrenamiento del modelo.
            Los resultados anónimos se utilizan para mejorar la experiencia y la precisión del sistema.
          </p>
        </div>
        <Link
          href="/ingresar"
          className="inline-flex min-h-10 items-center rounded-xl border border-[#ded0fb] px-5 py-2 text-sm font-medium text-[#8b5cf6] transition hover:bg-[#f6f1ff]"
        >
          Acceso
        </Link>
      </section>
    </main>
  );
}
