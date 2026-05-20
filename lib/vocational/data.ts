import type { Dimension, Profile, Question } from "./types";

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

const guidedOpenOptions = [
  "Diseñar espacios, objetos o ambientes",
  "Crear contenido o expresar ideas",
  "Comprender cómo funcionan cosas o sistemas",
  "Ayudar y acompañar personas",
  "Organizar proyectos o liderar actividades",
  "Investigar y descubrir información",
  "Aún no estoy seguro",
];

const unsureOpenOptions = [
  "Nunca lo he explorado",
  "Me interesan varias cosas",
  "Me cuesta imaginarlo",
  "Depende del contexto",
];

export const questions: Question[] = [
  { id: 1, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando tengo que aprender algo nuevo, me ayuda probarlo con las manos, armarlo, repararlo o verlo funcionar en la práctica.", dimension: "realista", stage: "exploracion", semanticFocus: ["hands-on-building", "technical-manipulation", "practical-testing"] },
  { id: 2, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando algo no sale como esperaba, suelo preguntarme qué lo causó y busco evidencias antes de sacar una conclusión.", dimension: "investigativo", stage: "exploracion", semanticFocus: ["scientific-analysis", "causal-reasoning", "evidence-based-reasoning"] },
  { id: 3, kind: "likert", model: "RIASEC", promptStyle: "exploratory", text: "Me resulta natural expresar ideas mediante historias, diseño, música, imágenes, videos o formas creativas de comunicar.", dimension: "artistico", stage: "exploracion", semanticFocus: ["expressive-creativity", "applied-design", "conceptual-creation"] },
  { id: 4, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando alguien de mi entorno tiene un problema, suelo escuchar con atención y tratar de ayudarle a ordenar lo que siente o piensa.", dimension: "social", stage: "exploracion", semanticFocus: ["emotional-support", "interpersonal-care"] },
  { id: 5, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si un grupo tiene una idea pero nadie la organiza, tiendo a proponer un plan, repartir tareas o animar a que avance.", dimension: "emprendedor", stage: "exploracion", semanticFocus: ["initiative-taking", "coordination-leadership"] },
  { id: 6, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Me siento cómodo cuando una actividad requiere orden, seguimiento de pasos, registro de información o cuidado de detalles.", dimension: "convencional", stage: "exploracion", semanticFocus: ["organization-structure", "precision-following", "information-management"] },

  { id: 7, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Me interesa probar ideas nuevas, aunque al inicio no tenga claro si van a funcionar.", dimension: "apertura", stage: "exploracion", semanticFocus: ["novelty-seeking", "exploratory-curiosity"] },
  { id: 8, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una tarea es importante, suelo organizarme para terminarla aunque no tenga ganas todo el tiempo.", dimension: "responsabilidad", stage: "exploracion", semanticFocus: ["task-persistence", "self-discipline"], optionalComment: true },
  { id: 9, kind: "likert", model: "Big Five", promptStyle: "situational", text: "En una exposición o trabajo grupal, puedo asumir una parte visible si eso ayuda a que el equipo avance.", dimension: "extraversion", stage: "exploracion", semanticFocus: ["social-assertiveness", "public-participation"] },
  { id: 10, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando trabajo con otros, intento entender distintos puntos de vista antes de imponer el mío.", dimension: "amabilidad", stage: "exploracion", semanticFocus: ["perspective-taking", "cooperative-attitude"] },
  { id: 11, kind: "likert", model: "Big Five", promptStyle: "reflective", text: "Pensar en elegir una carrera o proyecto de vida me genera preocupación por equivocarme o decepcionar a alguien.", dimension: "neuroticismo", stage: "exploracion", semanticFocus: ["decision-anxiety", "fear-of-disappointment"], optionalComment: true },

  { id: 12, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Siento que todavía me falta claridad para reconocer qué tipo de vida profesional quiero construir.", dimension: "incertidumbre", stage: "contexto", semanticFocus: ["vocational-uncertainty", "future-clarity"], optionalComment: true },
  { id: 13, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Al pensar en mi futuro, noto que las expectativas familiares, sociales o económicas influyen bastante en mi decisión.", dimension: "presion", stage: "contexto", semanticFocus: ["external-pressure", "economic-social-expectations"], optionalComment: true },
  { id: 14, kind: "likert", model: "Contexto", promptStyle: "situational", text: "Si una actividad se vuelve difícil, suelo intentar otra estrategia, pedir ayuda o practicar antes de abandonarla.", dimension: "tolerancia", stage: "contexto", semanticFocus: ["difficulty-tolerance", "adaptive-coping"], optionalComment: true },

  { id: 15, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si eligiera un proyecto escolar, me atraería uno donde tenga que probar cómo funciona algo, ajustar piezas, usar herramientas o comprobar resultados en la práctica.", dimension: "realista", stage: "profundizacion", semanticFocus: ["technical-manipulation", "practical-testing", "hands-on-building"] },
  { id: 16, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa revisar información, buscar patrones y entender por qué ocurre algo antes de decidir una explicación.", dimension: "investigativo", stage: "profundizacion", semanticFocus: ["pattern-analysis", "causal-reasoning", "scientific-analysis"] },
  { id: 17, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me imaginaría disfrutando un proyecto donde tenga que crear una campaña, una pieza visual, una historia, una marca o una experiencia.", dimension: "artistico", stage: "profundizacion", semanticFocus: ["applied-design", "visual-spatial-creativity", "conceptual-creation", "expressive-creativity"] },
  { id: 18, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me vería en actividades donde tenga que orientar, enseñar, acompañar o mejorar el bienestar de otras personas.", dimension: "social", stage: "profundizacion", semanticFocus: ["teaching-guidance", "interpersonal-care", "emotional-support"] },
  { id: 19, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa participar en retos donde haya que convencer, negociar, liderar o convertir una idea en algo viable.", dimension: "emprendedor", stage: "profundizacion", semanticFocus: ["persuasion-influence", "coordination-leadership", "initiative-taking"] },
  { id: 20, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa trabajar con listas, registros, presupuestos o inventarios donde sea importante mantener la información ordenada y exacta.", dimension: "convencional", stage: "profundizacion", semanticFocus: ["information-management", "organization-structure", "precision-following"] },

  { id: 21, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Me gusta explorar formas distintas de hacer una tarea cuando quiero entender mejor un tema o crear algo nuevo.", dimension: "apertura", stage: "profundizacion", semanticFocus: ["cognitive-flexibility", "exploratory-curiosity", "conceptual-creation"], optionalComment: true },
  { id: 22, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una actividad me interesa, puedo practicarla de manera constante aunque algunas partes sean repetitivas.", dimension: "responsabilidad", stage: "profundizacion", semanticFocus: ["interest-based-persistence", "routine-sustainability"], optionalComment: true },
  { id: 23, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una situación necesita comunicación, puedo iniciar conversaciones, preguntar o presentar ideas sin bloquearme demasiado.", dimension: "extraversion", stage: "profundizacion", semanticFocus: ["social-initiative", "communication-confidence"] },
  { id: 24, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "En desacuerdos, trato de cuidar la relación y buscar una salida justa, no solo ganar la discusión.", dimension: "amabilidad", stage: "profundizacion", semanticFocus: ["conflict-cooperation", "perspective-taking", "relationship-care"] },
  { id: 25, kind: "likert", model: "Big Five", promptStyle: "reflective", text: "Cuando una decisión importante depende de mí, puedo quedarme pensando demasiado en lo que podría salir mal.", dimension: "neuroticismo", stage: "profundizacion", semanticFocus: ["anticipatory-worry", "decision-anxiety"], optionalComment: true },

  { id: 26, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "Cuando un tema me despierta curiosidad, suelo explorarlo por mi cuenta hasta entenderlo con más profundidad.", dimension: "apertura", stage: "profundizacion", semanticFocus: ["exploratory-curiosity", "self-directed-learning"], optionalComment: true },
  { id: 27, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "He continuado practicando alguna actividad aunque al inicio me saliera mal o me comparara con personas más avanzadas.", dimension: "tolerancia", stage: "profundizacion", semanticFocus: ["difficulty-tolerance", "interest-based-persistence"], optionalComment: true },
  { id: 28, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "A veces digo que me interesa una carrera, pero no estoy seguro de si me gusta a mí o si me gusta la imagen que otros tienen de ella.", dimension: "incertidumbre", stage: "contexto", semanticFocus: ["identity-clarity", "vocational-image-conflict"], optionalComment: true },
  { id: 29, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Me preocupa que una opción que me gusta sea vista como poco segura, poco rentable o poco aceptada por mi entorno.", dimension: "presion", stage: "contexto", semanticFocus: ["external-pressure", "security-concern", "social-acceptance-concern"], optionalComment: true },
  { id: 30, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "Cuando una meta me importa, puedo dividirla en pasos pequeños y avanzar aunque no tenga una respuesta perfecta desde el inicio.", dimension: "responsabilidad", stage: "profundizacion", semanticFocus: ["planning-organization", "incremental-progress", "task-structuring"], optionalComment: true },

  {
    id: 101,
    kind: "open",
    promptStyle: "reflective",
    text: "Cuando piensas en tu futuro profesional, ¿cuál es la duda que aparece con más frecuencia?",
    stage: "contexto",
    trigger: "uncertainty",
    guidedOptions: guidedOpenOptions,
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
    text: "¿Existe alguna expectativa familiar, económica o social que esté influyendo en tu decisión?",
    stage: "contexto",
    trigger: "pressure",
    guidedOptions: guidedOpenOptions,
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
    text: "Aparece interés por un área, pero también señales de frustración o bloqueo. ¿Qué suele pasarte cuando algo que te importa se vuelve difícil?",
    stage: "contexto",
    trigger: "contradiction",
    guidedOptions: guidedOpenOptions,
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
    text: "Describe una actividad, tema o problema que podrías explorar durante mucho tiempo sin sentir que estás perdiendo el tiempo.",
    stage: "contexto",
    trigger: "motivation",
    guidedOptions: guidedOpenOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Todavía no identifico una actividad así.",
      "Me pasa con temas creativos o visuales.",
      "Me pasa cuando resuelvo problemas o investigo.",
    ],
  },
  {
    id: 105,
    kind: "open",
    promptStyle: "reflective",
    text: "Aparecen varios intereses fuertes. Si tuvieras que priorizar uno para explorarlo durante varios meses, ¿cuál elegirías y por qué?",
    stage: "contexto",
    trigger: "prioritization",
    guidedOptions: guidedOpenOptions,
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Elegiría la actividad que me hace perder la noción del tiempo.",
      "Elegiría una experiencia gratuita para probar si realmente me gusta.",
      "Me cuesta priorizar porque varias opciones me atraen por razones distintas.",
    ],
  },
  {
    id: 201,
    kind: "open",
    promptStyle: "situational",
    text: "Si tuvieras que elegir una actividad para probar durante una semana, ¿cuál se parece más a lo que te daría curiosidad continuar?",
    stage: "contexto",
    trigger: "contrast",
    semanticFocus: ["engineering-science-contrast", "practical-testing", "pattern-analysis"],
    guidedOptions: [
      "Probar cómo funciona algo, ajustarlo y comprobar si mejora",
      "Revisar información, buscar patrones y explicar por qué ocurre algo",
      "Me atraen ambas, pero todavía no sé cuál sostendría más tiempo",
    ],
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Probar cómo funciona algo, ajustarlo y comprobar si mejora.",
      "Revisar información, buscar patrones y explicar por qué ocurre algo.",
      "Me atraen ambas, pero todavía no sé cuál sostendría más tiempo.",
    ],
  },
  {
    id: 202,
    kind: "open",
    promptStyle: "situational",
    text: "En un proyecto creativo, ¿qué parte te resultaría más atractiva si tuvieras que dedicarle varias tardes?",
    stage: "contexto",
    trigger: "contrast",
    semanticFocus: ["art-design-contrast", "visual-spatial-creativity", "expressive-creativity"],
    guidedOptions: [
      "Diseñar la forma, distribución visual, espacio o composición de algo",
      "Crear una historia, pieza expresiva, música, video o mensaje creativo",
      "Me atraen ambas, pero depende mucho del tipo de proyecto",
    ],
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Diseñar la forma, distribución visual, espacio o composición de algo.",
      "Crear una historia, pieza expresiva, música, video o mensaje creativo.",
      "Me atraen ambas, pero depende mucho del tipo de proyecto.",
    ],
  },
  {
    id: 203,
    kind: "open",
    promptStyle: "situational",
    text: "Si participas en una actividad de ayuda a otras personas, ¿qué rol te saldría más natural probar primero?",
    stage: "contexto",
    trigger: "contrast",
    semanticFocus: ["health-education-contrast", "emotional-support", "teaching-guidance"],
    guidedOptions: [
      "Escuchar, acompañar y ayudar a ordenar lo que la persona siente",
      "Explicar, orientar o enseñar para que alguien entienda mejor algo",
      "Me atraen ambas formas de ayuda y tendría que probarlas",
    ],
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Escuchar, acompañar y ayudar a ordenar lo que la persona siente.",
      "Explicar, orientar o enseñar para que alguien entienda mejor algo.",
      "Me atraen ambas formas de ayuda y tendría que probarlas.",
    ],
  },
  {
    id: 204,
    kind: "open",
    promptStyle: "situational",
    text: "Cuando un grupo quiere sacar adelante una idea, ¿qué tipo de participación te interesaría más?",
    stage: "contexto",
    trigger: "contrast",
    semanticFocus: ["business-social-leadership-contrast", "persuasion-influence", "coordination-leadership"],
    guidedOptions: [
      "Convencer, negociar y tomar decisiones para que la idea sea viable",
      "Coordinar al grupo, repartir tareas y ayudar a que todos avancen",
      "Me interesan ambas, pero no sé cuál elegiría como rol principal",
    ],
    unsureOptions: unsureOpenOptions,
    helperPrompts: [
      "Convencer, negociar y tomar decisiones para que la idea sea viable.",
      "Coordinar al grupo, repartir tareas y ayudar a que todos avancen.",
      "Me interesan ambas, pero no sé cuál elegiría como rol principal.",
    ],
  },
];

export const profiles: Profile[] = [
  {
    id: "ingenieria-tecnologia",
    name: "Ingeniería, Tecnología y Sistemas",
    description: "Perfil asociado a resolver problemas técnicos, construir soluciones, analizar sistemas y aprender mediante experimentación práctica.",
    coreRiasec: ["realista", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    contextVariables: ["tolerancia"],
    dimensions: { realista: 1.0, investigativo: 1.4, convencional: 0.7, apertura: 0.7, responsabilidad: 0.8, tolerancia: 0.5 },
  },
  {
    id: "ciencia-datos-investigacion",
    name: "Ciencia, Datos e Investigación",
    description: "Perfil orientado a formular preguntas, analizar evidencia, interpretar patrones y construir conocimiento verificable.",
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    contextVariables: ["tolerancia"],
    dimensions: { investigativo: 1.6, convencional: 0.8, apertura: 0.9, responsabilidad: 0.7, tolerancia: 0.5 },
  },
  {
    id: "salud-apoyo-humano",
    name: "Salud, Psicología y Apoyo Humano",
    description: "Perfil vinculado al cuidado, bienestar, acompañamiento, intervención y comprensión de necesidades humanas.",
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "extraversion", "responsabilidad"],
    contextVariables: ["tolerancia"],
    dimensions: { social: 1.5, investigativo: 0.7, amabilidad: 1.0, responsabilidad: 0.8, tolerancia: 0.4 },
  },
  {
    id: "educacion-ciencias-sociales",
    name: "Educación y Ciencias Sociales",
    description: "Perfil enfocado en aprendizaje, orientación, comunicación, trabajo comunitario y desarrollo de personas o grupos.",
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad"],
    contextVariables: [],
    dimensions: { social: 1.5, artistico: 0.5, extraversion: 0.7, amabilidad: 0.9, responsabilidad: 0.5 },
  },
  {
    id: "arte-comunicacion-diseno",
    name: "Arte, Comunicación y Diseño",
    description: "Perfil relacionado con creatividad, expresión, narrativa, medios, diseño, publicidad y producción de contenidos.",
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "extraversion"],
    contextVariables: ["tolerancia"],
    dimensions: { artistico: 1.6, apertura: 1.0, extraversion: 0.5, social: 0.4, tolerancia: 0.3 },
  },
  {
    id: "negocios-gestion",
    name: "Negocios, Gestión y Emprendimiento",
    description: "Perfil asociado a liderazgo, ventas, administración, estrategia, negociación y creación de proyectos.",
    coreRiasec: ["emprendedor"],
    supportBigFive: ["extraversion", "responsabilidad"],
    contextVariables: ["tolerancia"],
    dimensions: { emprendedor: 1.6, convencional: 0.8, extraversion: 0.8, responsabilidad: 0.7, tolerancia: 0.3 },
  },
  {
    id: "administracion-finanzas",
    name: "Administración, Finanzas y Gestión Operativa",
    description: "Perfil orientado a orden, control, datos, procesos, recursos, operaciones y toma de decisiones estructuradas.",
    coreRiasec: ["convencional", "emprendedor"],
    supportBigFive: ["responsabilidad"],
    contextVariables: [],
    dimensions: { convencional: 1.5, emprendedor: 0.8, responsabilidad: 1.0, investigativo: 0.5, neuroticismo: -0.2 },
  },
];

export const minLikertQuestions = 12;
export const COMMON_BASELINE_QUESTION_COUNT = 14;
export const maxLikertQuestions = 28;
export const maxOpenQuestions = 3;

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
