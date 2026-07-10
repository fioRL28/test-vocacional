import type {
  AdaptiveThemeBlock,
  Dimension,
  Profile,
  Question,
  VocationalFamilyMetadata,
  VocationalSubrouteMetadata,
} from "./types";

export const dimensionLabels: Record<Dimension, string> = {
  realista: "Realista",
  investigativo: "Investigativo",
  artistico: "Artístico",
  social: "Social",
  emprendedor: "Emprendedor",
  convencional: "Convencional",
  apertura: "Apertura",
  responsabilidad: "Responsabilidad",
  extraversion: "Extraversión",
  amabilidad: "Amabilidad",
  neuroticismo: "Neuroticismo",
  incertidumbre: "Incertidumbre vocacional",
  presion: "Presión externa",
  tolerancia: "Tolerancia a la dificultad",
};

export const riasecDimensions: Dimension[] = [
  "realista",
  "investigativo",
  "artistico",
  "social",
  "emprendedor",
  "convencional",
];

export const bigFiveDimensions: Dimension[] = [
  "apertura",
  "responsabilidad",
  "extraversion",
  "amabilidad",
  "neuroticismo",
];

export const contextDimensions: Dimension[] = [
  "incertidumbre",
  "presion",
  "tolerancia",
];

export const measurableDimensions = [
  ...riasecDimensions,
  ...bigFiveDimensions,
  ...contextDimensions,
];

const uncertaintyGuidedOptions = [
  "No identifico qué carrera encaja mejor con mis intereses",
  "Me interesan varias áreas y me cuesta elegir",
  "Me preocupa equivocarme",
  "No sé si me gustará ejercer esa carrera",
  "Me preocupa la estabilidad económica o laboral",
  "Siento presión externa",
  "Me siento confundido/a, pero no sé cómo explicarlo",
];

const pressureGuidedOptions = [
  "Mi familia espera que elija una carrera específica",
  "Me preocupa elegir algo que no sea rentable",
  "Me preocupa decepcionar a otras personas",
  "Me comparo con lo que otros esperan de mí",
  "No siento presión de otras personas al elegir",
];

const difficultyGuidedOptions = [
  "Busco otra forma de intentarlo",
  "Pido ayuda o consejo",
  "Me frustro, pero intento continuar",
  "Pierdo interés si se vuelve muy difícil",
  "Dudo si realmente es para mí",
  "Depende de cuánto me importe la actividad",
  "Aún no sé cómo suelo reaccionar",
];

const motivationGuidedOptions = [
  "Diseñar espacios, objetos o ambientes",
  "Crear contenido o expresar ideas",
  "Comprender cómo funcionan cosas o sistemas",
  "Ayudar y acompañar personas",
  "Organizar proyectos o liderar actividades",
  "Investigar y descubrir información",
  "Aún no identifico una actividad así",
];

const prioritizationGuidedOptions = [
  "Elegiría lo que más curiosidad me genera",
  "Elegiría lo que puedo sostener por más tiempo",
  "Elegiría lo que me permite ayudar a otras personas",
  "Elegiría lo que tenga más oportunidades laborales",
  "Elegiría probar primero con una experiencia corta",
  "Me cuesta priorizar porque varias opciones me atraen",
  "Aún no puedo elegir una prioridad",
];

const unsureOpenOptions = [
  "Nunca lo he explorado",
  "Me interesan varias cosas",
  "Me cuesta imaginarlo",
  "Depende del contexto",
];

const CONTROL_FORCED_CHOICE_OPTIONS: NonNullable<Question["forcedChoiceOptions"]> = [
  {
    id: "unknown",
    text: "No sé todavía",
    dimension: "incertidumbre",
    semanticFocus: ["vocational-uncertainty", "future-clarity"],
    isUnknown: true,
  },
  {
    id: "write-own-answer",
    text: "Prefiero escribir mi respuesta",
    dimension: "incertidumbre",
    semanticFocus: ["identity-clarity", "future-clarity"],
    opensTextInput: true,
  },
];

export const activeQuestions: Question[] = [
  { id: 1, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría trabajar con objetos, materiales, herramientas, equipos o instrumentos para realizar tareas físicas o técnicas?", dimension: "realista", stage: "exploracion", semanticFocus: ["hands-on-building", "technical-manipulation", "physical-material-work"] },
  { id: 2, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría investigar causas, comparar evidencias y analizar información para explicar una situación?", dimension: "investigativo", stage: "exploracion", semanticFocus: ["scientific-analysis", "causal-reasoning", "evidence-based-reasoning"] },
  { id: 3, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría expresar ideas mediante recursos creativos, visuales o de diseño?", dimension: "artistico", stage: "exploracion", semanticFocus: ["expressive-creativity", "visual-spatial-creativity", "applied-design"] },
  { id: 4, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría trabajar con personas para escucharlas, orientarlas o acompañarlas en una situación importante?", dimension: "social", stage: "exploracion", semanticFocus: ["emotional-support", "interpersonal-care", "teaching-guidance"] },
  { id: 5, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría tomar iniciativa para impulsar una propuesta o coordinar acciones hacia una meta?", dimension: "emprendedor", stage: "exploracion", semanticFocus: ["initiative-taking", "coordination-leadership"] },
  { id: 6, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría ordenar información, revisar datos y seguir procedimientos con precisión?", dimension: "convencional", stage: "exploracion", semanticFocus: ["organization-structure", "precision-following", "information-management"] },
  { id: 13, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando tengo que resolver una tarea, ¿con qué frecuencia busco una forma nueva o diferente de hacerla?", dimension: "apertura", stage: "exploracion", semanticFocus: ["novelty-seeking", "cognitive-flexibility", "exploratory-curiosity"] },
  { id: 14, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando una actividad me interesa, ¿con qué frecuencia siento curiosidad por explorar más allá de lo básico?", dimension: "apertura", stage: "exploracion", semanticFocus: ["exploratory-curiosity", "self-directed-learning"] },
  { id: 15, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando tengo una tarea importante, ¿con qué frecuencia organizo mis pasos para terminarla a tiempo?", dimension: "responsabilidad", stage: "exploracion", semanticFocus: ["planning-organization", "task-persistence", "self-discipline"] },
  { id: 16, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando una tarea requiere cuidado, ¿con qué frecuencia mantengo la atención hasta completarla correctamente?", dimension: "responsabilidad", stage: "exploracion", semanticFocus: ["task-persistence", "precision-following"] },
  { id: 17, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando estoy en un grupo, ¿con qué frecuencia participo de manera visible?", dimension: "extraversion", stage: "exploracion", semanticFocus: ["social-assertiveness", "public-participation"] },
  { id: 19, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando hay desacuerdos, ¿con qué frecuencia intento comprender el punto de vista de los demás antes de responder?", dimension: "amabilidad", stage: "exploracion", semanticFocus: ["perspective-taking", "cooperative-attitude", "conflict-cooperation"] },
  { id: 21, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando debo tomar una decisión importante, ¿con qué frecuencia me preocupa equivocarme?", dimension: "neuroticismo", stage: "exploracion", semanticFocus: ["decision-anxiety", "anticipatory-worry"] },
  { id: 23, kind: "likert", model: "Contexto", scaleType: "intensity", promptStyle: "reflective", text: "¿Qué tanto sientes que todavía te falta claridad para reconocer qué tipo de vida profesional quieres construir?", dimension: "incertidumbre", stage: "contexto", semanticFocus: ["vocational-uncertainty", "future-clarity", "identity-clarity"], optionalComment: true },
  { id: 24, kind: "likert", model: "Contexto", scaleType: "intensity", promptStyle: "reflective", text: "¿Qué tanto sientes que las expectativas externas influyen en tu decisión vocacional?", dimension: "presion", stage: "contexto", semanticFocus: ["external-pressure", "economic-social-expectations"], optionalComment: true },
  { id: 25, kind: "likert", model: "Contexto", scaleType: "intensity", promptStyle: "reflective", text: "¿Qué tanto te preocupa que tu elección no sea aceptada o valorada por tu entorno?", dimension: "presion", stage: "contexto", semanticFocus: ["social-acceptance-concern", "external-pressure"], optionalComment: true },
  { id: 26, kind: "likert", model: "Contexto", scaleType: "intensity", promptStyle: "situational", text: "Cuando una actividad se vuelve difícil, ¿qué tanto estás dispuesto a seguir intentando antes de abandonarla?", dimension: "tolerancia", stage: "contexto", semanticFocus: ["difficulty-tolerance", "adaptive-coping"], optionalComment: true },

  { id: 7, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría probar, ajustar o mejorar objetos, herramientas o sistemas físicos para que funcionen mejor?", dimension: "realista", stage: "profundizacion", semanticFocus: ["practical-testing", "technical-manipulation", "physical-material-work"] },
  { id: 8, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría analizar información confiable para comprender patrones, causas o relaciones entre hechos?", dimension: "investigativo", stage: "profundizacion", semanticFocus: ["pattern-analysis", "causal-reasoning", "evidence-based-reasoning"] },
  { id: 9, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría crear propuestas visuales, expresivas o comunicativas con una intención clara?", dimension: "artistico", stage: "profundizacion", semanticFocus: ["applied-design", "expressive-creativity", "conceptual-creation"] },
  { id: 10, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría interactuar directamente con personas para explicar, comprender sus necesidades o brindar apoyo?", dimension: "social", stage: "profundizacion", semanticFocus: ["interpersonal-care", "teaching-guidance", "emotional-support"] },
  { id: 11, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría asumir un rol activo para defender una idea, organizar personas o hacer avanzar un proyecto?", dimension: "emprendedor", stage: "profundizacion", semanticFocus: ["initiative-taking", "coordination-leadership", "persuasion-influence"] },
  { id: 12, kind: "likert", model: "RIASEC", scaleType: "interest", promptStyle: "situational", text: "¿Qué tanto te interesaría realizar tareas que requieran registro, control, verificación y seguimiento de pasos?", dimension: "convencional", stage: "profundizacion", semanticFocus: ["information-management", "process-consistency", "precision-following"] },
  { id: 18, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando estoy con otras personas, ¿con qué frecuencia me siento cómodo iniciando conversaciones o participando activamente?", dimension: "extraversion", stage: "profundizacion", semanticFocus: ["social-initiative", "communication-confidence"] },
  { id: 20, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando alguien necesita apoyo, ¿con qué frecuencia intento apoyar sin imponer mi opinión?", dimension: "amabilidad", stage: "profundizacion", semanticFocus: ["interpersonal-care", "relationship-care", "cooperative-attitude"] },
  { id: 22, kind: "likert", model: "Big Five", scaleType: "frequency", promptStyle: "behavioral", text: "Cuando pienso en mi futuro, ¿con qué frecuencia siento miedo de elegir mal?", dimension: "neuroticismo", stage: "profundizacion", semanticFocus: ["risk-rumination", "vocational-uncertainty"] },

  {
    id: 101,
    kind: "open",
    promptStyle: "reflective",
    text: "Cuando piensas en tu futuro profesional, ¿cuál es la duda que aparece con más frecuencia?",
    stage: "contexto",
    trigger: "uncertainty",
    guidedOptions: uncertaintyGuidedOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "No lo tengo claro todavía.",
      "Me cuesta elegir entre varias opciones.",
      "Me preocupa equivocarme o arrepentirme.",
    ],
  },
  {
    id: 102,
    kind: "open",
    promptStyle: "reflective",
    text: "¿Existe alguna expectativa externa que esté influyendo en tu decisión?",
    stage: "contexto",
    trigger: "pressure",
    guidedOptions: pressureGuidedOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Siento presión por elegir algo rentable.",
      "Mi familia espera algo específico de mí.",
      "No sé si elijo por mí o por otros.",
    ],
  },
  {
    id: 103,
    kind: "open",
    promptStyle: "reflective",
    text: "Cuando algo que te importa se vuelve difícil, ¿qué suele pasarte?",
    stage: "contexto",
    trigger: "contradiction",
    guidedOptions: difficultyGuidedOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Me frustro rápido, pero no siempre abandono.",
      "Pido ayuda cuando ya no sé cómo avanzar.",
      "A veces pienso que si me cuesta, no es para mí.",
    ],
  },
  {
    id: 104,
    kind: "open",
    promptStyle: "reflective",
    text: "Describe una actividad que podrías explorar durante bastante tiempo porque te genera interés real.",
    stage: "contexto",
    trigger: "motivation",
    guidedOptions: motivationGuidedOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Todavía no identifico una actividad así.",
      "Me pasa con temas creativos o visuales.",
      "Me pasa cuando investigo o busco explicaciones.",
    ],
  },
  {
    id: 105,
    kind: "open",
    promptStyle: "reflective",
    text: "Aparecen varios intereses fuertes. Si tuvieras que priorizar uno para explorarlo durante varios meses, ¿cuál elegirías?",
    stage: "contexto",
    trigger: "prioritization",
    guidedOptions: prioritizationGuidedOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Elegiría la actividad que me hace perder la noción del tiempo.",
      "Elegiría una experiencia gratuita para probar si realmente me gusta.",
      "Me cuesta priorizar porque varias opciones me atraen por razones distintas.",
    ],
  },

  crearPreguntaEleccionForzada(201, "Si tuvieras que explorar una actividad práctica, ¿cuál elegirías primero?", "Diferenciación de rutas prácticas", [
    { id: "build-repair-assemble", text: "Construir, reparar o ensamblar objetos, equipos o estructuras.", dimension: "realista", semanticFocus: ["hands-on-building", "technical-manipulation"] },
    { id: "design-products-spaces", text: "Diseñar o mejorar espacios, productos, muebles o prototipos.", dimension: "realista", semanticFocus: ["applied-design", "visual-spatial-creativity"] },
    { id: "natural-resources", text: "Trabajar con plantas, animales, alimentos o recursos naturales.", dimension: "realista", semanticFocus: ["field-observation", "community-environment", "environmental-systems", "sustainability-impact"] },
    { id: "technical-tools", text: "Usar instrumentos, máquinas o herramientas técnicas.", dimension: "realista", semanticFocus: ["technical-manipulation", "practical-testing"] },
    { id: "physical-failures", text: "Revisar fallas en objetos, herramientas o equipos físicos.", dimension: "realista", semanticFocus: ["practical-testing", "learning-from-mistakes"] },
    { id: "none-practical", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "realista", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(202, "Cuando piensas en analizar información, ¿qué tipo de actividad te atrae más?", "Diferenciación de rutas investigativas", [
    { id: "numeric-patterns", text: "Analizar datos numéricos, patrones o tendencias.", dimension: "investigativo", semanticFocus: ["pattern-analysis", "information-management"] },
    { id: "scientific-causes", text: "Investigar causas científicas, técnicas o naturales.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "causal-reasoning"] },
    { id: "rules-cases", text: "Interpretar normas, argumentos o casos.", dimension: "investigativo", semanticFocus: ["evidence-based-reasoning", "precision-following"] },
    { id: "human-social-problems", text: "Comprender conductas, emociones o problemas sociales.", dimension: "investigativo", semanticFocus: ["perspective-taking", "emotional-support"] },
    { id: "laboratory-evidence", text: "Analizar muestras, evidencias o resultados de laboratorio.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"] },
    { id: "health-diagnosis", text: "Comprender diagnósticos o situaciones vinculadas con salud y bienestar.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "interpersonal-care"] },
    { id: "none-analysis", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "investigativo", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(203, "Cuando piensas en actividades creativas, ¿cuál te atrae más?", "Diferenciación de rutas creativas", [
    { id: "visual-graphic", text: "Diseñar piezas visuales, marcas o contenido gráfico.", dimension: "artistico", semanticFocus: ["graphic-visual-communication", "applied-design"] },
    { id: "narrative-content", text: "Crear historias, textos, videos, música o contenido narrativo.", dimension: "artistico", semanticFocus: ["expressive-creativity", "conceptual-creation"] },
    { id: "functional-spaces-objects", text: "Diseñar espacios, ambientes, interiores u objetos funcionales.", dimension: "artistico", semanticFocus: ["spatial-organization", "applied-design"] },
    { id: "communicative-solutions", text: "Crear soluciones comunicativas para informar, enseñar o persuadir.", dimension: "artistico", semanticFocus: ["communication-confidence", "teaching-guidance"] },
    { id: "innovative-need", text: "Crear propuestas innovadoras para resolver una necesidad concreta.", dimension: "artistico", semanticFocus: ["conceptual-creation", "decision-making"] },
    { id: "none-creative", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "artistico", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(204, "Cuando piensas en trabajar con personas, ¿qué tipo de interacción te atrae más?", "Ayuda, educación, salud, comunidad y mediación", [
    { id: "teach-explain", text: "Enseñar o explicar temas para facilitar el aprendizaje.", dimension: "social", semanticFocus: ["teaching-guidance", "communication-confidence"] },
    { id: "personal-support", text: "Escuchar, orientar o acompañar procesos personales.", dimension: "social", semanticFocus: ["emotional-support", "interpersonal-care"] },
    { id: "health-care-support", text: "Cuidar o atender necesidades de salud y bienestar.", dimension: "social", semanticFocus: ["interpersonal-care", "relationship-care"] },
    { id: "community-intervention", text: "Intervenir en problemas sociales o comunitarios.", dimension: "social", semanticFocus: ["community-environment", "collaborative-help"] },
    { id: "conflict-mediation", text: "Mediar conflictos o buscar acuerdos justos.", dimension: "social", semanticFocus: ["conflict-cooperation", "perspective-taking"] },
    { id: "none-social-help", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "social", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(205, "Cuando piensas en liderar o tomar iniciativa, ¿qué tipo de actividad te atrae más?", "Emprendimiento, dirección, negociación e instituciones", [
    { id: "business-selling", text: "Emprender un negocio o vender una propuesta.", dimension: "emprendedor", semanticFocus: ["initiative-taking", "persuasion-influence"] },
    { id: "team-direction", text: "Dirigir un equipo o coordinar un proyecto.", dimension: "emprendedor", semanticFocus: ["coordination-leadership", "decision-making"] },
    { id: "argument-negotiate", text: "Defender una idea, argumentar o negociar.", dimension: "emprendedor", semanticFocus: ["persuasion-influence", "decision-making"] },
    { id: "public-decisions", text: "Participar en decisiones públicas, sociales o institucionales.", dimension: "emprendedor", semanticFocus: ["decision-making", "perspective-taking"] },
    { id: "common-goal", text: "Organizar actividades para lograr una meta común.", dimension: "emprendedor", semanticFocus: ["coordination-leadership", "organization-structure"] },
    { id: "none-initiative", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "emprendedor", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(206, "Cuando piensas en tareas ordenadas o estructuradas, ¿qué tipo de actividad te atrae más?", "Administración, finanzas, procedimientos y procesos", [
    { id: "record-classify", text: "Registrar, clasificar o archivar información.", dimension: "convencional", semanticFocus: ["information-management", "organization-structure"] },
    { id: "review-accounts", text: "Revisar datos, cuentas, pagos o documentos.", dimension: "convencional", semanticFocus: ["precision-following", "information-management"] },
    { id: "admin-legal-procedures", text: "Seguir procedimientos administrativos o legales.", dimension: "convencional", semanticFocus: ["process-consistency", "precision-following"] },
    { id: "quality-control", text: "Controlar calidad, tiempos, recursos o procesos.", dimension: "convencional", semanticFocus: ["process-consistency", "organization-structure"] },
    { id: "decision-information", text: "Organizar información para tomar mejores decisiones.", dimension: "convencional", semanticFocus: ["information-management", "decision-making"] },
    { id: "none-structured", text: "Ninguna de estas opciones me atrae especialmente.", dimension: "convencional", semanticFocus: [] },
  ]),
  crearPreguntaEleccionForzada(301, "Entre diseñar espacios físicos y crear sistemas digitales, ¿qué actividad te atrae más explorar primero?", "Arquitectura vs Ingeniería de Sistemas", [
  { id: "architecture-space", text: "Diseñar espacios físicos considerando forma, función y experiencia de las personas.", dimension: "artistico", semanticFocus: ["visual-spatial-creativity", "spatial-organization", "applied-design"] },
  { id: "systems-software", text: "Crear soluciones digitales, sistemas o aplicaciones mediante programación o lógica computacional.", dimension: "investigativo", semanticFocus: ["technical-manipulation", "abstract-reasoning", "practical-testing"] },
]),

crearPreguntaEleccionForzada(302, "Entre analizar datos y programar sistemas, ¿qué actividad te resulta más interesante?", "Ciencia de Datos vs Ingeniería de Sistemas", [
  { id: "data-science", text: "Analizar datos, encontrar patrones y convertir información en conclusiones.", dimension: "investigativo", semanticFocus: ["pattern-analysis", "information-management", "evidence-based-reasoning"] },
  { id: "software-automation", text: "Construir o programar sistemas que automaticen tareas o resuelvan necesidades.", dimension: "investigativo", semanticFocus: ["technical-manipulation", "abstract-reasoning", "practical-testing"] },
]),

crearPreguntaEleccionForzada(303, "Entre comunicar visualmente una idea y diseñar espacios u objetos funcionales, ¿qué opción te atrae más?", "Diseño Gráfico vs Diseño de Interiores / Diseño Industrial", [
  { id: "graphic-communication", text: "Crear piezas visuales o mensajes gráficos para comunicar una idea.", dimension: "artistico", semanticFocus: ["expressive-creativity", "conceptual-creation", "communication-confidence"] },
  { id: "interior-industrial-design", text: "Diseñar ambientes, interiores, objetos o espacios funcionales.", dimension: "artistico", semanticFocus: ["visual-spatial-creativity", "spatial-organization", "applied-design"] },
]),

crearPreguntaEleccionForzada(304, "Entre comprender emociones personales y enseñar temas a otras personas, ¿qué actividad te atrae más?", "Psicología vs Educación", [
  { id: "psychology-support", text: "Comprender emociones, conductas y conflictos personales.", dimension: "social", semanticFocus: ["emotional-support", "interpersonal-care", "relationship-care"] },
  { id: "education-teaching", text: "Enseñar, explicar temas y acompañar procesos de aprendizaje.", dimension: "social", semanticFocus: ["teaching-guidance", "collaborative-help", "communication-confidence"] },
]),

crearPreguntaEleccionForzada(305, "Entre interpretar normas para defender argumentos y dirigir proyectos comerciales, ¿qué opción te interesa más?", "Derecho vs Negocios", [
  { id: "law-argument", text: "Interpretar normas, defender argumentos y buscar soluciones justas.", dimension: "emprendedor", semanticFocus: ["persuasion-influence", "precision-following", "evidence-based-reasoning"] },
  { id: "business-leadership", text: "Desarrollar o dirigir proyectos comerciales para lograr objetivos.", dimension: "emprendedor", semanticFocus: ["decision-making", "initiative-taking", "coordination-leadership"] },
]),

crearPreguntaEleccionForzada(306, "Entre ordenar información administrativa y mejorar procesos de producción, ¿qué actividad te atrae más?", "Administración / Finanzas vs Ingeniería Industrial", [
  { id: "administration-finance", text: "Ordenar documentos, datos, pagos, registros o procedimientos administrativos.", dimension: "convencional", semanticFocus: ["information-management", "precision-following", "organization-structure"] },
  { id: "industrial-processes", text: "Mejorar procesos, tiempos, recursos o formas de producción.", dimension: "convencional", semanticFocus: ["process-consistency", "practical-testing", "organization-structure"] },
]),

crearPreguntaEleccionForzada(307, "Entre atender directamente a personas y analizar evidencias en laboratorio, ¿qué foco te atrae más?", "Salud asistencial vs Salud / Laboratorio", [
  { id: "health-care", text: "Atender directamente a personas en temas de salud o bienestar.", dimension: "social", semanticFocus: ["interpersonal-care", "emotional-support", "collaborative-help"] },
  { id: "health-laboratory", text: "Investigar, analizar muestras, revisar evidencias o trabajar en laboratorio.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "precision-following", "evidence-based-reasoning"] },
]),

crearPreguntaEleccionForzada(308, "Entre investigar problemas sociales e intervenir directamente con personas o grupos, ¿qué actividad elegirías?", "Ciencias Sociales / Investigación vs Trabajo Social", [
  { id: "social-research", text: "Investigar problemas sociales, culturales o comunitarios.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "perspective-taking", "community-environment"] },
  { id: "social-work", text: "Intervenir directamente con personas o grupos en situación de necesidad.", dimension: "social", semanticFocus: ["interpersonal-care", "collaborative-help", "community-environment"] },
]),
crearPreguntaEleccionForzada(
  309,
  "Tus respuestas muestran interés en más de un área. Si tuvieras que probar una sola experiencia corta primero, ¿cuál elegirías?",
  "Desempate de intereses amplios",
  [
    {
      id: "broad-education-orientation",
      text: "Enseñar, orientar o facilitar el aprendizaje de otras personas.",
      dimension: "social",
      semanticFocus: ["teaching-guidance", "communication-confidence", "collaborative-help"],
      nextQuestionId: 401,
      careerRouteIds: [
        "educacion",
        "psicologia",
        "comunicacion-educativa",
        "gestion-proyectos-educativos",
      ],
    },
    {
      id: "broad-health-wellbeing",
      text: "Explorar salud, bienestar o prevención.",
      dimension: "social",
      semanticFocus: ["interpersonal-care", "scientific-analysis", "teaching-guidance"],
      nextQuestionId: 404,
      careerRouteIds: [
        "enfermeria",
        "psicologia",
        "nutricion",
        "laboratorio-clinico",
        "salud-publica",
      ],
    },
    {
      id: "broad-environment-natural-resources",
      text: "Trabajar con recursos naturales, ambiente, plantas o animales.",
      dimension: "realista",
      semanticFocus: [
        "field-observation",
        "community-environment",
        "environmental-systems",
        "sustainability-impact",
      ],
      nextQuestionId: 406,
      careerRouteIds: [
        "ingenieria-ambiental",
        "gestion-ambiental",
        "veterinaria",
        "agronomia",
      ],
    },
    {
      id: "broad-graphic-communication",
      text: "Crear piezas visuales, marcas o contenido gráfico.",
      dimension: "artistico",
      semanticFocus: ["graphic-visual-communication", "applied-design", "communication-confidence"],
      nextQuestionId: 402,
      careerRouteIds: [
        "diseno-grafico",
        "comunicacion-audiovisual",
        "marketing-ventas",
      ],
    },
    {
      id: "broad-project-management",
      text: "Organizar actividades, coordinar personas o liderar proyectos.",
      dimension: "emprendedor",
      semanticFocus: ["coordination-leadership", "decision-making", "organization-structure"],
      nextQuestionId: 405,
      careerRouteIds: [
        "administracion",
        "ingenieria-industrial",
        "marketing-ventas",
        "derecho",
      ],
    },
    {
      id: "broad-data-research",
      text: "Analizar información, datos o evidencias para encontrar patrones y conclusiones.",
      dimension: "investigativo",
      semanticFocus: ["pattern-analysis", "evidence-based-reasoning", "information-management"],
      nextQuestionId: 403,
      careerRouteIds: [
        "ciencia-datos",
        "ingenieria-sistemas",
        "laboratorio-clinico",
        "investigacion-social",
      ],
    },
    {
      id: "broad-admin-finance",
      text: "Ordenar procesos, registros, presupuestos o información para tomar mejores decisiones.",
      dimension: "convencional",
      semanticFocus: ["information-management", "precision-following", "organization-structure"],
      nextQuestionId: 405,
      careerRouteIds: [
        "administracion",
        "contabilidad-finanzas",
        "ingenieria-industrial",
      ],
    },
  ],
),
  crearPreguntaEleccionForzada(319, "Si te interesa el ambiente, ¿qué forma de trabajo te atrae más?", "Ingeniería Ambiental vs Gestión Ambiental", [
    { id: "environmental-engineering", text: "Analizar problemas ambientales y proponer soluciones técnicas o científicas.", dimension: "investigativo", semanticFocus: ["environmental-systems", "sustainability-impact", "scientific-analysis", "practical-testing"] },
    { id: "environmental-management", text: "Coordinar proyectos, normas o acciones con personas para generar impacto ambiental.", dimension: "emprendedor", semanticFocus: ["sustainability-impact", "community-environment", "coordination-leadership", "decision-making"] },
  ]),
  crearPreguntaEleccionForzada(310, "Si te interesa investigar, ¿qué escenario te atrae más?", "Laboratorio vs Ciencia de Datos", [
    { id: "laboratory-science", text: "Trabajar con muestras, pruebas, protocolos o resultados de laboratorio.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"] },
    { id: "science-data-analysis", text: "Analizar bases de datos, patrones, tendencias o información para obtener conclusiones.", dimension: "investigativo", semanticFocus: ["pattern-analysis", "information-management", "evidence-based-reasoning"] },
  ]),
  crearPreguntaEleccionForzada(311, "Si quieres ayudar a personas, ¿qué tipo de ayuda te interesa más?", "Psicología vs Trabajo Social", [
    { id: "psychology-human-support", text: "Escuchar y comprender emociones, conductas o conflictos personales.", dimension: "social", semanticFocus: ["emotional-support", "interpersonal-care", "relationship-care"] },
    { id: "social-work-community-development", text: "Acompañar a personas o comunidades para mejorar condiciones sociales concretas.", dimension: "social", semanticFocus: ["collaborative-help", "community-environment", "interpersonal-care"] },
  ]),
  crearPreguntaEleccionForzada(312, "Si te interesa trabajar con personas o grupos, ¿qué actividad elegirías?", "Educación vs Intervención Comunitaria", [
    { id: "education-teaching", text: "Enseñar, explicar y acompañar procesos de aprendizaje.", dimension: "social", semanticFocus: ["teaching-guidance", "communication-confidence", "collaborative-help"] },
    { id: "community-development", text: "Organizar acciones de apoyo o intervención para resolver necesidades comunitarias.", dimension: "social", semanticFocus: ["community-environment", "collaborative-help", "coordination-leadership"] },
  ]),
  crearPreguntaEleccionForzada(313, "Si te interesan normas, sociedad o decisiones públicas, ¿qué opción te atrae más?", "Derecho vs Políticas Públicas / Ciencias Sociales", [
    { id: "derecho-ciencias-juridicas", text: "Interpretar normas, analizar casos y defender argumentos jurídicos.", dimension: "convencional", semanticFocus: ["precision-following", "evidence-based-reasoning", "persuasion-influence"] },
    { id: "public-policy-social-analysis", text: "Analizar problemas públicos, instituciones o decisiones sociales desde evidencia y contexto.", dimension: "investigativo", semanticFocus: ["evidence-based-reasoning", "decision-making", "perspective-taking"] },
  ]),
  crearPreguntaEleccionForzada(314, "Si te atrae el diseño, ¿qué tipo de resultado preferirías crear?", "Arquitectura / Espacios vs Diseño Gráfico", [
    { id: "architecture-spatial-design", text: "Espacios físicos, ambientes o distribuciones funcionales para personas.", dimension: "artistico", semanticFocus: ["spatial-organization", "visual-spatial-creativity", "applied-design"] },
    { id: "graphic-design", text: "Piezas visuales, marcas o mensajes gráficos para comunicar ideas.", dimension: "artistico", semanticFocus: ["graphic-visual-communication", "conceptual-creation", "communication-confidence"] },
  ]),
  crearPreguntaEleccionForzada(315, "Si te interesa la tecnología, ¿qué parte te llama más la atención?", "Software vs Tecnología Física / Mecatrónica", [
    { id: "systems-software", text: "Programar aplicaciones, sistemas digitales o automatizaciones con lógica computacional.", dimension: "investigativo", semanticFocus: ["abstract-reasoning", "technical-manipulation", "practical-testing"] },
    { id: "mechatronics-applied-technology", text: "Probar dispositivos, mecanismos, equipos, sensores o soluciones físicas automatizadas.", dimension: "realista", semanticFocus: ["hands-on-building", "technical-manipulation", "practical-testing"] },
  ]),
  crearPreguntaEleccionForzada(316, "Si te atrae comunicar ideas, ¿qué formato te interesa más?", "Humanidades / Escritura vs Comunicación Audiovisual", [
    { id: "literature-writing-cultural-studies", text: "Leer, escribir, interpretar ideas, cultura o textos con profundidad.", dimension: "artistico", semanticFocus: ["expressive-creativity", "conceptual-creation", "evidence-based-reasoning"] },
    { id: "communication-audiovisual", text: "Crear videos, campañas, historias o contenidos para audiencias.", dimension: "artistico", semanticFocus: ["expressive-creativity", "communication-confidence", "conceptual-creation"] },
  ]),
  crearPreguntaEleccionForzada(317, "Si te interesa salud o seres vivos, ¿qué foco te atrae más?", "Salud Humana vs Veterinaria / Salud Animal", [
    { id: "nutrition-health-wellbeing", text: "Promover salud, alimentación, hábitos o bienestar en personas.", dimension: "social", semanticFocus: ["interpersonal-care", "evidence-based-reasoning", "teaching-guidance"] },
    { id: "veterinary-animal-health", text: "Cuidar, observar o diagnosticar animales desde biología y salud aplicada.", dimension: "investigativo", semanticFocus: ["scientific-analysis", "interpersonal-care", "practical-testing"] },
  ]),
  crearPreguntaEleccionForzada(318, "Si te atraen proyectos y organización, ¿qué parte te interesa más?", "Administración / Finanzas vs Negocios", [
    { id: "administrative-finance", text: "Controlar registros, presupuestos, documentos, pagos o procesos internos.", dimension: "convencional", semanticFocus: ["information-management", "precision-following", "organization-structure"] },
    { id: "business-project-management", text: "Impulsar proyectos, vender propuestas, negociar o liderar equipos hacia una meta.", dimension: "emprendedor", semanticFocus: ["initiative-taking", "persuasion-influence", "coordination-leadership"] },
  ]),

  crearPreguntaEleccionForzada(
  401,
  "Elegiste una experiencia relacionada con enseñar, orientar o facilitar aprendizaje. ¿Qué actividad te atrae más?",
  "Desglose de educación, orientación y apoyo humano",
  [
    {
      id: "education-school-teaching",
      text: "Explicar temas a estudiantes y acompañar su aprendizaje.",
      dimension: "social",
      semanticFocus: ["teaching-guidance", "communication-confidence"],
      careerRouteIds: ["educacion"],
    },
    {
      id: "educational-psychology-orientation",
      text: "Orientar a alguien que no sabe qué decisión tomar o necesita acompañamiento.",
      dimension: "social",
      semanticFocus: ["emotional-support", "teaching-guidance", "interpersonal-care"],
      careerRouteIds: ["psicologia", "orientacion-vocacional"],
    },
    {
      id: "educational-content-design",
      text: "Crear materiales educativos, guías, recursos o contenido para aprender mejor.",
      dimension: "artistico",
      semanticFocus: ["applied-design", "teaching-guidance", "graphic-visual-communication"],
      careerRouteIds: ["comunicacion-educativa", "diseno-instruccional"],
    },
    {
      id: "training-groups",
      text: "Capacitar grupos, dirigir talleres o facilitar actividades formativas.",
      dimension: "emprendedor",
      semanticFocus: ["coordination-leadership", "teaching-guidance", "communication-confidence"],
      careerRouteIds: ["gestion-humana", "educacion-corporativa"],
    },
    {
      id: "educational-technology",
      text: "Usar tecnología para enseñar mejor o crear experiencias de aprendizaje digitales.",
      dimension: "investigativo",
      semanticFocus: ["technical-manipulation", "teaching-guidance", "applied-design"],
      careerRouteIds: ["tecnologia-educativa", "ingenieria-sistemas"],
    },
  ],
),

crearPreguntaEleccionForzada(
  402,
  "Elegiste una experiencia relacionada con comunicación o diseño. ¿Qué forma de comunicar te atrae más?",
  "Desglose de comunicación, diseño y contenidos",
  [
    {
      id: "graphic-visual-design",
      text: "Diseñar piezas visuales, marcas, afiches, logos o contenido gráfico.",
      dimension: "artistico",
      semanticFocus: ["graphic-visual-communication", "applied-design"],
      careerRouteIds: ["diseno-grafico"],
    },
    {
      id: "audiovisual-production",
      text: "Crear videos, guiones, historias o contenido audiovisual.",
      dimension: "artistico",
      semanticFocus: ["expressive-creativity", "communication-confidence", "conceptual-creation"],
      careerRouteIds: ["comunicacion-audiovisual"],
    },
    {
      id: "journalism-public-information",
      text: "Investigar hechos, entrevistar personas y comunicar información al público.",
      dimension: "investigativo",
      semanticFocus: ["evidence-based-reasoning", "communication-confidence", "perspective-taking"],
      careerRouteIds: ["periodismo-comunicacion-publica"],
    },
    {
      id: "educational-communication",
      text: "Crear contenido para enseñar, explicar o hacer más comprensible una idea.",
      dimension: "social",
      semanticFocus: ["teaching-guidance", "communication-confidence", "applied-design"],
      careerRouteIds: ["comunicacion-educativa", "educacion"],
    },
    {
      id: "marketing-creative",
      text: "Comunicar ideas para persuadir, promocionar o posicionar una propuesta.",
      dimension: "emprendedor",
      semanticFocus: ["persuasion-influence", "communication-confidence", "conceptual-creation"],
      careerRouteIds: ["marketing-ventas", "publicidad"],
    },
  ],
),

crearPreguntaEleccionForzada(
  403,
  "Elegiste una experiencia relacionada con análisis, datos o investigación. ¿Qué actividad te atrae más?",
  "Desglose de análisis, investigación y tecnología",
  [
    {
      id: "data-analysis",
      text: "Analizar datos, encontrar patrones y convertir información en conclusiones.",
      dimension: "investigativo",
      semanticFocus: ["pattern-analysis", "information-management", "evidence-based-reasoning"],
      careerRouteIds: ["ciencia-datos"],
    },
    {
      id: "software-systems",
      text: "Programar aplicaciones, sistemas o soluciones digitales.",
      dimension: "investigativo",
      semanticFocus: ["abstract-reasoning", "technical-manipulation", "practical-testing"],
      careerRouteIds: ["ingenieria-sistemas"],
    },
    {
      id: "laboratory-analysis",
      text: "Trabajar con muestras, pruebas, protocolos o resultados de laboratorio.",
      dimension: "investigativo",
      semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"],
      careerRouteIds: ["laboratorio-clinico"],
    },
    {
      id: "social-research",
      text: "Investigar problemas sociales, humanos o comunitarios.",
      dimension: "investigativo",
      semanticFocus: ["perspective-taking", "evidence-based-reasoning", "community-environment"],
      careerRouteIds: ["investigacion-social", "ciencias-sociales"],
    },
    {
      id: "process-analysis",
      text: "Analizar procesos para mejorar eficiencia, orden o resultados.",
      dimension: "convencional",
      semanticFocus: ["process-consistency", "organization-structure", "information-management"],
      careerRouteIds: ["ingenieria-industrial", "administracion"],
    },
  ],
),

crearPreguntaEleccionForzada(
  404,
  "Elegiste una experiencia relacionada con salud o bienestar. ¿Qué tipo de actividad te atrae más?",
  "Desglose de salud, bienestar y apoyo humano",
  [
    {
      id: "direct-patient-care",
      text: "Cuidar directamente a pacientes y seguir procedimientos de atención.",
      dimension: "social",
      semanticFocus: ["interpersonal-care", "relationship-care", "precision-following"],
      careerRouteIds: ["enfermeria"],
    },
    {
      id: "health-prevention-guidance",
      text: "Orientar sobre hábitos, prevención, nutrición o bienestar.",
      dimension: "social",
      semanticFocus: ["teaching-guidance", "interpersonal-care", "evidence-based-reasoning"],
      careerRouteIds: ["nutricion", "salud-publica"],
    },
    {
      id: "emotional-support",
      text: "Escuchar y acompañar emocionalmente a personas.",
      dimension: "social",
      semanticFocus: ["emotional-support", "interpersonal-care", "relationship-care"],
      careerRouteIds: ["psicologia"],
    },
    {
      id: "clinical-lab",
      text: "Analizar muestras, resultados o evidencias en un entorno controlado.",
      dimension: "investigativo",
      semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"],
      careerRouteIds: ["laboratorio-clinico"],
    },
    {
      id: "health-research",
      text: "Investigar temas de salud, enfermedad, prevención o calidad de vida.",
      dimension: "investigativo",
      semanticFocus: ["scientific-analysis", "evidence-based-reasoning", "interpersonal-care"],
      careerRouteIds: ["investigacion-salud"],
    },
  ],
),

crearPreguntaEleccionForzada(
  405,
  "Elegiste una experiencia relacionada con organización, gestión o liderazgo. ¿Qué actividad te atrae más?",
  "Desglose de administración, negocios, proyectos y procesos",
  [
    {
      id: "admin-processes",
      text: "Organizar recursos, procesos, documentos o actividades internas.",
      dimension: "convencional",
      semanticFocus: ["organization-structure", "process-consistency", "information-management"],
      careerRouteIds: ["administracion"],
    },
    {
      id: "finance-control",
      text: "Analizar dinero, costos, presupuestos, cuentas o reportes financieros.",
      dimension: "convencional",
      semanticFocus: ["precision-following", "information-management", "process-consistency"],
      careerRouteIds: ["contabilidad-finanzas"],
    },
    {
      id: "team-project-management",
      text: "Coordinar personas, equipos o proyectos para alcanzar una meta.",
      dimension: "emprendedor",
      semanticFocus: ["coordination-leadership", "decision-making", "organization-structure"],
      careerRouteIds: ["administracion", "gestion-proyectos"],
    },
    {
      id: "sales-negotiation",
      text: "Vender, negociar, persuadir o presentar propuestas a otras personas.",
      dimension: "emprendedor",
      semanticFocus: ["persuasion-influence", "communication-confidence", "initiative-taking"],
      careerRouteIds: ["marketing-ventas", "negocios"],
    },
    {
      id: "industrial-improvement",
      text: "Mejorar procesos, operaciones, tiempos o calidad de un sistema de trabajo.",
      dimension: "convencional",
      semanticFocus: ["process-consistency", "practical-testing", "organization-structure"],
      careerRouteIds: ["ingenieria-industrial"],
    },
  ],
),

crearPreguntaEleccionForzada(
  406,
  "Elegiste una experiencia relacionada con ambiente, recursos naturales, plantas o animales. ¿Qué actividad te atrae más?",
  "Desglose de ambiente, recursos naturales y seres vivos",
  [
    {
      id: "environmental-engineering-focus",
      text: "Analizar problemas ambientales y proponer soluciones técnicas.",
      dimension: "investigativo",
      semanticFocus: ["environmental-systems", "scientific-analysis", "practical-testing"],
      careerRouteIds: ["ingenieria-ambiental"],
    },
    {
      id: "environmental-management-focus",
      text: "Coordinar proyectos, normas o acciones para generar impacto ambiental.",
      dimension: "emprendedor",
      semanticFocus: ["sustainability-impact", "coordination-leadership", "community-environment"],
      careerRouteIds: ["gestion-ambiental"],
    },
    {
      id: "animal-health-focus",
      text: "Cuidar, observar o diagnosticar animales desde biología y salud aplicada.",
      dimension: "investigativo",
      semanticFocus: ["scientific-analysis", "interpersonal-care", "practical-testing"],
      careerRouteIds: ["veterinaria"],
    },
    {
      id: "agro-natural-resources",
      text: "Trabajar con plantas, alimentos, producción o recursos naturales.",
      dimension: "realista",
      semanticFocus: ["field-observation", "environmental-systems", "hands-on-building"],
      careerRouteIds: ["agronomia", "recursos-naturales"],
    },
  ],
),

crearPreguntaEleccionForzada(
  407,
  "Tus respuestas apuntan a tecnología o soluciones aplicadas. ¿Qué tipo de carrera te atrae más probar primero?",
  "Desglose de tecnología, ingeniería y soluciones aplicadas",
  [
    {
      id: "technology-software-systems",
      text: "Programar, automatizar o construir sistemas digitales.",
      dimension: "investigativo",
      semanticFocus: ["abstract-reasoning", "technical-manipulation", "practical-testing"],
      careerRouteIds: ["ingenieria-sistemas", "software", "tecnologias-informacion"],
    },
    {
      id: "technology-industrial-processes",
      text: "Mejorar procesos, operaciones, tiempos o calidad en una organización.",
      dimension: "convencional",
      semanticFocus: ["process-consistency", "organization-structure", "practical-testing"],
      careerRouteIds: ["ingenieria-industrial", "operaciones", "logistica"],
    },
    {
      id: "technology-physical-systems",
      text: "Probar equipos, sensores, mecanismos o soluciones físicas automatizadas.",
      dimension: "realista",
      semanticFocus: ["hands-on-building", "technical-manipulation", "practical-testing"],
      careerRouteIds: ["mecatronica", "electronica", "automatizacion"],
    },
    {
      id: "technology-spatial-design",
      text: "Diseñar espacios, estructuras o soluciones funcionales para personas.",
      dimension: "artistico",
      semanticFocus: ["spatial-organization", "visual-spatial-creativity", "applied-design"],
      careerRouteIds: ["arquitectura", "diseno-interiores", "diseno-industrial"],
    },
    {
      id: "technology-maintenance-field",
      text: "Instalar, reparar o mantener sistemas técnicos en campo.",
      dimension: "realista",
      semanticFocus: ["technical-manipulation", "physical-material-work", "precision-following"],
      careerRouteIds: ["electricidad-mantenimiento", "soporte-tecnico", "tecnologia-industrial"],
    },
  ],
),
];

export const questions: Question[] = activeQuestions;
export function obtenerTipoVisiblePregunta(question: Question) {
  if (question.kind === "likert") return "Escala";

  if (question.scaleType === "forced_choice") {
    return "Selección adaptativa";
  }

  return "Abierta";
}

export function obtenerDimensionVisiblePregunta(question: Question) {
  if (question.dimension) {
    return dimensionLabels[question.dimension];
  }

  if (question.id >= 101 && question.id <= 105) {
    const labels: Record<number, string> = {
      101: "Incertidumbre vocacional",
      102: "Presión externa",
      103: "Tolerancia a la dificultad",
      104: "Interés intrínseco",
      105: "Priorización vocacional",
    };

    return labels[question.id] ?? "Contexto vocacional";
  }

  if (question.id >= 201 && question.id <= 206) {
    return "Profundización RIASEC";
  }

  if (question.id >= 301 && question.id <= 309) {
    return "Desempate vocacional";
  }

  if (question.id >= 310 && question.id <= 319) {
    return "Afinamiento de subruta";
  }

  if (question.id >= 401 && question.id <= 407) {
    return "Desglose de carrera probable";
  }

  return question.contrastLabel ?? "Sin categoría";
}

function crearPreguntaEleccionForzada(
  id: number,
  text: string,
  contrastLabel: string,
  forcedChoiceOptions: NonNullable<Question["forcedChoiceOptions"]>,
): Question {
  const optionsWithControls = [
    ...forcedChoiceOptions,
    ...CONTROL_FORCED_CHOICE_OPTIONS,
  ];

  return {
    id,
    kind: "open",
    promptStyle: "situational",
    text,
    contrastLabel,
    stage: "contexto",
    trigger: "contrast",
    scaleType: "forced_choice",
    semanticFocus: forcedChoiceOptions.flatMap((option) => option.semanticFocus ?? []),
    guidedOptions: optionsWithControls.map((option) => option.text),
    forcedChoiceOptions: optionsWithControls,
    unsureOptions: [
      "Me interesan varias opciones",
      "Nunca he probado algo parecido",
      "Me cuesta imaginarme haciendo eso",
      "Depende del contexto",
      "Aún no puedo elegir",
    ],
    helperPrompts: forcedChoiceOptions.map((option) => option.text),
  };
}



export const profiles: Profile[] = [
  {
    id: "ingenieria-tecnologia",
    name: "Ingeniería, Tecnología y Sistemas",
    description: "Perfil asociado a resolver problemas técnicos, construir soluciones, analizar sistemas y aprender mediante experimentación práctica.",
    coreRiasec: ["realista", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    contextVariables: ["tolerancia"],
    // Ajuste clave: Ingeniería ya no debe ganar solo por tener investigativo alto.
    // Necesita señal realista/técnica o foco semántico de construcción, sistemas o prueba aplicada.
    dimensions: { realista: 1.15, investigativo: 1.05, convencional: 0.35, apertura: 0.55, responsabilidad: 0.75, tolerancia: 0.6 },
  },
  {
    id: "ciencia-datos-investigacion",
    name: "Ciencia, Datos e Investigación",
    description: "Perfil orientado a formular preguntas, analizar evidencia, interpretar patrones y construir conocimiento verificable.",
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    contextVariables: ["tolerancia"],
    // Más fuerte en análisis/evidencia que en ejecución técnica. Evita que ciencia/datos se confunda con sistemas.
    dimensions: { investigativo: 1.65, convencional: 0.55, apertura: 0.9, responsabilidad: 0.75, tolerancia: 0.45 },
  },
  {
    id: "salud-apoyo-humano",
    name: "Salud, Psicología y Apoyo Humano",
    description: "Perfil vinculado al cuidado, bienestar, acompañamiento, intervención y comprensión de necesidades humanas.",
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "extraversion", "responsabilidad"],
    contextVariables: ["tolerancia"],
    dimensions: { social: 1.45, investigativo: 0.75, amabilidad: 1.0, responsabilidad: 0.8, tolerancia: 0.45 },
  },
  {
    id: "educacion-ciencias-sociales",
    name: "Educación y Ciencias Sociales",
    description: "Perfil enfocado en aprendizaje, orientación, comunicación, trabajo comunitario y desarrollo de personas o grupos.",
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad"],
    contextVariables: [],
    dimensions: { social: 1.4, artistico: 0.35, investigativo: 0.25, extraversion: 0.65, amabilidad: 0.95, responsabilidad: 0.55 },
  },
  {
    id: "arte-comunicacion-diseno",
    name: "Arte, Comunicación y Diseño",
    description: "Perfil relacionado con creatividad, expresión, narrativa, medios, diseño, publicidad y producción de contenidos.",
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "extraversion"],
    contextVariables: ["tolerancia"],
    dimensions: { artistico: 1.55, apertura: 0.95, extraversion: 0.45, social: 0.25, tolerancia: 0.35 },
  },
  {
    id: "negocios-gestion",
    name: "Negocios, Gestión y Emprendimiento",
    description: "Perfil asociado a liderazgo, ventas, administración, estrategia, negociación y creación de proyectos.",
    coreRiasec: ["emprendedor"],
    supportBigFive: ["extraversion", "responsabilidad"],
    contextVariables: ["tolerancia"],
    // Menos peso convencional para no absorber Administración/Finanzas cuando no hay liderazgo o iniciativa.
    dimensions: { emprendedor: 1.55, convencional: 0.45, extraversion: 0.8, responsabilidad: 0.7, tolerancia: 0.35 },
  },
  {
    id: "administracion-finanzas",
    name: "Administración, Finanzas y Gestión Operativa",
    description: "Perfil orientado a orden, control, datos, procesos, recursos, operaciones y toma de decisiones estructuradas.",
    coreRiasec: ["convencional", "emprendedor"],
    supportBigFive: ["responsabilidad"],
    contextVariables: [],
    dimensions: { convencional: 1.55, emprendedor: 0.55, responsabilidad: 0.95, investigativo: 0.35, neuroticismo: -0.2 },
  },
];

export type ProfileCoherenceRule = {
  profileId: Profile["id"];
  description: string;
  requiredAnySemanticFocus: string[];
  weakIfOnlyDimensions?: Dimension[];
  competingProfileIds?: Profile["id"][];
};

// Reglas para que el motor no recomiende por puntaje bruto cuando la evidencia semántica no sostiene el perfil.
// Úsalas en el engine/scoring: si el perfil gana pero no cumple requiredAnySemanticFocus, baja confianza
// y muestra resultado híbrido/exploratorio en vez de una recomendación cerrada.
export const profileCoherenceRules: ProfileCoherenceRule[] = [
  {
    profileId: "ingenieria-tecnologia",
    description: "Ingeniería requiere señal técnica, construcción, software, sistemas físicos o pruebas aplicadas; no basta investigativo alto.",
    requiredAnySemanticFocus: ["technical-manipulation", "hands-on-building", "practical-testing", "abstract-reasoning", "physical-material-work"],
    weakIfOnlyDimensions: ["investigativo", "apertura"],
    competingProfileIds: ["ciencia-datos-investigacion", "administracion-finanzas", "arte-comunicacion-diseno"],
  },
  {
    profileId: "ciencia-datos-investigacion",
    description: "Ciencia/datos requiere análisis de evidencia, patrones o explicación causal; no basta curiosidad general.",
    requiredAnySemanticFocus: ["pattern-analysis", "scientific-analysis", "causal-reasoning", "evidence-based-reasoning", "information-management"],
    competingProfileIds: ["ingenieria-tecnologia", "salud-apoyo-humano", "educacion-ciencias-sociales"],
  },
  {
    profileId: "salud-apoyo-humano",
    description: "Salud/apoyo humano requiere cuidado, acompañamiento o bienestar; no debe ganar solo por social alto genérico.",
    requiredAnySemanticFocus: ["interpersonal-care", "emotional-support", "relationship-care", "scientific-analysis"],
    competingProfileIds: ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
  },
  {
    profileId: "educacion-ciencias-sociales",
    description: "Educación/sociales requiere enseñanza, comunidad o comprensión social; debe separarse de psicología y trabajo social.",
    requiredAnySemanticFocus: ["teaching-guidance", "collaborative-help", "community-environment", "perspective-taking"],
    competingProfileIds: ["salud-apoyo-humano", "arte-comunicacion-diseno"],
  },
  {
    profileId: "arte-comunicacion-diseno",
    description: "Arte/diseño requiere señal creativa concreta: visual, narrativa, espacial o comunicación aplicada.",
    requiredAnySemanticFocus: ["expressive-creativity", "graphic-visual-communication", "visual-spatial-creativity", "applied-design", "conceptual-creation", "spatial-organization"],
    competingProfileIds: ["ingenieria-tecnologia", "educacion-ciencias-sociales"],
  },
  {
    profileId: "negocios-gestion",
    description: "Negocios/gestión requiere iniciativa, liderazgo, persuasión o coordinación; no debe confundirse con orden administrativo.",
    requiredAnySemanticFocus: ["initiative-taking", "coordination-leadership", "persuasion-influence", "decision-making"],
    competingProfileIds: ["administracion-finanzas"],
  },
  {
    profileId: "administracion-finanzas",
    description: "Administración/finanzas requiere estructura, precisión, registros, datos o procesos; no basta liderazgo general.",
    requiredAnySemanticFocus: ["organization-structure", "precision-following", "process-consistency", "information-management"],
    competingProfileIds: ["negocios-gestion", "ingenieria-tecnologia"],
  },
];

export const contrastQuestionIdsByConflict: Record<string, number[]> = {
  "architecture-vs-systems": [301, 314],
  "data-vs-systems": [302, 310],
  "graphic-vs-spatial-design": [303, 314],
  "psychology-vs-education": [304, 311, 312],
  "law-vs-business": [305, 313],
  "admin-finance-vs-industrial": [306, 318],
  "health-care-vs-laboratory": [307, 310, 317],
  "social-research-vs-social-work": [308, 311],
  "environmental-engineering-vs-management": [319],
  "software-vs-mechatronics": [315],
  "humanities-vs-audiovisual": [316],
};

export const vocationalFamilies: VocationalFamilyMetadata[] = [
  {
    id: "engineering-technology-applied-solutions",
    name: "Ingeniería, Tecnología y Soluciones Aplicadas",
    description:
      "Familia amplia para intereses en construir, probar, optimizar o implementar soluciones técnicas y sistemas funcionales.",
    relatedProfileIds: ["ingenieria-tecnologia", "ciencia-datos-investigacion"],
    coreRiasec: ["realista", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: [
      "hands-on-building",
      "technical-manipulation",
      "practical-testing",
      "scientific-analysis",
    ],
  },
  {
    id: "science-research-analysis",
    name: "Ciencia, Investigación y Análisis",
    description:
      "Familia para intereses en explicar fenómenos, analizar evidencia, encontrar patrones y producir conocimiento verificable.",
    relatedProfileIds: ["ciencia-datos-investigacion"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: [
      "scientific-analysis",
      "pattern-analysis",
      "causal-reasoning",
      "evidence-based-reasoning",
    ],
  },
  {
    id: "design-architecture-visual-communication",
    name: "Diseño, Arquitectura y Comunicación Visual",
    description:
      "Familia para intereses en crear formas, espacios, experiencias visuales, piezas comunicativas o soluciones de diseño aplicado.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: [
      "graphic-visual-communication",
      "applied-design",
      "spatial-organization",
      "conceptual-creation",
    ],
  },
  {
    id: "environment-territory-applied-science",
    name: "Ambiente, Territorio y Ciencia Aplicada",
    description:
      "Familia candidata para intereses en ambiente, sostenibilidad, territorio, recursos naturales e impacto aplicado en comunidades.",
    relatedProfileIds: ["ingenieria-tecnologia", "ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "responsabilidad", "amabilidad"],
    semanticFocus: [
      "environmental-systems",
      "territorial-analysis",
      "field-observation",
      "sustainability-impact",
      "community-environment",
    ],
  },
  {
    id: "health-wellbeing-human-support",
    name: "Salud, Bienestar y Apoyo Humano",
    description:
      "Familia para intereses en cuidado, bienestar, acompañamiento, escucha e intervención orientada a personas.",
    relatedProfileIds: ["salud-apoyo-humano"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad", "extraversion"],
    semanticFocus: [
      "emotional-support",
      "interpersonal-care",
      "collaborative-help",
      "relationship-care",
    ],
  },
  {
    id: "life-health-laboratory-sciences",
    name: "Ciencias de la Vida, Salud y Laboratorio",
    description:
      "Familia para intereses en farmacia, laboratorio, biología aplicada, nutrición, veterinaria, biotecnología e investigación en salud.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["responsabilidad", "apertura", "amabilidad"],
    semanticFocus: [
      "scientific-analysis",
      "precision-following",
      "evidence-based-reasoning",
      "interpersonal-care",
      "practical-testing",
    ],
  },
  {
    id: "education-society-human-development",
    name: "Educación, Sociedad y Desarrollo Humano",
    description:
      "Familia para intereses en aprendizaje, orientación, trabajo social, desarrollo de grupos y mejora comunitaria.",
    relatedProfileIds: ["educacion-ciencias-sociales"],
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad"],
    semanticFocus: [
      "teaching-guidance",
      "collaborative-help",
      "public-participation",
      "communication-confidence",
    ],
  },
  {
    id: "humanities-culture-communication",
    name: "Humanidades, Cultura y Comunicación",
    description:
      "Familia para intereses en lectura, escritura, historia, filosofía, cultura, lenguaje, comunicación, periodismo e interpretación social.",
    relatedProfileIds: ["arte-comunicacion-diseno", "educacion-ciencias-sociales"],
    coreRiasec: ["artistico", "social"],
    supportBigFive: ["apertura", "extraversion"],
    semanticFocus: [
      "expressive-creativity",
      "conceptual-creation",
      "communication-confidence",
      "teaching-guidance",
      "perspective-taking",
    ],
  },
  {
    id: "social-community-public-service",
    name: "Ciencias Sociales, Comunidad y Servicio Publico",
    description:
      "Familia para intereses en sociedad, comunidad, bienestar colectivo, trabajo social, investigación social, politicas publicas y desarrollo humano.",
    relatedProfileIds: ["educacion-ciencias-sociales", "salud-apoyo-humano", "negocios-gestion"],
    coreRiasec: ["social", "investigativo"],
    supportBigFive: ["amabilidad", "apertura", "responsabilidad"],
    semanticFocus: [
      "interpersonal-care",
      "collaborative-help",
      "community-environment",
      "evidence-based-reasoning",
      "coordination-leadership",
    ],
  },
  {
    id: "business-management-entrepreneurship",
    name: "Gestión, Negocios y Emprendimiento",
    description:
      "Familia para intereses en iniciar proyectos, negociar, liderar, vender, tomar decisiones y hacer viable una idea.",
    relatedProfileIds: ["negocios-gestion", "administracion-finanzas"],
    coreRiasec: ["emprendedor"],
    supportBigFive: ["extraversion", "responsabilidad"],
    semanticFocus: [
      "initiative-taking",
      "persuasion-influence",
      "coordination-leadership",
      "decision-making",
    ],
  },
  {
    id: "law-institutions-legal-sciences",
    name: "Derecho, Instituciones y Ciencias Jurídicas",
    description:
      "Familia para intereses en normas, argumentacion, análisis de casos, evidencia, mediacion, instituciones y resolución de conflictos.",
    relatedProfileIds: ["negocios-gestion", "administracion-finanzas", "educacion-ciencias-sociales"],
    coreRiasec: ["emprendedor", "convencional", "social"],
    supportBigFive: ["responsabilidad", "extraversion", "amabilidad"],
    semanticFocus: [
      "persuasion-influence",
      "decision-making",
      "organization-structure",
      "precision-following",
      "evidence-based-reasoning",
      "interpersonal-care",
    ],
  },
  {
    id: "administration-finance-processes",
    name: "Administración, Finanzas y Procesos",
    description:
      "Familia para intereses en orden, exactitud, gestión de información, procesos, presupuestos y seguimiento operativo.",
    relatedProfileIds: ["administracion-finanzas"],
    coreRiasec: ["convencional", "emprendedor"],
    supportBigFive: ["responsabilidad"],
    semanticFocus: [
      "organization-structure",
      "precision-following",
      "process-consistency",
      "information-management",
    ],
  },
];

export const vocationalSubroutes: VocationalSubrouteMetadata[] = [
  {
    id: "systems-software",
    familyId: "engineering-technology-applied-solutions",
    name: "Sistemas y Software",
    description:
      "Exploración de soluciones digitales, lógica computacional, sistemas, aplicaciones y automatización.",
    relatedProfileIds: ["ingenieria-tecnologia"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["technical-manipulation", "practical-testing", "abstract-reasoning"],
    careerExamples: ["Ingeniería de sistemas", "Software", "Tecnologías de información"],
    conflictsWith: ["science-data-analysis", "industrial-processes"],
    validationNotes:
      "Debe distinguirse de interés general por tecnología o prestigio de sistemas.",
  },
  {
    id: "science-data-analysis",
    familyId: "science-research-analysis",
    name: "Ciencia de Datos y Análisis",
    description:
      "Exploración de patrones, información, evidencia, explicaciones y análisis cuantitativo o cualitativo.",
    relatedProfileIds: ["ciencia-datos-investigacion"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["pattern-analysis", "scientific-analysis", "information-management"],
    careerExamples: ["Ciencia de datos", "Analítica", "Estadística aplicada"],
    conflictsWith: ["systems-software", "laboratory-science"],
    validationNotes:
      "Debe diferenciarse de programación y de simple gusto por tecnología.",
  },
  {
    id: "industrial-processes",
    familyId: "engineering-technology-applied-solutions",
    name: "Industrial, Procesos y Operaciones",
    description:
      "Exploración de mejora de procesos, producción, operaciones, eficiencia, control y solución práctica de problemas.",
    relatedProfileIds: ["ingenieria-tecnologia", "administracion-finanzas"],
    coreRiasec: ["realista", "convencional"],
    supportBigFive: ["responsabilidad"],
    semanticFocus: ["process-consistency", "practical-testing", "organization-structure"],
    careerExamples: ["Ingeniería industrial", "Operaciones", "Logística"],
    conflictsWith: ["business-project-management", "administrative-finance"],
    validationNotes:
      "Puede solaparse con gestión si no se distingue entre liderar proyectos y optimizar procesos.",
  },
  {
    id: "mechatronics-applied-technology",
    familyId: "engineering-technology-applied-solutions",
    name: "Mecatrónica y Tecnología Aplicada",
    description:
      "Exploración de mecanismos, dispositivos, pruebas, herramientas, automatización y funcionamiento técnico.",
    relatedProfileIds: ["ingenieria-tecnologia"],
    coreRiasec: ["realista", "investigativo"],
    supportBigFive: ["responsabilidad", "apertura"],
    semanticFocus: ["hands-on-building", "technical-manipulation", "practical-testing"],
    careerExamples: ["Mecatrónica", "Electrónica", "Automatización"],
    conflictsWith: ["systems-software", "architecture-spatial-design"],
    validationNotes:
      "Debe requerir señales prácticas/materiales, no solo interés abstracto por resolver problemas.",
  },
  {
    id: "architecture-spatial-design",
    familyId: "design-architecture-visual-communication",
    name: "Arquitectura y Diseño Espacial",
    description:
      "Exploración de espacios, ambientes, distribución visual, forma, función y experiencia de personas en entornos.",
    relatedProfileIds: ["arte-comunicacion-diseno", "ingenieria-tecnologia"],
    coreRiasec: ["artistico", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["visual-spatial-creativity", "applied-design", "spatial-organization"],
    careerExamples: ["Arquitectura", "Diseño de interiores", "Diseño de espacios"],
    conflictsWith: ["mechatronics-applied-technology", "graphic-design", "expressive-arts"],
    validationNotes:
      "Ruta clave para validar casos donde Arquitectura está siendo absorbida por Ingeniería.",
  },
  {
    id: "graphic-design",
    familyId: "design-architecture-visual-communication",
    name: "Diseño Gráfico y Visual",
    description:
      "Exploración de composición visual, marca, piezas gráficas, comunicación visual y soluciones de diseño aplicado.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["applied-design", "graphic-visual-communication", "conceptual-creation"],
    careerExamples: ["Diseño gráfico", "Branding", "Diseño visual"],
    conflictsWith: ["architecture-spatial-design", "communication-audiovisual"],
    validationNotes:
      "Debe distinguir composición visual aplicada de arte expresivo o contenido audiovisual.",
  },
  {
    id: "communication-audiovisual",
    familyId: "design-architecture-visual-communication",
    name: "Comunicación Audiovisual y Contenidos",
    description:
      "Exploración de historias, mensajes, video, campañas, medios y producción creativa orientada a comunicar.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "extraversion"],
    semanticFocus: ["expressive-creativity", "conceptual-creation", "communication-confidence"],
    careerExamples: ["Comunicación audiovisual", "Publicidad", "Producción de contenidos"],
    conflictsWith: ["graphic-design", "architecture-spatial-design"],
    validationNotes:
      "Debe evitar absorber creatividad visual-espacial propia de Arquitectura.",
  },
  {
    id: "environmental-engineering",
    familyId: "environment-territory-applied-science",
    name: "Ingeniería Ambiental y Sostenibilidad",
    description:
      "Exploración de soluciones técnicas y científicas para problemas ambientales, recursos, impacto y sostenibilidad.",
    relatedProfileIds: ["ingenieria-tecnologia", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["environmental-systems", "sustainability-impact", "field-observation"],
    careerExamples: ["Ingeniería ambiental", "Sostenibilidad", "Calidad ambiental"],
    conflictsWith: ["business-project-management", "systems-software", "laboratory-science"],
    validationNotes:
      "Ruta clave para validar casos donde Ambiental cae como Negocios o Ingeniería genérica.",
  },
  {
    id: "environmental-management",
    familyId: "environment-territory-applied-science",
    name: "Gestión Ambiental y Proyectos",
    description:
      "Exploración de gestión de proyectos, normas, comunidades, impacto ambiental y coordinación de acciones sostenibles.",
    relatedProfileIds: ["negocios-gestion", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "emprendedor"],
    supportBigFive: ["responsabilidad", "amabilidad"],
    semanticFocus: ["sustainability-impact", "community-environment", "coordination-leadership"],
    careerExamples: ["Gestión ambiental", "Proyectos sostenibles", "Consultoría ambiental"],
    conflictsWith: ["business-project-management", "environmental-engineering"],
    validationNotes:
      "Debe distinguir interés ambiental real de liderazgo o gestión genérica.",
  },
  {
    id: "natural-resources-territory",
    familyId: "environment-territory-applied-science",
    name: "Recursos Naturales y Territorio",
    description:
      "Exploración de campo, recursos naturales, territorio, observación ambiental y relación entre personas y entorno.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "amabilidad"],
    semanticFocus: ["territorial-analysis", "field-observation", "community-environment"],
    careerExamples: ["Recursos naturales", "Geografía", "Gestión territorial"],
    conflictsWith: ["laboratory-science", "education-community-development"],
    validationNotes:
      "Puede requerir nuevas preguntas de campo/territorio porque hoy hay poca cobertura directa.",
  },
  {
    id: "laboratory-science",
    familyId: "life-health-laboratory-sciences",
    name: "Laboratorio, Farmacia e Investigación Aplicada",
    description:
      "Exploración de análisis controlado, pruebas, sustancias, evidencia, precisión y trabajo científico aplicado.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo", "convencional"],
    supportBigFive: ["responsabilidad", "apertura"],
    semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"],
    careerExamples: ["Farmacia", "Laboratorio clínico", "Biotecnología"],
    conflictsWith: ["systems-software", "environmental-engineering"],
    validationNotes:
      "Sirve para evitar que investigativo alto sea absorbido por Ingeniería cuando realista técnico es bajo.",
  },
  {
    id: "biotechnology-health-sciences",
    familyId: "life-health-laboratory-sciences",
    name: "Biotecnología y Ciencias de la Salud",
    description:
      "Exploración de procesos biológicos, investigación aplicada, salud, tecnología de laboratorio y soluciones científicas para bienestar.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "evidence-based-reasoning", "practical-testing"],
    careerExamples: ["Biotecnología", "Biología aplicada", "Ciencias de la salud"],
    conflictsWith: ["systems-software", "laboratory-science", "environmental-engineering"],
    validationNotes:
      "Debe distinguir investigación en salud y biología aplicada de ciencia de datos o tecnología genérica.",
  },
  {
    id: "nutrition-health-wellbeing",
    familyId: "life-health-laboratory-sciences",
    name: "Nutrición, Salud y Bienestar",
    description:
      "Exploración de alimentación, hábitos, bienestar, salud preventiva y acompañamiento de personas desde evidencia aplicada.",
    relatedProfileIds: ["salud-apoyo-humano", "ciencia-datos-investigacion"],
    coreRiasec: ["social", "investigativo"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["interpersonal-care", "evidence-based-reasoning", "teaching-guidance"],
    careerExamples: ["Nutrición", "Salud preventiva", "Promoción de bienestar"],
    conflictsWith: ["psychology-human-support", "laboratory-science"],
    validationNotes:
      "Debe diferenciar interés en salud humana aplicada de laboratorio puro o apoyo psicologico.",
  },
  {
    id: "veterinary-animal-health",
    familyId: "life-health-laboratory-sciences",
    name: "Veterinaria y Salud Animal",
    description:
      "Exploración de cuidado animal, salud, biología aplicada, observación, diagnóstico y trabajo práctico con seres vivos.",
    relatedProfileIds: ["salud-apoyo-humano", "ciencia-datos-investigacion", "ingenieria-tecnologia"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "interpersonal-care", "practical-testing"],
    careerExamples: ["Veterinaria", "Zootecnia", "Salud animal"],
    conflictsWith: ["laboratory-science", "natural-resources-territory"],
    validationNotes:
      "Debe observar si el interés por salud se dirige a personas, laboratorio, animales o ambiente.",
  },
  {
    id: "psychology-human-support",
    familyId: "health-wellbeing-human-support",
    name: "Psicología y Apoyo Humano",
    description:
      "Exploración de escucha, acompañamiento, bienestar emocional, orientación y comprensión de necesidades personales.",
    relatedProfileIds: ["salud-apoyo-humano"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["emotional-support", "interpersonal-care", "relationship-care"],
    careerExamples: ["Psicología", "Orientación", "Bienestar humano"],
    conflictsWith: ["education-teaching", "education-community-development"],
    validationNotes:
      "Debe diferenciar apoyo emocional de enseñanza o liderazgo social.",
  },
  {
    id: "educacion-orientacion-formacion",
    familyId: "education-society-human-development",
    name: "Educación, Orientación y Formación",
    description:
      "Aparece porque tus respuestas muestran interés por enseñar, orientar, explicar temas y facilitar el aprendizaje de otras personas.",
    relatedProfileIds: ["educacion-ciencias-sociales"],
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad", "responsabilidad"],
    semanticFocus: ["teaching-guidance", "communication-confidence", "collaborative-help"],
    careerExamples: ["Educación", "Orientación educativa", "Formación", "Tutoría"],
    conflictsWith: ["psychology-human-support", "derecho-ciencias-juridicas", "business-project-management"],
    validationNotes:
      "Subruta específica para desempatar perfiles amplios cuando la persona elige enseñar, orientar o facilitar aprendizaje.",
  },
  {
    id: "education-teaching",
    familyId: "education-society-human-development",
    name: "Educación y Enseñanza",
    description:
      "Exploración de explicar, guiar, enseñar, facilitar aprendizaje y acompañar procesos formativos.",
    relatedProfileIds: ["educacion-ciencias-sociales"],
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad"],
    semanticFocus: ["teaching-guidance", "communication-confidence", "collaborative-help"],
    careerExamples: ["Educación", "Docencia", "Orientación educativa"],
    conflictsWith: ["psychology-human-support", "business-social-leadership"],
    validationNotes:
      "Debe distinguir enseñanza de ayuda emocional y de liderazgo grupal.",
  },
  {
    id: "psychopedagogy-orientation",
    familyId: "education-society-human-development",
    name: "Psicopedagogía y Orientación Educativa",
    description:
      "Exploración de aprendizaje, acompañamiento educativo, orientación, dificultades escolares y desarrollo de estudiantes.",
    relatedProfileIds: ["educacion-ciencias-sociales", "salud-apoyo-humano"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad", "extraversion"],
    semanticFocus: ["teaching-guidance", "emotional-support", "interpersonal-care"],
    careerExamples: ["Psicopedagogía", "Orientación educativa", "Tutoría"],
    conflictsWith: ["psychology-human-support", "education-teaching"],
    validationNotes:
      "Subruta para diferenciar docencia general de apoyo a procesos de aprendizaje y orientación.",
  },
  {
    id: "literature-writing-cultural-studies",
    familyId: "humanities-culture-communication",
    name: "Literatura, Escritura y Estudios Culturales",
    description:
      "Exploración de lectura, escritura, interpretación cultural, creación de textos, análisis de ideas y sensibilidad narrativa.",
    relatedProfileIds: ["arte-comunicacion-diseno", "educacion-ciencias-sociales"],
    coreRiasec: ["artistico", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["expressive-creativity", "conceptual-creation", "evidence-based-reasoning"],
    careerExamples: ["Literatura", "Escritura", "Edición", "Estudios culturales"],
    conflictsWith: ["communication-audiovisual", "education-teaching"],
    validationNotes:
      "Cubre humanidades expresivas y analíticas que hoy podrían caer en Arte o Educación de forma demasiado amplia.",
  },
  {
    id: "history-philosophy-humanities",
    familyId: "humanities-culture-communication",
    name: "Historia, Filosofía y Humanidades",
    description:
      "Exploración de ideas, sociedad, cultura, memoria, pensamiento crítico, lectura profunda y explicación de procesos humanos.",
    relatedProfileIds: ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "social"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["abstract-reasoning", "evidence-based-reasoning", "perspective-taking"],
    careerExamples: ["Historia", "Filosofía", "Humanidades", "Investigación cultural"],
    conflictsWith: ["literature-writing-cultural-studies", "social-research"],
    validationNotes:
      "Debe evitar que interés por análisis social sea absorbido solo por ciencia de datos o educacion.",
  },
  {
    id: "journalism-public-communication",
    familyId: "humanities-culture-communication",
    name: "Periodismo y Comunicación Publica",
    description:
      "Exploración de investigar hechos, comunicar ideas, entrevistar, escribir, informar y conectar temas sociales con audiencias.",
    relatedProfileIds: ["arte-comunicacion-diseno", "educacion-ciencias-sociales"],
    coreRiasec: ["artistico", "social", "investigativo"],
    supportBigFive: ["extraversion", "apertura", "responsabilidad"],
    semanticFocus: ["communication-confidence", "evidence-based-reasoning", "conceptual-creation"],
    careerExamples: ["Periodismo", "Comunicación", "Comunicación publica"],
    conflictsWith: ["communication-audiovisual", "social-research"],
    validationNotes:
      "Distingue comunicación informativa/social de creatividad audiovisual o diseño visual.",
  },
  {
    id: "social-work-community-development",
    familyId: "social-community-public-service",
    name: "Trabajo Social y Desarrollo Comunitario",
    description:
      "Exploración de acompañamiento, comunidad, inclusion, gestión de apoyo, bienestar colectivo y mejora de condiciones sociales.",
    relatedProfileIds: ["salud-apoyo-humano", "educacion-ciencias-sociales"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["interpersonal-care", "collaborative-help", "community-environment"],
    careerExamples: ["Trabajo social", "Desarrollo comunitario", "Intervencion social"],
    conflictsWith: ["psychology-human-support", "education-community-development"],
    validationNotes:
      "Cubre ayuda social y comunitaria que no necesariamente es psicologia ni docencia.",
  },
  {
    id: "social-research",
    familyId: "social-community-public-service",
    name: "Sociología, Antropología e Investigación Social",
    description:
      "Exploración de sociedad, cultura, grupos humanos, investigación cualitativa, patrones sociales y explicación de fenómenos colectivos.",
    relatedProfileIds: ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
    coreRiasec: ["social", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "perspective-taking", "evidence-based-reasoning"],
    careerExamples: ["Sociología", "Antropología", "Investigación social"],
    conflictsWith: ["history-philosophy-humanities", "science-data-analysis"],
    validationNotes:
      "Evita que interés investigativo sobre personas y sociedad caiga automaticamente en ciencia/datos.",
  },
  {
    id: "international-relations-public-policy",
    familyId: "social-community-public-service",
    name: "Relaciones Internacionales y Politicas Publicas",
    description:
      "Exploración de instituciones, sociedad, negociación, problemas públicos, análisis de contexto y toma de decisiones colectivas.",
    relatedProfileIds: ["negocios-gestion", "educacion-ciencias-sociales", "administracion-finanzas"],
    coreRiasec: ["emprendedor", "social", "investigativo"],
    supportBigFive: ["extraversion", "apertura", "responsabilidad"],
    semanticFocus: ["persuasion-influence", "evidence-based-reasoning", "decision-making"],
    careerExamples: ["Relaciones internacionales", "Políticas públicas", "Gestión publica"],
    conflictsWith: ["derecho-ciencias-juridicas", "business-project-management"],
    validationNotes:
      "Distingue instituciones y asuntos públicos de negocios privados o derecho puro.",
  },
  {
    id: "business-project-management",
    familyId: "business-management-entrepreneurship",
    name: "Negocios y Gestión de Proyectos",
    description:
      "Exploración de planificación, coordinación, ventas, viabilidad, negociación y decisiones para hacer avanzar proyectos.",
    relatedProfileIds: ["negocios-gestion"],
    coreRiasec: ["emprendedor"],
    supportBigFive: ["extraversion", "responsabilidad"],
    semanticFocus: ["initiative-taking", "persuasion-influence", "coordination-leadership"],
    careerExamples: ["Administración", "Marketing", "Emprendimiento"],
    conflictsWith: ["environmental-management", "business-social-leadership"],
    validationNotes:
      "Debe evitar capturar Ambiental cuando la señal de gestión esta al servicio de sostenibilidad.",
  },
  {
    id: "derecho-ciencias-juridicas",
    familyId: "law-institutions-legal-sciences",
    name: "Derecho y Ciencias Jurídicas",
    description:
      "Exploración de argumentacion, normas, negociación, análisis de casos, evidencia, mediacion e interaccion institucional.",
    relatedProfileIds: ["negocios-gestion", "administracion-finanzas", "educacion-ciencias-sociales"],
    coreRiasec: ["emprendedor", "convencional"],
    supportBigFive: ["responsabilidad", "extraversion", "amabilidad"],
    semanticFocus: [
      "persuasion-influence",
      "decision-making",
      "organization-structure",
      "precision-following",
      "evidence-based-reasoning",
      "interpersonal-care",
    ],
    careerExamples: [
      "Derecho",
      "Ciencias Jurídicas",
      "Gestión publica",
      "Mediacion y resolución de conflictos",
      "Relaciones institucionales",
    ],
    conflictsWith: ["business-project-management", "education-community-development", "administrative-finance"],
    validationNotes:
      "Subruta metodológica para validar intereses juridicos sin usarla todavía en ranking, score ni resultados finales.",
  },
  {
    id: "administrative-finance",
    familyId: "administration-finance-processes",
    name: "Finanzas, Administración y Procesos",
    description:
      "Exploración de presupuestos, registros, control, exactitud, operaciones, información y estructura administrativa.",
    relatedProfileIds: ["administracion-finanzas"],
    coreRiasec: ["convencional", "emprendedor"],
    supportBigFive: ["responsabilidad"],
    semanticFocus: ["information-management", "organization-structure", "precision-following"],
    careerExamples: ["Finanzas", "Contabilidad", "Administración"],
    conflictsWith: ["industrial-processes", "business-project-management"],
    validationNotes:
      "Debe diferenciar orden financiero/procesal de liderazgo o emprendimiento.",
  },
];

export const adaptiveThemeBlocks: AdaptiveThemeBlock[] = [
  {
    id: "technical-applied",
    name: "Bloque técnico aplicado",
    description:
      "Profundiza funcionamiento práctico, análisis, pruebas y solución aplicada de problemas.",
    dimensions: ["realista", "investigativo", "responsabilidad", "tolerancia"],
    semanticFocus: [
      "hands-on-building",
      "technical-manipulation",
      "practical-testing",
      "pattern-analysis",
      "scientific-analysis",
      "task-persistence",
    ],
  },
  {
    id: "creative-applied",
    name: "Bloque creativo aplicado",
    description:
      "Profundiza diseño, creatividad aplicada, organización visual y exploración de soluciones creativas.",
    dimensions: ["artistico", "apertura", "responsabilidad", "tolerancia"],
    semanticFocus: [
      "applied-design",
      "graphic-visual-communication",
      "spatial-organization",
      "conceptual-creation",
      "cognitive-flexibility",
    ],
  },
  {
    id: "social-educational",
    name: "Bloque social educativo",
    description:
      "Profundiza acompañamiento, enseñanza, orientación, comunicación y cuidado interpersonal.",
    dimensions: ["social", "amabilidad", "extraversion", "tolerancia"],
    semanticFocus: [
      "emotional-support",
      "interpersonal-care",
      "teaching-guidance",
      "collaborative-help",
      "communication-confidence",
    ],
  },
  {
    id: "leadership-management",
    name: "Bloque liderazgo y gestión",
    description:
      "Profundiza organización, liderazgo, negociación, coordinación y desarrollo de proyectos.",
    dimensions: ["emprendedor", "convencional", "extraversion", "responsabilidad"],
    semanticFocus: [
      "initiative-taking",
      "coordination-leadership",
      "persuasion-influence",
      "organization-structure",
      "information-management",
    ],
  },
  {
    id: "environment-territory",
    name: "Bloque ambiente y territorio",
    description:
      "Profundiza sostenibilidad, campo, territorio, recursos naturales, impacto ambiental y gestión ambiental.",
    dimensions: ["investigativo", "realista", "emprendedor", "amabilidad"],
    semanticFocus: [
      "environmental-systems",
      "territorial-analysis",
      "field-observation",
      "sustainability-impact",
      "community-environment",
    ],
  },
  {
    id: "health-laboratory",
    name: "Bloque salud y laboratorio",
    description:
      "Profundiza cuidado humano, bienestar, laboratorio, ciencias de la vida, precisión y evidencia aplicada.",
    dimensions: ["social", "investigativo", "responsabilidad", "amabilidad"],
    semanticFocus: [
      "interpersonal-care",
      "scientific-analysis",
      "precision-following",
      "evidence-based-reasoning",
      "practical-testing",
    ],
  },
  {
    id: "humanities-legal-social",
    name: "Bloque humanidades, derecho y sociedad",
    description:
      "Profundiza lectura, escritura, análisis social, normas, argumentación, instituciones y asuntos públicos.",
    dimensions: ["social", "investigativo", "artistico", "convencional", "emprendedor"],
    semanticFocus: [
      "evidence-based-reasoning",
      "perspective-taking",
      "conceptual-creation",
      "precision-following",
      "persuasion-influence",
    ],
  },
  {
    id: "clarity-context",
    name: "Bloque claridad y contexto",
    description:
      "Profundiza dudas, presión externa, ansiedad de decisión y tolerancia cuando el contexto afecta la elección.",
    dimensions: ["incertidumbre", "presion", "neuroticismo", "tolerancia"],
    semanticFocus: [
      "vocational-uncertainty",
      "future-clarity",
      "external-pressure",
      "decision-anxiety",
      "difficulty-tolerance",
    ],
  },
];

export const minLikertQuestions = 17;
export const COMMON_BASELINE_QUESTION_COUNT = 17;
export const maxLikertQuestions = 26;
export const maxOpenQuestions = 3;
export const maxForcedChoiceQuestions = 5;

export const adaptiveFocusByRiasec: Record<Dimension, Dimension[]> = {
  realista: ["realista", "investigativo", "responsabilidad", "tolerancia"],
  investigativo: ["investigativo", "apertura", "responsabilidad", "tolerancia"],
  artistico: ["artistico", "apertura", "extraversion", "tolerancia"],
  social: ["social", "amabilidad", "extraversion", "tolerancia"],
  emprendedor: ["emprendedor", "extraversion", "responsabilidad", "tolerancia"],
  convencional: ["convencional", "responsabilidad", "investigativo", "tolerancia"],
  apertura: ["apertura"],
  responsabilidad: ["responsabilidad"],
  extraversion: ["extraversion"],
  amabilidad: ["amabilidad"],
  neuroticismo: ["neuroticismo"],
  incertidumbre: ["incertidumbre"],
  presion: ["presion"],
  tolerancia: ["tolerancia"],
};

