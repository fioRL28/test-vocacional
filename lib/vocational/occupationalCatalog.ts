import { bigFiveDimensions, dimensionLabels, riasecDimensions } from "./data";
import { questions, vocationalFamilies, vocationalSubroutes } from "./data";
import {
  calcularPuntajeDiferenciacion,
  obtenerDiagnosticosAdaptativos,
  obtenerPatronesVocacionalesOrdenados,
  obtenerPromedios,
  obtenerRespuestasAbiertas,
} from "./engine";
import {
  analizarRespuestaLibreVocacional,
  analizarTextoFocoSemantico,
} from "./responsePatterns";
import type {
  Answer,
  BigFiveDimension,
  Dimension,
  OccupationalRoute,
  OccupationalRouteCompatibility,
  Profile,
  RouteCompatibilityTrace,
  RiasecDimension,
  VocationalSubrouteMetadata,
  VocationalCombinedPattern,
} from "./types";

type CompatibilityWeights = {
  primaryRiasec: number;
  secondaryRiasec: number;
  bigFiveSupport: number;
};

const DEFAULT_COMPATIBILITY_WEIGHTS: CompatibilityWeights = {
  primaryRiasec: 0.5,
  secondaryRiasec: 0.3,
  bigFiveSupport: 0.2,
};

export const occupationalRoutes: OccupationalRoute[] = [
  {
    id: "arquitectura",
    name: "Arquitectura",
    riasecPrimary: "realista",
    riasecSecondary: ["artistico", "investigativo"],
    bigFiveSupport: ["apertura", "responsabilidad"],
    trainingTypes: ["universitaria"],
    description:
      "Ruta orientada al diseno espacial, la funcionalidad, la estetica y la solucion aplicada de problemas en entornos construidos.",
    activities: [
      "disenar espacios",
      "elaborar planos",
      "analizar estructuras",
      "resolver necesidades funcionales",
      "integrar estetica y uso",
    ],
    recommendedWorkConditions: [
      "trabajo por proyectos",
      "revision visual y tecnica",
      "iteracion con restricciones reales",
      "colaboracion con usuarios y equipos tecnicos",
    ],
    relatedProfileIds: ["ingenieria-tecnologia", "arte-comunicacion-diseno"],
  },
  {
    id: "carpinteria-diseno",
    name: "Carpinteria de diseno",
    riasecPrimary: "realista",
    riasecSecondary: ["artistico"],
    bigFiveSupport: ["apertura", "responsabilidad"],
    trainingTypes: ["tecnica", "oficio"],
    description:
      "Ruta practica y creativa enfocada en crear muebles, objetos y soluciones funcionales mediante herramientas, materiales y diseno aplicado.",
    activities: [
      "trabajar madera y materiales",
      "usar herramientas",
      "crear muebles",
      "mejorar objetos",
      "resolver problemas de forma y uso",
    ],
    recommendedWorkConditions: [
      "taller practico",
      "produccion por encargo",
      "trabajo manual detallado",
      "aprendizaje por demostracion y practica",
    ],
    relatedProfileIds: ["ingenieria-tecnologia", "arte-comunicacion-diseno"],
  },
  {
    id: "ciencia-datos",
    name: "Ciencia de Datos",
    riasecPrimary: "investigativo",
    riasecSecondary: ["convencional"],
    bigFiveSupport: ["apertura", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta centrada en analizar datos, encontrar patrones, construir modelos e interpretar evidencia para responder preguntas.",
    activities: [
      "analizar datos",
      "buscar patrones",
      "aplicar estadistica",
      "construir modelos",
      "interpretar resultados",
    ],
    recommendedWorkConditions: [
      "trabajo con informacion estructurada",
      "problemas analiticos",
      "herramientas digitales",
      "validacion con evidencia",
    ],
    relatedProfileIds: ["ciencia-datos-investigacion"],
  },
  {
    id: "ingenieria-sistemas",
    name: "Ingenieria de Sistemas y Software",
    riasecPrimary: "investigativo",
    riasecSecondary: ["realista", "convencional"],
    bigFiveSupport: ["apertura", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta orientada a comprender, construir y mantener soluciones digitales, sistemas, aplicaciones y procesos automatizados.",
    activities: [
      "programar soluciones",
      "analizar sistemas",
      "automatizar procesos",
      "probar software",
      "resolver fallas logicas",
    ],
    recommendedWorkConditions: [
      "trabajo con tecnologia",
      "resolucion de problemas abstractos",
      "iteracion y pruebas",
      "aprendizaje continuo",
    ],
    relatedProfileIds: ["ingenieria-tecnologia", "ciencia-datos-investigacion"],
  },
  {
    id: "ingenieria-industrial",
    name: "Ingenieria Industrial y Procesos",
    riasecPrimary: "convencional",
    riasecSecondary: ["realista", "emprendedor"],
    bigFiveSupport: ["responsabilidad", "extraversion"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta enfocada en mejorar procesos, operaciones, logistica, eficiencia y control de sistemas productivos o administrativos.",
    activities: [
      "optimizar procesos",
      "medir eficiencia",
      "coordinar operaciones",
      "analizar flujos de trabajo",
      "implementar mejoras",
    ],
    recommendedWorkConditions: [
      "ambientes organizados",
      "metas medibles",
      "coordinacion con equipos",
      "seguimiento de indicadores",
    ],
    relatedProfileIds: ["ingenieria-tecnologia", "administracion-finanzas"],
  },
  {
    id: "diseno-grafico",
    name: "Diseno Grafico y Visual",
    riasecPrimary: "artistico",
    riasecSecondary: ["convencional", "emprendedor"],
    bigFiveSupport: ["apertura", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta enfocada en crear piezas visuales, identidad grafica, composicion, comunicacion y soluciones visuales aplicadas.",
    activities: [
      "crear piezas visuales",
      "disenar marcas",
      "organizar informacion visual",
      "proponer composiciones",
      "adaptar mensajes a formatos",
    ],
    recommendedWorkConditions: [
      "trabajo creativo con entregables",
      "retroalimentacion frecuente",
      "atencion a detalle visual",
      "uso de herramientas digitales",
    ],
    relatedProfileIds: ["arte-comunicacion-diseno"],
  },
  {
    id: "comunicacion-audiovisual",
    name: "Comunicacion Audiovisual",
    riasecPrimary: "artistico",
    riasecSecondary: ["social", "emprendedor"],
    bigFiveSupport: ["apertura", "extraversion"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta relacionada con crear mensajes, historias, videos, campanas, contenidos y experiencias de comunicacion.",
    activities: [
      "crear contenidos",
      "producir videos",
      "contar historias",
      "comunicar ideas",
      "trabajar con audiencias",
    ],
    recommendedWorkConditions: [
      "proyectos creativos",
      "colaboracion con equipos",
      "ritmo variable",
      "exposicion a audiencias",
    ],
    relatedProfileIds: ["arte-comunicacion-diseno"],
  },
  {
    id: "psicologia",
    name: "Psicologia",
    riasecPrimary: "social",
    riasecSecondary: ["investigativo"],
    bigFiveSupport: ["amabilidad", "responsabilidad", "apertura"],
    trainingTypes: ["universitaria"],
    description:
      "Ruta orientada a comprender personas, acompanar procesos, evaluar necesidades y promover bienestar emocional o conductual.",
    activities: [
      "escuchar activamente",
      "analizar casos",
      "acompanar personas",
      "evaluar necesidades",
      "disenar intervenciones",
    ],
    recommendedWorkConditions: [
      "trato humano constante",
      "confidencialidad",
      "analisis cuidadoso",
      "formacion continua",
    ],
    relatedProfileIds: ["salud-apoyo-humano"],
  },
  {
    id: "educacion",
    name: "Educacion y Ensenanza",
    riasecPrimary: "social",
    riasecSecondary: ["artistico", "convencional"],
    bigFiveSupport: ["amabilidad", "extraversion", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta centrada en explicar, guiar aprendizajes, adaptar estrategias y acompanar el desarrollo de personas o grupos.",
    activities: [
      "ensenar temas",
      "preparar materiales",
      "acompanar aprendizajes",
      "evaluar avances",
      "adaptar explicaciones",
    ],
    recommendedWorkConditions: [
      "interaccion frecuente",
      "planificacion",
      "paciencia con procesos",
      "comunicacion clara",
    ],
    relatedProfileIds: ["educacion-ciencias-sociales"],
  },
  {
    id: "derecho",
    name: "Derecho",
    riasecPrimary: "emprendedor",
    riasecSecondary: ["convencional", "social", "investigativo"],
    bigFiveSupport: ["responsabilidad", "extraversion", "amabilidad"],
    trainingTypes: ["universitaria"],
    description:
      "Ruta enfocada en normas, argumentacion, analisis de casos, negociacion, defensa, mediacion e instituciones.",
    activities: [
      "analizar casos",
      "interpretar normas",
      "argumentar posiciones",
      "negociar acuerdos",
      "defender intereses",
    ],
    recommendedWorkConditions: [
      "trabajo con reglas",
      "interaccion con personas",
      "precision documental",
      "escenarios de decision",
    ],
    relatedProfileIds: ["negocios-gestion", "administracion-finanzas", "educacion-ciencias-sociales"],
  },
  {
    id: "administracion",
    name: "Administracion",
    riasecPrimary: "convencional",
    riasecSecondary: ["emprendedor", "social"],
    bigFiveSupport: ["responsabilidad", "extraversion"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta orientada a organizar recursos, procesos, equipos, informacion y decisiones operativas dentro de una organizacion.",
    activities: [
      "coordinar recursos",
      "ordenar informacion",
      "gestionar procesos",
      "hacer seguimiento",
      "apoyar decisiones",
    ],
    recommendedWorkConditions: [
      "estructura clara",
      "responsabilidades definidas",
      "trabajo con indicadores",
      "coordinacion con areas",
    ],
    relatedProfileIds: ["administracion-finanzas", "negocios-gestion"],
  },
  {
    id: "contabilidad-finanzas",
    name: "Contabilidad y Finanzas",
    riasecPrimary: "convencional",
    riasecSecondary: ["investigativo"],
    bigFiveSupport: ["responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta enfocada en registros, presupuestos, control financiero, analisis numerico, exactitud y cumplimiento de criterios.",
    activities: [
      "registrar informacion financiera",
      "analizar presupuestos",
      "controlar gastos",
      "verificar datos",
      "preparar reportes",
    ],
    recommendedWorkConditions: [
      "orden documental",
      "precision numerica",
      "procesos estables",
      "responsabilidad con plazos",
    ],
    relatedProfileIds: ["administracion-finanzas"],
  },
  {
    id: "enfermeria",
    name: "Enfermeria",
    riasecPrimary: "social",
    riasecSecondary: ["realista", "convencional"],
    bigFiveSupport: ["amabilidad", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta de cuidado directo, seguimiento de procedimientos, apoyo a pacientes y coordinacion con equipos de salud.",
    activities: [
      "cuidar pacientes",
      "seguir protocolos",
      "observar signos",
      "apoyar tratamientos",
      "comunicar necesidades",
    ],
    recommendedWorkConditions: [
      "contacto humano constante",
      "procedimientos claros",
      "turnos estructurados",
      "trabajo bajo responsabilidad",
    ],
    relatedProfileIds: ["salud-apoyo-humano"],
  },
  {
    id: "laboratorio-clinico",
    name: "Laboratorio Clinico",
    riasecPrimary: "investigativo",
    riasecSecondary: ["convencional", "realista"],
    bigFiveSupport: ["responsabilidad", "apertura"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta orientada a pruebas, muestras, evidencia, precision tecnica y analisis aplicado a salud.",
    activities: [
      "procesar muestras",
      "seguir protocolos",
      "analizar resultados",
      "verificar calidad",
      "trabajar con instrumentos",
    ],
    recommendedWorkConditions: [
      "ambiente controlado",
      "precision procedimental",
      "bajo margen de error",
      "trabajo con evidencia",
    ],
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
  },
  {
    id: "marketing-ventas",
    name: "Marketing y Ventas",
    riasecPrimary: "emprendedor",
    riasecSecondary: ["artistico", "social"],
    bigFiveSupport: ["extraversion", "apertura", "responsabilidad"],
    trainingTypes: ["universitaria", "tecnica"],
    description:
      "Ruta enfocada en comprender audiencias, comunicar valor, persuadir, crear estrategias y hacer viable una propuesta.",
    activities: [
      "analizar clientes",
      "crear campanas",
      "presentar propuestas",
      "negociar",
      "medir resultados comerciales",
    ],
    recommendedWorkConditions: [
      "metas claras",
      "interaccion con personas",
      "creatividad aplicada",
      "ritmo dinamico",
    ],
    relatedProfileIds: ["negocios-gestion", "arte-comunicacion-diseno"],
  },
  {
    id: "electricidad-mantenimiento",
    name: "Electricidad y Mantenimiento",
    riasecPrimary: "realista",
    riasecSecondary: ["convencional", "investigativo"],
    bigFiveSupport: ["responsabilidad"],
    trainingTypes: ["tecnica", "oficio"],
    description:
      "Ruta practica enfocada en diagnosticar, reparar, instalar y mantener sistemas electricos o tecnicos.",
    activities: [
      "diagnosticar fallas",
      "usar herramientas",
      "instalar sistemas",
      "seguir normas de seguridad",
      "mantener equipos",
    ],
    recommendedWorkConditions: [
      "trabajo practico",
      "protocolos de seguridad",
      "resolucion en campo",
      "aprendizaje tecnico continuo",
    ],
    relatedProfileIds: ["ingenieria-tecnologia", "administracion-finanzas"],
  },
];

export function calcularCompatibilidadRutaOcupacional(
  averages: Record<Dimension, number>,
  route: OccupationalRoute,
  weights: CompatibilityWeights = DEFAULT_COMPATIBILITY_WEIGHTS,
): OccupationalRouteCompatibility {
  const primaryValue = averages[route.riasecPrimary] ?? 0;
  const secondaryValue = promediarDimensionesOcupacionales(averages, route.riasecSecondary);
  const supportValue = promediarDimensionesOcupacionales(averages, route.bigFiveSupport);
  const activeWeights = normalizarPesos({
    primaryRiasec: weights.primaryRiasec,
    secondaryRiasec: route.riasecSecondary.length ? weights.secondaryRiasec : 0,
    bigFiveSupport: route.bigFiveSupport.length ? weights.bigFiveSupport : 0,
  });
  const weightedValue =
    primaryValue * activeWeights.primaryRiasec +
    secondaryValue * activeWeights.secondaryRiasec +
    supportValue * activeWeights.bigFiveSupport;
  const score = Math.round((weightedValue / 5) * 100);

  return {
    route,
    score: limitarPuntaje(score),
    riasecPrimaryScore: Math.round((primaryValue / 5) * 100),
    riasecSecondaryScore: Math.round((secondaryValue / 5) * 100),
    bigFiveSupportScore: Math.round((supportValue / 5) * 100),
    matchedRiasec: [
      { dimension: route.riasecPrimary, value: primaryValue, role: "primary" },
      ...route.riasecSecondary.map((dimension) => ({
        dimension,
        value: averages[dimension] ?? 0,
        role: "secondary" as const,
      })),
    ],
    matchedBigFive: route.bigFiveSupport.map((dimension) => ({
      dimension,
      value: averages[dimension] ?? 0,
    })),
    explanation: construirExplicacionCompatibilidad(route, primaryValue, secondaryValue, supportValue),
  };
}

export function ordenarRutasOcupacionales(
  averages: Record<Dimension, number>,
  routes: OccupationalRoute[] = occupationalRoutes,
  weights: CompatibilityWeights = DEFAULT_COMPATIBILITY_WEIGHTS,
) {
  return routes
    .map((route) => calcularCompatibilidadRutaOcupacional(averages, route, weights))
    .sort((a, b) => b.score - a.score);
}

function promediarDimensionesOcupacionales(
  averages: Record<Dimension, number>,
  dimensions: Array<RiasecDimension | BigFiveDimension>,
) {
  if (dimensions.length === 0) return 0;

  return dimensions.reduce((total, dimension) => total + (averages[dimension] ?? 0), 0) / dimensions.length;
}

function normalizarPesos(weights: CompatibilityWeights): CompatibilityWeights {
  const total = weights.primaryRiasec + weights.secondaryRiasec + weights.bigFiveSupport;

  if (total <= 0) return DEFAULT_COMPATIBILITY_WEIGHTS;

  return {
    primaryRiasec: weights.primaryRiasec / total,
    secondaryRiasec: weights.secondaryRiasec / total,
    bigFiveSupport: weights.bigFiveSupport / total,
  };
}

function limitarPuntaje(score: number) {
  return Math.max(0, Math.min(100, score));
}

function construirExplicacionCompatibilidad(
  route: OccupationalRoute,
  primaryValue: number,
  secondaryValue: number,
  supportValue: number,
) {
  return [
    `RIASEC principal ${dimensionLabels[route.riasecPrimary]}: ${primaryValue.toFixed(1)}/5.`,
    route.riasecSecondary.length
      ? `RIASEC secundario ${route.riasecSecondary.map((dimension) => dimensionLabels[dimension]).join(", ")}: ${secondaryValue.toFixed(1)}/5.`
      : "No requiere RIASEC secundario especifico.",
    route.bigFiveSupport.length
      ? `Big Five de apoyo ${route.bigFiveSupport.map((dimension) => dimensionLabels[dimension]).join(", ")}: ${supportValue.toFixed(1)}/5.`
      : "No requiere rasgos Big Five de apoyo especificos.",
  ];
}

export function esDimensionRiasec(dimension: Dimension): dimension is RiasecDimension {
  return riasecDimensions.includes(dimension);
}

export function esDimensionBigFive(dimension: Dimension): dimension is BigFiveDimension {
  return bigFiveDimensions.includes(dimension);
}

export type LayeredResultSubroute = {
  id: string;
  name: string;
  familyName: string;
  rawAffinity?: number;
  relevance: number;
  compatibilityTrace?: RouteCompatibilityTrace;
  reasons: string[];
  activitiesToExplore: string[];
};

export type LayeredResultArchitecture = {
  riasecEnvironment: {
    title: string;
    dominantCombination: Array<{ dimension: Dimension; label: string; value: number }>;
    explanation: string;
    broadInterestPattern: boolean;
  };
  bigFiveStyle: {
    traits: Array<{ dimension: Dimension; label: string; value: number; explanation: string }>;
    explanation: string;
  };
  concreteSubroutes: LayeredResultSubroute[];
  interpretationNotes: string[];
};

const bigFiveInterpretations: Partial<Record<Dimension, string>> = {
  apertura: "aprende mejor explorando ideas, posibilidades y formas nuevas de entender un tema",
  responsabilidad: "tiende a sostener tareas, ordenar pasos y avanzar con constancia",
  extraversion: "puede apoyarse en comunicacion, participacion visible e intercambio con otras personas",
  amabilidad: "suele considerar necesidades de otros y trabajar desde cooperacion o cuidado interpersonal",
  neuroticismo: "puede requerir mas contencion cuando hay decisiones inciertas o miedo a equivocarse",
};

const semanticFocusLabels: Record<string, string> = {
  "hands-on-building": "construccion practica",
  "technical-manipulation": "funcionamiento tecnico",
  "practical-testing": "pruebas concretas",
  "operational-execution": "ejecucion operativa",
  "scientific-analysis": "analisis cientifico",
  "pattern-analysis": "busqueda de patrones",
  "abstract-reasoning": "razonamiento abstracto",
  "evidence-based-reasoning": "evidencia y casos",
  "graphic-visual-communication": "comunicacion visual y grafica",
  "visual-spatial-creativity": "creatividad visual-espacial",
  "applied-design": "diseno aplicado",
  "spatial-organization": "organizacion espacial",
  "expressive-creativity": "expresion creativa",
  "conceptual-creation": "creacion conceptual",
  "emotional-support": "apoyo emocional",
  "teaching-guidance": "ensenanza y orientacion",
  "collaborative-help": "ayuda colaborativa",
  "interpersonal-care": "cuidado interpersonal",
  "initiative-taking": "iniciativa",
  "persuasion-influence": "argumentacion e influencia",
  "coordination-leadership": "coordinacion",
  "decision-making": "toma de decisiones",
  "organization-structure": "estructura y organizacion",
  "precision-following": "precision y normas",
  "process-consistency": "seguimiento de procesos",
  "information-management": "gestion de informacion",
};

export function construirArquitecturaResultadoPorCapas(
  answers: Answer[],
  ranked: Array<Profile & { score: number }>,
) {
  const averages = obtenerPromedios(answers);
  const diagnostics = obtenerDiagnosticosAdaptativos(answers, averages, ranked);
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const dominantRiasec = obtenerCombinacionRiasecDominante(averages);
  const bigFiveStyle = obtenerEstiloBigFive(averages);
  const semanticFocus = obtenerFocosSemanticosDetectados(answers);
  const concreteSubroutes = obtenerSubrutasConcretas({
    answers,
    averages,
    ranked,
    semanticFocus,
    broadInterestPattern: differentiation.broadInterestPattern,
    diagnostics,
  });

  return {
    riasecEnvironment: {
      title: differentiation.broadInterestPattern
        ? "Entorno vocacional amplio"
        : "Entorno vocacional dominante",
      dominantCombination: dominantRiasec,
      explanation: obtenerExplicacionRiasec(dominantRiasec, differentiation.broadInterestPattern),
      broadInterestPattern: differentiation.broadInterestPattern,
    },
    bigFiveStyle: {
      traits: bigFiveStyle,
      explanation:
        bigFiveStyle.length > 0
          ? "Estos rasgos no definen una carrera por si solos; ayudan a interpretar como podrias aprender, trabajar y sostener una ruta."
          : "No aparece un estilo personal claramente dominante con la evidencia actual.",
    },
    concreteSubroutes,
    interpretationNotes: [
      diagnostics.broadInterestPattern
        ? "Como hay intereses amplios, conviene leer las subrutas como hipotesis de exploracion y no como una unica carrera cerrada."
        : "Las subrutas ayudan a traducir intereses generales en actividades mas concretas para probar.",
      "RIASEC se interpreta como entorno de interes; Big Five como estilo personal; semanticFocus y respuestas abiertas orientan subrutas concretas.",
    ],
  } satisfies LayeredResultArchitecture;
}

function obtenerCombinacionRiasecDominante(averages: Record<Dimension, number>) {
  const sorted = riasecDimensions
    .map((dimension) => ({
      dimension,
      label: dimensionLabels[dimension],
      value: averages[dimension],
    }))
    .sort((a, b) => b.value - a.value);
  const topValue = sorted[0]?.value ?? 0;

  return sorted
    .filter((item) => item.value >= 3.5 && topValue - item.value <= 1)
    .slice(0, 4);
}

function obtenerExplicacionRiasec(
  dominantRiasec: Array<{ dimension: Dimension; label: string; value: number }>,
  broadInterestPattern: boolean,
) {
  if (dominantRiasec.length === 0) {
    return "Todavia no hay suficiente fuerza en intereses RIASEC para describir un entorno dominante.";
  }

  const labels = dominantRiasec.map((item) => item.label).join(", ");

  if (broadInterestPattern) {
    return `Aparecen varios entornos altos al mismo tiempo (${labels}). Esto sugiere amplitud de intereses y baja diferenciacion, por lo que no conviene interpretar un perfil principal como carrera definitiva.`;
  }

  return `La combinacion dominante se concentra en ${labels}. Esto describe el tipo de entorno que parece atraer mas, no una carrera cerrada.`;
}

function obtenerEstiloBigFive(averages: Record<Dimension, number>) {
  return bigFiveDimensions
    .map((dimension) => ({
      dimension,
      label: dimensionLabels[dimension],
      value: averages[dimension],
      explanation: bigFiveInterpretations[dimension] ?? "aporta matices sobre estilo personal",
    }))
    .filter((trait) => trait.value >= 3.5)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

function obtenerFocosSemanticosDetectados(answers: Answer[]) {
  const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));
  const questionFocus = questions
    .filter((question) => answeredQuestionIds.has(question.id))
    .flatMap((question) => question.semanticFocus ?? []);
  const narrativeFocus = answers.flatMap((answer) => {
    if (answer.kind === "open") {
      if (answer.answerMode === "typed-text") {
        const analysis = analizarRespuestaLibreVocacional(answer.text);
        return analysis.usarParaRanking ? analysis.semanticFocus : [];
      }

      return analizarTextoFocoSemantico(answer.text).semanticFocus;
    }

    return answer.comment ? analizarTextoFocoSemantico(answer.comment).semanticFocus : [];
  });

  return Array.from(new Set([...questionFocus, ...narrativeFocus]));
}

function normalizarTextoDecision(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function obtenerTextoDecisionSubrutas(answers: Answer[]) {
  return obtenerRespuestasAbiertas(answers)
    .map((answer) => normalizarTextoDecision(answer.text))
    .join(" | ");
}

type EvidenceCategory =
  | "software"
  | "data"
  | "spatial"
  | "humanSupport"
  | "finance"
  | "industrial"
  | "environment"
  | "labLife";

type RouteEvidenceProfile = {
  required?: EvidenceCategory;
  supportive: EvidenceCategory[];
};

type RouteEvidenceSignals = Record<EvidenceCategory, number> & {
  noneByCategory: Record<EvidenceCategory, number>;
};

const evidenceCategories: EvidenceCategory[] = [
  "software",
  "data",
  "spatial",
  "humanSupport",
  "finance",
  "industrial",
  "environment",
  "labLife",
];

const routeEvidenceProfiles: Record<string, RouteEvidenceProfile> = {
  "systems-software": { required: "software", supportive: ["software", "data", "industrial"] },
  "ingenieria-sistemas": { required: "software", supportive: ["software", "data"] },
  "science-data-analysis": { required: "data", supportive: ["data", "software", "industrial"] },
  "data-science": { required: "data", supportive: ["data", "software"] },
  "ciencia-datos": { required: "data", supportive: ["data"] },
  "architecture-spatial-design": { required: "spatial", supportive: ["spatial"] },
  "arquitectura-diseno-espacios": { required: "spatial", supportive: ["spatial"] },
  "interior-design-environments": { required: "spatial", supportive: ["spatial"] },
  "industrial-design": { required: "spatial", supportive: ["spatial", "industrial"] },
  "psychology-human-support": { supportive: ["humanSupport"] },
  "psicologia-apoyo-humano": { supportive: ["humanSupport"] },
  "administrative-finance": { required: "finance", supportive: ["finance", "industrial"] },
  "contabilidad-finanzas": { required: "finance", supportive: ["finance", "data"] },
  "industrial-processes": { required: "industrial", supportive: ["industrial", "finance", "software"] },
  "ingenieria-industrial": { required: "industrial", supportive: ["industrial", "finance"] },
  "environmental-engineering": { required: "environment", supportive: ["environment", "industrial"] },
  "environmental-management": { required: "environment", supportive: ["environment", "industrial"] },
  "natural-resources-territory": { required: "environment", supportive: ["environment"] },
  "laboratory-science": { required: "labLife", supportive: ["labLife", "data"] },
  "biotechnology-health-sciences": { required: "labLife", supportive: ["labLife", "data"] },
  "veterinary-animal-health": { required: "labLife", supportive: ["labLife", "environment"] },
};

const noneQuestionCategories: Record<number, EvidenceCategory[]> = {
  201: ["spatial", "industrial"],
  202: ["data"],
  203: ["spatial"],
  204: ["humanSupport"],
  206: ["finance", "industrial"],
};

const guidedOptionEvidence: Record<string, EvidenceCategory> = {
  "design-products-spaces": "spatial",
  "functional-spaces-objects": "spatial",
  "architecture-space": "spatial",
  "interior-industrial-design": "spatial",
  "architecture-spatial-design": "spatial",
  "numeric-patterns": "data",
  "data-science": "data",
  "science-data-analysis": "data",
  "software-automation": "software",
  "systems-software": "software",
  "review-accounts": "finance",
  "administration-finance": "finance",
  "administrative-finance": "finance",
  "quality-control": "industrial",
  "industrial-processes": "industrial",
  "personal-support": "humanSupport",
  "psychology-support": "humanSupport",
  "psychology-human-support": "humanSupport",
};

const evidenceKeywords: Record<EvidenceCategory, string[]> = {
  software: [
    "programar",
    "programacion",
    "software",
    "sistemas",
    "codigo",
    "codificar",
    "apps",
    "aplicaciones",
    "tecnologia digital",
    "automatizaciones",
    "logica computacional",
  ],
  data: [
    "datos",
    "patrones",
    "tendencias",
    "analisis numerico",
    "analizar informacion",
    "bases de datos",
    "conclusiones",
    "estadistica",
  ],
  spatial: [
    "espacios",
    "ambientes",
    "interiores",
    "planos",
    "estructuras",
    "maquetas",
    "arquitectura",
    "diseno espacial",
    "distribuciones",
    "espacios fisicos",
  ],
  humanSupport: [
    "emociones",
    "escuchar",
    "acompanar",
    "orientar",
    "apoyo",
    "bienestar emocional",
    "conductas",
    "conflictos personales",
  ],
  finance: [
    "presupuesto",
    "presupuestos",
    "cuentas",
    "pagos",
    "costos",
    "registros",
    "finanzas",
    "contabilidad",
    "gastos",
    "documentos",
    "registros financieros",
  ],
  industrial: [
    "procesos",
    "calidad",
    "tiempos",
    "produccion",
    "operaciones",
    "logistica",
    "eficiencia",
    "recursos",
    "mejorar procesos",
    "controlar calidad",
  ],
  environment: [
    "ambiente",
    "ambiental",
    "sostenibilidad",
    "recursos naturales",
    "naturaleza",
    "ecosistema",
    "territorio",
    "plantas",
    "animales",
    "impacto ambiental",
  ],
  labLife: [
    "laboratorio",
    "muestras",
    "farmacia",
    "farmaco",
    "biotecnologia",
    "diagnostico",
    "clinica",
    "salud",
    "animales",
    "biologia",
    "seres vivos",
  ],
};

function obtenerPerfilEvidenciaRuta(subrouteId: string): RouteEvidenceProfile {
  return routeEvidenceProfiles[subrouteId] ?? { supportive: [] };
}

function textoTieneEvidencia(text: string, category: EvidenceCategory) {
  return evidenceKeywords[category].some((keyword) =>
    text.includes(normalizarTextoDecision(keyword)),
  );
}

function esRespuestaNinguna(answer: Answer) {
  if (answer.kind !== "open") return false;

  const selectedText = normalizarTextoDecision(answer.selectedOptionText ?? "");
  const text = normalizarTextoDecision(answer.text);

  return (
    answer.selectedOptionId?.startsWith("none-") ||
    selectedText.includes("ninguna de estas opciones me atrae especialmente") ||
    text.includes("ninguna de estas opciones me atrae especialmente")
  );
}

function obtenerSenalesEvidenciaRutas(answers: Answer[]): RouteEvidenceSignals {
  const signals = evidenceCategories.reduce(
    (acc, category) => ({ ...acc, [category]: 0 }),
    {} as Record<EvidenceCategory, number>,
  );
  const noneByCategory = evidenceCategories.reduce(
    (acc, category) => ({ ...acc, [category]: 0 }),
    {} as Record<EvidenceCategory, number>,
  );

  obtenerRespuestasAbiertas(answers).forEach((answer) => {
    if (esRespuestaNinguna(answer)) {
      (noneQuestionCategories[answer.questionId] ?? []).forEach((category) => {
        noneByCategory[category] += 1;
      });
      return;
    }

    const text = normalizarTextoDecision(
      [
        answer.text,
        answer.selectedOptionText ?? "",
        answer.selectedOptionId ?? "",
      ].join(" "),
    );

    const guidedCategory = answer.selectedOptionId
      ? guidedOptionEvidence[answer.selectedOptionId]
      : undefined;

    if (guidedCategory) {
      signals[guidedCategory] += 1.2;
    }

    evidenceCategories.forEach((category) => {
      if (textoTieneEvidencia(text, category)) {
        signals[category] += answer.answerMode === "guided-option" ? 1 : 1.4;
      }
    });
  });

  return { ...signals, noneByCategory };
}

function calcularDimensionScoreSubruta(
  subroute: VocationalSubrouteMetadata,
  averages: Record<Dimension, number>,
) {
  const coreAverage = promediarDimensiones(averages, subroute.coreRiasec);
  const supportAverage = promediarDimensiones(averages, subroute.supportBigFive);
  const activeCoreWeight = subroute.coreRiasec.length ? 0.75 : 0;
  const activeSupportWeight = subroute.supportBigFive.length ? 0.25 : 0;
  const totalWeight = activeCoreWeight + activeSupportWeight || 1;
  const weighted =
    (coreAverage * activeCoreWeight + supportAverage * activeSupportWeight) / totalWeight;

  return limitarPuntaje(Math.round((weighted / 5) * 100));
}

function calcularCombinedPatternScoreSubruta(
  subroute: VocationalSubrouteMetadata,
  patterns: VocationalCombinedPattern[],
) {
  const relatedPatterns = patterns.filter((pattern) =>
    subroute.relatedProfileIds.includes(pattern.profileId),
  );
  const bestPattern = relatedPatterns[0];

  if (!bestPattern) return 0;

  return limitarPuntaje(Math.round((bestPattern.score / 5) * 100));
}

function calcularExplicitEvidenceScoreSubruta(
  subroute: VocationalSubrouteMetadata,
  evidence: RouteEvidenceSignals,
) {
  const profile = obtenerPerfilEvidenciaRuta(subroute.id);
  if (profile.supportive.length === 0) return 45;

  const strongestSignal = Math.max(
    ...profile.supportive.map((category) => evidence[category] ?? 0),
  );

  return limitarPuntaje(Math.round(Math.min(100, strongestSignal * 34)));
}

function calcularAdaptiveConfirmationScoreSubruta(
  subroute: VocationalSubrouteMetadata,
  evidence: RouteEvidenceSignals,
) {
  const profile = obtenerPerfilEvidenciaRuta(subroute.id);
  if (profile.supportive.length === 0) return 35;

  const guidedStrength = profile.supportive.reduce((total, category) => {
    const nonePenalty = evidence.noneByCategory[category] > 0 ? -1.5 : 0;
    return total + Math.min(2, evidence[category]) + nonePenalty;
  }, 0);

  return limitarPuntaje(Math.round(Math.max(0, guidedStrength) * 25));
}

function calcularPenaltyScoreSubruta({
  subroute,
  averages,
  evidence,
  explicitEvidenceScore,
  semanticMatches,
  broadInterestPattern,
}: {
  subroute: VocationalSubrouteMetadata;
  averages: Record<Dimension, number>;
  evidence: RouteEvidenceSignals;
  explicitEvidenceScore: number;
  semanticMatches: string[];
  broadInterestPattern: boolean;
}) {
  const profile = obtenerPerfilEvidenciaRuta(subroute.id);
  const requiredEvidenceMet = profile.required
    ? (evidence[profile.required] ?? 0) > 0
    : true;
  let penalty = 0;

  if (profile.required && !requiredEvidenceMet) penalty += 26;
  if (broadInterestPattern && explicitEvidenceScore < 35) penalty += 12;
  if (
    riasecDimensions.filter((dimension) => averages[dimension] >= 4).length >= 4 &&
    explicitEvidenceScore < 35
  ) {
    penalty += 10;
  }

  profile.supportive.forEach((category) => {
    if (evidence.noneByCategory[category] > 0) {
      penalty += 12 * evidence.noneByCategory[category];
    }
  });

  if (
    subroute.id === "architecture-spatial-design" &&
    ((evidence.software > 0 || evidence.data > 0) && !requiredEvidenceMet)
  ) {
    penalty += 18;
  }

  if (
    subroute.id === "administrative-finance" &&
    evidence.industrial > 0 &&
    evidence.finance <= 0
  ) {
    penalty += 12;
  }

  if (
    subroute.id === "industrial-processes" &&
    evidence.finance > 0 &&
    evidence.industrial <= 0
  ) {
    penalty += 12;
  }

  if (semanticMatches.length === 0 && explicitEvidenceScore < 20) penalty += 6;

  return {
    penaltyScore: limitarPuntaje(Math.round(penalty)),
    requiredEvidenceMet,
  };
}

function calcularCompatibilidadCorregidaSubruta({
  subroute,
  answers,
  averages,
  semanticMatches,
  patterns,
  broadInterestPattern,
}: {
  subroute: VocationalSubrouteMetadata;
  answers: Answer[];
  averages: Record<Dimension, number>;
  semanticMatches: string[];
  patterns: VocationalCombinedPattern[];
  broadInterestPattern: boolean;
}): RouteCompatibilityTrace {
  const evidence = obtenerSenalesEvidenciaRutas(answers);
  const dimensionScore = calcularDimensionScoreSubruta(subroute, averages);
  const combinedPatternScore = calcularCombinedPatternScoreSubruta(subroute, patterns);
  const explicitEvidenceScore = calcularExplicitEvidenceScoreSubruta(subroute, evidence);
  const adaptiveConfirmationScore = calcularAdaptiveConfirmationScoreSubruta(subroute, evidence);
  const { penaltyScore, requiredEvidenceMet } = calcularPenaltyScoreSubruta({
    subroute,
    averages,
    evidence,
    explicitEvidenceScore,
    semanticMatches,
    broadInterestPattern,
  });
  const finalScore = limitarPuntaje(
    Math.round(
      0.4 * dimensionScore +
        0.2 * combinedPatternScore +
        0.3 * explicitEvidenceScore +
        0.1 * adaptiveConfirmationScore -
        penaltyScore,
    ),
  );

  return {
    routeName: subroute.name,
    dimensionScore,
    combinedPatternScore,
    explicitEvidenceScore,
    adaptiveConfirmationScore,
    penaltyScore,
    finalScore,
    requiredEvidenceMet,
  };
}

function limitarCompatibilidadAltaSinEvidencia(
  trace: RouteCompatibilityTrace,
  diagnostics: ReturnType<typeof obtenerDiagnosticosAdaptativos>,
) {
  if (
    diagnostics.highUncertainty ||
    diagnostics.lowDifferentiation ||
    diagnostics.broadInterestPattern ||
    diagnostics.missingSemanticFocus.length > 0 ||
    !trace.requiredEvidenceMet
  ) {
    return Math.min(trace.finalScore, 69);
  }

  return trace.finalScore;
}

type BroadTieBreakerChoice =
  | "education"
  | "health"
  | "environment"
  | "graphic"
  | "projects"
  | null;

function obtenerRespuestaDesempateAmplio(answers: Answer[]) {
  const answer = obtenerRespuestasAbiertas(answers).find((item) => item.questionId === 309);
  return answer ? normalizarTextoDecision(answer.text) : "";
}

function obtenerOpcionDesempateAmplio(answers: Answer[]): BroadTieBreakerChoice {
  const text = obtenerRespuestaDesempateAmplio(answers);

  if (!text) return null;

  if (
    text.includes("ensenar orientar") ||
    text.includes("facilitar el aprendizaje") ||
    text.includes("ensenar")
  ) {
    return "education";
  }

  if (text.includes("salud") || text.includes("bienestar") || text.includes("prevencion")) {
    return "health";
  }

  if (
    text.includes("recursos naturales") ||
    text.includes("ambiente") ||
    text.includes("plantas") ||
    text.includes("animales")
  ) {
    return "environment";
  }

  if (
    text.includes("crear piezas visuales") ||
    text.includes("disenar piezas visuales") ||
    text.includes("piezas visuales") ||
    text.includes("marcas") ||
    text.includes("contenido grafico")
  ) {
    return "graphic";
  }

  if (
    text.includes("organizar actividades") ||
    text.includes("coordinar personas") ||
    text.includes("liderar proyectos") ||
    text.includes("proyectos")
  ) {
    return "projects";
  }

  return null;
}

function ajustarAfinidadSubruta(
  subrouteId: string,
  affinity: number,
  answers: Answer[],
  averages: Record<Dimension, number>,
) {
  const text = obtenerTextoDecisionSubrutas(answers);
  const broadTieBreakerChoice = obtenerOpcionDesempateAmplio(answers);

  const rechazoInteraccionSocial =
    text.includes("ninguna de estas opciones me atrae especialmente");

  const senalTecnica =
    text.includes("usar instrumentos maquinas o herramientas tecnicas") ||
    text.includes("analizar datos numericos patrones o tendencias") ||
    text.includes("comprender como funcionan cosas o sistemas");

  const senalGestion =
    text.includes("dirigir un equipo o coordinar un proyecto") ||
    text.includes("organizar personas") ||
    text.includes("hacer avanzar un proyecto");
  const senalGestionNegocios =
    senalGestion ||
    text.includes("proyectos") ||
    text.includes("vender") ||
    text.includes("negociar") ||
    text.includes("liderar") ||
    text.includes("recursos") ||
    text.includes("procesos") ||
    text.includes("coordinar personas");
  const hasSpatialDesignSignal =
    text.includes("disenar espacios") ||
    text.includes("espacios fisicos") ||
    text.includes("ambientes") ||
    text.includes("interiores") ||
    text.includes("estructuras") ||
    text.includes("distribucion espacial") ||
    text.includes("forma funcion experiencia") ||
    text.includes("forma funcion del espacio") ||
    text.includes("muebles") ||
    text.includes("prototipos") ||
    text.includes("prototipos fisicos");
  const hasGraphicDesignSignal =
    text.includes("crear piezas visuales") ||
    text.includes("disenar piezas visuales") ||
    text.includes("piezas visuales") ||
    text.includes("marcas") ||
    text.includes("branding") ||
    text.includes("contenido grafico") ||
    text.includes("comunicacion visual") ||
    text.includes("videos") ||
    text.includes("contenido audiovisual") ||
    text.includes("campanas visuales") ||
    text.includes("contenido para redes") ||
    text.includes("publicaciones") ||
    text.includes("afiches") ||
    text.includes("logos") ||
    text.includes("identidad visual");
  const hasLaboratoryHealthSignal =
    text.includes("laboratorio") ||
    text.includes("muestras") ||
    text.includes("farmacia") ||
    text.includes("farmaco") ||
    text.includes("diagnostico clinico") ||
    text.includes("diagnosticos") ||
    text.includes("clinica") ||
    text.includes("biotecnologia");
  const hasEducationTieBreaker =
    text.includes("ensenar orientar o facilitar el aprendizaje") ||
    text.includes("facilitar el aprendizaje de otras personas") ||
    text.includes("ensenar") ||
    text.includes("orientar");
  const hasLegalDirectSignal =
    text.includes("interpretar normas") ||
    text.includes("argumentos o casos") ||
    text.includes("mediar conflictos") ||
    text.includes("acuerdos justos") ||
    text.includes("casos legales") ||
    text.includes("argumentacion legal") ||
    text.includes("argumentar legal") ||
    text.includes("contratos") ||
    text.includes("derecho") ||
    text.includes("leyes") ||
    text.includes("legal") ||
    text.includes("juridico") ||
    text.includes("justicia");
  const hasBroadTieBreaker = broadTieBreakerChoice !== null;

  let adjusted = affinity;

  const rutasSocialesFuertes = [
    "psicologia-apoyo-humano",
    "psicologia-human-support",
    "psychology-human-support",
    "trabajo-social-desarrollo-comunitario",
    "social-work-community-development",
    "educacion-orientacion",
    "education-teaching",
    "psychopedagogy-orientation",
    "mediacion-resolucion-conflictos",
  ];

  if (rutasSocialesFuertes.includes(subrouteId)) {
    if (rechazoInteraccionSocial) adjusted -= 25;
    if ((averages.amabilidad ?? 0) < 3) adjusted -= 15;
    if ((averages.social ?? 0) >= 4 && rechazoInteraccionSocial) adjusted -= 10;
  }

  if (
    ["negocios-gestion-proyectos", "business-project-management"].includes(subrouteId) &&
    senalGestion
  ) {
    adjusted += 15;
  }

  if (
    [
      "educacion-orientacion-formacion",
      "educacion-pedagogia",
      "orientacion-educativa",
      "education-teaching",
      "psychopedagogy-orientation",
    ].includes(subrouteId) &&
    hasEducationTieBreaker
  ) {
    adjusted += 30;
  }

  if (
    ["law-legal-sciences", "derecho-ciencias-juridicas"].includes(subrouteId) &&
    hasEducationTieBreaker &&
    !hasLegalDirectSignal
  ) {
    adjusted -= 25;
  }

  if (
    ["law-legal-sciences", "derecho-ciencias-juridicas"].includes(subrouteId) &&
    senalGestionNegocios &&
    !hasLegalDirectSignal
  ) {
    adjusted -= 25;
  }

  if (
    ["mediation-conflict-resolution", "mediacion-resolucion-conflictos"].includes(subrouteId) &&
    !text.includes("mediar conflictos") &&
    !text.includes("acuerdos justos")
  ) {
    adjusted -= 20;
  }

  if (
    [
      "ciencia-datos-investigacion",
      "analisis-datos",
      "science-data-analysis",
      "data-science",
      "ingenieria-sistemas",
      "systems-software",
    ].includes(subrouteId) &&
    senalTecnica
  ) {
    adjusted += 15;
  }

  if (["architecture-spatial-design", "arquitectura-diseno-espacios"].includes(subrouteId)) {
    if (hasSpatialDesignSignal) adjusted += 30;
    if (hasGraphicDesignSignal && !hasSpatialDesignSignal) adjusted -= 25;
    if (hasBroadTieBreaker && !hasSpatialDesignSignal) adjusted -= 30;
  }

  if (["industrial-design", "diseno-industrial-producto"].includes(subrouteId)) {
    if (hasSpatialDesignSignal) adjusted += 25;
  }

  if (subrouteId === "arte-comunicacion-diseno" && hasSpatialDesignSignal) {
    adjusted += 12;
  }

  if (subrouteId === "interior-design-environments" && hasGraphicDesignSignal && !hasSpatialDesignSignal) {
    adjusted -= 20;
  }

  if (subrouteId === "interior-design-environments" && hasBroadTieBreaker && !hasSpatialDesignSignal) {
    adjusted -= 25;
  }

  if (
    ["graphic-design", "diseno-grafico", "diseno-grafico-comunicacion-visual"].includes(subrouteId) &&
    hasGraphicDesignSignal
  ) {
    adjusted += 35;
  }

  if (
    ["communication-audiovisual", "journalism-public-communication", "arte-comunicacion-diseno"].includes(subrouteId) &&
    hasGraphicDesignSignal
  ) {
    adjusted += 15;
  }

  if (
    [
      "ciencia-datos-analisis",
      "ciencia-datos-investigacion",
      "science-data-analysis",
      "data-science",
    ].includes(subrouteId) &&
    hasSpatialDesignSignal
  ) {
    adjusted -= 15;
  }

  if (
    [
      "biotecnologia-ciencias-salud",
      "biotechnology-health-sciences",
      "laboratorio-biologia-biotecnologia",
    ].includes(subrouteId) &&
    hasSpatialDesignSignal
  ) {
    adjusted -= 20;
  }

  if (
    ["ingenieria-ambiental-sostenibilidad", "environmental-engineering"].includes(subrouteId) &&
    hasSpatialDesignSignal
  ) {
    adjusted -= 10;
  }

  if (averages.convencional <= 2 && averages.responsabilidad <= 2.5) {
    if (
      [
        "ciencia-datos-analisis",
        "ciencia-datos-investigacion",
        "science-data-analysis",
        "data-science",
        "laboratory-science",
        "laboratorio-biologia-biotecnologia",
        "biotechnology-health-sciences",
        "biotecnologia-ciencias-salud",
      ].includes(subrouteId)
    ) {
      adjusted -= 15;
    }
  }

  if (hasGraphicDesignSignal && !hasLaboratoryHealthSignal) {
    if (
      [
        "laboratory-science",
        "laboratorio-biologia-biotecnologia",
        "biotechnology-health-sciences",
        "biotecnologia-ciencias-salud",
        "investigacion-clinica",
      ].includes(subrouteId)
    ) {
      adjusted -= 30;
    }
  }

  if (
    broadTieBreakerChoice === "health" &&
    !hasLaboratoryHealthSignal &&
    [
      "laboratory-science",
      "laboratorio-biologia-biotecnologia",
      "biotechnology-health-sciences",
      "biotecnologia-ciencias-salud",
      "investigacion-clinica",
    ].includes(subrouteId)
  ) {
    adjusted -= 30;
  }

  return Math.max(0, Math.min(100, adjusted));
}

function obtenerSubrutasConcretas({
  answers,
  averages,
  ranked,
  semanticFocus,
  broadInterestPattern,
  diagnostics,
}: {
  answers: Answer[];
  averages: Record<Dimension, number>;
  ranked: Array<Profile & { score: number }>;
  semanticFocus: string[];
  broadInterestPattern: boolean;
  diagnostics: ReturnType<typeof obtenerDiagnosticosAdaptativos>;
}) {
  const mainProfileIds = ranked.slice(0, 4).map((profile) => profile.id);
  const signalPrioritySubroutes = obtenerSubrutasPrioridadPorSenales(
    answers,
    averages,
    semanticFocus,
  );
  const broadTieBreakerChoice = obtenerOpcionDesempateAmplio(answers);

  if (signalPrioritySubroutes.length > 0) {
    return signalPrioritySubroutes
      .map((subroute) => {
        const rawAffinity = subroute.relevance;
        const relevance = broadTieBreakerChoice
          ? rawAffinity
          : ajustarAfinidadSubruta(subroute.id, rawAffinity, answers, averages);

        return {
          ...subroute,
          rawAffinity,
          relevance,
        };
      })
      .filter((subroute) => subroute.relevance >= 45)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }

  const patterns = obtenerPatronesVocacionalesOrdenados(averages);
  const traceableSubroutes = vocationalSubroutes
    .map((subroute) => {
      const semanticMatches = subroute.semanticFocus.filter((focus) => semanticFocus.includes(focus));
      const profileRelated = subroute.relatedProfileIds.some((profileId) =>
        mainProfileIds.includes(profileId),
      );
      const trace = calcularCompatibilidadCorregidaSubruta({
        subroute,
        answers,
        averages,
        semanticMatches,
        patterns,
        broadInterestPattern,
      });
      const rawAffinity = trace.finalScore;
      const adjustedByLegacyRules = ajustarAfinidadSubruta(
        subroute.id,
        rawAffinity,
        answers,
        averages,
      );
      const relevance = limitarCompatibilidadAltaSinEvidencia(
        {
          ...trace,
          finalScore: Math.min(trace.finalScore, adjustedByLegacyRules),
        },
        diagnostics,
      );

      return {
        subroute,
        rawAffinity,
        relevance,
        compatibilityTrace: {
          ...trace,
          finalScore: relevance,
        },
        semanticMatches,
        profileRelated,
      };
    })
    .filter((item) => item.relevance >= 45)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, broadInterestPattern ? 3 : 4);

  mostrarTrazabilidadCompatibilidadEnDesarrollo(traceableSubroutes.slice(0, 5));

  return traceableSubroutes
    .map(({ subroute, rawAffinity, relevance, compatibilityTrace, semanticMatches, profileRelated }) =>
      construirPresentacionSubruta(
        subroute,
        relevance,
        semanticMatches,
        profileRelated,
        rawAffinity,
        compatibilityTrace,
      ),
    );
}

function mostrarTrazabilidadCompatibilidadEnDesarrollo(
  routes: Array<{ compatibilityTrace: RouteCompatibilityTrace }>,
) {
  if (process.env.NODE_ENV !== "development" || routes.length === 0) return;

  console.table(
    routes.map(({ compatibilityTrace }) => ({
      routeName: compatibilityTrace.routeName,
      dimensionScore: compatibilityTrace.dimensionScore,
      combinedPatternScore: compatibilityTrace.combinedPatternScore,
      explicitEvidenceScore: compatibilityTrace.explicitEvidenceScore,
      adaptiveConfirmationScore: compatibilityTrace.adaptiveConfirmationScore,
      penaltyScore: compatibilityTrace.penaltyScore,
      finalScore: compatibilityTrace.finalScore,
      requiredEvidenceMet: compatibilityTrace.requiredEvidenceMet,
    })),
  );
}

function obtenerSubrutasPrioridadPorSenales(
  answers: Answer[],
  averages: Record<Dimension, number>,
  semanticFocus: string[],
) {
  const narrativeText = obtenerTextoNarrativo(answers);
  const broadTieBreakerChoice = obtenerOpcionDesempateAmplio(answers);
  const hasHigh = (...dimensions: Dimension[]) =>
    dimensions.every((dimension) => averages[dimension] >= 4);
  const hasAnyText = (terms: string[]) =>
    terms.some((term) => narrativeText.includes(normalizarTexto(term)));
  const hasAnyFocus = (focus: string[]) => focus.some((item) => semanticFocus.includes(item));

  const hasDirectLegalText = hasAnyText([
    "derecho",
    "leyes",
    "legal",
    "juridico",
    "jurídico",
    "justicia",
    "contratos",
    "casos legales",
    "interpretacion de normas",
    "interpretación de normas",
    "argumentacion legal",
    "argumentación legal",
    "mediacion de conflictos",
    "mediación de conflictos",
  ]);
  const hasGeneralHealthText = hasAnyText([
    "salud",
    "bienestar",
    "prevencion",
    "prevención",
    "habitos",
    "hábitos",
    "alimentacion",
    "alimentación",
    "nutricion",
    "nutrición",
    "autocuidado",
    "atender personas en temas de salud",
  ]);
  const hasLaboratoryHealthText = hasAnyText([
    "laboratorio",
    "muestras",
    "farmaco",
    "fármaco",
    "farmacia",
    "diagnostico clinico",
    "diagnóstico clínico",
    "diagnosticos",
    "diagnósticos",
    "clinica",
    "clínica",
    "biotecnologia",
    "biotecnología",
  ]);
  const hasBusinessManagementText = hasAnyText([
    "impulsar proyectos",
    "proyectos",
    "vender propuestas",
    "vender",
    "negociar",
    "liderar equipos",
    "liderar",
    "controlar calidad",
    "tiempos",
    "recursos",
    "procesos",
    "coordinar personas",
    "gestion",
    "gestión",
  ]);
  const hasPublicInstitutionalText = hasAnyText([
    "politicas publicas",
    "políticas públicas",
    "gobierno",
    "instituciones",
    "estado",
    "diplomacia",
    "relaciones internacionales",
    "sociedad",
    "comunidad",
    "problemas publicos",
    "problemas públicos",
    "gestion publica",
    "gestión pública",
  ]);
  const hasTechnicalProcessText = hasAnyText([
    "sistemas fisicos",
    "sistemas físicos",
    "herramientas",
    "procesos",
    "funcionamiento",
    "analisis",
    "análisis",
    "mejora",
    "mejorar",
    "optimizar",
    "datos",
    "patrones",
    "sistemas",
  ]);
  const hasSpatialDesignText = hasAnyText([
    "disenar espacios",
    "espacios fisicos",
    "ambientes",
    "interiores",
    "estructuras",
    "distribucion espacial",
    "forma funcion experiencia",
    "forma funcion del espacio",
    "muebles",
    "prototipos",
    "prototipos fisicos",
  ]);
  const hasGraphicDesignText = hasAnyText([
    "crear piezas visuales",
    "disenar piezas visuales",
    "piezas visuales",
    "marcas",
    "branding",
    "contenido grafico",
    "contenido gráfico",
    "comunicacion visual",
    "comunicación visual",
    "videos",
    "contenido audiovisual",
    "campanas visuales",
    "campañas visuales",
    "contenido para redes",
    "publicaciones",
    "afiches",
    "logos",
    "identidad visual",
    "propuestas visuales",
    "propuestas expresivas",
    "propuestas comunicativas",
    "comunicativas",
    "expresivas",
  ]);
  if (broadTieBreakerChoice === "education") {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "educacion-orientacion-formacion",
        96,
        "se activa porque la experiencia corta elegida apunta a ensenar, orientar o facilitar aprendizaje",
      ),
      crearSubrutaRecomendada({
        id: "gestion-proyectos-educativos-sociales",
        name: "Gestion de Proyectos Educativos o Sociales",
        familyName: "Educacion, Sociedad y Desarrollo Humano",
        relevance: 91,
        reasons: [
          "combina orientacion a personas con organizacion de actividades o proyectos",
          "ayuda a contrastar si el interes educativo se expresa mejor coordinando experiencias formativas o sociales",
        ],
        activity:
          "Disenar una actividad breve de aprendizaje o apoyo social: objetivo, personas, pasos, recursos y forma de evaluar si funciono.",
      }),
      crearSubrutaRecomendada({
        id: "salud-bienestar-orientacion-prevencion",
        name: "Salud y Bienestar desde la Orientacion o Prevencion",
        familyName: "Salud, Bienestar y Apoyo Humano",
        relevance: 88,
        reasons: [
          "conecta ensenanza y orientacion con promocion de bienestar o prevencion",
          "permite explorar salud sin asumir atencion clinica directa ni laboratorio",
        ],
        activity:
          "Preparar una mini guia preventiva sobre bienestar, habitos o autocuidado para explicarla a otra persona.",
      }),
    ];
  }

  if (broadTieBreakerChoice === "health") {
    return [
      crearSubrutaRecomendada({
        id: "salud-bienestar-prevencion",
        name: "Salud, Bienestar y Prevención",
        familyName: "Salud, Bienestar y Apoyo Humano",
        relevance: 96,
        reasons: [
          "se activa porque la experiencia corta elegida apunta a salud, bienestar o prevencion",
          "prioriza promocion y orientacion en salud sin asumir laboratorio o investigacion clinica",
        ],
        activity:
          "Crear una mini accion preventiva sobre bienestar, habitos o autocuidado y probar explicarla a otra persona.",
      }),
      crearSubrutaRecomendadaDesdeExistente(
        "nutrition-health-wellbeing",
        91,
        "se activa como area cercana por salud preventiva, habitos y bienestar aplicado",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "psychology-human-support",
        86,
        "se activa como area cercana si el interes por bienestar tambien incluye acompanamiento humano",
      ),
    ];
  }

  if (broadTieBreakerChoice === "environment") {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "natural-resources-territory",
        96,
        "se activa porque la experiencia corta elegida apunta a recursos naturales, ambiente, plantas o animales",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "environmental-management",
        91,
        "se activa como area cercana por gestion de acciones e impacto ambiental",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "environmental-engineering",
        86,
        "se activa como hipotesis tecnica secundaria dentro del interes ambiental",
      ),
    ];
  }

  if (broadTieBreakerChoice === "graphic") {
    return [
      crearSubrutaRecomendada({
        id: "graphic-design",
        name: "Diseño Gráfico y Comunicación Visual",
        familyName: "Diseño, Arquitectura y Comunicación Visual",
        relevance: 96,
        reasons: [
          "se activa porque la experiencia corta elegida apunta a crear piezas visuales, marcas o contenido grafico",
          "prioriza una senal concreta de diseno grafico por encima de promedios generales altos",
        ],
        activity:
          "Crear una pieza visual simple para una marca, campana o mensaje y pedir retroalimentacion sobre claridad, estilo y comunicacion.",
      }),
      crearSubrutaRecomendadaDesdeExistente(
        "communication-audiovisual",
        90,
        "se activa como area cercana porque combina creatividad, comunicacion y produccion de contenido",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "journalism-public-communication",
        86,
        "se activa como opcion complementaria si el interes visual tambien busca comunicar ideas a una audiencia",
      ),
    ];
  }

  if (broadTieBreakerChoice === "projects") {
    const projectSubroutes = [
      crearSubrutaRecomendada({
        id: "business-project-management",
        name: "Gestión de Proyectos",
        familyName: "Gestión, Negocios y Emprendimiento",
        relevance: 96,
        reasons: [
          "se activa porque la experiencia corta elegida apunta a organizar actividades, coordinar personas o liderar proyectos",
          "prioriza una senal concreta de gestion por encima de promedios generales altos",
        ],
        activity:
          "Planear una actividad breve: objetivo, personas involucradas, pasos, recursos, tiempos y forma de medir si funciono.",
      }),
    ];

    const projectCandidates: LayeredResultSubroute[] = [];

    if (averages.convencional >= 3.5 && averages.emprendedor >= 3.5) {
      projectCandidates.push(
        crearSubrutaRecomendadaDesdeExistente(
          "administrative-finance",
          90,
          "se activa como soporte si el proyecto requiere orden, seguimiento y control de recursos",
        ),
      );
    }

    if (averages.artistico >= 3.5 && hasGraphicDesignText) {
      projectCandidates.push(
        crearSubrutaRecomendadaDesdeExistente(
          "graphic-design",
          88,
          "se activa porque la gestion de proyectos aparece junto con senales visuales, expresivas o comunicativas",
        ),
        crearSubrutaRecomendadaDesdeExistente(
          "communication-audiovisual",
          86,
          "se activa como area cercana si los proyectos se expresan mediante contenido, campanas o comunicacion audiovisual",
        ),
      );
    }

    if ((averages.realista >= 3.5 || averages.investigativo >= 3.5) && hasTechnicalProcessText) {
      projectCandidates.push(
        crearSubrutaRecomendadaDesdeExistente(
          "industrial-processes",
          87,
          "se activa si la gestion se orienta a mejora de procesos, funcionamiento u operaciones",
        ),
      );

      if (averages.investigativo >= 3.5 && hasAnyText(["datos", "patrones", "analisis", "análisis"])) {
        projectCandidates.push(
          crearSubrutaRecomendadaDesdeExistente(
            "science-data-analysis",
            85,
            "se activa si el proyecto se apoya en analisis de datos, patrones o informacion",
          ),
        );
      }

      if (averages.realista >= 3.5 && hasAnyText(["sistemas fisicos", "sistemas físicos", "herramientas", "funcionamiento"])) {
        projectCandidates.push(
          crearSubrutaRecomendadaDesdeExistente(
            "mechatronics-applied-technology",
            84,
            "se activa si el proyecto se orienta a sistemas fisicos, herramientas o funcionamiento tecnico",
          ),
        );
      }
    }

    if (hasPublicInstitutionalText) {
      projectCandidates.push(
        crearSubrutaRecomendadaDesdeExistente(
          "international-relations-public-policy",
          84,
          "se activa porque hay senales explicitas de politica publica, gobierno, instituciones, comunidad o problemas publicos",
        ),
      );
    }

    return [
      ...projectSubroutes,
      ...projectCandidates.sort((a, b) => b.relevance - a.relevance),
    ].slice(0, 3);
  }

  if (hasBusinessManagementText && averages.emprendedor >= 3.5 && averages.convencional >= 3.5) {
    return [
      crearSubrutaRecomendada({
        id: "business-project-management",
        name: "Gestión de Proyectos",
        familyName: "Gestión, Negocios y Emprendimiento",
        relevance: 96,
        reasons: [
          "se activa por senales de proyectos, ventas, negociacion, liderazgo, recursos o procesos",
          "prioriza gestion y operaciones sin asumir una ruta juridica",
        ],
        activity:
          "Planear una actividad breve: objetivo, personas involucradas, pasos, recursos, tiempos y forma de medir si funciono.",
      }),
      crearSubrutaRecomendadaDesdeExistente(
        "administrative-finance",
        91,
        "se activa como soporte por orden, seguimiento y control de recursos",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "industrial-processes",
        88,
        "se activa como area cercana por control de calidad, tiempos, recursos o procesos",
      ),
    ];
  }

  if (hasGeneralHealthText && !hasLaboratoryHealthText) {
    return [
      crearSubrutaRecomendada({
        id: "salud-bienestar-prevencion",
        name: "Salud, Bienestar y Prevención",
        familyName: "Salud, Bienestar y Apoyo Humano",
        relevance: 96,
        reasons: [
          "se activa porque aparecen senales de salud, bienestar, prevencion, habitos o autocuidado",
          "prioriza promocion y orientacion en salud sin asumir laboratorio o investigacion clinica",
        ],
        activity:
          "Crear una mini accion preventiva sobre bienestar, habitos o autocuidado y probar explicarla a otra persona.",
      }),
      crearSubrutaRecomendadaDesdeExistente(
        "nutrition-health-wellbeing",
        91,
        "se activa como area cercana por salud preventiva, alimentacion, habitos y bienestar aplicado",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "psychology-human-support",
        86,
        "se activa como area cercana si el interes por bienestar tambien incluye acompanamiento humano",
      ),
    ];
  }

  if (
    hasHigh("emprendedor", "social", "convencional", "investigativo") &&
    hasDirectLegalText
  ) {
    return [
      crearSubrutaRecomendada({
        id: "derecho-ciencias-juridicas",
        name: "Derecho y Ciencias Juridicas",
        familyName: "Derecho, Instituciones y Ciencias Juridicas",
        relevance: 96,
        reasons: [
          "se activa porque aparecen Emprendedor, Social, Convencional e Investigativo altos",
          "la respuesta guiada prioriza ayudar a personas, lo que puede conectar con mediacion, defensa, orientacion o resolucion de conflictos",
          "combina argumentacion, normas, analisis de casos y decisiones con impacto humano",
        ],
        activity:
          "Probar un caso sencillo: leer una situacion de conflicto, identificar partes, normas o acuerdos posibles y defender una solucion.",
      }),
      crearSubrutaRecomendada({
        id: "gestion-publica-relaciones-institucionales",
        name: "Gestion Publica y Relaciones Institucionales",
        familyName: "Derecho, Instituciones y Ciencias Juridicas",
        relevance: 91,
        reasons: [
          "se activa por la combinacion de organizacion, decisiones, trato con personas y analisis de situaciones",
          "puede explicar el interes por ayudar desde instituciones, proyectos publicos o coordinacion social",
        ],
        activity:
          "Explorar una noticia o problema local y proponer que institucion podria intervenir, con que pasos y para quienes.",
      }),
      crearSubrutaRecomendada({
        id: "mediacion-resolucion-conflictos",
        name: "Mediacion y Resolucion de Conflictos",
        familyName: "Derecho, Instituciones y Ciencias Juridicas",
        relevance: 89,
        reasons: [
          "se activa por la senal explicita de ayudar a personas junto con influencia, comunicacion y estructura",
          "permite probar si el interes social se expresa mejor acompanando, negociando o construyendo acuerdos",
        ],
        activity:
          "Practicar un escenario de mediacion: escuchar dos posturas, resumir necesidades y plantear un acuerdo posible.",
      }),
    ];
  }

  if (
    averages.realista >= 3.5 &&
    averages.investigativo >= 3.5 &&
    averages.artistico >= 3.5 &&
    hasSpatialDesignText &&
    !(hasGraphicDesignText && !hasSpatialDesignText)
  ) {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "architecture-spatial-design",
        95,
        "se activa por Realista, Investigativo y Artistico altos junto con creatividad visual-espacial o diseno aplicado",
      ),
      crearSubrutaRecomendada({
        id: "interior-design-environments",
        name: "Diseno de Interiores y Entornos",
        familyName: "Diseno, Arquitectura y Comunicacion Visual",
        relevance: 90,
        reasons: [
          "se activa por senales de organizacion espacial, funcion y experiencia de personas en ambientes",
          "ayuda a diferenciar diseno aplicado de arte expresivo o ingenieria tecnica",
        ],
        activity:
          "Redisenar un ambiente conocido en papel: distribucion, uso, circulacion y experiencia de las personas.",
      }),
      crearSubrutaRecomendada({
        id: "industrial-design",
        name: "Diseno Industrial",
        familyName: "Diseno, Arquitectura y Comunicacion Visual",
        relevance: 88,
        reasons: [
          "se activa por la mezcla de pruebas practicas, forma visual y soluciones funcionales",
          "puede explicar intereses entre construir, mejorar objetos y disenar experiencias de uso",
        ],
        activity:
          "Elegir un objeto cotidiano y proponer mejoras de forma, uso, materiales o comodidad.",
      }),
    ];
  }

  if (
    hasHigh("investigativo", "realista") &&
    (hasAnyText(["laboratorio", "farmaco", "farmacia", "ciencia aplicada", "clinica", "biotecnologia"]) ||
      (averages.convencional >= 3.5 &&
        hasAnyFocus(["scientific-analysis", "precision-following", "evidence-based-reasoning"])))
  ) {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "laboratory-science",
        95,
        "se activa por Investigativo y Realista altos junto con senales de laboratorio, farmacia o ciencia aplicada",
      ),
      crearSubrutaRecomendada({
        id: "biotecnologia-ciencias-salud",
        name: "Biotecnologia y Ciencias de la Salud",
        familyName: "Ciencia, Investigacion y Analisis",
        relevance: 90,
        reasons: [
          "se activa por interes cientifico aplicado a salud, procesos biologicos o soluciones de laboratorio",
          "ayuda a separar ciencia aplicada de tecnologia generica",
        ],
        activity:
          "Explorar una practica o video de laboratorio y registrar que parte despierta mas curiosidad.",
      }),
      crearSubrutaRecomendada({
        id: "investigacion-clinica",
        name: "Investigacion Clinica",
        familyName: "Ciencia, Investigacion y Analisis",
        relevance: 88,
        reasons: [
          "se activa por analisis de evidencia, cuidado de personas y preguntas de salud",
          "permite probar si interesa investigar problemas humanos desde datos, casos y protocolos",
        ],
        activity:
          "Leer un caso de salud simple e identificar pregunta, evidencia, posible explicacion y siguiente prueba.",
      }),
    ];
  }

  if (
    hasHigh("investigativo", "realista", "social") &&
    hasAnyText(["ambiente", "territorio", "sostenibilidad", "naturaleza", "recursos naturales", "ecosistema"])
  ) {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "environmental-engineering",
        95,
        "se activa por Investigativo, Realista y Social altos junto con senales ambientales o de sostenibilidad",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "natural-resources-territory",
        90,
        "se activa por interes en territorio, naturaleza, campo o relacion entre personas y entorno",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "environmental-management",
        88,
        "se activa por interes ambiental con coordinacion, impacto comunitario o proyectos sostenibles",
      ),
    ];
  }

  if (hasGraphicDesignText) {
    return [
      crearSubrutaRecomendada({
        id: "graphic-design",
        name: "Diseño Gráfico y Comunicación Visual",
        familyName: "Diseño, Arquitectura y Comunicación Visual",
        relevance: 96,
        reasons: [
          "se activa porque aparecen senales visuales, graficas, de marca o contenido para redes",
          "prioriza diseno y comunicacion visual por encima de rutas amplias de humanidades",
        ],
        activity:
          "Crear una pieza visual simple para una marca, campana o mensaje y pedir retroalimentacion sobre claridad, estilo y comunicacion.",
      }),
      crearSubrutaRecomendadaDesdeExistente(
        "communication-audiovisual",
        91,
        "se activa como area cercana por contenido audiovisual, videos, campanas o comunicacion con audiencias",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "journalism-public-communication",
        86,
        "se activa como opcion complementaria si el interes visual tambien busca comunicar ideas a una audiencia",
      ),
    ];
  }

  if (
    averages.artistico >= 3.5 &&
    averages.social >= 3.5 &&
    hasAnyText([
      "humanidades",
      "historia",
      "filosofia",
      "filosofía",
      "literatura",
      "leer",
      "escribir",
      "cultura",
      "periodismo",
      "comunicacion",
      "comunicación",
      "idiomas",
      "lenguaje",
    ])
  ) {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "literature-writing-cultural-studies",
        94,
        "se activa por Artistico y Social altos junto con señales de lectura, escritura, cultura o expresion de ideas",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "history-philosophy-humanities",
        91,
        "se activa por interes en ideas, cultura, sociedad, interpretacion o pensamiento critico",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "journalism-public-communication",
        88,
        "se activa por interes en comunicar, investigar hechos o conectar temas sociales con audiencias",
      ),
    ];
  }

  if (
    averages.social >= 3.5 &&
    averages.investigativo >= 3.5 &&
    hasAnyText([
      "sociedad",
      "comunidad",
      "problemas sociales",
      "trabajo social",
      "sociologia",
      "sociología",
      "antropologia",
      "antropología",
      "politicas publicas",
      "políticas públicas",
      "relaciones internacionales",
    ])
  ) {
    return [
      crearSubrutaRecomendadaDesdeExistente(
        "social-work-community-development",
        93,
        "se activa por Social alto junto con señales de comunidad, ayuda o problemas sociales",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "social-research",
        90,
        "se activa por Social e Investigativo altos orientados a entender grupos humanos o fenomenos sociales",
      ),
      crearSubrutaRecomendadaDesdeExistente(
        "international-relations-public-policy",
        87,
        "se activa por interes en instituciones, asuntos publicos, negociacion o decisiones colectivas",
      ),
    ];
  }

  return [];
}

function crearSubrutaRecomendada(input: {
  id: string;
  name: string;
  familyName: string;
  relevance: number;
  reasons: string[];
  activity: string;
}): LayeredResultSubroute {
  return {
    id: input.id,
    name: input.name,
    familyName: input.familyName,
    relevance: input.relevance,
    reasons: input.reasons,
    activitiesToExplore: [
      input.activity,
      "Conversar con una persona que estudie o trabaje en esta ruta y preguntarle que actividades realiza en una semana normal.",
      "Comparar esta ruta con otra cercana antes de tomarla como opcion principal.",
    ],
  };
}

function crearSubrutaRecomendadaDesdeExistente(
  subrouteId: string,
  relevance: number,
  activationReason: string,
) {
  const subroute = vocationalSubroutes.find((item) => item.id === subrouteId);
  if (!subroute) {
    return crearSubrutaRecomendada({
      id: subrouteId,
      name: subrouteId,
      familyName: "Ruta vocacional",
      relevance,
      reasons: [activationReason],
      activity: "Probar una actividad corta relacionada con esta ruta.",
    });
  }

  const family = vocationalFamilies.find((item) => item.id === subroute.familyId);

  return crearSubrutaRecomendada({
    id: subroute.id,
    name: subroute.name,
    familyName: family?.name ?? subroute.familyId,
    relevance,
    reasons: [
      activationReason,
      `su nucleo RIASEC combina ${subroute.coreRiasec.map((dimension) => dimensionLabels[dimension]).join(", ")}`,
    ],
    activity: `Probar una actividad corta relacionada con ${subroute.name.toLowerCase()}.`,
  });
}

function construirPresentacionSubruta(
  subroute: VocationalSubrouteMetadata,
  relevance: number,
  semanticMatches: string[],
  profileRelated: boolean,
  rawAffinity?: number,
  compatibilityTrace?: RouteCompatibilityTrace,
): LayeredResultSubroute {
  const family = vocationalFamilies.find((item) => item.id === subroute.familyId);
  const reasons = [
    profileRelated ? "aparece cercana a las familias generales con mayor afinidad" : null,
    semanticMatches.length > 0
      ? `coincide con señales como ${semanticMatches.map(etiquetarFocoSemantico).join(", ")}`
      : null,
    subroute.coreRiasec.length > 0
      ? `su nucleo RIASEC combina ${subroute.coreRiasec.map((dimension) => dimensionLabels[dimension]).join(", ")}`
      : null,
  ].filter((reason): reason is string => Boolean(reason));

  return {
    id: subroute.id,
    name: subroute.name,
    familyName: family?.name ?? subroute.familyId,
    ...(rawAffinity !== undefined ? { rawAffinity: Math.round(rawAffinity) } : {}),
    relevance: Math.round(relevance),
    ...(compatibilityTrace ? { compatibilityTrace } : {}),
    reasons,
    activitiesToExplore: [
      `Conversar con alguien de ${subroute.careerExamples[0] ?? subroute.name}.`,
      `Probar una actividad corta relacionada con ${subroute.name.toLowerCase()}.`,
      `Comparar esta subruta con otra cercana antes de decidir.`,
    ],
  };
}

function promediarDimensiones(averages: Record<Dimension, number>, dimensions: Dimension[]) {
  if (dimensions.length === 0) return 0;

  return dimensions.reduce((total, dimension) => total + (averages[dimension] ?? 0), 0) / dimensions.length;
}

function obtenerTextoNarrativo(answers: Answer[]) {
  return normalizarTexto(
    answers
      .flatMap((answer) => {
        if (answer.kind === "open") return [answer.text];
        return answer.comment ? [answer.comment] : [];
      })
      .join(" "),
  );
}

function normalizarTexto(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function etiquetarFocoSemantico(focus: string) {
  return semanticFocusLabels[focus] ?? focus.replaceAll("-", " ");
}

