import Link from "next/link";
import { PrintReportButton, ReportPanel } from "./ReportPanel";
import type { Answer, Profile } from "@/lib/vocational/types";

export function getResultMode(clarity: number) {
  if (clarity >= 75) return "defined";
  if (clarity >= 50) return "moderate";
  return "exploration";
}

export function getCompatiblePaths(profileRanking: Array<Profile & { score: number }>) {
  const topScore = profileRanking[0]?.score ?? 0;
  const [mainPath, secondaryPath] = profileRanking;
  const compatiblePaths = profileRanking
    .filter((profile, index) => index > 0 && profile.score >= topScore - 2)
    .map((profile) => ({
      id: profile.id,
      name: getProfileRouteLabel(profile.id, profile.name),
      score: profile.score,
    }));

  return {
    mainPath,
    secondaryPath,
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
  confidence,
  profile,
  ranked,
  signals,
}: {
  answers: Answer[];
  confidence: number;
  profile: Profile & { score: number };
  ranked: Array<Profile & { score: number }>;
  signals: string[];
}) {
  const secondProfile = ranked[1];
  const shouldShowSecondary = showSecondaryProfile(ranked);
  const scoreGap = secondProfile ? profile.score - secondProfile.score : 0;
  const isHybrid = Boolean(shouldShowSecondary && secondProfile && scoreGap <= 2.5);
  const profileExtras = getProfilePresentation(profile.id);
  const compatiblePathResult = getCompatiblePaths(ranked);
  const compatiblePaths = compatiblePathResult.compatiblePaths;
  const narrativeClose = getNarrativeClose(profile, ranked);
  const topScore = ranked[0]?.score || 1;
  const compatibleRows = ranked.slice(0, 4).map((item, index) => ({
    id: item.id,
    name: getProfileRouteLabel(item.id, item.name),
    percent: Math.max(
      index === 0 ? Math.round(confidence) : 35,
      Math.min(100, Math.round((item.score / topScore) * confidence)),
    ),
  }));
  const thingsToTry = getThingsToTry(profile.id);
  const nextSteps = getNextSteps();

  return (
    <>
      <div className="no-print">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#efe9ff] text-3xl">
              🎉
            </div>
            <div>
              <h2 className="text-2xl font-bold">¡Ya tienes tus resultados!</h2>
              <p className="mt-1 text-sm text-[#6b7394]">
                Aquí puedes ver tus áreas más compatibles y próximas recomendaciones.
              </p>
            </div>
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
        </div>

        <section className="grid gap-5 rounded-2xl border border-[#e7e3f2] bg-[#f4efff] p-5 shadow-[0_18px_50px_rgba(83,67,160,0.08)] lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-bold text-[#7c3aed]">Tu resultado principal</p>
            <h3 className="mt-4 text-3xl font-bold">{profile.name}</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#394267]">
              {profile.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-5">
            <h3 className="font-bold">¿Por qué apareció este resultado?</h3>
            <div className="mt-5 grid gap-4 text-sm leading-6 text-[#273153]">
              <ReasonItem text="Tus respuestas apuntan con más fuerza a intereses relacionados con este perfil." />
              <ReasonItem text="Aparecen áreas cercanas que puedes comparar antes de tomar una decisión." />
              <ReasonItem text="El resultado funciona como orientación, no como una carrera definitiva." />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div id="areas-compatibles" className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_40px_rgba(83,67,160,0.06)]">
            <h3 className="text-lg font-bold">Tus áreas compatibles</h3>
            <div className="mt-5 grid gap-4">
              {compatibleRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[44px_1fr] items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e0f2fe] text-xl">
                    {getAreaIcon(row.id, index)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 text-sm font-bold">
                      <span>{row.name}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eceaf4]">
                      <div
                        className="h-2 rounded-full bg-[#7c3aed]"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_40px_rgba(83,67,160,0.06)]">
            <h3 className="text-lg font-bold">Tus principales fortalezas</h3>
            <div className="mt-5 grid gap-3">
              {profileExtras.strengths.map((strength, index) => (
                <div
                  key={strength}
                  className="flex items-center justify-between rounded-xl border border-[#e7e3f2] bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e0f2fe] text-xl">
                      {getStrengthIcon(index)}
                    </span>
                    <span className="font-bold">{strength}</span>
                  </div>
                  <span className="text-[#7c3aed]">● ● ●</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <details className="mt-5 rounded-2xl border border-[#e7e3f2] bg-white p-5 shadow-[0_14px_40px_rgba(83,67,160,0.05)]">
          <summary className="cursor-pointer text-lg font-bold text-[#7c3aed]">
            Conoce más sobre tu resultado
          </summary>

          <div className="mt-5 grid gap-5">
            <section>
              <h3 className="text-lg font-bold">Qué podrías probar</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {thingsToTry.map((item) => (
                  <StudentInfoCard
                    key={item.text}
                    icon={item.icon}
                    text={item.text}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold">Próximos pasos</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {nextSteps.map((step) => (
                  <StudentInfoCard
                    key={step.text}
                    icon={step.icon}
                    text={step.text}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-[#f7f3ff] p-4">
              <h3 className="text-lg font-bold">Lectura narrativa</h3>
              <p className="mt-2 text-sm leading-7 text-[#394267]">
                {narrativeClose}
              </p>
              {isHybrid && secondProfile && (
                <p className="mt-2 text-sm leading-7 text-[#394267]">
                  También aparece una señal cercana con {secondProfile.name}. Explorar experiencias
                  reales podría ayudarte a descubrir qué actividades disfrutas y cuáles puedes mantener en el tiempo.
                </p>
              )}
            </section>
          </div>
        </details>
      </div>

      <ReportPanel
        answers={answers}
        areas={profileExtras.areas}
        clarity={confidence}
        compatiblePaths={compatiblePaths.map((path) => path.name)}
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

function StudentInfoCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#fbfaff] p-4 text-sm leading-6 text-[#394267]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1ecff] text-base font-bold text-[#7c3aed]">
        {icon}
      </span>
      <p>{text}</p>
    </div>
  );
}

function getThingsToTry(profileId: string) {
  const suggestions: Record<string, Array<{ icon: string; text: string }>> = {
    "ingenieria-tecnologia": [
      { icon: "💻", text: "Participar en proyectos tecnológicos o de programación." },
      { icon: "🛠️", text: "Probar actividades donde construyas, repares o mejores algo." },
      { icon: "👥", text: "Conversar con estudiantes o profesionales de tecnología." },
      { icon: "📚", text: "Tomar un curso corto relacionado con sistemas o ingeniería." },
    ],
    "ciencia-datos-investigacion": [
      { icon: "🔬", text: "Explorar actividades de investigación o análisis de datos." },
      { icon: "📊", text: "Probar retos donde compares información y saques conclusiones." },
      { icon: "👥", text: "Conversar con personas que estudien ciencias o investigación." },
      { icon: "📚", text: "Tomar un curso corto de ciencia, estadística o pensamiento lógico." },
    ],
    "salud-apoyo-humano": [
      { icon: "👥", text: "Conversar con personas de áreas de salud, psicología o bienestar." },
      { icon: "🤝", text: "Participar en actividades de apoyo, voluntariado u orientación." },
      { icon: "📚", text: "Explorar cursos cortos sobre cuidado, escucha o desarrollo humano." },
      { icon: "📝", text: "Observar qué tipo de ayuda a otros te resulta más natural." },
    ],
    "educacion-ciencias-sociales": [
      { icon: "📚", text: "Probar actividades donde expliques o enseñes algo a otras personas." },
      { icon: "👥", text: "Participar en proyectos grupales, sociales o comunitarios." },
      { icon: "🗣️", text: "Conversar con estudiantes o profesionales de educación y ciencias sociales." },
      { icon: "📝", text: "Registrar qué temas sociales o educativos despiertan más curiosidad." },
    ],
    "arte-comunicacion-diseno": [
      { icon: "🎨", text: "Realizar actividades creativas como diseño, video, dibujo o contenido." },
      { icon: "🗣️", text: "Probar formas de comunicar ideas: campañas, historias o piezas visuales." },
      { icon: "📚", text: "Tomar un curso corto de diseño, comunicación o producción digital." },
      { icon: "👥", text: "Conversar con personas de áreas creativas para conocer su día a día." },
    ],
    "negocios-gestion": [
      { icon: "📊", text: "Probar retos de organización, liderazgo o planificación de proyectos." },
      { icon: "🚀", text: "Explorar actividades de emprendimiento, ventas o creación de ideas." },
      { icon: "👥", text: "Conversar con personas que gestionen equipos o negocios." },
      { icon: "📚", text: "Tomar un curso corto de gestión, marketing o finanzas básicas." },
    ],
    "administracion-finanzas": [
      { icon: "📊", text: "Probar actividades de organización, presupuesto o análisis de información." },
      { icon: "🗂️", text: "Explorar tareas donde haya procesos, registros y seguimiento." },
      { icon: "👥", text: "Conversar con personas de administración, finanzas u operaciones." },
      { icon: "📚", text: "Tomar un curso corto de finanzas, Excel, gestión o procesos." },
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

function getNarrativeClose(
  profile: Profile & { score: number },
  ranked: Array<Profile & { score: number }>,
) {
  const mainRoute = getProfileRouteLabel(profile.id, profile.name).toLowerCase();
  const nearbyRoutes = ranked
    .slice(1, 3)
    .map((item) => getProfileRouteLabel(item.id, item.name).toLowerCase());
  const nearbyText = nearbyRoutes.length
    ? `También aparecieron señales cercanas a ${nearbyRoutes.join(" y ")}.`
    : "También pueden existir rutas cercanas que vale la pena comparar.";

  return `Tu resultado muestra una orientación inicial hacia ${mainRoute}. ${nearbyText} Explorar experiencias reales puede ayudarte a descubrir qué actividades disfrutas y cuáles puedes mantener con el tiempo.`;
}

function getAreaIcon(profileId: string, index: number) {
  const icons: Record<string, string> = {
    "ingenieria-tecnologia": "💻",
    "ciencia-datos-investigacion": "🔬",
    "salud-apoyo-humano": "💚",
    "educacion-ciencias-sociales": "📚",
    "arte-comunicacion-diseno": "🎨",
    "negocios-gestion": "🚀",
    "administracion-finanzas": "📊",
  };
  const fallback = ["🧭", "💡", "⭐", "🎯"];

  return icons[profileId] ?? fallback[index] ?? "⭐";
}

function getStrengthIcon(index: number) {
  return ["🧩", "🎯", "🛠️", "🎨"][index] ?? "⭐";
}

function getProfileRouteLabel(profileId: string, fallback: string) {
  const labels: Record<string, string> = {
    "ingenieria-tecnologia": "Ingeniería y tecnología",
    "ciencia-datos-investigacion": "Investigación, ciencia y datos",
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
      strengths: ["Iniciativa", "Liderazgo", "Toma de decisiones"],
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
