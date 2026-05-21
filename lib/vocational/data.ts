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
  "No sé qué carrera se parece más a mí",
  "Me interesan varias áreas y me cuesta elegir",
  "Me preocupa equivocarme",
  "No sé si me gustará ejercer esa carrera",
  "Me preocupa la estabilidad económica o laboral",
  "Siento presión externa",
  "Aún no tengo una duda clara",
];

const pressureGuidedOptions = [
  "Mi familia espera que elija una carrera específica",
  "Me preocupa elegir algo que no sea rentable",
  "Siento que debo elegir algo con estabilidad laboral",
  "Me preocupa decepcionar a otras personas",
  "Me comparo con lo que otros esperan de mí",
  "No siento una presión externa importante",
  "Aún no estoy seguro de cuánto influye mi entorno",
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

  { id: 15, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si eligiera un proyecto escolar, me atraería comparar soluciones en condiciones reales, hacer pruebas concretas y ajustar lo que no funciona hasta mejorarlo.", dimension: "realista", stage: "profundizacion", semanticFocus: ["practical-testing", "operational-execution"] },
  { id: 16, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa comparar informacion, reconocer patrones y separar datos importantes de detalles secundarios para entender mejor una situacion.", dimension: "investigativo", stage: "profundizacion", semanticFocus: ["pattern-analysis", "abstract-reasoning"] },
  { id: 17, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me atraería ordenar visualmente un espacio, objeto o pieza gráfica para que se vea bien, funcione y sea fácil de entender para otras personas.", dimension: "artistico", stage: "profundizacion", semanticFocus: ["visual-spatial-creativity", "applied-design"] },
  { id: 18, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesaría explicar un tema paso a paso, adaptar ejemplos y comprobar si otra persona logró entenderlo mejor.", dimension: "social", stage: "profundizacion", semanticFocus: ["teaching-guidance", "collaborative-help"] },
  { id: 19, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa defender una propuesta, negociar alternativas y tomar decisiones para que un proyecto pueda avanzar.", dimension: "emprendedor", stage: "profundizacion", semanticFocus: ["persuasion-influence", "decision-making"] },
  { id: 20, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me resulta interesante seguir criterios claros para clasificar, verificar o completar una tarea sin saltarme pasos importantes.", dimension: "convencional", stage: "profundizacion", semanticFocus: ["process-consistency"] },

  { id: 21, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Me gusta explorar formas distintas de hacer una tarea cuando quiero entender mejor un tema o crear algo nuevo.", dimension: "apertura", stage: "profundizacion", semanticFocus: ["cognitive-flexibility", "exploratory-curiosity", "conceptual-creation"], optionalComment: true },
  { id: 22, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una actividad me interesa, puedo practicarla de manera constante aunque algunas partes sean repetitivas.", dimension: "responsabilidad", stage: "profundizacion", semanticFocus: ["interest-based-persistence", "routine-sustainability"], optionalComment: true },
  { id: 23, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una situación necesita comunicación, puedo iniciar conversaciones, preguntar o presentar ideas sin bloquearme demasiado.", dimension: "extraversion", stage: "profundizacion", semanticFocus: ["social-initiative", "communication-confidence"] },
  { id: 24, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "En desacuerdos, trato de cuidar la relación y buscar una salida justa, no solo ganar la discusión.", dimension: "amabilidad", stage: "profundizacion", semanticFocus: ["conflict-cooperation", "perspective-taking", "relationship-care"] },
  { id: 25, kind: "likert", model: "Big Five", promptStyle: "reflective", text: "Cuando una decision importante depende de mi, puedo quedarme pensando demasiado en lo que podria salir mal.", dimension: "neuroticismo", stage: "profundizacion", semanticFocus: ["anticipatory-worry", "risk-rumination"], optionalComment: true },

  { id: 26, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "Cuando un tema me interesa, suelo buscar materiales, ejemplos o experiencias por mi cuenta para entenderlo con mas profundidad.", dimension: "apertura", stage: "profundizacion", semanticFocus: ["self-directed-learning"], optionalComment: true },
  { id: 27, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "He continuado practicando alguna actividad aunque al inicio me saliera mal o me comparara con personas mas avanzadas.", dimension: "tolerancia", stage: "profundizacion", semanticFocus: ["interest-based-persistence", "learning-from-mistakes"], optionalComment: true },
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
    text: "¿Existe alguna expectativa familiar, económica o social que esté influyendo en tu decisión?",
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
    text: "Aparece interés por un área, pero también señales de frustración o bloqueo. ¿Qué suele pasarte cuando algo que te importa se vuelve difícil?",
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
    text: "Describe una actividad, tema o problema que podrías explorar durante mucho tiempo sin sentir que estás perdiendo el tiempo.",
    stage: "contexto",
    trigger: "motivation",
    guidedOptions: motivationGuidedOptions,
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
    guidedOptions: prioritizationGuidedOptions,
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

export const vocationalFamilies: VocationalFamilyMetadata[] = [
  {
    id: "engineering-technology-applied-solutions",
    name: "Ingenieria, Tecnologia y Soluciones Aplicadas",
    description:
      "Familia amplia para intereses en construir, probar, optimizar o implementar soluciones tecnicas y sistemas funcionales.",
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
    name: "Ciencia, Investigacion y Analisis",
    description:
      "Familia para intereses en explicar fenomenos, analizar evidencia, encontrar patrones y producir conocimiento verificable.",
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
    name: "Diseno, Arquitectura y Comunicacion Visual",
    description:
      "Familia para intereses en crear formas, espacios, experiencias visuales, piezas comunicativas o soluciones de diseno aplicado.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: [
      "visual-spatial-creativity",
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
      "Familia para intereses en cuidado, bienestar, acompanamiento, escucha e intervencion orientada a personas.",
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
      "Familia para intereses en farmacia, laboratorio, biologia aplicada, nutricion, veterinaria, biotecnologia e investigacion en salud.",
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
    name: "Educacion, Sociedad y Desarrollo Humano",
    description:
      "Familia para intereses en aprendizaje, orientacion, trabajo social, desarrollo de grupos y mejora comunitaria.",
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
    name: "Humanidades, Cultura y Comunicacion",
    description:
      "Familia para intereses en lectura, escritura, historia, filosofia, cultura, lenguaje, comunicacion, periodismo e interpretacion social.",
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
      "Familia para intereses en sociedad, comunidad, bienestar colectivo, trabajo social, investigacion social, politicas publicas y desarrollo humano.",
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
    name: "Gestion, Negocios y Emprendimiento",
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
    name: "Derecho, Instituciones y Ciencias Juridicas",
    description:
      "Familia para intereses en normas, argumentacion, analisis de casos, evidencia, mediacion, instituciones y resolucion de conflictos.",
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
    name: "Administracion, Finanzas y Procesos",
    description:
      "Familia para intereses en orden, exactitud, gestion de informacion, procesos, presupuestos y seguimiento operativo.",
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
      "Exploracion de soluciones digitales, logica computacional, sistemas, aplicaciones y automatizacion.",
    relatedProfileIds: ["ingenieria-tecnologia"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["technical-manipulation", "practical-testing", "abstract-reasoning"],
    careerExamples: ["Ingenieria de sistemas", "Software", "Tecnologias de informacion"],
    conflictsWith: ["science-data-analysis", "industrial-processes"],
    validationNotes:
      "Debe distinguirse de interes general por tecnologia o prestigio de sistemas.",
  },
  {
    id: "science-data-analysis",
    familyId: "science-research-analysis",
    name: "Ciencia de Datos y Analisis",
    description:
      "Exploracion de patrones, informacion, evidencia, explicaciones y analisis cuantitativo o cualitativo.",
    relatedProfileIds: ["ciencia-datos-investigacion"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["pattern-analysis", "scientific-analysis", "information-management"],
    careerExamples: ["Ciencia de datos", "Analitica", "Estadistica aplicada"],
    conflictsWith: ["systems-software", "laboratory-science"],
    validationNotes:
      "Debe diferenciarse de programacion y de simple gusto por tecnologia.",
  },
  {
    id: "industrial-processes",
    familyId: "engineering-technology-applied-solutions",
    name: "Industrial, Procesos y Operaciones",
    description:
      "Exploracion de mejora de procesos, produccion, operaciones, eficiencia, control y solucion practica de problemas.",
    relatedProfileIds: ["ingenieria-tecnologia", "administracion-finanzas"],
    coreRiasec: ["realista", "convencional"],
    supportBigFive: ["responsabilidad"],
    semanticFocus: ["process-consistency", "practical-testing", "organization-structure"],
    careerExamples: ["Ingenieria industrial", "Operaciones", "Logistica"],
    conflictsWith: ["business-project-management", "administrative-finance"],
    validationNotes:
      "Puede solaparse con gestion si no se distingue entre liderar proyectos y optimizar procesos.",
  },
  {
    id: "mechatronics-applied-technology",
    familyId: "engineering-technology-applied-solutions",
    name: "Mecatronica y Tecnologia Aplicada",
    description:
      "Exploracion de mecanismos, dispositivos, pruebas, herramientas, automatizacion y funcionamiento tecnico.",
    relatedProfileIds: ["ingenieria-tecnologia"],
    coreRiasec: ["realista", "investigativo"],
    supportBigFive: ["responsabilidad", "apertura"],
    semanticFocus: ["hands-on-building", "technical-manipulation", "practical-testing"],
    careerExamples: ["Mecatronica", "Electronica", "Automatizacion"],
    conflictsWith: ["systems-software", "architecture-spatial-design"],
    validationNotes:
      "Debe requerir senales practicas/materiales, no solo interes abstracto por resolver problemas.",
  },
  {
    id: "architecture-spatial-design",
    familyId: "design-architecture-visual-communication",
    name: "Arquitectura y Diseno Espacial",
    description:
      "Exploracion de espacios, ambientes, distribucion visual, forma, funcion y experiencia de personas en entornos.",
    relatedProfileIds: ["arte-comunicacion-diseno", "ingenieria-tecnologia"],
    coreRiasec: ["artistico", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["visual-spatial-creativity", "applied-design", "spatial-organization"],
    careerExamples: ["Arquitectura", "Diseno de interiores", "Diseno de espacios"],
    conflictsWith: ["mechatronics-applied-technology", "graphic-design", "expressive-arts"],
    validationNotes:
      "Ruta clave para validar casos donde Arquitectura esta siendo absorbida por Ingenieria.",
  },
  {
    id: "graphic-design",
    familyId: "design-architecture-visual-communication",
    name: "Diseno Grafico y Visual",
    description:
      "Exploracion de composicion visual, marca, piezas graficas, comunicacion visual y soluciones de diseno aplicado.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["applied-design", "visual-spatial-creativity", "conceptual-creation"],
    careerExamples: ["Diseno grafico", "Branding", "Diseno visual"],
    conflictsWith: ["architecture-spatial-design", "communication-audiovisual"],
    validationNotes:
      "Debe distinguir composicion visual aplicada de arte expresivo o contenido audiovisual.",
  },
  {
    id: "communication-audiovisual",
    familyId: "design-architecture-visual-communication",
    name: "Comunicacion Audiovisual y Contenidos",
    description:
      "Exploracion de historias, mensajes, video, campanas, medios y produccion creativa orientada a comunicar.",
    relatedProfileIds: ["arte-comunicacion-diseno"],
    coreRiasec: ["artistico"],
    supportBigFive: ["apertura", "extraversion"],
    semanticFocus: ["expressive-creativity", "conceptual-creation", "communication-confidence"],
    careerExamples: ["Comunicacion audiovisual", "Publicidad", "Produccion de contenidos"],
    conflictsWith: ["graphic-design", "architecture-spatial-design"],
    validationNotes:
      "Debe evitar absorber creatividad visual-espacial propia de Arquitectura.",
  },
  {
    id: "environmental-engineering",
    familyId: "environment-territory-applied-science",
    name: "Ingenieria Ambiental y Sostenibilidad",
    description:
      "Exploracion de soluciones tecnicas y cientificas para problemas ambientales, recursos, impacto y sostenibilidad.",
    relatedProfileIds: ["ingenieria-tecnologia", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["environmental-systems", "sustainability-impact", "field-observation"],
    careerExamples: ["Ingenieria ambiental", "Sostenibilidad", "Calidad ambiental"],
    conflictsWith: ["business-project-management", "systems-software", "laboratory-science"],
    validationNotes:
      "Ruta clave para validar casos donde Ambiental cae como Negocios o Ingenieria generica.",
  },
  {
    id: "environmental-management",
    familyId: "environment-territory-applied-science",
    name: "Gestion Ambiental y Proyectos",
    description:
      "Exploracion de gestion de proyectos, normas, comunidades, impacto ambiental y coordinacion de acciones sostenibles.",
    relatedProfileIds: ["negocios-gestion", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "emprendedor"],
    supportBigFive: ["responsabilidad", "amabilidad"],
    semanticFocus: ["sustainability-impact", "community-environment", "coordination-leadership"],
    careerExamples: ["Gestion ambiental", "Proyectos sostenibles", "Consultoria ambiental"],
    conflictsWith: ["business-project-management", "environmental-engineering"],
    validationNotes:
      "Debe distinguir interes ambiental real de liderazgo o gestion generica.",
  },
  {
    id: "natural-resources-territory",
    familyId: "environment-territory-applied-science",
    name: "Recursos Naturales y Territorio",
    description:
      "Exploracion de campo, recursos naturales, territorio, observacion ambiental y relacion entre personas y entorno.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["apertura", "amabilidad"],
    semanticFocus: ["territorial-analysis", "field-observation", "community-environment"],
    careerExamples: ["Recursos naturales", "Geografia", "Gestion territorial"],
    conflictsWith: ["laboratory-science", "education-community-development"],
    validationNotes:
      "Puede requerir nuevas preguntas de campo/territorio porque hoy hay poca cobertura directa.",
  },
  {
    id: "laboratory-science",
    familyId: "life-health-laboratory-sciences",
    name: "Laboratorio, Farmacia e Investigacion Aplicada",
    description:
      "Exploracion de analisis controlado, pruebas, sustancias, evidencia, precision y trabajo cientifico aplicado.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo", "convencional"],
    supportBigFive: ["responsabilidad", "apertura"],
    semanticFocus: ["scientific-analysis", "precision-following", "practical-testing"],
    careerExamples: ["Farmacia", "Laboratorio clinico", "Biotecnologia"],
    conflictsWith: ["systems-software", "environmental-engineering"],
    validationNotes:
      "Sirve para evitar que investigativo alto sea absorbido por Ingenieria cuando realista tecnico es bajo.",
  },
  {
    id: "biotechnology-health-sciences",
    familyId: "life-health-laboratory-sciences",
    name: "Biotecnologia y Ciencias de la Salud",
    description:
      "Exploracion de procesos biologicos, investigacion aplicada, salud, tecnologia de laboratorio y soluciones cientificas para bienestar.",
    relatedProfileIds: ["ciencia-datos-investigacion", "salud-apoyo-humano"],
    coreRiasec: ["investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "evidence-based-reasoning", "practical-testing"],
    careerExamples: ["Biotecnologia", "Biologia aplicada", "Ciencias de la salud"],
    conflictsWith: ["systems-software", "laboratory-science", "environmental-engineering"],
    validationNotes:
      "Debe distinguir investigacion en salud y biologia aplicada de ciencia de datos o tecnologia generica.",
  },
  {
    id: "nutrition-health-wellbeing",
    familyId: "life-health-laboratory-sciences",
    name: "Nutricion, Salud y Bienestar",
    description:
      "Exploracion de alimentacion, habitos, bienestar, salud preventiva y acompanamiento de personas desde evidencia aplicada.",
    relatedProfileIds: ["salud-apoyo-humano", "ciencia-datos-investigacion"],
    coreRiasec: ["social", "investigativo"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["interpersonal-care", "evidence-based-reasoning", "teaching-guidance"],
    careerExamples: ["Nutricion", "Salud preventiva", "Promocion de bienestar"],
    conflictsWith: ["psychology-human-support", "laboratory-science"],
    validationNotes:
      "Debe diferenciar interes en salud humana aplicada de laboratorio puro o apoyo psicologico.",
  },
  {
    id: "veterinary-animal-health",
    familyId: "life-health-laboratory-sciences",
    name: "Veterinaria y Salud Animal",
    description:
      "Exploracion de cuidado animal, salud, biologia aplicada, observacion, diagnostico y trabajo practico con seres vivos.",
    relatedProfileIds: ["salud-apoyo-humano", "ciencia-datos-investigacion", "ingenieria-tecnologia"],
    coreRiasec: ["investigativo", "realista"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "interpersonal-care", "practical-testing"],
    careerExamples: ["Veterinaria", "Zootecnia", "Salud animal"],
    conflictsWith: ["laboratory-science", "natural-resources-territory"],
    validationNotes:
      "Debe observar si el interes por salud se dirige a personas, laboratorio, animales o ambiente.",
  },
  {
    id: "psychology-human-support",
    familyId: "health-wellbeing-human-support",
    name: "Psicologia y Apoyo Humano",
    description:
      "Exploracion de escucha, acompanamiento, bienestar emocional, orientacion y comprension de necesidades personales.",
    relatedProfileIds: ["salud-apoyo-humano"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad"],
    semanticFocus: ["emotional-support", "interpersonal-care", "relationship-care"],
    careerExamples: ["Psicologia", "Orientacion", "Bienestar humano"],
    conflictsWith: ["education-teaching", "education-community-development"],
    validationNotes:
      "Debe diferenciar apoyo emocional de ensenanza o liderazgo social.",
  },
  {
    id: "education-teaching",
    familyId: "education-society-human-development",
    name: "Educacion y Ensenanza",
    description:
      "Exploracion de explicar, guiar, ensenar, facilitar aprendizaje y acompanar procesos formativos.",
    relatedProfileIds: ["educacion-ciencias-sociales"],
    coreRiasec: ["social"],
    supportBigFive: ["extraversion", "amabilidad"],
    semanticFocus: ["teaching-guidance", "communication-confidence", "collaborative-help"],
    careerExamples: ["Educacion", "Docencia", "Orientacion educativa"],
    conflictsWith: ["psychology-human-support", "business-social-leadership"],
    validationNotes:
      "Debe distinguir ensenanza de ayuda emocional y de liderazgo grupal.",
  },
  {
    id: "psychopedagogy-orientation",
    familyId: "education-society-human-development",
    name: "Psicopedagogia y Orientacion Educativa",
    description:
      "Exploracion de aprendizaje, acompanamiento educativo, orientacion, dificultades escolares y desarrollo de estudiantes.",
    relatedProfileIds: ["educacion-ciencias-sociales", "salud-apoyo-humano"],
    coreRiasec: ["social"],
    supportBigFive: ["amabilidad", "responsabilidad", "extraversion"],
    semanticFocus: ["teaching-guidance", "emotional-support", "interpersonal-care"],
    careerExamples: ["Psicopedagogia", "Orientacion educativa", "Tutoria"],
    conflictsWith: ["psychology-human-support", "education-teaching"],
    validationNotes:
      "Subruta para diferenciar docencia general de apoyo a procesos de aprendizaje y orientacion.",
  },
  {
    id: "literature-writing-cultural-studies",
    familyId: "humanities-culture-communication",
    name: "Literatura, Escritura y Estudios Culturales",
    description:
      "Exploracion de lectura, escritura, interpretacion cultural, creacion de textos, analisis de ideas y sensibilidad narrativa.",
    relatedProfileIds: ["arte-comunicacion-diseno", "educacion-ciencias-sociales"],
    coreRiasec: ["artistico", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["expressive-creativity", "conceptual-creation", "evidence-based-reasoning"],
    careerExamples: ["Literatura", "Escritura", "Edicion", "Estudios culturales"],
    conflictsWith: ["communication-audiovisual", "education-teaching"],
    validationNotes:
      "Cubre humanidades expresivas y analiticas que hoy podrian caer en Arte o Educacion de forma demasiado amplia.",
  },
  {
    id: "history-philosophy-humanities",
    familyId: "humanities-culture-communication",
    name: "Historia, Filosofia y Humanidades",
    description:
      "Exploracion de ideas, sociedad, cultura, memoria, pensamiento critico, lectura profunda y explicacion de procesos humanos.",
    relatedProfileIds: ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
    coreRiasec: ["investigativo", "social"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["abstract-reasoning", "evidence-based-reasoning", "perspective-taking"],
    careerExamples: ["Historia", "Filosofia", "Humanidades", "Investigacion cultural"],
    conflictsWith: ["literature-writing-cultural-studies", "social-research"],
    validationNotes:
      "Debe evitar que interes por analisis social sea absorbido solo por ciencia de datos o educacion.",
  },
  {
    id: "journalism-public-communication",
    familyId: "humanities-culture-communication",
    name: "Periodismo y Comunicacion Publica",
    description:
      "Exploracion de investigar hechos, comunicar ideas, entrevistar, escribir, informar y conectar temas sociales con audiencias.",
    relatedProfileIds: ["arte-comunicacion-diseno", "educacion-ciencias-sociales"],
    coreRiasec: ["artistico", "social", "investigativo"],
    supportBigFive: ["extraversion", "apertura", "responsabilidad"],
    semanticFocus: ["communication-confidence", "evidence-based-reasoning", "conceptual-creation"],
    careerExamples: ["Periodismo", "Comunicacion", "Comunicacion publica"],
    conflictsWith: ["communication-audiovisual", "social-research"],
    validationNotes:
      "Distingue comunicacion informativa/social de creatividad audiovisual o diseno visual.",
  },
  {
    id: "social-work-community-development",
    familyId: "social-community-public-service",
    name: "Trabajo Social y Desarrollo Comunitario",
    description:
      "Exploracion de acompanamiento, comunidad, inclusion, gestion de apoyo, bienestar colectivo y mejora de condiciones sociales.",
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
    name: "Sociologia, Antropologia e Investigacion Social",
    description:
      "Exploracion de sociedad, cultura, grupos humanos, investigacion cualitativa, patrones sociales y explicacion de fenomenos colectivos.",
    relatedProfileIds: ["educacion-ciencias-sociales", "ciencia-datos-investigacion"],
    coreRiasec: ["social", "investigativo"],
    supportBigFive: ["apertura", "responsabilidad"],
    semanticFocus: ["scientific-analysis", "perspective-taking", "evidence-based-reasoning"],
    careerExamples: ["Sociologia", "Antropologia", "Investigacion social"],
    conflictsWith: ["history-philosophy-humanities", "science-data-analysis"],
    validationNotes:
      "Evita que interes investigativo sobre personas y sociedad caiga automaticamente en ciencia/datos.",
  },
  {
    id: "international-relations-public-policy",
    familyId: "social-community-public-service",
    name: "Relaciones Internacionales y Politicas Publicas",
    description:
      "Exploracion de instituciones, sociedad, negociacion, problemas publicos, analisis de contexto y toma de decisiones colectivas.",
    relatedProfileIds: ["negocios-gestion", "educacion-ciencias-sociales", "administracion-finanzas"],
    coreRiasec: ["emprendedor", "social", "investigativo"],
    supportBigFive: ["extraversion", "apertura", "responsabilidad"],
    semanticFocus: ["persuasion-influence", "evidence-based-reasoning", "decision-making"],
    careerExamples: ["Relaciones internacionales", "Politicas publicas", "Gestion publica"],
    conflictsWith: ["derecho-ciencias-juridicas", "business-project-management"],
    validationNotes:
      "Distingue instituciones y asuntos publicos de negocios privados o derecho puro.",
  },
  {
    id: "business-project-management",
    familyId: "business-management-entrepreneurship",
    name: "Negocios y Gestion de Proyectos",
    description:
      "Exploracion de planificacion, coordinacion, ventas, viabilidad, negociacion y decisiones para hacer avanzar proyectos.",
    relatedProfileIds: ["negocios-gestion"],
    coreRiasec: ["emprendedor"],
    supportBigFive: ["extraversion", "responsabilidad"],
    semanticFocus: ["initiative-taking", "persuasion-influence", "coordination-leadership"],
    careerExamples: ["Administracion", "Marketing", "Emprendimiento"],
    conflictsWith: ["environmental-management", "business-social-leadership"],
    validationNotes:
      "Debe evitar capturar Ambiental cuando la senal de gestion esta al servicio de sostenibilidad.",
  },
  {
    id: "derecho-ciencias-juridicas",
    familyId: "law-institutions-legal-sciences",
    name: "Derecho y Ciencias Juridicas",
    description:
      "Exploracion de argumentacion, normas, negociacion, analisis de casos, evidencia, mediacion e interaccion institucional.",
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
      "Ciencias Juridicas",
      "Gestion publica",
      "Mediacion y resolucion de conflictos",
      "Relaciones institucionales",
    ],
    conflictsWith: ["business-project-management", "education-community-development", "administrative-finance"],
    validationNotes:
      "Subruta metodologica para validar intereses juridicos sin usarla todavia en ranking, score ni resultados finales.",
  },
  {
    id: "administrative-finance",
    familyId: "administration-finance-processes",
    name: "Finanzas, Administracion y Procesos",
    description:
      "Exploracion de presupuestos, registros, control, exactitud, operaciones, informacion y estructura administrativa.",
    relatedProfileIds: ["administracion-finanzas"],
    coreRiasec: ["convencional", "emprendedor"],
    supportBigFive: ["responsabilidad"],
    semanticFocus: ["information-management", "organization-structure", "precision-following"],
    careerExamples: ["Finanzas", "Contabilidad", "Administracion"],
    conflictsWith: ["industrial-processes", "business-project-management"],
    validationNotes:
      "Debe diferenciar orden financiero/procesal de liderazgo o emprendimiento.",
  },
];

export const adaptiveThemeBlocks: AdaptiveThemeBlock[] = [
  {
    id: "technical-applied",
    name: "Bloque tecnico aplicado",
    description:
      "Profundiza funcionamiento practico, analisis, pruebas y solucion aplicada de problemas.",
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
      "Profundiza diseno, creatividad aplicada, organizacion visual y exploracion de soluciones creativas.",
    dimensions: ["artistico", "apertura", "responsabilidad", "tolerancia"],
    semanticFocus: [
      "applied-design",
      "visual-spatial-creativity",
      "spatial-organization",
      "conceptual-creation",
      "cognitive-flexibility",
    ],
  },
  {
    id: "social-educational",
    name: "Bloque social educativo",
    description:
      "Profundiza acompanamiento, ensenanza, orientacion, comunicacion y cuidado interpersonal.",
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
    name: "Bloque liderazgo y gestion",
    description:
      "Profundiza organizacion, liderazgo, negociacion, coordinacion y desarrollo de proyectos.",
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
    id: "clarity-context",
    name: "Bloque claridad y contexto",
    description:
      "Profundiza dudas, presion externa, ansiedad de decision y tolerancia cuando el contexto afecta la eleccion.",
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

export const minLikertQuestions = 12;
export const COMMON_BASELINE_QUESTION_COUNT = 14;
export const maxLikertQuestions = 26;
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
