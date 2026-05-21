import {
  bigFiveDimensions,
  dimensionLabels,
  questions,
  riasecDimensions,
  vocationalFamilies,
  vocationalSubroutes,
} from "./data";
import {
  calculateDifferentiationScore,
  getAdaptiveDiagnostics,
  getAverages,
} from "./engine";
import { analyzeSemanticFocusText } from "./responsePatterns";
import type { Answer, Dimension, Profile, VocationalSubrouteMetadata } from "./types";

export type LayeredResultSubroute = {
  id: string;
  name: string;
  familyName: string;
  relevance: number;
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

export function buildLayeredResultArchitecture(
  answers: Answer[],
  ranked: Array<Profile & { score: number }>,
) {
  const averages = getAverages(answers);
  const diagnostics = getAdaptiveDiagnostics(answers, averages, ranked);
  const differentiation = calculateDifferentiationScore(averages);
  const dominantRiasec = getDominantRiasecCombination(averages);
  const bigFiveStyle = getBigFiveStyle(averages);
  const semanticFocus = getDetectedSemanticFocus(answers);
  const concreteSubroutes = getConcreteSubroutes({
    answers,
    averages,
    ranked,
    semanticFocus,
    broadInterestPattern: differentiation.broadInterestPattern,
  });

  return {
    riasecEnvironment: {
      title: differentiation.broadInterestPattern
        ? "Entorno vocacional amplio"
        : "Entorno vocacional dominante",
      dominantCombination: dominantRiasec,
      explanation: getRiasecExplanation(dominantRiasec, differentiation.broadInterestPattern),
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

function getDominantRiasecCombination(averages: Record<Dimension, number>) {
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

function getRiasecExplanation(
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

function getBigFiveStyle(averages: Record<Dimension, number>) {
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

function getDetectedSemanticFocus(answers: Answer[]) {
  const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));
  const questionFocus = questions
    .filter((question) => answeredQuestionIds.has(question.id))
    .flatMap((question) => question.semanticFocus ?? []);
  const narrativeFocus = answers.flatMap((answer) => {
    if (answer.kind === "open") return analyzeSemanticFocusText(answer.text).semanticFocus;
    return answer.comment ? analyzeSemanticFocusText(answer.comment).semanticFocus : [];
  });

  return Array.from(new Set([...questionFocus, ...narrativeFocus]));
}

function getConcreteSubroutes({
  answers,
  averages,
  ranked,
  semanticFocus,
  broadInterestPattern,
}: {
  answers: Answer[];
  averages: Record<Dimension, number>;
  ranked: Array<Profile & { score: number }>;
  semanticFocus: string[];
  broadInterestPattern: boolean;
}) {
  const mainProfileIds = ranked.slice(0, 4).map((profile) => profile.id);
  const signalPrioritySubroutes = getSignalPrioritySubroutes(
    answers,
    averages,
    semanticFocus,
    broadInterestPattern,
  );

  if (signalPrioritySubroutes.length > 0) {
    return signalPrioritySubroutes.slice(0, 3);
  }

  return vocationalSubroutes
    .map((subroute) => {
      const coreAverage = averageDimensions(averages, subroute.coreRiasec);
      const supportAverage = averageDimensions(averages, subroute.supportBigFive);
      const semanticMatches = subroute.semanticFocus.filter((focus) => semanticFocus.includes(focus));
      const semanticRatio = semanticMatches.length / Math.max(1, subroute.semanticFocus.length);
      const profileRelated = subroute.relatedProfileIds.some((profileId) =>
        mainProfileIds.includes(profileId),
      );
      const relevance =
        coreAverage * 8 +
        supportAverage * 2 +
        semanticRatio * 30 +
        (profileRelated && !broadInterestPattern ? 12 : 0);

      return {
        subroute,
        relevance,
        semanticMatches,
        profileRelated,
      };
    })
    .filter((item) => item.relevance >= 38)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, broadInterestPattern ? 3 : 4)
    .map(({ subroute, relevance, semanticMatches, profileRelated }) =>
      buildSubroutePresentation(subroute, relevance, semanticMatches, profileRelated),
    );
}

function getSignalPrioritySubroutes(
  answers: Answer[],
  averages: Record<Dimension, number>,
  semanticFocus: string[],
  broadInterestPattern: boolean,
) {
  const narrativeText = getNarrativeText(answers);
  const hasHigh = (...dimensions: Dimension[]) =>
    dimensions.every((dimension) => averages[dimension] >= 4);
  const hasAnyText = (terms: string[]) =>
    terms.some((term) => narrativeText.includes(normalizeText(term)));
  const hasAnyFocus = (focus: string[]) => focus.some((item) => semanticFocus.includes(item));

  const hasLegalOrHumanPriorityText = hasAnyText([
      "ayudar",
      "personas",
      "orientar",
      "mediar",
      "defender",
      "resolver conflictos",
      "normas",
      "casos",
      "justicia",
      "decisiones",
  ]);
  const hasDirectLegalText = hasAnyText([
    "derecho",
    "ley",
    "leyes",
    "legal",
    "juridico",
    "jurídico",
    "abogado",
    "abogada",
    "justicia",
    "defender",
    "mediar",
    "normas",
  ]);

  if (
    hasHigh("emprendedor", "social", "convencional", "investigativo") &&
    (hasDirectLegalText || (broadInterestPattern && hasLegalOrHumanPriorityText))
  ) {
    return [
      createRecommendedSubroute({
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
      createRecommendedSubroute({
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
      createRecommendedSubroute({
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
    hasAnyFocus(["visual-spatial-creativity", "applied-design", "spatial-organization"])
  ) {
    return [
      createRecommendedSubrouteFromExisting(
        "architecture-spatial-design",
        95,
        "se activa por Realista, Investigativo y Artistico altos junto con creatividad visual-espacial o diseno aplicado",
      ),
      createRecommendedSubroute({
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
      createRecommendedSubroute({
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
    (hasAnyText(["salud", "laboratorio", "farmaco", "farmacia", "ciencia aplicada", "clinica", "biotecnologia"]) ||
      (averages.convencional >= 3.5 &&
        hasAnyFocus(["scientific-analysis", "precision-following", "evidence-based-reasoning"])))
  ) {
    return [
      createRecommendedSubrouteFromExisting(
        "laboratory-science",
        95,
        "se activa por Investigativo y Realista altos junto con senales de laboratorio, farmacia o ciencia aplicada",
      ),
      createRecommendedSubroute({
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
      createRecommendedSubroute({
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
      createRecommendedSubrouteFromExisting(
        "environmental-engineering",
        95,
        "se activa por Investigativo, Realista y Social altos junto con senales ambientales o de sostenibilidad",
      ),
      createRecommendedSubrouteFromExisting(
        "natural-resources-territory",
        90,
        "se activa por interes en territorio, naturaleza, campo o relacion entre personas y entorno",
      ),
      createRecommendedSubrouteFromExisting(
        "environmental-management",
        88,
        "se activa por interes ambiental con coordinacion, impacto comunitario o proyectos sostenibles",
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
      createRecommendedSubrouteFromExisting(
        "literature-writing-cultural-studies",
        94,
        "se activa por Artistico y Social altos junto con señales de lectura, escritura, cultura o expresion de ideas",
      ),
      createRecommendedSubrouteFromExisting(
        "history-philosophy-humanities",
        91,
        "se activa por interes en ideas, cultura, sociedad, interpretacion o pensamiento critico",
      ),
      createRecommendedSubrouteFromExisting(
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
      "personas",
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
      createRecommendedSubrouteFromExisting(
        "social-work-community-development",
        93,
        "se activa por Social alto junto con señales de comunidad, ayuda o problemas sociales",
      ),
      createRecommendedSubrouteFromExisting(
        "social-research",
        90,
        "se activa por Social e Investigativo altos orientados a entender grupos humanos o fenomenos sociales",
      ),
      createRecommendedSubrouteFromExisting(
        "international-relations-public-policy",
        87,
        "se activa por interes en instituciones, asuntos publicos, negociacion o decisiones colectivas",
      ),
    ];
  }

  return [];
}

function createRecommendedSubroute(input: {
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

function createRecommendedSubrouteFromExisting(
  subrouteId: string,
  relevance: number,
  activationReason: string,
) {
  const subroute = vocationalSubroutes.find((item) => item.id === subrouteId);
  if (!subroute) {
    return createRecommendedSubroute({
      id: subrouteId,
      name: subrouteId,
      familyName: "Ruta vocacional",
      relevance,
      reasons: [activationReason],
      activity: "Probar una actividad corta relacionada con esta ruta.",
    });
  }

  const family = vocationalFamilies.find((item) => item.id === subroute.familyId);

  return createRecommendedSubroute({
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

function buildSubroutePresentation(
  subroute: VocationalSubrouteMetadata,
  relevance: number,
  semanticMatches: string[],
  profileRelated: boolean,
): LayeredResultSubroute {
  const family = vocationalFamilies.find((item) => item.id === subroute.familyId);
  const reasons = [
    profileRelated ? "aparece cercana a las familias generales con mayor afinidad" : null,
    semanticMatches.length > 0
      ? `coincide con señales como ${semanticMatches.map(labelSemanticFocus).join(", ")}`
      : null,
    subroute.coreRiasec.length > 0
      ? `su nucleo RIASEC combina ${subroute.coreRiasec.map((dimension) => dimensionLabels[dimension]).join(", ")}`
      : null,
  ].filter((reason): reason is string => Boolean(reason));

  return {
    id: subroute.id,
    name: subroute.name,
    familyName: family?.name ?? subroute.familyId,
    relevance: Math.round(relevance),
    reasons,
    activitiesToExplore: [
      `Conversar con alguien de ${subroute.careerExamples[0] ?? subroute.name}.`,
      `Probar una actividad corta relacionada con ${subroute.name.toLowerCase()}.`,
      `Comparar esta subruta con otra cercana antes de decidir.`,
    ],
  };
}

function averageDimensions(averages: Record<Dimension, number>, dimensions: Dimension[]) {
  if (dimensions.length === 0) return 0;

  return dimensions.reduce((total, dimension) => total + (averages[dimension] ?? 0), 0) / dimensions.length;
}

function getNarrativeText(answers: Answer[]) {
  return normalizeText(
    answers
      .flatMap((answer) => {
        if (answer.kind === "open") return [answer.text];
        return answer.comment ? [answer.comment] : [];
      })
      .join(" "),
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function labelSemanticFocus(focus: string) {
  return semanticFocusLabels[focus] ?? focus.replaceAll("-", " ");
}
