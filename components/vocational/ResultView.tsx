import Link from "next/link";
import { PrintReportButton, ReportPanel } from "./ReportPanel";
import { getCompatibleProfiles } from "@/lib/vocational/engine";
import { buildLayeredResultArchitecture } from "@/lib/vocational/resultArchitecture";
import type { Answer, Profile, ResultIndicators } from "@/lib/vocational/types";

export function getResultMode(clarity: number) {
  if (clarity >= 75) return "defined";
  if (clarity >= 50) return "moderate";
  return "exploration";
}

export function getCompatiblePaths(
  profileRanking: Array<Profile & { score: number }>,
  mainProfileId: string,
) {
  const mainPath = profileRanking.find((profile) => profile.id === mainProfileId);
  const compatiblePaths = getCompatibleProfiles(profileRanking, mainProfileId).map((profile) => ({
    id: profile.id,
    name: getProfileRouteLabel(profile.id, profile.name),
    score: profile.score,
  }));

  return {
    mainPath,
    compatiblePaths,
  };
}

export function showSecondaryProfile(profileRanking: Array<Profile & { score: number }>) {
  const [main, secondary] = profileRanking;

  if (!main || !secondary) return false;

  return secondary.score >= main.score * 0.75;
}

export function ResultView({
  answers,
  indicators,
  profile,
  ranked,
  signals,
}: {
  answers: Answer[];
  indicators: ResultIndicators;
  profile: Profile & { score: number };
  ranked: Array<Profile & { score: number }>;
  signals: string[];
}) {
  const profileExtras = getProfilePresentation(profile.id);
  const compatiblePathResult = getCompatiblePaths(ranked, profile.id);
  const compatiblePaths = compatiblePathResult.compatiblePaths;
  const layeredResult = buildLayeredResultArchitecture(answers, ranked);
  const isExploratory =
    layeredResult.riasecEnvironment.broadInterestPattern || indicators.profileClarity < 50;
  const visibleAreas = getVisibleAreas(layeredResult, ranked, profile);
  const strengths = profileExtras.strengths.slice(0, 4);
  const reasons = getResultReasons(profile.id, visibleAreas, isExploratory);
  const thingsToTry = getThingsToTry(profile.id);
  const nextSteps = getNextSteps();
  const resultMeaning = getResultMeaning(profile.id, visibleAreas);

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
            <PrintReportButton />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_16px_40px_rgba(83,67,160,0.07)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#7c3aed]">Resultado principal</p>
                <h1 className="mt-2 text-3xl font-bold leading-tight">{profile.name}</h1>
              </div>
              {isExploratory && (
                <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-bold text-[#92400e]">
                  Exploratorio
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#394267]">
              {getShortProfileDescription(profile)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e3f2] bg-[#fbfaff] p-5 shadow-[0_16px_40px_rgba(83,67,160,0.05)]">
            <h3 className="font-bold">¿Por qué apareció este resultado?</h3>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[#394267]">
              {reasons.map((reason) => (
                <ReasonItem key={reason} text={reason} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
            <h3 className="text-lg font-bold">Áreas compatibles</h3>
            <div className="mt-4 grid gap-3">
              {visibleAreas.map((area, index) => (
                <details key={area.name} className="group grid gap-2 rounded-xl bg-white">
                  <summary className="grid cursor-pointer list-none gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e0f2fe] text-xl">
                          {area.icon}
                        </span>
                        <span className="truncate text-sm font-bold">{area.name}</span>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-[#6b7394]">
                        {index === 0 ? "Principal" : "Compatible"}
                        <span className="inline-block text-[#7c3aed] transition group-open:rotate-90">▸</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eceaf4]">
                      <div
                        className="h-2 rounded-full bg-[#7c3aed]"
                        style={{ width: `${area.width}%` }}
                      />
                    </div>
                  </summary>
                  <p className="rounded-xl bg-[#fbfaff] px-3 py-2 text-sm leading-6 text-[#394267]">
                    {area.description}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
            <h3 className="text-lg font-bold">Tus fortalezas principales</h3>
            <div className="mt-4 grid gap-2">
              {strengths.map((strength, index) => (
                <div key={strength} className="flex items-center gap-3 rounded-xl bg-[#fbfaff] px-3 py-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef9f2] text-lg">
                    {getStrengthIcon(index)}
                  </span>
                  <span className="text-sm font-semibold text-[#273153]">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <details className="mt-4 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_36px_rgba(83,67,160,0.06)]">
          <summary className="cursor-pointer list-none text-lg font-bold text-[#7c3aed]">
            <span className="mr-2 inline-block">▾</span>
            Conoce más sobre tu resultado
          </summary>

          <h3 className="mt-6 text-lg font-bold">Qué podrías probar</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {thingsToTry.map((item) => (
              <div key={item.text} className="flex gap-3 rounded-xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]">
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
              <div key={step.text} className="flex gap-3 rounded-xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]">
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

      <ReportPanel
        answers={answers}
        areas={profileExtras.areas}
        compatiblePaths={compatiblePaths.map((path) => path.name)}
        indicators={indicators}
        profile={profile}
        ranked={ranked}
        signals={signals}
        strengths={profileExtras.strengths}
      />
    </>
  );
}

function ReasonItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#dcfce7] text-sm text-[#16a34a]">
        ✓
      </span>
      <p>{text}</p>
    </div>
  );
}

function getVisibleAreas(
  layeredResult: ReturnType<typeof buildLayeredResultArchitecture>,
  ranked: Array<Profile & { score: number }>,
  profile: Profile & { score: number },
) {
  const subrouteAreas = layeredResult.concreteSubroutes.slice(0, 3).map((subroute, index) => ({
    name: formatAreaName(subroute.name),
    icon: getAreaIcon(subroute.id, index),
    width: [96, 84, 72][index] ?? 64,
    description: getSubrouteDescription(subroute.id, subroute.name),
  }));

  if (subrouteAreas.length >= 3) return subrouteAreas;

  const profileAreas = [
    profile,
    ...ranked.filter((item) => item.id !== profile.id).slice(0, 2),
  ].map((item, index) => ({
    name: getProfileRouteLabel(item.id, item.name),
    icon: getAreaIcon(item.id, index),
    width: getQualitativeBarWidth(index, profile.score, item.score),
    description: getAreaDescription(item.id),
  }));

  return [...subrouteAreas, ...profileAreas]
    .filter((area, index, areas) => areas.findIndex((item) => item.name === area.name) === index)
    .slice(0, 3);
}

function getResultReasons(
  profileId: string,
  areas: Array<{ name: string }>,
  isExploratory: boolean,
) {
  const [firstArea, secondArea] = areas;
  const reasonsByProfile: Record<string, string> = {
    "ingenieria-tecnologia": "Tus respuestas mostraron afinidad con resolver problemas prácticos y entender cómo funcionan las cosas.",
    "ciencia-datos-investigacion": "Tus respuestas mostraron afinidad con investigar, analizar información y encontrar patrones.",
    "salud-apoyo-humano": "Tus respuestas mostraron afinidad con ayudar, escuchar y acompañar a otras personas.",
    "educacion-ciencias-sociales": "Tus respuestas mostraron afinidad con orientar, explicar y trabajar con personas o grupos.",
    "arte-comunicacion-diseno": "Tus respuestas mostraron afinidad con crear, diseñar y comunicar ideas.",
    "negocios-gestion": "Tus respuestas mostraron afinidad con liderazgo, organización y toma de decisiones.",
    "administracion-finanzas": "Tus respuestas mostraron afinidad con orden, procesos y gestión de información.",
  };

  return [
    reasonsByProfile[profileId] ?? `Tus respuestas se relacionan con ${firstArea?.name ?? "esta ruta"}.`,
    secondArea
      ? `También aparecen intereses cercanos en ${secondArea.name}.`
      : "También hay rutas cercanas que podrías comparar.",
    isExploratory
      ? "Este resultado es una orientación inicial: conviene probar actividades antes de decidir."
      : "Este resultado funciona como orientación y no como una decisión definitiva.",
  ];
}

function getShortProfileDescription(profile: Profile) {
  const descriptions: Record<string, string> = {
    "ingenieria-tecnologia":
      "Perfil relacionado con soluciones técnicas, análisis de sistemas y aprendizaje práctico.",
    "ciencia-datos-investigacion":
      "Perfil orientado a investigar, analizar evidencia y comprender patrones.",
    "salud-apoyo-humano":
      "Perfil relacionado con cuidado, bienestar, acompañamiento y apoyo a personas.",
    "educacion-ciencias-sociales":
      "Perfil relacionado con enseñanza, orientación, comunicación y desarrollo de personas.",
    "arte-comunicacion-diseno":
      "Perfil vinculado con creatividad, diseño, comunicación y expresión de ideas.",
    "negocios-gestion":
      "Perfil relacionado con liderazgo, organización, negociación y creación de proyectos.",
    "administracion-finanzas":
      "Perfil orientado a orden, procesos, finanzas, recursos y gestión operativa.",
  };

  return descriptions[profile.id] ?? profile.description;
}

function getAreaDescription(profileId: string) {
  const descriptions: Record<string, string> = {
    "ingenieria-tecnologia":
      "Aparece porque tus respuestas muestran interés por entender cómo funcionan las cosas, resolver retos prácticos o mejorar soluciones.",
    "ciencia-datos-investigacion":
      "Aparece porque tus respuestas se relacionan con analizar información, buscar evidencias y encontrar patrones.",
    "salud-apoyo-humano":
      "Aparece porque tus respuestas muestran interés por cuidar, escuchar, acompañar o apoyar a otras personas.",
    "educacion-ciencias-sociales":
      "Aparece porque tus respuestas muestran habilidades para explicar, orientar, comunicarte y trabajar con personas o grupos.",
    "arte-comunicacion-diseno":
      "Aparece porque tus respuestas muestran interés por crear, diseñar, comunicar ideas o proponer soluciones visuales.",
    "negocios-gestion":
      "Aparece porque tus respuestas muestran iniciativa, organización, liderazgo y gusto por tomar decisiones.",
    "administracion-finanzas":
      "Aparece porque tus respuestas se relacionan con ordenar información, seguir procesos y trabajar con detalle.",
  };

  return descriptions[profileId] ?? "Aparece porque tus respuestas muestran señales compatibles con esta área.";
}

function getSubrouteDescription(subrouteId: string, fallbackName: string) {
  const lowerId = subrouteId.toLowerCase();
  const lowerName = fallbackName.toLowerCase();
  const text = `${lowerId} ${lowerName}`;

  if (text.includes("derecho") || text.includes("jurid")) {
    return "Aparece porque tus respuestas combinan interés por ayudar a personas, tomar decisiones y trabajar con normas o acuerdos.";
  }

  if (text.includes("gestion-publica") || text.includes("relaciones-institucionales")) {
    return "Aparece porque tus respuestas se relacionan con organización, diálogo y participación en decisiones que afectan a otras personas.";
  }

  if (text.includes("mediacion") || text.includes("conflictos")) {
    return "Aparece porque tus respuestas muestran interés por escuchar distintas posiciones y buscar soluciones justas entre personas.";
  }

  if (text.includes("negocios") || text.includes("gestion-de-proyectos")) {
    return "Aparece porque tus respuestas muestran iniciativa, organización y facilidad para coordinar actividades o proyectos.";
  }

  if (text.includes("industrial") || text.includes("procesos") || text.includes("operaciones")) {
    return "Aparece porque tus respuestas muestran interés por organizar procesos, mejorar resultados y resolver problemas prácticos.";
  }

  if (text.includes("arquitectura") || text.includes("diseno-espacial") || text.includes("diseño-espacial")) {
    return "Aparece porque tus respuestas muestran interés por espacios, estructuras, ambientes y soluciones visuales aplicadas.";
  }

  if (text.includes("interiores") || text.includes("entornos")) {
    return "Aparece porque tus respuestas se relacionan con diseñar ambientes funcionales y pensar cómo las personas usan los espacios.";
  }

  if (text.includes("diseno") || text.includes("diseño")) {
    return "Aparece porque tus respuestas muestran creatividad aplicada, atención visual y gusto por transformar ideas en propuestas concretas.";
  }

  if (text.includes("ambiental") || text.includes("sostenibilidad") || text.includes("recursos-naturales")) {
    return "Aparece porque tus respuestas conectan ciencia aplicada, interés por el entorno y búsqueda de soluciones para problemas reales.";
  }

  if (text.includes("farmacia") || text.includes("laboratorio") || text.includes("biotecnologia")) {
    return "Aparece porque tus respuestas muestran interés por investigar, analizar evidencias y trabajar con procesos de salud o laboratorio.";
  }

  if (text.includes("educacion") || text.includes("ensenanza") || text.includes("orientacion")) {
    return "Aparece porque tus respuestas muestran interés por explicar, acompañar aprendizajes y orientar a otras personas.";
  }

  if (text.includes("psicologia") || text.includes("apoyo-humano")) {
    return "Aparece porque tus respuestas muestran sensibilidad para escuchar, comprender necesidades y acompañar a otras personas.";
  }

  return "Aparece porque tus respuestas muestran señales concretas que conviene seguir explorando en esta ruta.";
}

function formatAreaName(name: string) {
  const names: Record<string, string> = {
    "Ciencia de Datos y Analisis": "Ciencia de Datos y Análisis",
    "Industrial, Procesos y Operaciones": "Industrial, Procesos y Operaciones",
    "Mecatronica y Tecnologia Aplicada": "Mecatrónica y Tecnología Aplicada",
    "Arquitectura y Diseno Espacial": "Arquitectura y Diseño Espacial",
    "Diseno Grafico y Visual": "Diseño Gráfico y Visual",
    "Comunicacion Audiovisual y Contenidos": "Comunicación Audiovisual y Contenidos",
    "Ingenieria Ambiental y Sostenibilidad": "Ingeniería Ambiental y Sostenibilidad",
    "Gestion Ambiental y Proyectos": "Gestión Ambiental y Proyectos",
    "Laboratorio, Farmacia e Investigacion Aplicada": "Laboratorio, Farmacia e Investigación Aplicada",
    "Biotecnologia y Ciencias de la Salud": "Biotecnología y Ciencias de la Salud",
    "Nutricion, Salud y Bienestar": "Nutrición, Salud y Bienestar",
    "Psicologia y Apoyo Humano": "Psicología y Apoyo Humano",
    "Educacion y Ensenanza": "Educación y Enseñanza",
    "Psicopedagogia y Orientacion Educativa": "Psicopedagogía y Orientación Educativa",
    "Literatura, Escritura y Estudios Culturales": "Literatura, Escritura y Estudios Culturales",
    "Historia, Filosofia y Humanidades": "Historia, Filosofía y Humanidades",
    "Periodismo y Comunicacion Publica": "Periodismo y Comunicación Pública",
    "Trabajo Social y Desarrollo Comunitario": "Trabajo Social y Desarrollo Comunitario",
    "Sociologia, Antropologia e Investigacion Social": "Sociología, Antropología e Investigación Social",
    "Relaciones Internacionales y Politicas Publicas": "Relaciones Internacionales y Políticas Públicas",
    "Negocios y Gestion de Proyectos": "Negocios y Gestión de Proyectos",
    "Derecho y Ciencias Juridicas": "Derecho y Ciencias Jurídicas",
    "Finanzas, Administracion y Procesos": "Finanzas, Administración y Procesos",
  };

  return names[name] ?? name;
}

function getThingsToTry(profileId: string) {
  const suggestions: Record<string, Array<{ icon: string; text: string }>> = {
    "ingenieria-tecnologia": [
      { icon: "💻", text: "Probar retos de tecnología, construcción o mejora de soluciones." },
      { icon: "🛠️", text: "Realizar una actividad práctica donde puedas armar, probar o corregir algo." },
      { icon: "👥", text: "Conversar con personas que estudien ingeniería o tecnología." },
      { icon: "📚", text: "Tomar un curso corto de lógica, sistemas o herramientas técnicas." },
    ],
    "ciencia-datos-investigacion": [
      { icon: "🔬", text: "Explorar actividades de investigación, laboratorio o análisis de información." },
      { icon: "📊", text: "Revisar casos donde se usen evidencias para explicar un problema." },
      { icon: "👥", text: "Conversar con personas que investiguen, analicen datos o trabajen en ciencia." },
      { icon: "📚", text: "Tomar un curso corto de análisis, método científico o pensamiento lógico." },
    ],
    "salud-apoyo-humano": [
      { icon: "💚", text: "Explorar actividades de apoyo, escucha o acompañamiento a personas." },
      { icon: "👥", text: "Conversar con personas que estudien salud, psicología o bienestar humano." },
      { icon: "📚", text: "Tomar un taller corto sobre cuidado, orientación o primeros auxilios emocionales." },
      { icon: "📝", text: "Observar qué situaciones de ayuda te interesan y cuáles te cuestan sostener." },
    ],
    "educacion-ciencias-sociales": [
      { icon: "📚", text: "Probar actividades donde expliques un tema o acompañes el aprendizaje de alguien." },
      { icon: "👥", text: "Conversar con personas que enseñen, orienten o trabajen con comunidades." },
      { icon: "🗣️", text: "Participar en espacios de diálogo, tutoría o trabajo grupal." },
      { icon: "📝", text: "Comparar si te interesa más enseñar, investigar sociedad u orientar personas." },
    ],
    "arte-comunicacion-diseno": [
      { icon: "🎨", text: "Crear una pieza visual, historia, ambiente o propuesta de diseño pequeña." },
      { icon: "🗣️", text: "Explorar actividades de comunicación, contenido o expresión de ideas." },
      { icon: "📚", text: "Tomar un taller corto de diseño, comunicación visual o creatividad aplicada." },
      { icon: "👥", text: "Conversar con personas de diseño, comunicación, arquitectura o producción creativa." },
    ],
    "negocios-gestion": [
      { icon: "📊", text: "Probar retos de organización, liderazgo o planificación de proyectos." },
      { icon: "🚀", text: "Explorar actividades de emprendimiento, ventas o creación de ideas." },
      { icon: "👥", text: "Conversar con personas que gestionen equipos, proyectos o negocios." },
      { icon: "📚", text: "Tomar un curso corto de gestión, marketing o finanzas básicas." },
    ],
    "administracion-finanzas": [
      { icon: "📊", text: "Probar actividades de orden, registro, presupuesto o control de procesos." },
      { icon: "🗂️", text: "Organizar información real y observar si te resulta cómodo trabajar con detalle." },
      { icon: "👥", text: "Conversar con personas que trabajen en administración, finanzas u operaciones." },
      { icon: "📚", text: "Tomar un curso corto de Excel, finanzas personales o gestión operativa." },
    ],
  };

  return suggestions[profileId] ?? suggestions["ingenieria-tecnologia"];
}

function getNextSteps() {
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
      text: "Conversa con alguien que estudie o trabaje en un área que te interese.",
    },
    {
      icon: "🧭",
      text: "Compara dos opciones reales antes de pensar en una elección definitiva.",
    },
  ];
}

function getResultMeaning(profileId: string, areas: Array<{ name: string }>) {
  const firstArea = areas[0]?.name ?? "tu ruta principal";
  const secondaryAreas = areas
    .slice(1, 3)
    .map((area) => area.name.toLowerCase())
    .join(" y ");

  const profileMeaning: Record<string, string> = {
    "ingenieria-tecnologia":
      "Tu resultado se orienta principalmente hacia soluciones prácticas, tecnología y análisis de cómo funcionan las cosas.",
    "ciencia-datos-investigacion":
      "Tu resultado se orienta principalmente hacia investigación, análisis de información y búsqueda de explicaciones.",
    "salud-apoyo-humano":
      "Tu resultado se orienta principalmente hacia el cuidado, la escucha y el apoyo a otras personas.",
    "educacion-ciencias-sociales":
      "Tu resultado se orienta principalmente hacia la orientación, la enseñanza y el trabajo con personas o grupos.",
    "arte-comunicacion-diseno":
      "Tu resultado se orienta principalmente hacia la creatividad, el diseño, la comunicación y la expresión de ideas.",
    "negocios-gestion":
      "Tu resultado se orienta principalmente hacia gestión, liderazgo, organización y creación de proyectos.",
    "administracion-finanzas":
      "Tu resultado se orienta principalmente hacia orden, procesos, gestión de información y trabajo con detalle.",
  };

  const primary =
    profileMeaning[profileId] ??
    `Tu resultado se orienta principalmente hacia ${firstArea.toLowerCase()}.`;

  return {
    primary: secondaryAreas
      ? `${primary} También hay cercanía con ${secondaryAreas}, lo que sugiere que tus intereses pueden moverse entre más de una dirección.`
      : primary,
    action:
      "Para avanzar, prueba actividades pequeñas relacionadas con estas áreas y observa cuáles te dan energía, cuáles te cuestan sostener y cuáles te gustaría repetir.",
  };
}

function getQualitativeBarWidth(index: number, topScore: number, score: number) {
  if (index === 0) return 96;

  const gap = topScore - score;

  if (gap <= 0.5) return 84;
  if (gap <= 2) return 72;

  return 60;
}

function getAreaIcon(id: string, index: number) {
  const lowerId = id.toLowerCase();

  if (lowerId.includes("architecture") || lowerId.includes("design") || lowerId.includes("diseno")) return "🏛️";
  if (lowerId.includes("derecho") || lowerId.includes("jurid")) return "⚖️";
  if (lowerId.includes("environment") || lowerId.includes("ambient")) return "🌱";
  if (lowerId.includes("laboratory") || lowerId.includes("biotech") || lowerId.includes("farmacia")) return "🔬";
  if (lowerId.includes("humanities") || lowerId.includes("literature") || lowerId.includes("history")) return "📖";
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
  const fallback = ["🧭", "💡", "⭐"];

  return icons[id] ?? fallback[index] ?? "⭐";
}

function getStrengthIcon(index: number) {
  return ["🧩", "🎯", "🛠️", "✨"][index] ?? "⭐";
}

function getProfileRouteLabel(profileId: string, fallback: string) {
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

function getProfilePresentation(profileId: string) {
  const presentations: Record<string, { strengths: string[]; areas: string[] }> = {
    "ingenieria-tecnologia": {
      strengths: ["Resolución práctica de problemas", "Pensamiento técnico", "Aprendizaje por experimentación"],
      areas: ["Ingeniería", "Tecnología y sistemas", "Desarrollo de soluciones digitales"],
    },
    "ciencia-datos-investigacion": {
      strengths: ["Análisis de evidencia", "Curiosidad intelectual", "Búsqueda de patrones"],
      areas: ["Ciencia de datos", "Investigación", "Analítica aplicada"],
    },
    "salud-apoyo-humano": {
      strengths: ["Escucha y acompañamiento", "Comprensión de necesidades humanas", "Responsabilidad en el cuidado"],
      areas: ["Salud", "Psicología", "Apoyo humano y bienestar"],
    },
    "educacion-ciencias-sociales": {
      strengths: ["Comunicación", "Orientación a personas", "Trabajo con grupos"],
      areas: ["Educación", "Ciencias sociales", "Gestión comunitaria"],
    },
    "arte-comunicacion-diseno": {
      strengths: ["Creatividad", "Expresión de ideas", "Sensibilidad comunicativa"],
      areas: ["Diseño", "Comunicación", "Producción de contenidos"],
    },
    "negocios-gestion": {
      strengths: ["Iniciativa", "Liderazgo", "Toma de decisiones", "Organización"],
      areas: ["Negocios", "Gestión", "Emprendimiento"],
    },
    "administracion-finanzas": {
      strengths: ["Orden y estructura", "Gestión de información", "Control de procesos"],
      areas: ["Administración", "Finanzas", "Gestión operativa"],
    },
  };

  return (
    presentations[profileId] ?? {
      strengths: ["Intereses consistentes", "Capacidad de exploración", "Aprendizaje progresivo"],
      areas: ["Área principal sugerida", "Área alternativa para explorar", "Ruta exploratoria"],
    }
  );
}
