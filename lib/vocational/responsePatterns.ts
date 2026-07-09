export type ResponsePattern = {
  id: string;
  label: string;
  category:
    | "uncertainty"
    | "external_pressure"
    | "intrinsic_motivation"
    | "social_motivation"
    | "technical_motivation"
    | "creative_motivation"
    | "resilience"
    | "avoidance"
    | "low_reflection"
    | "defensive_superiority"
    | "rejection_of_help"
    | "economic_concern"
    | "identity_conflict"
    | "routine_difficulty"
    | "autonomy"
    | "exploration"
    | "leadership_motivation";
  keywords: string[];
  phrases: string[];
  clarityImpact: number;
  reliabilityImpact: number;
  suggestedDimensions?: string[];
};

export type SemanticFocusPattern = {
  id: string;
  semanticFocus: string[];
  keywords: string[];
  phrases: string[];
};

type FreeVocationalPattern = {
  id: string;
  semanticFocus: string[];
  suggestedRoutes: string[];
  keywords: string[];
  phrases: string[];
};

export type AnalisisRespuestaLibreVocacional = {
  matchedPatterns: string[];
  semanticFocus: string[];
  suggestedRoutes: string[];
  clarity: "alta" | "media" | "baja";
  usarParaRanking: boolean;
};

export const semanticFocusPatterns: SemanticFocusPattern[] = [
  {
    id: "visual-spatial-design",
    semanticFocus: [
      "visual-spatial-creativity",
      "applied-design",
      "spatial-organization",
    ],
    keywords: [
      "arquitectura",
      "espacio",
      "espacios",
      "estructura",
      "estructuras",
      "ambiente",
      "ambientes",
      "distribucion",
      "distribuir",
      "plano",
      "planos",
      "maqueta",
      "maquetas",
      "interiores",
      "forma",
      "formas",
    ],
    phrases: [
      "organizacion espacial",
      "organización espacial",
      "diseno de espacios",
      "diseño de espacios",
      "diseno espacial",
      "diseño espacial",
      "experiencia de personas",
      "como se usa un espacio",
      "como se sienten las personas en un espacio",
    ],
  },
  {
    id: "graphic-visual-communication",
    semanticFocus: [
      "graphic-visual-communication",
      "applied-design",
      "communication-confidence",
    ],
    keywords: [
      "marca",
      "marcas",
      "grafico",
      "gráfico",
      "visuales",
      "branding",
      "contenido",
      "comunicacion",
      "comunicación",
    ],
    phrases: [
      "piezas visuales",
      "contenido grafico",
      "contenido gráfico",
      "comunicacion visual",
      "comunicación visual",
      "mensajes graficos",
      "mensajes gráficos",
    ],
  },
];

const freeVocationalPatterns: FreeVocationalPattern[] = [
  {
    id: "social-community-service",
    semanticFocus: [
      "collaborative-help",
      "community-environment",
      "interpersonal-care",
      "emotional-support",
    ],
    suggestedRoutes: [
      "social-work-community-development",
      "salud-publica",
      "psicologia-human-support",
    ],
    keywords: [
      "voluntariado",
      "comunidad",
      "comunitario",
      "comunitaria",
      "social",
      "ayuda",
      "apoyo",
    ],
    phrases: [
      "servicio social",
      "ayuda social",
      "trabajo social",
      "ayudar a la comunidad",
      "apoyar a comunidades",
      "ayudar personas",
    ],
  },
  {
    id: "territory-field",
    semanticFocus: [
      "community-environment",
      "field-observation",
      "territorial-analysis",
    ],
    suggestedRoutes: [
      "natural-resources-territory",
      "environmental-management",
      "social-work-community-development",
    ],
    keywords: [
      "viajar",
      "campo",
      "territorio",
      "territorial",
      "rural",
      "rurales",
      "zonas",
    ],
    phrases: [
      "zonas rurales",
      "trabajo de campo",
      "salir a campo",
      "conocer lugares",
      "trabajar en territorio",
    ],
  },
  {
    id: "teaching-guidance",
    semanticFocus: [
      "teaching-guidance",
      "communication-confidence",
      "collaborative-help",
    ],
    suggestedRoutes: ["educacion", "orientacion-vocacional"],
    keywords: [
      "ensenar",
      "enseñar",
      "explicar",
      "educar",
      "orientar",
      "docencia",
      "profesor",
      "profesora",
    ],
    phrases: [
      "dar clases",
      "ayudar a aprender",
      "orientar personas",
      "explicar temas",
    ],
  },
  {
    id: "health-care",
    semanticFocus: [
      "interpersonal-care",
      "evidence-based-reasoning",
      "teaching-guidance",
      "emotional-support",
    ],
    suggestedRoutes: [
      "salud-publica",
      "enfermeria",
      "nutricion",
      "psicologia-human-support",
    ],
    keywords: [
      "salud",
      "bienestar",
      "prevencion",
      "prevención",
      "cuidar",
      "pacientes",
      "enfermeria",
      "enfermería",
      "nutricion",
      "nutrición",
    ],
    phrases: [
      "cuidar pacientes",
      "ayudar pacientes",
      "promover salud",
      "salud publica",
      "salud pública",
    ],
  },
  {
    id: "software-technology",
    semanticFocus: [
      "abstract-reasoning",
      "technical-manipulation",
      "practical-testing",
    ],
    suggestedRoutes: ["ingenieria-sistemas", "software"],
    keywords: [
      "programar",
      "software",
      "sistemas",
      "tecnologia",
      "tecnología",
      "aplicaciones",
      "codigo",
      "código",
    ],
    phrases: [
      "crear aplicaciones",
      "ingenieria de sistemas",
      "ingeniería de sistemas",
      "desarrollo de software",
    ],
  },
  {
    id: "visual-design",
    semanticFocus: [
      "graphic-visual-communication",
      "visual-spatial-creativity",
      "applied-design",
      "communication-confidence",
    ],
    suggestedRoutes: ["diseno-grafico", "comunicacion-audiovisual"],
    keywords: [
      "disenar",
      "diseñar",
      "diseno",
      "diseño",
      "dibujo",
      "visual",
      "visuales",
      "logos",
      "logo",
      "grafico",
      "gráfico",
    ],
    phrases: [
      "diseno grafico",
      "diseño gráfico",
      "comunicacion audiovisual",
      "comunicación audiovisual",
      "crear logos",
      "piezas visuales",
    ],
  },
];

export const responsePatterns: ResponsePattern[] = [
  {
    id: "uncertainty",
    label: "Duda o falta de claridad",
    category: "uncertainty",
    keywords: ["duda", "elegir", "seguro", "segura"],
    phrases: ["no se", "no lo tengo claro", "me cuesta elegir", "no estoy seguro", "no estoy segura", "todavia no se", "no se que elegir"],
    clarityImpact: -8,
    reliabilityImpact: 0,
  },
  {
    id: "external-pressure",
    label: "Presion externa",
    category: "external_pressure",
    keywords: ["familia", "presionan", "obligacion", "padres"],
    phrases: ["mi familia quiere", "me presionan", "por dinero", "por obligacion", "mis padres quieren", "esperan que estudie", "me dicen que estudie", "no quiero decepcionar"],
    clarityImpact: -8,
    reliabilityImpact: 0,
  },
  {
    id: "intrinsic-motivation",
    label: "Motivacion interna",
    category: "intrinsic_motivation",
    keywords: ["gusta", "interesa", "apasiona", "curiosidad"],
    phrases: ["me gusta", "me interesa", "me apasiona", "me da curiosidad", "podria hacerlo por horas", "quiero aprender", "lo haria aunque nadie me obligue"],
    clarityImpact: 5,
    reliabilityImpact: 3,
  },
  {
    id: "technical-motivation",
    label: "Motivacion tecnica",
    category: "technical_motivation",
    keywords: ["programar", "construir", "tecnologia", "sistemas", "datos", "software", "aplicaciones", "computadoras"],
    phrases: ["resolver problemas", "hacer prototipos"],
    clarityImpact: 4,
    reliabilityImpact: 2,
    suggestedDimensions: ["realista", "investigativo"],
  },
  {
    id: "social-motivation",
    label: "Motivacion social",
    category: "social_motivation",
    keywords: ["ayudar", "acompanar", "escuchar", "orientar", "apoyar", "aconsejar"],
    phrases: ["mejorar la vida de las personas", "trabajar con personas"],
    clarityImpact: 4,
    reliabilityImpact: 2,
    suggestedDimensions: ["social", "amabilidad"],
  },
  {
    id: "creative-motivation",
    label: "Motivacion creativa",
    category: "creative_motivation",
    keywords: ["dibujar", "pintar", "crear", "disenar", "historias", "musica", "video", "contenido", "marca", "campana", "imagen"],
    phrases: [],
    clarityImpact: 4,
    reliabilityImpact: 2,
    suggestedDimensions: ["artistico", "apertura"],
  },
  {
    id: "resilience",
    label: "Persistencia",
    category: "resilience",
    keywords: ["practico", "intento", "soluciones", "error"],
    phrases: ["seguir intentando", "busco otra forma", "practico mas", "lo intento de nuevo", "pido ayuda", "no me rindo", "busco soluciones", "aprendo del error"],
    clarityImpact: 4,
    reliabilityImpact: 3,
    suggestedDimensions: ["tolerancia", "responsabilidad"],
  },
  {
    id: "avoidance",
    label: "Bloqueo o abandono",
    category: "avoidance",
    keywords: ["bloqueo", "frustro", "aburro", "abandono"],
    phrases: ["me bloqueo", "lo dejo", "pierdo interes", "me frustro", "me aburro", "me cuesta seguir", "ya no quiero continuar"],
    clarityImpact: -5,
    reliabilityImpact: 0,
    suggestedDimensions: ["neuroticismo"],
  },
  {
    id: "low-reflection",
    label: "Baja reflexion",
    category: "low_reflection",
    keywords: ["xd", "jaja", "aaa", "nada", "normal"],
    phrases: ["no se", "porque si", "no tengo idea"],
    clarityImpact: -6,
    reliabilityImpact: -8,
  },
  {
    id: "defensive-superiority",
    label: "Superioridad defensiva",
    category: "defensive_superiority",
    keywords: [],
    phrases: ["soy el mejor", "soy la mejor", "nadie me supera", "nunca fallo", "todo lo controlo", "nada me sale mal", "soy perfecto", "soy perfecta", "nadie es mejor que yo"],
    clarityImpact: -8,
    reliabilityImpact: -15,
  },
  {
    id: "rejection-of-help",
    label: "Rechazo de ayuda",
    category: "rejection_of_help",
    keywords: [],
    phrases: ["no necesito ayuda", "pedir ayuda es para debiles", "yo puedo solo", "yo puedo sola", "no necesito a nadie", "no pido ayuda"],
    clarityImpact: -8,
    reliabilityImpact: -15,
  },
  {
    id: "economic-concern",
    label: "Preocupación económica o laboral",
    category: "economic_concern",
    keywords: [
      "rentable",
      "estabilidad",
      "empleabilidad",
      "sueldo",
      "salario",
      "dinero",
      "trabajo",
      "laboral",
    ],
    phrases: [
      "conseguir trabajo",
      "ganar dinero",
      "seguro laboral",
      "trabajo seguro",
      "no conseguir empleo",
      "salida laboral",
      "oportunidades laborales",
      "mas oportunidades laborales",
      "más oportunidades laborales",
      "oportunidades de trabajo",
      "mayor salida laboral",
      "mejor salida laboral",
      "que tenga trabajo",
      "que tenga mas trabajo",
      "que tenga más trabajo",
    ],
    clarityImpact: -2,
    reliabilityImpact: 1,
  },
  {
    id: "identity-conflict",
    label: "Conflicto de identidad",
    category: "identity_conflict",
    keywords: [],
    phrases: ["no se si soy yo", "no se si es lo que quiero", "me gusta la imagen", "quiero ser como ellos", "quiero ser como ellas", "no se si elegi por mi", "no se si lo hago por mi", "me atrae como se ve esa carrera"],
    clarityImpact: -7,
    reliabilityImpact: 0,
  },
  {
    id: "routine-difficulty",
    label: "Dificultad de rutina",
    category: "routine_difficulty",
    keywords: ["constante"],
    phrases: ["me cuesta mantener", "pierdo motivacion", "me aburro", "no soy constante", "me frustro rapido", "empiezo y lo dejo", "me cuesta sostener", "me cuesta dividir en pasos"],
    clarityImpact: -5,
    reliabilityImpact: 0,
  },
  {
    id: "autonomy",
    label: "Autonomia",
    category: "autonomy",
    keywords: ["libertad"],
    phrases: ["quiero decidir", "quiero libertad", "no me gusta que me impongan", "prefiero hacerlo a mi manera", "quiero hacerlo a mi forma", "no quiero que decidan por mi"],
    clarityImpact: 1,
    reliabilityImpact: 1,
  },
  {
    id: "exploration",
    label: "Exploracion",
    category: "exploration",
    keywords: ["viajar", "explorar", "experimentar", "descubrir"],
    phrases: ["probar cosas nuevas", "conocer lugares", "hacer muchas cosas", "vivir experiencias"],
    clarityImpact: 1,
    reliabilityImpact: 1,
  },
  {
    id: "leadership-motivation",
    label: "Motivacion de liderazgo",
    category: "leadership_motivation",
    keywords: ["liderar", "negociar", "emprender"],
    phrases: ["tener negocios", "dirigir equipos", "tomar decisiones", "crear empresa", "hacer que otros trabajen conmigo", "organizar personas"],
    clarityImpact: 4,
    reliabilityImpact: 2,
    suggestedDimensions: ["emprendedor", "extraversion"],
  },
];

export function analizarTextoNarrativo(text: string) {
  const normalized = normalizarTexto(text);

  if (!normalized) {
    return {
      matchedPatterns: [],
      categories: [],
      suggestedDimensions: [],
      reliabilityImpact: 0,
      clarityImpact: 0,
    };
  }

  const matchedPatterns = responsePatterns.filter((pattern) => {
    const values = [...pattern.keywords, ...pattern.phrases].map(normalizarTexto);

    return values.some((value) => value && normalized.includes(value));
  });

  return {
    matchedPatterns: matchedPatterns.map((pattern) => pattern.id),
    categories: unicos(matchedPatterns.map((pattern) => pattern.category)),
    suggestedDimensions: unicos(
      matchedPatterns.flatMap((pattern) => pattern.suggestedDimensions ?? []),
    ),
    reliabilityImpact: matchedPatterns.reduce(
      (total, pattern) => total + pattern.reliabilityImpact,
      0,
    ),
    clarityImpact: matchedPatterns.reduce(
      (total, pattern) => total + pattern.clarityImpact,
      0,
    ),
  };
}

export function analizarTextoFocoSemantico(text: string) {
  const normalized = normalizarTexto(text);

  if (!normalized) {
    return {
      matchedPatterns: [],
      semanticFocus: [],
    };
  }

  const matchedPatterns = semanticFocusPatterns.filter((pattern) => {
    const values = [...pattern.keywords, ...pattern.phrases].map(normalizarTexto);

    return values.some((value) => value && normalized.includes(value));
  });

  return {
    matchedPatterns: matchedPatterns.map((pattern) => pattern.id),
    semanticFocus: unicos(
      matchedPatterns.flatMap((pattern) => pattern.semanticFocus),
    ),
  };
}

export function analizarRespuestaLibreVocacional(
  text: string,
): AnalisisRespuestaLibreVocacional {
  const normalized = normalizarTexto(text);

  if (!normalized || normalized.split(/\s+/).filter(Boolean).length < 2) {
    return {
      matchedPatterns: [],
      semanticFocus: [],
      suggestedRoutes: [],
      clarity: "baja",
      usarParaRanking: false,
    };
  }

  const matchedPatterns = freeVocationalPatterns.filter((pattern) => {
    const values = [...pattern.keywords, ...pattern.phrases].map(normalizarTexto);

    return values.some((value) => value && normalized.includes(value));
  });
  const semanticFocus = unicos(
    matchedPatterns.flatMap((pattern) => pattern.semanticFocus),
  );
  const suggestedRoutes = unicos(
    matchedPatterns.flatMap((pattern) => pattern.suggestedRoutes),
  );
  const meaningfulWordCount = normalized
    .split(/\s+/)
    .filter((word) => word.length > 2).length;
  const clarity =
    matchedPatterns.length >= 2 || (matchedPatterns.length === 1 && meaningfulWordCount >= 6)
      ? "alta"
      : matchedPatterns.length === 1
        ? "media"
        : "baja";

  return {
    matchedPatterns: matchedPatterns.map((pattern) => pattern.id),
    semanticFocus,
    suggestedRoutes,
    clarity,
    usarParaRanking: clarity !== "baja" && semanticFocus.length > 0,
  };
}

function normalizarTexto(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function unicos<T>(values: T[]) {
  return Array.from(new Set(values));
}

