import Link from "next/link";
import { BotonImprimirReporte, PanelReporte } from "./PanelReporte";
import {
  obtenerPatronVocacionalDominante,
  obtenerPerfilesCompatibles,
  obtenerPromedios,
} from "@/lib/vocational/engine";
import { riasecDimensions } from "@/lib/vocational/data";
import { construirArquitecturaResultadoPorCapas } from "@/lib/vocational/occupationalCatalog";
import type {
  Answer,
  Dimension,
  Profile,
  ResultIndicators,
  VocationalCombinedPattern,
} from "@/lib/vocational/types";

type AreaVisible = {
  name: string;
  icon: string;
  affinity: number;
  width: number;
  requiredEvidenceMet?: boolean;
  description: string;
  activities: string[];
};

export function obtenerModoResultado(clarity: number) {
  if (clarity >= 75) return "defined";
  if (clarity >= 50) return "moderate";
  return "exploration";
}

export function obtenerRutasCompatibles(
  profileRanking: Array<Profile & { score: number }>,
  mainProfileId: string,
) {
  const mainPath = profileRanking.find(
    (profile) => profile.id === mainProfileId,
  );
  const compatiblePaths = obtenerPerfilesCompatibles(
    profileRanking,
    mainProfileId,
  ).map((profile) => ({
    id: profile.id,
    name: obtenerEtiquetaRutaPerfil(profile.id, profile.name),
    score: profile.score,
  }));

  return {
    mainPath,
    compatiblePaths,
  };
}

export function mostrarPerfilSecundario(
  profileRanking: Array<Profile & { score: number }>,
) {
  const [main, secondary] = profileRanking;

  if (!main || !secondary) return false;

  return secondary.score >= main.score * 0.75;
}

function esPerfilDemasiadoAmplio(
  averages: Record<Dimension, number>,
  indicators: ResultIndicators,
) {
  const highRiasecCount = riasecDimensions.filter(
    (dimension) => averages[dimension] >= 4,
  ).length;

  return (
    highRiasecCount >= 5 ||
    indicators.vocationalUncertainty >= 80 ||
    indicators.externalPressure >= 80
  );
}

function normalizarTextoVista(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function VistaResultados({
  answers,
  indicators,
  profile,
  ranked,
}: {
  answers: Answer[];
  indicators: ResultIndicators;
  profile: Profile & { score: number };
  ranked: Array<Profile & { score: number }>;
  signals: string[];
}) {
  const layeredResult = construirArquitecturaResultadoPorCapas(answers, ranked);
  const averages = obtenerPromedios(answers);
  const combinedPattern = obtenerPatronVocacionalDominante(averages);
  const broadExploratoryResult = esPerfilDemasiadoAmplio(averages, indicators);
  const visibleAreas = obtenerAreasVisibles(layeredResult, ranked, profile, answers, averages);
  const topArea = visibleAreas[0];
  const shouldShowRouteAsMainResult =
    !broadExploratoryResult &&
    Boolean(topArea) &&
    (topArea?.affinity ?? 0) >= 90 &&
    indicators.profileClarity <= 55;
  const mainResultName = topArea?.name ?? profile.name;
  const mainResultTitle = broadExploratoryResult || !combinedPattern
    ? "Ruta inicial sugerida"
    : "Área más compatible según tu patrón de respuestas";
  const resultLabel = "Orientación inicial";
  const routeMainPresentation = shouldShowRouteAsMainResult
    ? obtenerPresentacionResultadoPrincipalPorRuta(topArea!.name)
    : null;
  const macroProfileLabel = shouldShowRouteAsMainResult
    ? `Área amplia relacionada: ${routeMainPresentation?.macroProfileName ?? profile.name}`
    : null;
  const mainResultDescription =
    "Estas opciones se relacionan con tus respuestas. Revísalas con calma y compara cuál se acerca más a lo que te gustaría hacer.";
  const strengths = obtenerFortalezasTransversales(
    profile.id,
    visibleAreas,
  ).slice(0, 3);
  const reasons = obtenerRazonesResultado(visibleAreas, profile.id, combinedPattern);
  const thingsToTry = obtenerActividadesParaProbar(visibleAreas, profile.id);
  const nextSteps = obtenerProximosPasos(visibleAreas);
  const resultMeaning = obtenerSignificadoResultado(
    visibleAreas,
    profile.id,
    combinedPattern,
  );
  const highlightedInterests = obtenerInteresesDestacadosExplicados(
    visibleAreas,
    profile.id,
  );
  const aspectsToConsider = obtenerAspectosAConsiderar(
    indicators,
    visibleAreas,
  );

  return (
    <>
      <div className="no-print">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#7c3aed]">RutaFuturo</p>
            <h2 className="mt-1 text-2xl font-bold">Tus resultados</h2>
            <p className="mt-1 text-sm text-[#6b7394]">
              Un resumen rápido para ayudarte a comparar opciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-lg border border-[#d7d2e7] bg-white px-5 py-3 font-bold text-[#667096] transition hover:border-[#8b5cf6] hover:bg-[#f6f1ff]"
            >
              Reiniciar test
            </Link>
            <BotonImprimirReporte />
          </div>
        </header>

        <section className="mt-1 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_16px_40px_rgba(83,67,160,0.07)]">
              <div>
                <h3 className="text-sm font-bold text-[#7c3aed]">
                  {resultLabel}
                </h3>
                <h1 className="mt-2 text-3xl font-bold leading-tight">
                  {mainResultTitle}
                </h1>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#394267]">
                {mainResultDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
              <h3 className="text-lg font-bold">Opciones recomendadas</h3>
              <div className="mt-4 grid gap-4">
                {visibleAreas.map((area, index) => (
                  <details
                    key={area.name}
                    open={index === 0}
                    className="group rounded-2xl border border-[#eee8fb] bg-[#fcfbff] p-4"
                  >
                    <summary className="grid cursor-pointer list-none gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e0f2fe] text-xl">
                            {area.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold text-[#1f2a44]">
                              {area.name}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-[#6b7394]">
                              {obtenerNivelCompatibilidad(
                                index,
                                area.affinity,
                                area.requiredEvidenceMet,
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="inline-block shrink-0 pt-1 text-sm text-[#7c3aed] transition group-open:rotate-90">
                          ▸
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#eceaf4]">
                        <div
                          className="h-2 rounded-full bg-[#7c3aed]"
                          style={{ width: `${area.width}%` }}
                        />
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-3">
                      <p className="rounded-xl bg-white px-4 py-3 text-sm leading-6 text-[#394267] ring-1 ring-[#f0ebfb]">
                        {area.description}
                      </p>
                      <div className="rounded-xl bg-white px-4 py-3 text-sm leading-6 text-[#394267] ring-1 ring-[#f0ebfb]">
                        <p className="font-semibold text-[#273153]">
                          Actividades relacionadas
                        </p>
                        <ul className="mt-2 grid gap-1.5">
                          {area.activities.slice(0, 3).map((activity) => (
                            <li key={activity}>
                              • {capitalizarActividad(activity)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-[#e7e3f2] bg-[#fbfaff] p-5 shadow-[0_16px_40px_rgba(83,67,160,0.05)]">
              <h3 className="font-bold">¿Por qué se muestran estas áreas?</h3>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-[#394267]">
                {reasons.map((reason) => (
                  <ElementoRazon key={reason} text={reason} />
                ))}
              </div>
            </div>

            <div className="-mt-1 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
              <h3 className="text-lg font-bold">Tus fortalezas principales</h3>
              <div className="mt-4 grid gap-2">
                {strengths.map((strength, index) => (
                  <div
                    key={strength}
                    className="flex items-center gap-3 rounded-xl bg-[#fbfaff] px-3 py-3"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef9f2] text-lg">
                      {obtenerIconoFortaleza(index)}
                    </span>
                    <span className="text-sm font-semibold text-[#273153]">
                      {strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

    <details className="mt-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
          <summary className="cursor-pointer list-none text-lg font-bold text-[#7c3aed]">
            <span className="mr-2 inline-block">►</span>
            Conoce más sobre tu resultado
          </summary>

          <h3 className="mt-6 text-lg font-bold">Intereses destacados</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {highlightedInterests.map((interest) => (
              <p
                key={interest}
                className="rounded-xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]"
              >
                {interest}
              </p>
            ))}
          </div>

          <h3 className="mt-7 text-lg font-bold">Aspectos a considerar</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {aspectsToConsider.map((aspect) => (
              <p
                key={aspect}
                className="rounded-xl bg-[#fff7ed] p-4 text-sm leading-6 text-[#394267]"
              >
                {aspect}
              </p>
            ))}
          </div>

          <h3 className="mt-6 text-lg font-bold">Qué podrías probar</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {thingsToTry.map((item) => (
              <div
                key={item.text}
                className="flex gap-3 rounded-xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1ecff] text-lg">
                  {item.icon}
                </span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-7 text-lg font-bold">Próximos pasos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {nextSteps.map((step) => (
              <div
                key={step.text}
                className="flex gap-3 rounded-xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1ecff] text-lg">
                  {step.icon}
                </span>
                <p>{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl bg-[#f3edff] p-5 text-sm leading-7 text-[#273153]">
            <h3 className="text-lg font-bold">Qué significa tu resultado</h3>
            <p className="mt-4">{resultMeaning.primary}</p>
            <p className="mt-4">{resultMeaning.action}</p>
          </div>
        </details>
      </div>

      <PanelReporte
        answers={answers}
        areas={visibleAreas}
        indicators={indicators}
        macroProfileLabel={macroProfileLabel}
        mainResultName={mainResultName}
        mainResultTitle={mainResultTitle}
        profile={profile}
        reasons={reasons}
        resultLabel={resultLabel}
        resultMeaning={resultMeaning}
        strengths={strengths}
      />
    </>
  );
}

function ElementoRazon({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#dcfce7] text-sm text-[#16a34a]">
        ✓
      </span>
      <p>{text}</p>
    </div>
  );
}

function obtenerAreasVisibles(
  layeredResult: ReturnType<typeof construirArquitecturaResultadoPorCapas>,
  ranked: Array<Profile & { score: number }>,
  profile: Profile & { score: number },
  answers: Answer[],
  averages: Record<Dimension, number>,
): AreaVisible[] {
  const hasOperationalSignal = tieneSenalOperativaExplicita(answers, averages);
  const subrouteAreas = layeredResult.concreteSubroutes
    .filter(
      (subroute) =>
        profile.id !== "negocios-gestion" ||
        hasOperationalSignal ||
        !esRutaAdministrativaFinancieraOperativa(subroute.id, subroute.name),
    )
    .slice(0, 3)
    .map((subroute, index) => ({
      name: formatearNombreArea(subroute.name),
      icon: obtenerIconoArea(subroute.id, index),
      affinity: subroute.relevance,
      width: [96, 84, 72][index] ?? 64,
      requiredEvidenceMet: subroute.compatibilityTrace?.requiredEvidenceMet,
      description: obtenerDescripcionSubruta(subroute.id, subroute.name),
      activities: obtenerActividadesSubruta(
        subroute.id,
        subroute.activitiesToExplore,
      ),
    }));

  if (subrouteAreas.length >= 3) return subrouteAreas;

  const profileAreas = [
    profile,
    ...ranked.filter((item) => item.id !== profile.id).slice(0, 2),
  ].map((item, index) => ({
    name: obtenerEtiquetaRutaPerfil(item.id, item.name),
    icon: obtenerIconoArea(item.id, index),
    affinity: obtenerAnchoBarraCualitativa(index, profile.score, item.score),
    width: obtenerAnchoBarraCualitativa(index, profile.score, item.score),
    description: obtenerDescripcionArea(item.id),
    activities: obtenerActividadesArea(item.id),
  }));

  return [...subrouteAreas, ...profileAreas]
    .filter(
      (area, index, areas) =>
        areas.findIndex((item) => item.name === area.name) === index,
    )
    .slice(0, 3);
}

function esRutaAdministrativaFinancieraOperativa(id: string, name: string) {
  const text = normalizarTextoVista(`${id} ${name}`);

  return (
    text.includes("finanza") ||
    text.includes("administr") ||
    text.includes("industrial") ||
    text.includes("operacion") ||
    text.includes("operativa") ||
    text.includes("proceso")
  );
}

function tieneSenalOperativaExplicita(
  answers: Answer[],
  averages: Record<Dimension, number>,
) {
  if (averages.convencional >= 4 && averages.responsabilidad >= 3.5) {
    return true;
  }

  const text = answers
    .flatMap((answer) => {
      if (answer.kind === "open") return [answer.text, answer.selectedOptionText ?? ""];
      return answer.comment ? [answer.comment] : [];
    })
    .map(normalizarTextoVista)
    .join(" ");

  return [
    "finanza",
    "presupuesto",
    "contabilidad",
    "administracion",
    "administrativo",
    "registro",
    "procesos",
    "operaciones",
    "industrial",
    "logistica",
    "costos",
  ].some((pattern) => text.includes(pattern));
}

type CategoriaResultado =
  | "communication-design"
  | "education-support"
  | "health"
  | "technology"
  | "research-data"
  | "business-management"
  | "admin-finance"
  | "law-social"
  | "environment"
  | "general";

function obtenerRazonesResultado(
  areas: AreaVisible[],
  profileId: string,
  combinedPattern: VocationalCombinedPattern | null,
) {
  if (combinedPattern) {
    return obtenerRazonesPorPatronCombinado(combinedPattern, areas);
  }

  const category = obtenerCategoriaAreas(areas, profileId);
  const areaNames = areas.map((area) => area.name);
  const joinedAreas = unirListaNatural(areaNames);
  const reasonsByCategory: Record<
    CategoriaResultado,
    [string, string, string]
  > = {
    "communication-design": [
      "Tus respuestas muestran afinidad con actividades de comunicación visual, expresión creativa y creación de mensajes.",
      "También aparecen intereses relacionados con contenidos, medios e información para distintos públicos.",
      "Por eso se presentan áreas cercanas dentro de comunicación, diseño y contenidos.",
    ],
    technology: [
      "Tus respuestas mostraron afinidad con actividades de solución práctica, tecnología y funcionamiento de sistemas.",
      "También aparecieron señales de análisis, prueba de ideas y mejora de soluciones concretas.",
      "Por eso se presentan áreas relacionadas con tecnología, sistemas y soluciones aplicadas.",
    ],
    "research-data": [
      "Tus respuestas mostraron afinidad con investigar, analizar información y encontrar explicaciones.",
      "También aparecieron señales de curiosidad, comparación de evidencias y búsqueda de patrones.",
      "Por eso se presentan áreas relacionadas con análisis, investigación y uso de información.",
    ],
    health: [
      "Tus respuestas mostraron afinidad con actividades de cuidado, escucha y apoyo a personas.",
      "También aparecieron señales de responsabilidad, trato humano y atención a necesidades concretas.",
      "Por eso se presentan áreas relacionadas con salud, bienestar y apoyo humano.",
    ],
    "education-support": [
      "Tus respuestas mostraron afinidad con actividades de orientación, aprendizaje y contacto con personas.",
      "También aparecieron señales de comunicación clara, cooperación y comprensión de situaciones sociales.",
      "Por eso se presentan áreas relacionadas con educación, orientación y desarrollo de personas.",
    ],
    "business-management": [
      "Tus respuestas mostraron afinidad con actividades de organización, iniciativa y coordinación de proyectos.",
      "También aparecieron señales de comunicación, toma de decisiones y búsqueda de resultados concretos.",
      "Por eso se presentan áreas relacionadas con gestión, negocios y proyectos.",
    ],
    "admin-finance": [
      "Tus respuestas mostraron afinidad con actividades de orden, revisión de información y seguimiento de procesos.",
      "También aparecieron señales de atención al detalle, organización y trabajo con datos o recursos.",
      "Por eso se presentan áreas relacionadas con administración, finanzas y procesos.",
    ],
    "law-social": [
      "Tus respuestas muestran afinidad con análisis de casos, argumentación y búsqueda de acuerdos.",
      "También aparecen intereses relacionados con normas, instituciones y comunicación clara.",
      "Por eso se presentan áreas cercanas a derecho, asuntos públicos o análisis social.",
    ],
    environment: [
      "Tus respuestas muestran afinidad con el entorno, la sostenibilidad y los recursos naturales.",
      "También aparecen intereses relacionados con observar, analizar y proponer soluciones para problemas reales.",
      "Por eso se presentan áreas cercanas a ambiente, territorio y recursos naturales.",
    ],
    general: [
      joinedAreas
        ? `Tus respuestas se relacionan con actividades presentes en ${joinedAreas}.`
        : "Tus respuestas se relacionan con las áreas que aparecen en el resultado.",
      "También aparecieron señales útiles para revisar estas opciones con más información.",
      "Por eso se presentan áreas relacionadas que conviene explorar antes de decidir.",
    ],
  };

  return reasonsByCategory[category];
}

function obtenerRazonesPorPatronCombinado(
  pattern: VocationalCombinedPattern,
  areas: AreaVisible[],
) {
  const areaNames = unirListaNatural(areas.map((area) => area.name));
  const baseReasons: [string, string, string] = [
    pattern.explanation,
    areaNames
      ? `Por eso se muestran como ruta inicial áreas como ${areaNames}, para compararlas antes de tomar una decisión.`
      : "Por eso se muestran rutas iniciales compatibles para comparar antes de tomar una decisión.",
    "Las respuestas abiertas se toman como señales secundarias: ayudan a matizar el enfoque, pero no reemplazan el patrón de intereses y estilo personal.",
  ];

  if (pattern.socialManagementNuance) {
    baseReasons[1] =
      "El resultado combina gestión o coordinación con una orientación hacia personas, bienestar, educación o comunidad.";
  }

  if (pattern.requiresExplicitOperationalSignal) {
    baseReasons[1] =
      "Si además aparecen señales explícitas de registros, presupuestos, datos o procesos, conviene comparar gestión con administración, finanzas u operaciones; si no, el foco principal es coordinación de proyectos.";
  }

  return baseReasons;
}

function obtenerNivelCompatibilidad(
  index: number,
  affinity: number,
  requiredEvidenceMet = true,
) {
  if (!requiredEvidenceMet) return index === 0 ? "Ruta inicial tentativa" : "Compatible por explorar";
  if (index === 0 || affinity >= 88) return "Alta compatibilidad";
  if (affinity >= 70) return "Compatible";
  return "Opción por explorar";
}

function unirListaNatural(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;

  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function detectarCategoriaPorTexto(rawText: string): CategoriaResultado | null {
  const text = normalizarTextoVista(rawText);

  if (!text) return null;

  // Importante: primero se detectan rutas concretas visibles.
  // No usamos palabras genéricas como "comunicación clara" porque pueden aparecer en
  // fortalezas de educación o salud y contaminar el resultado.
  if (
    text.includes("diseno") ||
    text.includes("grafico") ||
    text.includes("visual") ||
    text.includes("audiovisual") ||
    text.includes("contenidos") ||
    text.includes("periodismo") ||
    text.includes("comunicacion publica") ||
    text.includes("arte")
  ) {
    return "communication-design";
  }

  if (
    text.includes("software") ||
    text.includes("sistemas") ||
    text.includes("tecnologia") ||
    text.includes("mecatronica") ||
    text.includes("ingenieria")
  ) {
    return "technology";
  }

  if (
    text.includes("datos") ||
    text.includes("investigacion") ||
    text.includes("laboratorio") ||
    text.includes("biotecnologia") ||
    text.includes("ciencia")
  ) {
    return "research-data";
  }

  if (
    text.includes("salud") ||
    text.includes("psicologia") ||
    text.includes("nutricion") ||
    text.includes("enfermeria") ||
    text.includes("bienestar")
  ) {
    return "health";
  }

  if (
    text.includes("educacion") ||
    text.includes("ensenanza") ||
    text.includes("orientacion") ||
    text.includes("psicopedagogia") ||
    text.includes("formacion")
  ) {
    return "education-support";
  }

  if (
    text.includes("ambient") ||
    text.includes("sostenibilidad") ||
    text.includes("recursos naturales")
  ) {
    return "environment";
  }

  if (
    text.includes("derecho") ||
    text.includes("jurid") ||
    text.includes("politicas publicas")
  ) {
    return "law-social";
  }

  if (
    text.includes("administracion") ||
    text.includes("finanzas") ||
    text.includes("procesos")
  ) {
    return "admin-finance";
  }

  if (
    text.includes("negocios") ||
    text.includes("gestion") ||
    text.includes("proyectos")
  ) {
    return "business-management";
  }

  return null;
}

function obtenerCategoriaAreas(
  areas: AreaVisible[],
  profileId: string,
): CategoriaResultado {
  const firstVisibleArea = areas[0]?.name ?? "";
  const categoryFromFirstArea = detectarCategoriaPorTexto(firstVisibleArea);

  // La primera carrera/área visible manda el contenido narrativo.
  // Esto evita que un perfil macro social genere textos de enseñanza cuando la pantalla muestra diseño/comunicación.
  if (categoryFromFirstArea) return categoryFromFirstArea;

  const categoryFromVisibleAreas = detectarCategoriaPorTexto(
    areas.map((area) => area.name).join(" "),
  );

  if (categoryFromVisibleAreas) return categoryFromVisibleAreas;

  const categoryByProfile: Partial<Record<string, CategoriaResultado>> = {
    "ingenieria-tecnologia": "technology",
    "ciencia-datos-investigacion": "research-data",
    "salud-apoyo-humano": "health",
    "educacion-ciencias-sociales": "education-support",
    "arte-comunicacion-diseno": "communication-design",
    "negocios-gestion": "business-management",
    "administracion-finanzas": "admin-finance",
  };

  return categoryByProfile[profileId] ?? "general";
}

function obtenerPresentacionResultadoPrincipalPorRuta(routeName: string) {
  const normalizedRouteName = routeName.toLowerCase();
  const isArchitectureSpatialDesign =
    normalizedRouteName.includes("arquitectura") &&
    normalizedRouteName.includes("diseño espacial");
  const isLawLegalSciences =
    normalizedRouteName.includes("derecho") &&
    normalizedRouteName.includes("ciencias jurídicas");

  if (isLawLegalSciences) {
    return {
      macroProfileName: "Educación y Ciencias Sociales",
      description:
        "Área vinculada con la argumentación, la mediación de conflictos, el análisis de normas y la defensa de acuerdos o decisiones justas.",
      strengths: [
        "Argumentación",
        "Mediación de conflictos",
        "Comunicación persuasiva",
      ],
    };
  }

  if (!isArchitectureSpatialDesign) return null;

  return {
    macroProfileName: "Diseño aplicado, creatividad y tecnología",
    description:
      "Área vinculada con el diseño de espacios, objetos o prototipos, considerando forma, función y experiencia de las personas.",
    strengths: [
      "Creatividad aplicada",
      "Pensamiento espacial",
      "Prototipado de soluciones",
    ],
  };
}

function obtenerDescripcionArea(profileId: string) {
  const descriptions: Record<string, string> = {
    "ingenieria-tecnologia":
      "Te puede interesar si disfrutas entender cómo funcionan las cosas, resolver retos prácticos o mejorar soluciones.",
    "ciencia-datos-investigacion":
      "Puede relacionarse contigo si te interesa analizar información, buscar evidencias y encontrar patrones.",
    "salud-apoyo-humano":
      "Te puede interesar si valoras cuidar, escuchar, acompañar o apoyar a otras personas.",
    "educacion-ciencias-sociales":
      "Puede ser una buena opción si te gusta explicar, orientar, comunicarte y trabajar con personas o grupos.",
    "arte-comunicacion-diseno":
      "Te puede interesar si disfrutas crear, diseñar, comunicar ideas o proponer soluciones visuales.",
    "negocios-gestion":
      "Puede relacionarse contigo si te atrae organizar actividades, tomar iniciativa y coordinar decisiones.",
    "administracion-finanzas":
      "Te puede interesar si disfrutas ordenar información, seguir procesos y trabajar con detalle.",
  };

  return (
    descriptions[profileId] ??
    "Puede ser una opción para revisar según las actividades que elegiste en el test."
  );
}

function obtenerDescripcionSubruta(subrouteId: string, fallbackName: string) {
  const lowerId = subrouteId.toLowerCase();
  const lowerName = normalizarTextoVista(fallbackName);
  const text = `${lowerId} ${lowerName}`;

  if (text.includes("derecho") || text.includes("jurid")) {
    return "Puede interesarte si te atrae analizar situaciones, argumentar con claridad y buscar acuerdos justos.";
  }

  if (
    text.includes("gestion-publica") ||
    text.includes("relaciones-institucionales")
  ) {
    return "Puede relacionarse contigo si te interesa organizar ideas, dialogar y participar en decisiones que afectan a otras personas.";
  }

  if (text.includes("gestion-proyectos-educativos-sociales")) {
    return "Te puede interesar si disfrutas orientar personas y organizar actividades, grupos o proyectos formativos.";
  }

  if (text.includes("salud-bienestar-orientacion-prevencion")) {
    return "Puede ser una buena opción si te llama la atención orientar, prevenir y promover bienestar.";
  }

  if (text.includes("mediacion") || text.includes("conflictos")) {
    return "Te puede interesar si disfrutas escuchar distintas posiciones y buscar soluciones justas entre personas.";
  }

  if (text.includes("negocios") || text.includes("gestion-de-proyectos")) {
    return "Puede relacionarse contigo si te atrae tomar iniciativa, organizar actividades y coordinar proyectos.";
  }

  if (
    text.includes("industrial") ||
    text.includes("procesos") ||
    text.includes("operaciones")
  ) {
    return "Te puede interesar si disfrutas ordenar procesos, mejorar resultados y resolver problemas prácticos.";
  }

  if (
    text.includes("arquitectura") ||
    text.includes("diseno-espacial") ||
    text.includes("diseño-espacial")
  ) {
    return "Te puede interesar si disfrutas pensar en espacios, estructuras, ambientes y soluciones visuales aplicadas.";
  }

  if (text.includes("interiores") || text.includes("entornos")) {
    return "Puede ser una buena opción si te llama la atención diseñar ambientes funcionales y pensar cómo se usan los espacios.";
  }

  if (text.includes("diseno") || text.includes("diseño")) {
    return "Te puede interesar si disfrutas transformar ideas en propuestas visuales, creativas y concretas.";
  }

  if (text.includes("audiovisual") || text.includes("contenidos")) {
    return "Puede ser una buena opción si te llama la atención crear contenido, trabajar con medios digitales o comunicar mensajes en formatos audiovisuales.";
  }

  if (text.includes("periodismo") || text.includes("comunicacion publica")) {
    return "Puede relacionarse contigo si te interesa investigar temas, informar y comunicar ideas con claridad a diferentes personas.";
  }

  if (
    text.includes("ambiental") ||
    text.includes("sostenibilidad") ||
    text.includes("recursos-naturales")
  ) {
    return "Puede relacionarse contigo si te interesa el entorno, la sostenibilidad y buscar soluciones para problemas reales.";
  }

  if (
    text.includes("farmacia") ||
    text.includes("laboratorio") ||
    text.includes("biotecnologia")
  ) {
    return "Te puede interesar si disfrutas investigar, analizar evidencias y trabajar con procesos de salud o laboratorio.";
  }

  if (
    text.includes("educacion") ||
    text.includes("ensenanza") ||
    text.includes("orientacion")
  ) {
    return "Puede ser una buena opción si te gusta explicar, acompañar aprendizajes y orientar a otras personas.";
  }

  if (text.includes("psicologia") || text.includes("apoyo-humano")) {
    return "Te puede interesar si valoras escuchar, comprender necesidades y acompañar a otras personas.";
  }

  return "Puede ser una opción para revisar porque se relaciona con actividades que elegiste en el test.";
}

function obtenerActividadesSubruta(
  subrouteId: string,
  fallbackActivities: string[],
) {
  const lowerId = subrouteId.toLowerCase();
  const activitiesByRoute: Record<string, string[]> = {
    "systems-software": [
      "programar una solución sencilla",
      "probar una aplicación",
      "resolver fallas lógicas",
    ],
    "science-data-analysis": [
      "analizar una base de datos pequeña",
      "buscar patrones",
      "explicar conclusiones con gráficos",
    ],
    "industrial-processes": [
      "ordenar un proceso",
      "medir tiempos",
      "proponer mejoras",
    ],
    "mechatronics-applied-technology": [
      "probar sensores o mecanismos",
      "armar un prototipo",
      "revisar fallas técnicas",
    ],
    "architecture-spatial-design": [
      "dibujar planos básicos",
      "diseñar un ambiente",
      "crear una maqueta o prototipo",
    ],
    "graphic-design": [
      "diseñar una pieza visual",
      "crear una identidad gráfica",
      "organizar información visual",
    ],
    "communication-audiovisual": [
      "crear un video corto",
      "escribir un guion",
      "producir contenido para una audiencia",
    ],
    "journalism-public-communication": [
      "escribir una nota informativa",
      "preparar una entrevista breve",
      "comunicar información para un público",
    ],
    "environmental-engineering": [
      "analizar un problema ambiental",
      "tomar datos del entorno",
      "proponer una solución técnica",
    ],
    "environmental-management": [
      "coordinar una campaña ambiental",
      "revisar normas básicas",
      "planificar acciones sostenibles",
    ],
    "laboratory-science": [
      "procesar muestras simuladas",
      "seguir un protocolo",
      "interpretar resultados",
    ],
    "nutrition-health-wellbeing": [
      "preparar una guía de hábitos",
      "comparar información de salud",
      "orientar sobre prevención",
    ],
    "veterinary-animal-health": [
      "observar el cuidado animal",
      "investigar salud de animales",
      "aplicar criterios de bienestar",
    ],
    "psychology-human-support": [
      "escuchar un caso con respeto",
      "identificar necesidades",
      "proponer formas de apoyo",
    ],
    "education-teaching": [
      "explicar un tema",
      "preparar material educativo",
      "acompañar una práctica",
    ],
    "educacion-orientacion-formacion": [
      "orientar una decisión",
      "facilitar un taller",
      "crear una guía de aprendizaje",
    ],
    "social-work-community-development": [
      "identificar una necesidad comunitaria",
      "organizar apoyo",
      "acompañar a un grupo",
    ],
    "social-research": [
      "entrevistar personas",
      "analizar un problema social",
      "resumir hallazgos",
    ],
    "business-project-management": [
      "organizar un proyecto",
      "presentar una propuesta",
      "coordinar tareas de equipo",
    ],
    "derecho-ciencias-juridicas": [
      "analizar un caso",
      "argumentar una postura",
      "buscar acuerdos justos",
    ],
    "administrative-finance": [
      "ordenar registros",
      "crear un presupuesto",
      "verificar datos",
    ],
  };

  const matchedKey = Object.keys(activitiesByRoute).find((key) =>
    lowerId.includes(key),
  );
  return matchedKey
    ? activitiesByRoute[matchedKey]
    : fallbackActivities.slice(0, 3);
}

function obtenerActividadesArea(profileId: string) {
  const activities: Record<string, string[]> = {
    "ingenieria-tecnologia": [
      "construir o probar una solución",
      "analizar cómo funciona un sistema",
      "corregir una falla técnica",
    ],
    "ciencia-datos-investigacion": [
      "investigar una pregunta",
      "comparar evidencias",
      "explicar patrones con información",
    ],
    "salud-apoyo-humano": [
      "acompañar a una persona",
      "observar necesidades de cuidado",
      "orientar sobre bienestar",
    ],
    "educacion-ciencias-sociales": [
      "explicar un tema",
      "facilitar una actividad grupal",
      "investigar una situación social",
    ],
    "arte-comunicacion-diseno": [
      "crear una pieza visual",
      "diseñar un contenido",
      "comunicar una idea a una audiencia",
    ],
    "negocios-gestion": [
      "coordinar un proyecto",
      "presentar una propuesta",
      "organizar recursos y tareas",
    ],
    "administracion-finanzas": [
      "ordenar información",
      "elaborar un presupuesto",
      "controlar un proceso",
    ],
  };

  return (
    activities[profileId] ?? [
      "explorar una actividad corta",
      "conversar con alguien del área",
      "comparar opciones reales",
    ]
  );
}

function capitalizarActividad(activity: string) {
  if (!activity) return activity;
  return `${activity.charAt(0).toUpperCase()}${activity.slice(1)}.`;
}

function formatearNombreArea(name: string) {
  const names: Record<string, string> = {
    "Ciencia de Datos y Analisis": "Ciencia de Datos y Análisis",
    "Industrial, Procesos y Operaciones": "Industrial, Procesos y Operaciones",
    "Mecatronica y Tecnologia Aplicada": "Mecatrónica y Tecnología Aplicada",
    "Arquitectura y Diseno Espacial": "Arquitectura y Diseño Espacial",
    "Diseno Grafico y Visual": "Diseño Gráfico y Visual",
    "Comunicacion Audiovisual y Contenidos":
      "Comunicación Audiovisual y Contenidos",
    "Ingenieria Ambiental y Sostenibilidad":
      "Ingeniería Ambiental y Sostenibilidad",
    "Gestion Ambiental y Proyectos": "Gestión Ambiental y Proyectos",
    "Laboratorio, Farmacia e Investigacion Aplicada":
      "Laboratorio, Farmacia e Investigación Aplicada",
    "Biotecnologia y Ciencias de la Salud":
      "Biotecnología y Ciencias de la Salud",
    "Nutricion, Salud y Bienestar": "Nutrición, Salud y Bienestar",
    "Psicologia y Apoyo Humano": "Psicología y Apoyo Humano",
    "Educacion, Orientacion y Formacion": "Educación, Orientación y Formación",
    "Educacion y Ensenanza": "Educación y Enseñanza",
    "Psicopedagogia y Orientacion Educativa":
      "Psicopedagogía y Orientación Educativa",
    "Gestion de Proyectos Educativos o Sociales":
      "Gestión de Proyectos Educativos o Sociales",
    "Salud y Bienestar desde la Orientacion o Prevencion":
      "Salud y Bienestar desde la Orientación o Prevención",
    "Literatura, Escritura y Estudios Culturales":
      "Literatura, Escritura y Estudios Culturales",
    "Historia, Filosofia y Humanidades": "Historia, Filosofía y Humanidades",
    "Periodismo y Comunicacion Publica": "Periodismo y Comunicación Pública",
    "Trabajo Social y Desarrollo Comunitario":
      "Trabajo Social y Desarrollo Comunitario",
    "Sociologia, Antropologia e Investigacion Social":
      "Sociología, Antropología e Investigación Social",
    "Relaciones Internacionales y Politicas Publicas":
      "Relaciones Internacionales y Políticas Públicas",
    "Negocios y Gestion de Proyectos": "Negocios y Gestión de Proyectos",
    "Derecho y Ciencias Juridicas": "Derecho y Ciencias Jurídicas",
    "Finanzas, Administracion y Procesos":
      "Finanzas, Administración y Procesos",
  };

  return names[name] ?? name;
}

function obtenerActividadesParaProbar(areas: AreaVisible[], profileId: string) {
  const category = obtenerCategoriaAreas(areas, profileId);
  const suggestions: Record<
    CategoriaResultado,
    Array<{ icon: string; text: string }>
  > = {
    "communication-design": [
      {
        icon: "🎨",
        text: "Diseñar una publicación, afiche o presentación visual.",
      },
      { icon: "🖼️", text: "Crear una pieza gráfica para explicar una idea." },
      {
        icon: "🎬",
        text: "Grabar o editar un video corto sobre un tema que te interese.",
      },
      {
        icon: "📝",
        text: "Escribir una nota, entrevista o publicación informativa breve.",
      },
    ],
    technology: [
      {
        icon: "💻",
        text: "Probar retos de tecnología, construcción o mejora de soluciones.",
      },
      {
        icon: "🛠️",
        text: "Realizar una actividad práctica donde puedas armar, probar o corregir algo.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que estudien ingeniería o tecnología.",
      },
      {
        icon: "📚",
        text: "Tomar un curso corto de lógica, sistemas o herramientas técnicas.",
      },
    ],
    "research-data": [
      {
        icon: "🔬",
        text: "Explorar actividades de investigación, laboratorio o análisis de información.",
      },
      {
        icon: "📊",
        text: "Revisar casos donde se usen evidencias para explicar un problema.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que investiguen, analicen datos o trabajen en ciencia.",
      },
      {
        icon: "📚",
        text: "Tomar un curso corto de análisis, método científico o pensamiento lógico.",
      },
    ],
    health: [
      {
        icon: "💚",
        text: "Explorar actividades de apoyo, escucha o acompañamiento a personas.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que estudien salud, psicología o bienestar humano.",
      },
      {
        icon: "📚",
        text: "Tomar un taller corto sobre cuidado, orientación o primeros auxilios emocionales.",
      },
      {
        icon: "📝",
        text: "Observar qué situaciones de ayuda te interesan y cuáles te cuestan sostener.",
      },
    ],
    "education-support": [
      {
        icon: "📚",
        text: "Probar actividades donde expliques un tema o acompañes el aprendizaje de alguien.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que enseñen, orienten o trabajan con comunidades.",
      },
      {
        icon: "🗣️",
        text: "Participar en espacios de diálogo, tutoría o trabajo grupal.",
      },
      {
        icon: "📝",
        text: "Comparar si te interesa más enseñar, investigar sociedad u orientar personas.",
      },
    ],
    "business-management": [
      {
        icon: "📊",
        text: "Probar retos de organización, liderazgo o planificación de proyectos.",
      },
      {
        icon: "🚀",
        text: "Explorar actividades de emprendimiento, ventas o creación de ideas.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que gestionen equipos, proyectos o negocios.",
      },
      {
        icon: "📚",
        text: "Tomar un curso corto de gestión, marketing o finanzas básicas.",
      },
    ],
    "admin-finance": [
      {
        icon: "📊",
        text: "Probar actividades de orden, registro, presupuesto o control de procesos.",
      },
      {
        icon: "🗂️",
        text: "Organizar información real y observar si te resulta cómodo trabajar con detalle.",
      },
      {
        icon: "👥",
        text: "Conversar con personas que trabajen en administración, finanzas u operaciones.",
      },
      {
        icon: "📚",
        text: "Tomar un curso corto de Excel, finanzas personales o gestión operativa.",
      },
    ],
    "law-social": [
      {
        icon: "⚖️",
        text: "Analizar un caso sencillo y escribir argumentos a favor y en contra.",
      },
      {
        icon: "🗣️",
        text: "Participar en un debate breve sobre una decisión justa.",
      },
      {
        icon: "📄",
        text: "Leer una noticia e identificar normas, actores y posibles soluciones.",
      },
      {
        icon: "🤝",
        text: "Simular una mediación para buscar acuerdos entre dos posturas.",
      },
    ],
    environment: [
      {
        icon: "🌱",
        text: "Observar un problema ambiental cercano y registrar posibles causas.",
      },
      {
        icon: "📋",
        text: "Diseñar una pequeña acción para reducir residuos o cuidar recursos.",
      },
      {
        icon: "🔎",
        text: "Comparar información sobre sostenibilidad, territorio o recursos naturales.",
      },
      {
        icon: "👥",
        text: "Conversar con alguien que trabaje en ambiente o gestión de proyectos sostenibles.",
      },
    ],
    general: [
      {
        icon: "📝",
        text: "Elegir una actividad breve relacionada con la primera opción recomendada.",
      },
      {
        icon: "🔎",
        text: "Buscar ejemplos reales de trabajo en cada área compatible.",
      },
      {
        icon: "👥",
        text: "Conversar con alguien que estudie o trabaje en una de esas áreas.",
      },
      {
        icon: "🧭",
        text: "Comparar qué actividad te interesa repetir después de probarla.",
      },
    ],
  };

  return suggestions[category];
}

function obtenerInteresesDestacadosExplicados(
  areas: AreaVisible[],
  profileId: string,
) {
  const category = obtenerCategoriaAreas(areas, profileId);
  const interests: Record<CategoriaResultado, string[]> = {
    "communication-design": [
      "Te atraen actividades donde puedas comunicar ideas de forma visual, creativa o expresiva.",
      "Puede interesarte crear piezas gráficas, contenidos o mensajes para distintos públicos.",
      "También aparecen señales relacionadas con informar, explicar o conectar ideas con personas.",
    ],
    technology: [
      "Te atraen actividades donde puedas entender cómo funcionan las cosas y buscar soluciones prácticas.",
      "Puede interesarte aprender probando, ajustando y corrigiendo hasta que algo funcione mejor.",
    ],
    "research-data": [
      "Te atraen actividades donde puedas investigar, comparar información y llegar a conclusiones con evidencias.",
      "Puede interesarte descubrir patrones, causas o explicaciones detrás de una situación.",
    ],
    health: [
      "Te atraen actividades donde puedas cuidar, acompañar u orientar a otras personas.",
      "Puede interesarte comprender necesidades humanas y actuar con responsabilidad ante ellas.",
    ],
    "education-support": [
      "Te atraen actividades donde puedas explicar, acompañar aprendizajes o trabajar con grupos.",
      "Puede interesarte comprender cómo viven, aprenden o se organizan las personas.",
    ],
    "business-management": [
      "Te atraen actividades donde puedas organizar personas, tomar iniciativa y hacer avanzar proyectos.",
      "Puede interesarte presentar ideas, negociar o coordinar acciones para lograr una meta.",
    ],
    "admin-finance": [
      "Te atraen actividades donde puedas ordenar información, revisar detalles y mejorar procesos.",
      "Puede interesarte trabajar con registros, presupuestos, procedimientos o decisiones organizadas.",
    ],
    "law-social": [
      "Te atraen actividades donde puedas analizar situaciones, argumentar y comunicar ideas con claridad.",
      "Puede interesarte revisar casos, normas o problemas sociales desde distintos puntos de vista.",
    ],
    environment: [
      "Te atraen actividades relacionadas con el ambiente, los recursos naturales o la sostenibilidad.",
      "Puede interesarte observar problemas reales y pensar soluciones para cuidar el entorno.",
    ],
    general: [
      "Tus respuestas muestran intereses que conviene comparar con actividades reales.",
      "Puede ayudarte observar qué tipo de tareas te dan más curiosidad y cuáles sostienes mejor.",
    ],
  };

  return interests[category].slice(0, 3);
}

function obtenerFortalezasTransversales(
  profileId: string,
  areas: AreaVisible[],
) {
  const category = obtenerCategoriaAreas(areas, profileId);
  const strengthsByCategory: Record<CategoriaResultado, string[]> = {
    "communication-design": [
      "Capacidad para expresar ideas",
      "Creatividad aplicada",
      "Comunicación clara",
    ],
    technology: [
      "Interés por resolver problemas",
      "Organización para probar soluciones",
      "Disposición para comparar alternativas",
    ],
    "research-data": [
      "Curiosidad para investigar",
      "Organización para revisar información",
      "Interés por encontrar explicaciones",
    ],
    health: [
      "Comunicación clara",
      "Disposición para comprender necesidades",
      "Interés por apoyar a personas",
    ],
    "education-support": [
      "Capacidad para explicar ideas",
      "Comunicación clara",
      "Disposición para acompañar aprendizajes",
    ],
    "business-management": [
      "Organización para coordinar acciones",
      "Comunicación clara",
      "Disposición para tomar iniciativa",
    ],
    "admin-finance": [
      "Organización para revisar información",
      "Atención a detalles importantes",
      "Disposición para seguir procesos",
    ],
    "law-social": [
      "Capacidad para argumentar ideas",
      "Comunicación clara",
      "Interés por analizar situaciones",
    ],
    environment: [
      "Interés por problemas reales",
      "Observación del entorno",
      "Disposición para proponer mejoras",
    ],
    general: [
      "Interés por explorar opciones",
      "Disposición para comparar alternativas",
      "Organización para probar opciones",
    ],
  };

  return strengthsByCategory[category];
}

function obtenerAspectosAConsiderar(
  indicators: ResultIndicators,
  areas: AreaVisible[],
) {
  const category = obtenerCategoriaAreas(areas, "general");
  const [firstArea, secondArea, thirdArea] = areas;
  const aspects: string[] = [];

  if (category === "communication-design" && firstArea && secondArea) {
    aspects.push(
      `Compara ${firstArea.name} con ${secondArea.name}, porque ambas se relacionan con creatividad y comunicación.`,
    );
    aspects.push(
      thirdArea
        ? `Revisa si prefieres crear piezas visuales, producir contenido audiovisual o comunicar información mediante textos y entrevistas.`
        : "Revisa si prefieres crear piezas visuales, producir contenido audiovisual o comunicar ideas en otro formato.",
    );
    aspects.push("Antes de decidir, prueba actividades pequeñas de cada área.");
    return aspects;
  }

  if (areas.length >= 2) {
    aspects.push(
      `Compara ${areas[0].name} con ${areas[1].name}, porque ambas se relacionan con tus respuestas.`,
    );
  }

  aspects.push(
    "Revisa qué actividades concretas harías en cada opción, no solo el nombre de la carrera.",
  );
  aspects.push(
    "Antes de decidir, prueba una actividad pequeña de cada área recomendada.",
  );

  if (indicators.externalPressure >= 60) {
    aspects.push(
      "Conviene separar lo que realmente te interesa de lo que otras personas esperan de ti.",
    );
  }

  return aspects.slice(0, 3);
}

function obtenerProximosPasos(areas: AreaVisible[]) {
  const [firstArea, secondArea] = areas;
  const comparisonText =
    firstArea && secondArea
      ? `Compara ${firstArea.name} con ${secondArea.name} usando actividades reales, no solo el nombre de la carrera.`
      : "Compara dos opciones reales antes de pensar en una elección definitiva.";

  return [
    {
      icon: "📝",
      text: "Anota qué actividades te dan energía y cuáles te frustran después de probarlas.",
    },
    {
      icon: "⏳",
      text: "Observa qué actividades puedes sostener varias semanas, no solo cuáles te gustan al inicio.",
    },
    {
      icon: "👥",
      text: "Conversa con alguien que estudie o trabaje en una de las áreas recomendadas.",
    },
    {
      icon: "🧭",
      text: comparisonText,
    },
  ];
}

function obtenerSignificadoResultado(
  areas: AreaVisible[],
  profileId: string,
  combinedPattern: VocationalCombinedPattern | null = null,
) {
  if (combinedPattern) {
    const areaNames = unirListaNatural(areas.map((area) => area.name));

    return {
      primary:
        `${combinedPattern.explanation} ` +
        `Esto no define una carrera única; funciona como área más compatible según el patrón de respuestas${areaNames ? `, con opciones como ${areaNames}` : ""}.`,
      action:
        "Para avanzar, valida esta ruta inicial con experiencias cortas y compara qué actividades puedes sostener con interés real.",
    };
  }

  const category = obtenerCategoriaAreas(areas, profileId);
  const areaNames = unirListaNatural(areas.map((area) => area.name));
  const meaningByCategory: Record<CategoriaResultado, string> = {
    "communication-design": `Tu resultado se relaciona principalmente con áreas donde puedes comunicar ideas, crear mensajes visuales, producir contenido o informar a otras personas. Las opciones más cercanas son ${areaNames}. Este resultado no define una carrera única, sino que sirve como guía inicial para comparar alternativas reales.`,
    technology: `Tu resultado se relaciona principalmente con áreas donde puedes resolver problemas, crear soluciones técnicas, probar sistemas o mejorar cómo funcionan las cosas. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    "research-data": `Tu resultado se relaciona principalmente con áreas donde puedes investigar, analizar información, buscar patrones o explicar situaciones con evidencias. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    health: `Tu resultado se relaciona principalmente con áreas donde puedes cuidar, apoyar, prevenir o promover bienestar en personas. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    "education-support": `Tu resultado se relaciona principalmente con áreas donde puedes enseñar, orientar, explicar ideas o acompañar procesos de aprendizaje. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    "business-management": `Tu resultado se relaciona principalmente con áreas donde puedes organizar proyectos, coordinar personas, proponer ideas o tomar decisiones. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    "admin-finance": `Tu resultado se relaciona principalmente con áreas donde puedes ordenar información, revisar procesos, controlar recursos o trabajar con datos administrativos. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    "law-social": `Tu resultado se relaciona principalmente con áreas donde puedes analizar casos, argumentar, comunicar ideas y comprender decisiones sociales o institucionales. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    environment: `Tu resultado se relaciona principalmente con áreas donde puedes observar el entorno, analizar problemas ambientales y proponer acciones para cuidar recursos. Las opciones más cercanas son ${areaNames}. Este resultado sirve como guía inicial para comparar alternativas reales.`,
    general: `Tu resultado se relaciona con ${areaNames || "las áreas mostradas"}. Este resultado no define una carrera única, sino que sirve como guía inicial para comparar alternativas reales.`,
  };

  return {
    primary: meaningByCategory[category],
    action:
      "Para avanzar, valida estas ideas con información y experiencias reales: prueba actividades pequeñas de cada área y observa cuáles te gustaría repetir.",
  };
}

function obtenerAnchoBarraCualitativa(
  index: number,
  topScore: number,
  score: number,
) {
  if (index === 0) return 96;

  const gap = topScore - score;

  if (gap <= 0.5) return 84;
  if (gap <= 2) return 72;

  return 60;
}

function obtenerIconoArea(id: string, index: number) {
  const lowerId = id.toLowerCase();

  if (
    lowerId.includes("architecture") ||
    lowerId.includes("design") ||
    lowerId.includes("diseno")
  )
    return "🏛️";
  if (lowerId.includes("derecho") || lowerId.includes("jurid")) return "⚖️";
  if (lowerId.includes("environment") || lowerId.includes("ambient"))
    return "🌱";
  if (
    lowerId.includes("laboratory") ||
    lowerId.includes("biotech") ||
    lowerId.includes("farmacia")
  )
    return "🔬";
  if (
    lowerId.includes("humanities") ||
    lowerId.includes("literature") ||
    lowerId.includes("history")
  )
    return "📖";
  if (lowerId.includes("social") || lowerId.includes("psychology")) return "💚";

  const icons: Record<string, string> = {
    "ingenieria-tecnologia": "💻",
    "ciencia-datos-investigacion": "🔬",
    "salud-apoyo-humano": "💚",
    "educacion-ciencias-sociales": "📚",
    "arte-comunicacion-diseno": "🎨",
    "negocios-gestion": "🚀",
    "administracion-finanzas": "📊",
  };
  const fallback = ["🧭", "💡", "★"];

  return icons[id] ?? fallback[index] ?? "★";
}

function obtenerIconoFortaleza(index: number) {
  return ["🧩", "🎯", "🛠️", "✨"][index] ?? "★";
}

function obtenerEtiquetaRutaPerfil(profileId: string, fallback: string) {
  const labels: Record<string, string> = {
    "ingenieria-tecnologia": "Ingeniería y tecnología",
    "ciencia-datos-investigacion": "Investigación, ciencia y análisis",
    "salud-apoyo-humano": "Trabajo con personas y bienestar",
    "educacion-ciencias-sociales": "Educación y ciencias sociales",
    "arte-comunicacion-diseno": "Comunicación, arte y diseño",
    "negocios-gestion": "Gestión, liderazgo y emprendimiento",
    "administracion-finanzas": "Administración, finanzas y procesos",
  };

  return labels[profileId] ?? fallback;
}
 
