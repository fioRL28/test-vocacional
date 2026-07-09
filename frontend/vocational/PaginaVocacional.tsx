import Image from "next/image";
import Link from "next/link";
import { EnlaceResultadosDiferido } from "@/frontend/vocational/EnlaceResultadosDiferido";
import { VistaPregunta } from "@/frontend/vocational/VistaPregunta";
import { VistaResultados } from "@/frontend/vocational/VistaResultados";
import brujulaImage from "@/img/brujula-direcciones.png";
import pensandoImage from "@/img/pensando.png";
import type { Answer, Profile, Question, ResultIndicators } from "@/lib/vocational/types";

type PerfilConPuntaje = Profile & { score: number };

export function PaginaVocacional({
  estadoCodificado,
  estaEditando,
  finalizado,
  idSesion,
  indicadores,
  mostrarResultados,
  numeroPregunta,
  perfilPrincipal,
  preguntaActual,
  progreso,
  ranking,
  respuestaActual,
  respuestas,
  senales,
  totalPreguntas,
  urlResultados,
  urlVolverPreguntas,
}: {
  estadoCodificado: string;
  estaEditando: boolean;
  finalizado: boolean;
  idSesion?: string;
  indicadores: ResultIndicators;
  mostrarResultados: boolean;
  numeroPregunta: number;
  perfilPrincipal: PerfilConPuntaje;
  preguntaActual: Question | null;
  progreso: number;
  ranking: PerfilConPuntaje[];
  respuestaActual?: Answer;
  respuestas: Answer[];
  senales: string[];
  totalPreguntas: number;
  urlResultados: string;
  urlVolverPreguntas: string;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaff] text-[#111a44]">
      {!finalizado && preguntaActual ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
          <BarraLateral
            activo="test"
            puedeAbrirResultados={false}
            urlResultados={urlResultados}
          />

          <section className="grid gap-5">
            <header className="rounded-2xl border border-[#f0ecfb] bg-white/70 px-6 py-5 shadow-[0_12px_35px_rgba(83,67,160,0.05)]">
              <p className="text-2xl font-bold">¡Hola!</p>
              <p className="mt-1 text-sm text-[#6b7394]">
                Descubre tus talentos y encuentra tu camino ideal.
              </p>
            </header>

            <div className="rounded-2xl border border-[#e7e3f2] bg-white p-6 shadow-[0_18px_50px_rgba(83,67,160,0.10)] md:p-8">
              <VistaPregunta
                answers={respuestas}
                currentAnswer={respuestaActual}
                currentQuestion={preguntaActual}
                encodedState={estadoCodificado}
                isEditing={estaEditando}
                progress={progreso}
                questionNumber={numeroPregunta}
                sessionId={idSesion}
                totalQuestions={totalPreguntas}
              />
            </div>

            <TarjetaPrivacidad />
          </section>
        </section>
      ) : (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
          <BarraLateral
            activo={mostrarResultados ? "resultados" : "test"}
            puedeAbrirResultados
            urlResultados={urlResultados}
          />

          <section>
            {mostrarResultados ? (
              <VistaResultados
                answers={respuestas}
                indicators={indicadores}
                profile={perfilPrincipal}
                ranked={ranking}
                signals={senales}
              />
            ) : (
              <VistaFinalizacion
                totalPreguntas={respuestas.length}
                urlResultados={urlResultados}
                urlVolverPreguntas={urlVolverPreguntas}
              />
            )}
          </section>
        </section>
      )}
    </main>
  );
}

function BarraLateral({
  activo,
  puedeAbrirResultados,
  urlResultados,
}: {
  activo: "test" | "resultados";
  puedeAbrirResultados: boolean;
  urlResultados: string;
}) {
  return (
    <aside className="self-start rounded-2xl border border-[#ebe7fb] bg-white p-5 shadow-[0_16px_45px_rgba(83,67,160,0.08)]">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center">
          <Image
            src={brujulaImage}
            alt="Brújula de RutaFuturo"
            className="h-[52px] w-[52px] object-contain"
            priority={false}
          />
        </div>
        <div>
          <p className="text-xl font-bold">RutaFuturo</p>
          <p className="text-sm text-[#6b7394]">Test vocacional</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-3 text-sm font-semibold">
        {activo === "resultados" ? (
          <span className="rounded-xl px-4 py-3 text-[#9aa2bd]">
            Test vocacional
          </span>
        ) : (
          <Link
            href="/test"
            className="rounded-xl bg-[#f1ecff] px-4 py-3 text-[#7c3aed]"
          >
            Test vocacional
          </Link>
        )}
        {puedeAbrirResultados ? (
          activo === "resultados" ? (
            <Link
              href={urlResultados}
              className="rounded-xl bg-[#f1ecff] px-4 py-3 text-[#7c3aed]"
            >
              Mis resultados
            </Link>
          ) : (
            <EnlaceResultadosDiferido
              href={urlResultados}
              className="rounded-xl px-4 py-3 text-[#273153] transition hover:bg-[#f7f3ff]"
              disabledClassName="rounded-xl px-4 py-3 text-[#9aa2bd]"
              loadingChildren="Preparando resultados..."
            >
              Mis resultados
            </EnlaceResultadosDiferido>
          )
        ) : (
          <span className="rounded-xl px-4 py-3 text-[#9aa2bd]">Mis resultados</span>
        )}
        <Link
          href="/ingresar"
          className="rounded-xl px-4 py-3 text-[#273153] transition hover:bg-[#f7f3ff]"
        >
          Ingresar
        </Link>
      </nav>

      <div className="mt-5 rounded-2xl border border-[#e4def5] bg-[#f7f3ff] p-4 text-sm leading-6 text-[#394267]">
        <p className="font-bold text-[#7c3aed]">Consejo</p>
        <p className="mt-2">
          Tomarte el tiempo para conocerte es el primer paso hacia tu mejor decisión profesional.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#e4def5] bg-[#fbfaff] p-4 text-center">
        <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-[#f1ecff]">
          <Image
            src={pensandoImage}
            alt="Estudiante pensando en sus intereses"
            className="h-28 w-28 object-contain"
            priority={false}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-[#273153]">
          Explora con calma tus intereses y fortalezas.
        </p>
      </div>
    </aside>
  );
}

function TarjetaPrivacidad() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_40px_rgba(83,67,160,0.07)]">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f1ecff] text-xl text-[#7c3aed]">
        ♢
      </div>
      <div>
        <p className="font-bold">Tus respuestas son confidenciales</p>
        <p className="mt-1 text-sm text-[#6b7394]">
          Este test es solo para ayudarte a descubrir tus intereses y sugerir áreas compatibles contigo.
        </p>
      </div>
    </div>
  );
}

function VistaFinalizacion({
  totalPreguntas,
  urlResultados,
  urlVolverPreguntas,
}: {
  totalPreguntas: number;
  urlResultados: string;
  urlVolverPreguntas: string;
}) {
  return (
    <div>
      <section className="rounded-2xl border border-[#e7e3f2] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(83,67,160,0.08)] md:px-10">
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-[#f1ecff] text-6xl text-[#7c3aed]">
          ✓
        </div>
        <h1 className="mt-8 text-3xl font-bold md:text-4xl">
          ¡Has completado todas las preguntas!
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#596386]">
          Gracias por tomarte el tiempo para responder el test vocacional. Tus respuestas nos ayudarán
          a identificar tus intereses, fortalezas y áreas que mejor se adaptan a ti.
        </p>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
          <EstadisticaFinalizacion
            icono="✓"
            titulo={`${totalPreguntas} de ${totalPreguntas}`}
            subtitulo="Respuestas registradas"
          />
          <EstadisticaFinalizacion
            icono="○"
            titulo="Listo"
            subtitulo="Análisis preparado"
          />
          <EstadisticaFinalizacion
            icono="●"
            titulo="¡Excelente!"
            subtitulo="Completaste el test"
          />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-center gap-5 rounded-2xl border border-[#d9cef7] bg-[#f7f3ff] p-5 text-left">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#d9c8ff] text-2xl text-[#7c3aed]">
            ✦
          </div>
          <div>
            <p className="font-bold">Estamos analizando tus respuestas</p>
            <p className="mt-2 text-sm leading-6 text-[#394267]">
              Esto puede tardar unos segundos. Pronto podrás ver tus resultados personalizados.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <Link
            href={urlVolverPreguntas}
            className="rounded-xl border border-[#d7d2e7] bg-white px-6 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
          >
            ← Volver a preguntas
          </Link>
          <EnlaceResultadosDiferido
            href={urlResultados}
            className="rounded-xl bg-[#7c3aed] px-6 py-3 font-bold text-white transition hover:bg-[#6d28d9]"
            disabledClassName="rounded-xl bg-[#e7defb] px-6 py-3 font-bold text-[#b9a6e8]"
            loadingChildren="Preparando resultados..."
          >
            Ver mis resultados →
          </EnlaceResultadosDiferido>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-left text-sm text-[#596386]">
          Tus respuestas son confidenciales y se utilizan únicamente para generar tus resultados.
        </p>
      </section>
    </div>
  );
}

function EstadisticaFinalizacion({
  icono,
  subtitulo,
  titulo,
}: {
  icono: string;
  subtitulo: string;
  titulo: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 text-left">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f1ecff] text-2xl font-bold text-[#7c3aed]">
        {icono}
      </div>
      <div>
        <p className="text-xl font-bold">{titulo}</p>
        <p className="mt-1 text-sm text-[#596386]">{subtitulo}</p>
      </div>
    </div>
  );
}
