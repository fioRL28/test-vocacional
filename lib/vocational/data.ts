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

export const questions: Question[] = [
  { id: 1, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando tengo que aprender algo nuevo, me ayuda probarlo con las manos, armarlo, repararlo o verlo funcionar en la práctica.", dimension: "realista", stage: "exploracion" },
  { id: 2, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando algo no sale como esperaba, suelo preguntarme qué lo causó y busco evidencias antes de sacar una conclusión.", dimension: "investigativo", stage: "exploracion" },
  { id: 3, kind: "likert", model: "RIASEC", promptStyle: "exploratory", text: "Me resulta natural expresar ideas mediante historias, diseño, música, imágenes, videos o formas creativas de comunicar.", dimension: "artistico", stage: "exploracion" },
  { id: 4, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Cuando alguien de mi entorno tiene un problema, suelo escuchar con atención y tratar de ayudarle a ordenar lo que siente o piensa.", dimension: "social", stage: "exploracion" },
  { id: 5, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si un grupo tiene una idea pero nadie la organiza, tiendo a proponer un plan, repartir tareas o animar a que avance.", dimension: "emprendedor", stage: "exploracion" },
  { id: 6, kind: "likert", model: "RIASEC", promptStyle: "behavioral", text: "Me siento cómodo cuando una actividad requiere orden, seguimiento de pasos, registro de información o cuidado de detalles.", dimension: "convencional", stage: "exploracion" },

  { id: 7, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Me interesa probar ideas nuevas, aunque al inicio no tenga claro si van a funcionar.", dimension: "apertura", stage: "exploracion" },
  { id: 8, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una tarea es importante, suelo organizarme para terminarla aunque no tenga ganas todo el tiempo.", dimension: "responsabilidad", stage: "exploracion", optionalComment: true },
  { id: 9, kind: "likert", model: "Big Five", promptStyle: "situational", text: "En una exposición o trabajo grupal, puedo asumir una parte visible si eso ayuda a que el equipo avance.", dimension: "extraversion", stage: "exploracion" },
  { id: 10, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando trabajo con otros, intento entender distintos puntos de vista antes de imponer el mío.", dimension: "amabilidad", stage: "exploracion" },
  { id: 11, kind: "likert", model: "Big Five", promptStyle: "reflective", text: "Pensar en elegir una carrera o proyecto de vida me genera preocupación por equivocarme o decepcionar a alguien.", dimension: "neuroticismo", stage: "exploracion", optionalComment: true },

  { id: 12, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Siento que todavía me falta claridad para reconocer qué tipo de vida profesional quiero construir.", dimension: "incertidumbre", stage: "contexto", optionalComment: true },
  { id: 13, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Al pensar en mi futuro, noto que las expectativas familiares, sociales o económicas influyen bastante en mi decisión.", dimension: "presion", stage: "contexto", optionalComment: true },
  { id: 14, kind: "likert", model: "Contexto", promptStyle: "situational", text: "Si una actividad se vuelve difícil, suelo intentar otra estrategia, pedir ayuda o practicar antes de abandonarla.", dimension: "tolerancia", stage: "contexto", optionalComment: true },

  { id: 15, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si tuviera que elegir un proyecto escolar, me atraería uno donde pueda construir, programar, medir, reparar o probar un prototipo.", dimension: "realista", stage: "profundizacion" },
  { id: 16, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Si aparece un problema complejo, me motiva analizar datos, comparar alternativas y defender una respuesta con evidencia.", dimension: "investigativo", stage: "profundizacion" },
  { id: 17, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me imaginaría disfrutando un proyecto donde tenga que crear una campaña, una pieza visual, una historia, una marca o una experiencia.", dimension: "artistico", stage: "profundizacion" },
  { id: 18, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me vería en actividades donde tenga que orientar, enseñar, acompañar o mejorar el bienestar de otras personas.", dimension: "social", stage: "profundizacion" },
  { id: 19, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me interesa participar en retos donde haya que convencer, negociar, liderar o convertir una idea en algo viable.", dimension: "emprendedor", stage: "profundizacion" },
  { id: 20, kind: "likert", model: "RIASEC", promptStyle: "situational", text: "Me resultaría llevadero trabajar con presupuestos, bases de datos, inventarios, procesos o información que requiere exactitud.", dimension: "convencional", stage: "profundizacion" },

  { id: 21, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una solución conocida no funciona, puedo cambiar de enfoque sin sentir que perdí el tiempo.", dimension: "apertura", stage: "profundizacion", optionalComment: true },
  { id: 22, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Puedo sostener una rutina de estudio o práctica si entiendo para qué me sirve, aunque no sea entretenida.", dimension: "responsabilidad", stage: "profundizacion", optionalComment: true },
  { id: 23, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "Cuando una situación necesita comunicación, puedo iniciar conversaciones, preguntar o presentar ideas sin bloquearme demasiado.", dimension: "extraversion", stage: "profundizacion" },
  { id: 24, kind: "likert", model: "Big Five", promptStyle: "behavioral", text: "En desacuerdos, trato de cuidar la relación y buscar una salida justa, no solo ganar la discusión.", dimension: "amabilidad", stage: "profundizacion" },
  { id: 25, kind: "likert", model: "Big Five", promptStyle: "reflective", text: "Cuando una decisión importante depende de mí, puedo quedarme pensando demasiado en lo que podría salir mal.", dimension: "neuroticismo", stage: "profundizacion", optionalComment: true },

  { id: 26, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "Cuando algo me interesa de verdad, busco videos, cursos, personas o experiencias para entenderlo mejor por mi cuenta.", dimension: "apertura", stage: "profundizacion", optionalComment: true },
  { id: 27, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "He continuado practicando alguna actividad aunque al inicio me saliera mal o me comparara con personas más avanzadas.", dimension: "tolerancia", stage: "profundizacion", optionalComment: true },
  { id: 28, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "A veces digo que me interesa una carrera, pero no estoy seguro de si me gusta a mí o si me gusta la imagen que otros tienen de ella.", dimension: "incertidumbre", stage: "contexto", optionalComment: true },
  { id: 29, kind: "likert", model: "Contexto", promptStyle: "reflective", text: "Me preocupa que una opción que me gusta sea vista como poco segura, poco rentable o poco aceptada por mi entorno.", dimension: "presion", stage: "contexto", optionalComment: true },
  { id: 30, kind: "likert", model: "Contexto", promptStyle: "behavioral", text: "Cuando una meta me importa, puedo dividirla en pasos pequeños y avanzar aunque no tenga una respuesta perfecta desde el inicio.", dimension: "responsabilidad", stage: "profundizacion", optionalComment: true },

  {
    id: 101,
    kind: "open",
    promptStyle: "reflective",
    text: "Cuando piensas en tu futuro profesional, ¿cuál es la duda que aparece con más frecuencia?",
    stage: "contexto",
    trigger: "uncertainty",
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
    helperPrompts: [
      "Elegiría la actividad que me hace perder la noción del tiempo.",
      "Elegiría una experiencia gratuita para probar si realmente me gusta.",
      "Me cuesta priorizar porque varias opciones me atraen por razones distintas.",
    ],
  },
];

export const profiles: Profile[] = [
  {
    id: "ingenieria-tecnologia",
    name: "Ingeniería, Tecnología y Sistemas",
    description: "Perfil asociado a resolver problemas técnicos, construir soluciones, analizar sistemas y aprender mediante experimentación práctica.",
    dimensions: { realista: 1.0, investigativo: 1.4, convencional: 0.7, apertura: 0.7, responsabilidad: 0.8, tolerancia: 0.5 },
  },
  {
    id: "ciencia-datos-investigacion",
    name: "Ciencia, Datos e Investigación",
    description: "Perfil orientado a formular preguntas, analizar evidencia, interpretar patrones y construir conocimiento verificable.",
    dimensions: { investigativo: 1.6, convencional: 0.8, apertura: 0.9, responsabilidad: 0.7, tolerancia: 0.5 },
  },
  {
    id: "salud-apoyo-humano",
    name: "Salud, Psicología y Apoyo Humano",
    description: "Perfil vinculado al cuidado, bienestar, acompañamiento, intervención y comprensión de necesidades humanas.",
    dimensions: { social: 1.5, investigativo: 0.7, amabilidad: 1.0, responsabilidad: 0.8, tolerancia: 0.4 },
  },
  {
    id: "educacion-ciencias-sociales",
    name: "Educación y Ciencias Sociales",
    description: "Perfil enfocado en aprendizaje, orientación, comunicación, trabajo comunitario y desarrollo de personas o grupos.",
    dimensions: { social: 1.5, artistico: 0.5, extraversion: 0.7, amabilidad: 0.9, responsabilidad: 0.5 },
  },
  {
    id: "arte-comunicacion-diseno",
    name: "Arte, Comunicación y Diseño",
    description: "Perfil relacionado con creatividad, expresión, narrativa, medios, diseño, publicidad y producción de contenidos.",
    dimensions: { artistico: 1.6, apertura: 1.0, extraversion: 0.5, social: 0.4, tolerancia: 0.3 },
  },
  {
    id: "negocios-gestion",
    name: "Negocios, Gestión y Emprendimiento",
    description: "Perfil asociado a liderazgo, ventas, administración, estrategia, negociación y creación de proyectos.",
    dimensions: { emprendedor: 1.6, convencional: 0.8, extraversion: 0.8, responsabilidad: 0.7, tolerancia: 0.3 },
  },
  {
    id: "administracion-finanzas",
    name: "Administración, Finanzas y Gestión Operativa",
    description: "Perfil orientado a orden, control, datos, procesos, recursos, operaciones y toma de decisiones estructuradas.",
    dimensions: { convencional: 1.5, emprendedor: 0.8, responsabilidad: 1.0, investigativo: 0.5, neuroticismo: -0.2 },
  },
];

export const minLikertQuestions = 12;
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
