import {
  adaptiveFocusByRiasec,
  adaptiveThemeBlocks,
  bigFiveDimensions,
  COMMON_BASELINE_QUESTION_COUNT,
  contextDimensions,
  dimensionLabels,
  maxForcedChoiceQuestions,
  maxOpenQuestions,
  measurableDimensions,
  profiles,
  questions,
  riasecDimensions,
} from "./data";
import {
  analizarRespuestaLibreVocacional,
  analizarTextoNarrativo,
  analizarTextoFocoSemantico,
} from "./responsePatterns";
import type {
  AdaptiveStatus,
  AdaptiveDiagnostics,
  AdaptiveClosingReason,
  Answer,
  ContradictionStatus,
  Dimension,
  LikertAnswer,
  OpenAnswer,
  Profile,
  Question,
  AdaptiveThemeBlock,
  ResultIndicators,
  SearchParams,
  SemanticCoverage,
  ValidationObservation,
  VocationalCombinedPattern,
} from "./types";

export const CORE_THRESHOLD = 3.5;
const NEARBY_PROFILE_GAP = 1.5;
const SEMANTIC_FOCUS_THRESHOLD = 3.5;
const MIN_SEMANTIC_COVERAGE_RATIO = 0.66;
const MIN_PRIMARY_SEMANTIC_COVERAGE_RATIO = 0.5;
const BROAD_INTEREST_DIMENSION_COUNT = 4;
const BROAD_INTEREST_MAX_SPREAD = 1;
const MIN_THEME_BLOCK_QUESTIONS = 2;
const MAX_THEME_BLOCK_QUESTIONS = 4;
const RECOMMENDED_MAX_LIKERT_QUESTIONS = 26;
export const MAX_COMMENT_LENGTH = 300;

type VocationalCombinedPatternDefinition = Omit<
  VocationalCombinedPattern,
  "score"
> & {
  weights: Partial<Record<Dimension, number>>;
};

const combinedPatternDefinitions: VocationalCombinedPatternDefinition[] = [
  {
    id: "human-support-wellbeing",
    label: "Apoyo humano, salud, orientación y bienestar",
    profileId: "salud-apoyo-humano",
    dimensions: ["social", "amabilidad", "responsabilidad"],
    weights: { social: 1.2, amabilidad: 1.0, responsabilidad: 0.8 },
    explanation:
      "Tus respuestas combinan interés por trabajar con personas, cooperación y responsabilidad. Por eso aparecen rutas de apoyo humano, salud, orientación o bienestar.",
  },
  {
    id: "social-leadership-education",
    label: "Coordinación de personas, educación y liderazgo social",
    profileId: "educacion-ciencias-sociales",
    dimensions: ["social", "extraversion", "emprendedor"],
    weights: { social: 1.05, extraversion: 0.8, emprendedor: 0.8 },
    explanation:
      "Tus respuestas combinan participación con otras personas, iniciativa y comunicación. Por eso aparecen rutas de coordinación de grupos, educación, liderazgo social o gestión con personas.",
    socialManagementNuance: true,
  },
  {
    id: "management-processes",
    label: "Gestión, administración, proyectos y procesos",
    profileId: "negocios-gestion",
    dimensions: ["emprendedor", "convencional", "responsabilidad"],
    weights: { emprendedor: 1.1, convencional: 0.85, responsabilidad: 0.85 },
    explanation:
      "Tus respuestas combinan iniciativa, organización y constancia. Por eso aparecen rutas relacionadas con coordinación de actividades, gestión de proyectos o liderazgo de equipos.",
    requiresExplicitOperationalSignal: true,
  },
  {
    id: "research-analysis",
    label: "Investigación, análisis, ciencia y datos",
    profileId: "ciencia-datos-investigacion",
    dimensions: ["investigativo", "apertura", "responsabilidad"],
    weights: { investigativo: 1.15, apertura: 0.85, responsabilidad: 0.8 },
    explanation:
      "Tus respuestas combinan curiosidad, análisis y responsabilidad. Por eso aparecen rutas de investigación, ciencia, datos o interpretación de evidencia.",
  },
  {
    id: "creative-communication",
    label: "Comunicación, diseño y contenidos",
    profileId: "arte-comunicacion-diseno",
    dimensions: ["artistico", "apertura", "extraversion"],
    weights: { artistico: 1.15, apertura: 0.9, extraversion: 0.65 },
    explanation:
      "Tus respuestas combinan creatividad, apertura a ideas y comunicación. Por eso aparecen rutas de diseño, comunicación, contenidos o expresión visual.",
  },
  {
    id: "applied-technology",
    label: "Tecnología, ingeniería y soluciones aplicadas",
    profileId: "ingenieria-tecnologia",
    dimensions: ["realista", "investigativo", "responsabilidad"],
    weights: { realista: 1.1, investigativo: 1.0, responsabilidad: 0.8 },
    explanation:
      "Tus respuestas combinan interés práctico, análisis y constancia. Por eso aparecen rutas de tecnología, ingeniería o soluciones aplicadas.",
  },
  {
    id: "spatial-object-design",
    label: "Diseño espacial, arquitectura y objetos",
    profileId: "arte-comunicacion-diseno",
    dimensions: ["artistico", "realista", "apertura"],
    weights: { artistico: 1.05, realista: 0.9, apertura: 0.85 },
    explanation:
      "Tus respuestas combinan creatividad, interés práctico y exploración de ideas. Por eso aparecen rutas de diseño espacial, arquitectura, objetos o ambientes.",
  },
];

type SanitizedUserText = {
  text: string;
  suspiciousInput: boolean;
  suspiciousReason?: string;
};

function obtenerParametro(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function codificarRespuestas(answers: Answer[]) {
  return Buffer.from(JSON.stringify(answers), "utf8").toString("base64url");
}

export function decodificarRespuestas(value: string | undefined): Answer[] {
  if (!value) return [];

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? sanearRespuestasDecodificadas(parsed) : [];
  } catch {
    return [];
  }
}

function sanearRespuestasDecodificadas(answers: unknown[]) {
  return answers.flatMap((answer): Answer[] => {
    if (!answer || typeof answer !== "object") return [];

    const candidate = answer as Partial<Answer>;

    if (candidate.kind === "likert") {
      const sanitizedComment = sanearTextoUsuarioOpcional(candidate.comment);

      return [
        {
          ...candidate,
          ...(sanitizedComment.text ? { comment: sanitizedComment.text } : {}),
          ...(sanitizedComment.suspiciousInput
            ? {
                suspiciousInput: true,
                suspiciousReason: combinarRazonesSospechosas(
                  candidate.suspiciousReason,
                  sanitizedComment.suspiciousReason,
                ),
              }
            : {}),
        } as LikertAnswer,
      ];
    }

    if (candidate.kind === "open") {
      const sanitizedText = sanearTextoUsuario(candidate.text ?? "");
      const sanitizedCareerReference = sanearTextoUsuarioOpcional(candidate.careerReference);

      return [
        {
          ...candidate,
          text: sanitizedText.text || "Sin respuesta",
          ...(sanitizedCareerReference.text
            ? { careerReference: sanitizedCareerReference.text }
            : {}),
          ...(sanitizedText.suspiciousInput || sanitizedCareerReference.suspiciousInput
            ? {
                suspiciousInput: true,
                suspiciousReason: combinarRazonesSospechosas(
                  candidate.suspiciousReason,
                  sanitizedText.suspiciousReason,
                  sanitizedCareerReference.suspiciousReason,
                ),
              }
            : {}),
        } as OpenAnswer,
      ];
    }

    return [];
  });
}

function sanearTextoUsuarioOpcional(value: string | undefined) {
  return value ? sanearTextoUsuario(value) : { text: "", suspiciousInput: false };
}

function combinarRazonesSospechosas(...reasons: Array<string | undefined>) {
  const uniqueReasons = Array.from(new Set(reasons.filter((reason): reason is string => Boolean(reason))));

  return uniqueReasons.length ? uniqueReasons.join(", ") : undefined;
}

export function sanearTextoUsuario(value: string, maxLength = MAX_COMMENT_LENGTH): SanitizedUserText {
  const reasons: string[] = [];
  const original = String(value ?? "");
  let sanitized = original.replace(/\u0000/g, "").trim();

  if (sanitized.length > maxLength) {
    reasons.push("length-limit");
    sanitized = sanitized.slice(0, maxLength);
  }

  if (contieneMarcadoPeligroso(original)) {
    reasons.push("dangerous-markup");
  }

  sanitized = quitarMarcadoPeligroso(sanitized);

  if (tieneRuidoExcesivoSimbolos(sanitized)) {
    reasons.push("excessive-symbol-noise");
    sanitized = reducirRuidoSimbolos(sanitized);
  }

  if (tieneSoloCaracterRepetido(normalizarTextoAbierto(sanitized))) {
    reasons.push("repeated-character-noise");
  }

  const escaped = escaparHtml(sanitized).trim();

  return {
    text: escaped,
    suspiciousInput: reasons.length > 0,
    suspiciousReason: reasons.length ? Array.from(new Set(reasons)).join(", ") : undefined,
  };
}

function contieneMarcadoPeligroso(value: string) {
  const lower = value.toLowerCase();

  return (
    lower.includes("<script") ||
    lower.includes("</script") ||
    lower.includes("<iframe") ||
    lower.includes("</iframe") ||
    lower.includes("<svg") ||
    lower.includes("</svg") ||
    lower.includes("<img") ||
    lower.includes("javascript:") ||
    /\son[a-z]+\s*=/i.test(value)
  );
}

function quitarMarcadoPeligroso(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function escaparHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tieneRuidoExcesivoSimbolos(value: string) {
  const compact = value.replace(/\s/g, "");
  if (compact.length < 12) return false;

  const symbolCount = Array.from(compact).filter((character) =>
    /[^\p{L}\p{N}]/u.test(character),
  ).length;

  return symbolCount / compact.length > 0.45;
}

function reducirRuidoSimbolos(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s.,;:¿?¡!()/-]/gu, "")
    .replace(/([.,;:¿?¡!()/-])\1{2,}/g, "$1$1")
    .trim();
}

export function obtenerRespuestasLikert(answers: Answer[]) {
  return answers.filter((answer): answer is LikertAnswer => answer.kind === "likert");
}

export function obtenerRespuestasAbiertas(answers: Answer[]) {
  return answers.filter((answer): answer is OpenAnswer => answer.kind === "open");
}

export function obtenerRespuestaDePregunta(answers: Answer[], questionId: number) {
  return answers.find((answer) => answer.questionId === questionId);
}

export function obtenerPreguntaEditable(answers: Answer[], searchParams: SearchParams) {
  const editQuestionId = Number(obtenerParametro(searchParams, "editQuestionId"));

  if (!Number.isInteger(editQuestionId)) return null;
  if (!answers.some((answer) => answer.questionId === editQuestionId)) return null;

  return questions.find((question) => question.id === editQuestionId) ?? null;
}

function normalizarTextoAbierto(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function esRespuestaAbiertaDeBajaInformacion(text: string) {
  const normalized = normalizarTextoAbierto(text);

  return [
    "no se",
    "nose",
    "no lo se",
    "no estoy seguro",
    "no estoy segura",
    "ni idea",
    "sin respuesta",
    "no lo tengo claro todavia",
  ].includes(normalized) || normalized.includes("no lo tengo claro");
}

function tieneTextoDudaSinResolver(text: string) {
  const normalized = normalizarTextoAbierto(text);
  const unresolvedPhrases = [
    "me cuesta elegir",
    "no se",
    "nose",
    "no lo se",
    "no lo tengo claro",
    "varias opciones",
    "muchas opciones",
    "no estoy seguro",
    "no estoy segura",
    "todavia no se",
  ];

  return unresolvedPhrases.some((phrase) => normalized.includes(phrase));
}

function tieneTonoAbsolutoODefensivo(text: string) {
  const normalized = normalizarTextoAbierto(text);
  const absolutePatterns = [
    "soy el mejor",
    "soy la mejor",
    "nadie es mejor que yo",
    "nadie me supera",
    "nunca fallo",
    "todo lo controlo",
    "a mi nada me sale mal",
    "nada me sale mal",
    "nunca me equivoco",
    "no necesito ayuda",
    "no necesito a nadie",
    "no me importa nadie",
    "todo me sale bien",
    "siempre tengo razon",
    "no tengo errores",
    "no cometo errores",
    "no me cuesta nada",
  ];
  const defensivePatterns = [
    "no necesito ayuda",
    "no necesito a nadie",
    "los demas no importan",
    "los demás no importan",
    "no me importa nadie",
  ];
  const absoluteWords = normalized
    .split(/\s+/)
    .filter((word) => ["siempre", "nunca", "nadie", "todo", "nada"].includes(word));
  const repeatedWords = normalized
    .split(/\s+/)
    .filter((word, index, words) => word.length > 3 && words.indexOf(word) !== index);

  return (
    absolutePatterns.some((pattern) => normalized.includes(pattern)) ||
    defensivePatterns.some((pattern) => normalized.includes(normalizarTextoAbierto(pattern))) ||
    absoluteWords.length >= 2 ||
    repeatedWords.length >= 3
  );
}

function tieneTonoAgresivo(text: string) {
  const normalized = normalizarTextoAbierto(text);
  const aggressivePatterns = [
    "idiota",
    "imbecil",
    "estupido",
    "estupida",
    "tonto",
    "tonta",
    "mierda",
    "callate",
    "calla",
    "odio a",
    "me da asco",
  ];

  return aggressivePatterns.some((pattern) => normalized.includes(pattern));
}

export function esComentarioUtil(comment: string | undefined) {
  if (!comment) return false;

  const trimmed = comment.trim();
  if (!trimmed) return false;

  const normalized = normalizarTextoAbierto(trimmed);
  if (!normalized) return false;

  const allowedDoubtSignals = [
    "no se",
    "nose",
    "no lo se",
    "depende",
    "me cuesta explicarlo",
    "me cuesta explicar",
    "no estoy seguro",
    "no estoy segura",
  ];

  if (allowedDoubtSignals.includes(normalized)) {
    return true;
  }

  const lowContentPatterns = [
    "xd",
    "jaja",
    "jeje",
    "aaaa",
    "aaaaa",
    "asdf",
    "qwerty",
    "sin comentarios",
    "nada",
    "ok",
    "si",
    "no",
  ];
  const simpleInsults = [
    "tonto",
    "tonta",
    "idiota",
    "imbecil",
    "estupido",
    "estupida",
    "mierda",
  ];
  const repeatedCharactersOnly = tieneSoloCaracterRepetido(normalized);
  const hasLettersOrNumbers = /[a-z0-9]/.test(normalized);

  if (!hasLettersOrNumbers || repeatedCharactersOnly) return false;
  if (lowContentPatterns.includes(normalized)) return false;
  if (simpleInsults.includes(normalized)) return false;
  if (tieneTonoAgresivo(normalized)) return false;

  return normalized.length >= 4;
}

function tieneSoloCaracterRepetido(value: string) {
  if (value.length < 3) return false;

  const firstCharacter = value[0];

  for (let index = 1; index < value.length; index += 1) {
    if (value[index] !== firstCharacter) return false;
  }

  return true;
}

export function esAclaracionUtil(answer: string) {
  const normalized = normalizarTextoAbierto(answer);

  if (!esComentarioUtil(answer)) return false;
  if (esRespuestaAbiertaDeBajaInformacion(answer)) return false;
  if (tieneTonoAbsolutoODefensivo(answer)) return false;
  if (["depende", "no se", "nose", "no lo se"].includes(normalized)) return false;

  const preferenceSignals = [
    "prefiero",
    "elegiria",
    "elijo",
    "me quedaria con",
    "elegiría",
    "me interesa mas",
    "me interesa más",
    "me gusta mas",
    "me gusta más",
    "priorizaria",
    "priorizaría",
    "me motiva",
    "porque",
    "por que",
    "por ejemplo",
    "cuando",
    "durante",
    "probaria",
    "probaría",
    "dedicaria",
    "dedicaría",
  ];
  const hasPreferenceSignal = preferenceSignals.some((signal) =>
    normalized.includes(normalizarTextoAbierto(signal)),
  );
  const clearChoiceSignals = [
    "prefiero",
    "elegiria",
    "elijo",
    "me quedaria con",
    "priorizaria",
    "me interesa mas",
    "me gusta mas",
    "me motiva mas",
  ];
  const hasClearChoice = clearChoiceSignals.some((signal) =>
    normalized.includes(normalizarTextoAbierto(signal)),
  );
  const hasEnoughContext = normalized.split(/\s+/).length >= 6;

  if (tieneTextoDudaSinResolver(answer) && !hasClearChoice) return false;

  return hasPreferenceSignal && hasEnoughContext;
}

export function obtenerConfiabilidadNarrativa(comments: string[]) {
  const usefulComments = comments.filter(esComentarioUtil);
  const analysisReliabilityImpact = comments.reduce(
    (total, comment) => total + analizarTextoNarrativo(comment).reliabilityImpact,
    0,
  );

  if (usefulComments.length === 0) return "medium";

  const lowReliabilityCount = usefulComments.filter((comment) => {
    const normalized = normalizarTextoAbierto(comment);
    const doesNotExplain = normalized.length < 12 && !["no se", "depende"].includes(normalized);

    return tieneTonoAbsolutoODefensivo(comment) || tieneTonoAgresivo(comment) || doesNotExplain;
  }).length;
  const hasRepeatedLowReliabilityPattern = lowReliabilityCount >= 2;
  const onlyLowReliabilityComments = lowReliabilityCount === usefulComments.length;

  if (
    analysisReliabilityImpact <= -15 ||
    hasRepeatedLowReliabilityPattern ||
    onlyLowReliabilityComments
  ) {
    return "low";
  }

  if (analysisReliabilityImpact < 0 || lowReliabilityCount === 1) {
    return "medium";
  }

  return "high";
}

function obtenerTextosNarrativos(answers: Answer[]) {
  return answers.flatMap((answer) => {
    if (answer.kind === "open") return [answer.text];
    return answer.comment ? [answer.comment] : [];
  });
}

function obtenerAnalisisNarrativo(answers: Answer[]) {
  const analyses = obtenerTextosNarrativos(answers).map(analizarTextoNarrativo);

  return {
    categories: Array.from(new Set(analyses.flatMap((analysis) => analysis.categories))),
    suggestedDimensions: Array.from(
      new Set(analyses.flatMap((analysis) => analysis.suggestedDimensions)),
    ),
    reliabilityImpact: analyses.reduce(
      (total, analysis) => total + analysis.reliabilityImpact,
      0,
    ),
    clarityImpact: analyses.reduce((total, analysis) => total + analysis.clarityImpact, 0),
  };
}

function obtenerFocoSemanticoNarrativo(answers: Answer[]) {
  return Array.from(
    new Set(
      answers.flatMap((answer) => {
        if (answer.kind === "likert") {
          return answer.comment ? analizarTextoFocoSemantico(answer.comment).semanticFocus : [];
        }

        if (answer.answerMode === "typed-text") {
          const analysis = analizarRespuestaLibreVocacional(answer.text);
          return analysis.usarParaRanking ? analysis.semanticFocus : [];
        }

        return analizarTextoFocoSemantico(answer.text).semanticFocus;
      }),
    ),
  );
}

function construirPuntajesIniciales() {
  return measurableDimensions.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: { total: 0, count: 0 },
    }),
    {} as Record<Dimension, { total: number; count: number }>,
  );
}

export function obtenerPromedios(answers: Answer[]) {
  const scores = construirPuntajesIniciales();

  obtenerRespuestasLikert(answers).forEach((answer) => {
    scores[answer.dimension].total += answer.value;
    scores[answer.dimension].count += 1;
  });

  return measurableDimensions.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: scores[dimension].count
        ? scores[dimension].total / scores[dimension].count
        : 0,
    }),
    {} as Record<Dimension, number>,
  );
}

export function calcularPuntajes(responses: Answer[]) {
  return obtenerPromedios(responses);
}

export function obtenerDimensionesPrincipales(scores: Record<Dimension, number>) {
  return measurableDimensions
    .map((dimension) => ({
      dimension,
      label: dimensionLabels[dimension],
      score: scores[dimension],
    }))
    .sort((a, b) => b.score - a.score);
}

export function calcularPuntajeDiferenciacion(
  riasecScores: Pick<Record<Dimension, number>, (typeof riasecDimensions)[number]>,
) {
  const highDimensions = riasecDimensions.filter(
    (dimension) => riasecScores[dimension] >= 4,
  );
  const highDimensionScores = highDimensions.map((dimension) => riasecScores[dimension]);
  const highDimensionSpread = highDimensionScores.length
    ? Math.max(...highDimensionScores) - Math.min(...highDimensionScores)
    : 0;
  const broadInterestPattern =
    highDimensions.length >= BROAD_INTEREST_DIMENSION_COUNT &&
    highDimensionSpread <= BROAD_INTEREST_MAX_SPREAD;
  const broadInterestReason = broadInterestPattern
    ? `${highDimensions.length} dimensiones RIASEC altas con diferencia maxima ${highDimensionSpread.toFixed(1)}. Esto sugiere amplitud de intereses y baja diferenciacion, no claridad vocacional.`
    : undefined;
  const clarityPenalty =
    broadInterestPattern
      ? 25
      : highDimensions.length >= 5
        ? 15
      : highDimensions.length === 4
        ? 10
        : highDimensions.length === 3
          ? 5
          : 0;

  return {
    highDimensions,
    highDimensionSpread,
    broadInterestPattern,
    broadInterestReason,
    possibleBroadInterest: broadInterestPattern || highDimensions.length >= 5,
    clarityPenalty,
    differentiationScore: Math.max(0, 100 - clarityPenalty),
  };
}

export function obtenerPuntajeConsistencia(responses: Answer[]) {
  const answersByDimension = obtenerRespuestasLikert(responses).reduce(
    (acc, answer) => ({
      ...acc,
      [answer.dimension]: [...(acc[answer.dimension] ?? []), answer.value],
    }),
    {} as Partial<Record<Dimension, number[]>>,
  );
  const dimensionGaps = Object.entries(answersByDimension).flatMap(
    ([dimension, values]) => {
      if (!values || values.length < 2) return [];

      return [
        {
          dimension: dimension as Dimension,
          gap: Math.max(...values) - Math.min(...values),
        },
      ];
    },
  );
  const strongContradictions = dimensionGaps.filter(({ gap }) => gap >= 3);
  const moderateContradictions = dimensionGaps.filter(
    ({ gap }) => gap >= 2 && gap < 3,
  );
  const consistencyScore = Math.max(
    0,
    100 - strongContradictions.length * 25 - moderateContradictions.length * 10,
  );

  return {
    consistencyScore,
    possibleContradiction: strongContradictions.length > 0,
    dimensionGaps,
  };
}

function tieneDimensionVariable(
  responses: Answer[],
  dimension: Dimension,
  minimumGap = 2,
) {
  const values = obtenerRespuestasLikert(responses)
    .filter((answer) => answer.dimension === dimension)
    .map((answer) => answer.value);

  if (values.length < 2) return false;

  return Math.max(...values) - Math.min(...values) >= minimumGap;
}

function esAclaracionSoloEconomica(text: string) {
  const analysis = analizarTextoNarrativo(text);
  const categories = new Set(analysis.categories);

  const hasEconomicConcern = categories.has("economic_concern");

  const hasVocationalMotivation =
    categories.has("intrinsic_motivation") ||
    categories.has("technical_motivation") ||
    categories.has("social_motivation") ||
    categories.has("creative_motivation") ||
    categories.has("leadership_motivation") ||
    categories.has("autonomy") ||
    categories.has("exploration");

  return hasEconomicConcern && !hasVocationalMotivation;
}

function esAclaracionSoloProcesoExploratorio(text: string) {
  const normalized = normalizarTextoAbierto(text);

  const processSignals = [
    "probar primero",
    "experiencia corta",
    "probar con una experiencia",
    "explorar primero",
    "ver como me va",
    "intentarlo un tiempo",
  ];

  const domainSignals = [
    "educacion",
    "ensenar",
    "salud",
    "bienestar",
    "ambiente",
    "recursos naturales",
    "plantas",
    "animales",
    "diseno",
    "grafico",
    "comunicacion",
    "gestion",
    "proyectos",
    "derecho",
    "tecnologia",
    "datos",
    "arquitectura",
  ];

  const hasProcessSignal = processSignals.some((signal) =>
    normalized.includes(normalizarTextoAbierto(signal)),
  );
  const hasDomainSignal = domainSignals.some((signal) =>
    normalized.includes(normalizarTextoAbierto(signal)),
  );

  return hasProcessSignal && !hasDomainSignal;
}

export function obtenerEstadoResolucionConflicto(
  scores: Record<Dimension, number>,
  responses: Answer[],
) {
  const consistency = obtenerPuntajeConsistencia(responses);
  const differentiation = calcularPuntajeDiferenciacion(scores);
  const openAnswers = obtenerRespuestasAbiertas(responses);
  const clarificationAnswers = openAnswers.filter((answer) =>
    ["prioritization", "contradiction", "motivation"].includes(answer.trigger),
  );
  const narrativeReliability = obtenerConfiabilidadNarrativa(
    clarificationAnswers.map((answer) => answer.text),
  );
  const usefulClarifications = clarificationAnswers.filter((answer) =>
    narrativeReliability !== "low" &&
    esAclaracionUtil(answer.text) &&
    !esAclaracionSoloEconomica(answer.text) &&
    !esAclaracionSoloProcesoExploratorio(answer.text),
  );
  const hasConflict =
    differentiation.possibleBroadInterest || consistency.possibleContradiction;
  const status: ContradictionStatus = !hasConflict
    ? "resolved"
    : usefulClarifications.length > 0
      ? "resolved"
      : clarificationAnswers.length > 0
        ? "attempted"
        : "unresolved";
  const isResolved = hasConflict && status === "resolved";
  const isExplored = hasConflict && clarificationAnswers.length >= 2;

  return {
    hasConflict,
    status,
    isResolved,
    isExplored,
    clarificationCount: clarificationAnswers.length,
    usefulClarificationCount: usefulClarifications.length,
  };
}

export function detectarContradicciones(
  scores: Record<Dimension, number>,
  responses: Answer[],
) {
  const consistency = obtenerPuntajeConsistencia(responses);
  const differentiation = calcularPuntajeDiferenciacion(scores);
  const resolution = obtenerEstadoResolucionConflicto(scores, responses);
  const topRiasec = obtenerDimensionesPrincipales(scores).filter(({ dimension }) =>
    riasecDimensions.includes(dimension),
  );
  const highRiasecDimensions = topRiasec.filter(({ score }) => score >= 4);
  const topInterest = topRiasec[0];
  const hasLowTolerance = scores.tolerancia > 0 && scores.tolerancia <= 2;
  const hasUsefulLikertComment = obtenerRespuestasLikert(responses).some((answer) =>
    esComentarioUtil(answer.comment),
  );
  const contradictions: Array<{
    code:
      | "high_interest_low_tolerance"
      | "pressure_low_clarity"
      | "multiple_high_dimensions"
      | "structured_flexibility"
      | "dimension_variance"
      | "broad_interests";
    message: string;
    severity: "low" | "medium" | "high";
  }> = [];

  if (topInterest && topInterest.score >= 4 && hasLowTolerance) {
    contradictions.push({
      code: "high_interest_low_tolerance",
      message:
        "Aparece un interés alto, pero la tolerancia a la dificultad es baja. Conviene validar ese interés con experiencias pequeñas antes de decidir.",
      severity: "high",
    });
  }

  if (scores.presion >= 4 && scores.incertidumbre >= 4) {
    contradictions.push({
      code: "pressure_low_clarity",
      message:
        "La presión externa y la incertidumbre aparecen altas. Puede ser útil separar expectativas del entorno de preferencias propias.",
      severity: "high",
    });
  }

  if (highRiasecDimensions.length >= 3 && scores.incertidumbre >= 3) {
    contradictions.push({
      code: "multiple_high_dimensions",
      message:
        "Hay varias dimensiones altas junto con señales de indecisión. El resultado debería leerse como un mapa de opciones compatibles, no como una única carrera.",
      severity: hasUsefulLikertComment ? "medium" : "high",
    });
  }

  if (scores.convencional >= 4 && scores.apertura >= 4) {
    contradictions.push({
      code: "structured_flexibility",
      message:
        "La preferencia por estructura convive con apertura alta. Puede funcionar mejor un entorno con reglas claras, pero espacio para proponer mejoras.",
      severity: "medium",
    });
  }

  if (consistency.possibleContradiction && !resolution.isResolved) {
    contradictions.push({
      code: "dimension_variance",
      message:
        "Hay respuestas muy distintas dentro de una misma dimensión. Conviene hacer preguntas aclaratorias antes de cerrar el resultado.",
      severity: "high",
    });
  }

  if (differentiation.possibleBroadInterest && !resolution.isResolved) {
    contradictions.push({
      code: "broad_interests",
      message:
        differentiation.broadInterestReason ??
        "Hay muchas dimensiones altas. Esto puede indicar amplitud de intereses más que un perfil claramente diferenciado.",
      severity: differentiation.broadInterestPattern ? "high" : "medium",
    });
  }

  return contradictions;
}

function obtenerPerfilPrincipalParaCierre(
  profileRanking: Array<Profile & { score: number }>,
  scores: Record<Dimension, number>,
) {
  return (
    profileRanking.find(
      (profile) => obtenerEstadoNucleoEstricto(profile, scores).coreMeetsStrictThreshold,
    ) ?? profileRanking[0] ?? null
  );
}

function obtenerBrechasFocoSemanticoPrincipal(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profile: Profile | null,
) {
  if (!profile) return [];

  const coreDimensionsWithSignal = profile.coreRiasec.filter(
    (dimension) => scores[dimension] >= CORE_THRESHOLD,
  );

  return obtenerCoberturaSemantica(responses, scores).filter(
    (coverage) =>
      coreDimensionsWithSignal.includes(coverage.dimension) &&
      coverage.coverageRatio < MIN_PRIMARY_SEMANTIC_COVERAGE_RATIO &&
      coverage.missingFocus.length > 0,
  );
}

export function obtenerDecisionCierreAdaptativo(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profileRanking: Array<Profile & { score: number }>,
  contradictions: Array<{ severity: "low" | "medium" | "high" }>,
): {
  shouldFinish: boolean;
  closingReason: AdaptiveClosingReason;
  primarySemanticGaps: SemanticCoverage[];
} {
  const likertCount = obtenerRespuestasLikert(responses).length;

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return {
      shouldFinish: false,
      closingReason: "baseline-incomplete",
      primarySemanticGaps: [],
    };
  }

  if (likertCount >= RECOMMENDED_MAX_LIKERT_QUESTIONS) {
    return {
      shouldFinish: true,
      closingReason: "max-question-limit",
      primarySemanticGaps: [],
    };
  }

  const consistency = obtenerPuntajeConsistencia(responses);
  const differentiation = calcularPuntajeDiferenciacion(scores);
  const resolution = obtenerEstadoResolucionConflicto(scores, responses);
  const strictCoreProfiles = profileRanking.filter(
    (profile) => obtenerEstadoNucleoEstricto(profile, scores).coreMeetsStrictThreshold,
  );
  const primaryProfile = obtenerPerfilPrincipalParaCierre(profileRanking, scores);
  const secondProfile =
    strictCoreProfiles.find((profile) => profile.id !== primaryProfile?.id) ??
    profileRanking.find((profile) => profile.id !== primaryProfile?.id) ??
    null;
  const primaryScore = primaryProfile?.score ?? 0;
  const profileGap = primaryProfile && secondProfile
    ? primaryScore - secondProfile.score
    : 0;
  const primaryCoreStatus = primaryProfile
    ? obtenerEstadoNucleoEstricto(primaryProfile, scores)
    : { coreMeetsStrictThreshold: false };
  const primarySemanticGaps = obtenerBrechasFocoSemanticoPrincipal(
    responses,
    scores,
    primaryProfile,
  );
  const highRiasecDimensions = riasecDimensions.filter(
    (dimension) => scores[dimension] >= 4,
  );
  const hasStrongContradictions = contradictions.some(
    (contradiction) => contradiction.severity === "high",
  );
  const hasContextRisk =
    scores.incertidumbre >= 4 ||
    scores.presion >= 4 ||
    scores.neuroticismo >= 4 ||
    scores.tolerancia < 3;
  const hasMixedRiasecWithoutDominance =
    highRiasecDimensions.length >= 3 && profileGap < 2.2;
  const unresolvedConflict =
    (resolution.hasConflict && !resolution.isResolved) ||
    differentiation.broadInterestPattern ||
    hasStrongContradictions ||
    hasMixedRiasecWithoutDominance;
  const lowDifferentiation =
    profileGap < NEARBY_PROFILE_GAP ||
    differentiation.possibleBroadInterest ||
    differentiation.broadInterestPattern ||
    differentiation.highDimensions.length >= BROAD_INTEREST_DIMENSION_COUNT;
  const hasClearPrimaryProfile =
    primaryCoreStatus.coreMeetsStrictThreshold &&
    primaryScore >= 10 &&
    profileGap >= 1.75 &&
    consistency.consistencyScore >= 75 &&
    !lowDifferentiation &&
    !unresolvedConflict &&
    !hasContextRisk;

  if (hasClearPrimaryProfile && primarySemanticGaps.length === 0) {
    return {
      shouldFinish: true,
      closingReason: "high-profile-clarity",
      primarySemanticGaps,
    };
  }

  if (unresolvedConflict || lowDifferentiation || hasContextRisk) {
    return {
      shouldFinish: false,
      closingReason: "unresolved-conflict",
      primarySemanticGaps,
    };
  }

  if (primarySemanticGaps.length > 0) {
    return {
      shouldFinish: false,
      closingReason: "missing-semantic-focus",
      primarySemanticGaps,
    };
  }

  return {
    shouldFinish: false,
    closingReason: "needs-deepening",
    primarySemanticGaps,
  };
}

export function debeFinalizarTest(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profileRanking: Array<Profile & { score: number }>,
  contradictions: Array<{ severity: "low" | "medium" | "high" }>,
) {
  return obtenerDecisionCierreAdaptativo(
    responses,
    scores,
    profileRanking,
    contradictions,
  ).shouldFinish;
}

export function obtenerObjetivoPreguntasActual(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profileRanking: Array<Profile & { score: number }>,
  contradictions: Array<{ severity: "low" | "medium" | "high" }>,
) {
  const likertCount = obtenerRespuestasLikert(responses).length;

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return COMMON_BASELINE_QUESTION_COUNT;
  }

  const closingDecision = obtenerDecisionCierreAdaptativo(
    responses,
    scores,
    profileRanking,
    contradictions,
  );

  if (closingDecision.shouldFinish) {
    return Math.max(likertCount, COMMON_BASELINE_QUESTION_COUNT);
  }

  const consistency = obtenerPuntajeConsistencia(responses);
  const differentiation = calcularPuntajeDiferenciacion(scores);
  const resolution = obtenerEstadoResolucionConflicto(scores, responses);
  const [firstProfile, secondProfile] = profileRanking;
  const profileGap = firstProfile && secondProfile
    ? firstProfile.score - secondProfile.score
    : 0;
  const topProfileScore = firstProfile?.score ?? 0;
  const hasStrongContradictions = contradictions.some(
    (contradiction) => contradiction.severity === "high",
  );
  const hasContextRisk =
    scores.incertidumbre >= 4 ||
    scores.presion >= 4 ||
    scores.neuroticismo >= 4 ||
    scores.tolerancia < 3;
  const hasConflict =
    resolution.hasConflict ||
    differentiation.possibleBroadInterest ||
    differentiation.broadInterestPattern ||
    hasStrongContradictions ||
    hasContextRisk;

  if (hasConflict) return RECOMMENDED_MAX_LIKERT_QUESTIONS;

  if (
    topProfileScore >= 12 &&
    profileGap >= 1.5 &&
    consistency.consistencyScore >= 80
  ) {
    return COMMON_BASELINE_QUESTION_COUNT;
  }

  if (
    topProfileScore >= 10 &&
    profileGap >= 1 &&
    consistency.consistencyScore >= 65
  ) {
    return 18;
  }

  return RECOMMENDED_MAX_LIKERT_QUESTIONS;
}

function puntuarPerfil(profile: Profile, averages: Record<Dimension, number>) {
  return Object.entries(profile.dimensions).reduce((total, [dimension, weight]) => {
    return total + averages[dimension as Dimension] * Number(weight);
  }, 0);
}

function calcularPuntajePatronCombinado(
  pattern: VocationalCombinedPatternDefinition,
  averages: Record<Dimension, number>,
) {
  const weightTotal = Object.values(pattern.weights).reduce(
    (total, weight) => total + Number(weight),
    0,
  );
  const weightedScore =
    Object.entries(pattern.weights).reduce((total, [dimension, weight]) => {
      return total + (averages[dimension as Dimension] ?? 0) * Number(weight);
    }, 0) / Math.max(weightTotal, 1);
  const dimensionsAboveThreshold = pattern.dimensions.filter(
    (dimension) => (averages[dimension] ?? 0) >= 3.5,
  ).length;
  const singleDimensionPenalty = dimensionsAboveThreshold < 2 ? 0.65 : 1;

  return Number((weightedScore * singleDimensionPenalty).toFixed(2));
}

export function obtenerPatronVocacionalDominante(
  averages: Record<Dimension, number>,
): VocationalCombinedPattern | null {
  const rankedPatterns = combinedPatternDefinitions
    .map((pattern) => ({
      ...pattern,
      score: calcularPuntajePatronCombinado(pattern, averages),
    }))
    .sort((left, right) => right.score - left.score);
  const bestPattern = rankedPatterns[0];

  return bestPattern && bestPattern.score >= 3.35 ? bestPattern : null;
}

export function obtenerPatronesVocacionalesOrdenados(
  averages: Record<Dimension, number>,
): VocationalCombinedPattern[] {
  return combinedPatternDefinitions
    .map((pattern) => ({
      ...pattern,
      score: calcularPuntajePatronCombinado(pattern, averages),
    }))
    .sort((left, right) => right.score - left.score);
}

function calcularAjustePorPatronCombinado(
  profile: Profile,
  patterns: VocationalCombinedPattern[],
) {
  const ownPattern = patterns.find((pattern) => pattern.profileId === profile.id);
  const bestPattern = patterns[0];
  let adjustment = 0;

  if (ownPattern && ownPattern.score >= 3.35) {
    adjustment += (ownPattern.score - 3.2) * 2.2;
  }

  if (bestPattern && bestPattern.profileId === profile.id && bestPattern.score >= 3.5) {
    adjustment += 1.2;
  }

  if (ownPattern && ownPattern.score < 3.1) {
    adjustment -= 1.2;
  }

  return adjustment;
}

export function obtenerEstadoNucleoPerfil(
  profile: Profile,
  averages: Record<Dimension, number>,
  threshold = CORE_THRESHOLD,
) {
  const coreScores = profile.coreRiasec.map((dimension) => averages[dimension] ?? 0);
  const coreAverage = coreScores.length
    ? coreScores.reduce((total, score) => total + score, 0) / coreScores.length
    : 0;
  const missingCoreDimensions = profile.coreRiasec.filter(
    (dimension) => (averages[dimension] ?? 0) < threshold,
  );

  return {
    coreAverage,
    coreMeetsThreshold: coreAverage >= threshold,
    missingCoreDimensions,
  };
}

export function obtenerEstadoNucleoEstricto(
  profile: Profile,
  averages: Record<Dimension, number>,
  threshold = CORE_THRESHOLD,
) {
  const missingCoreDimensions = profile.coreRiasec.filter(
    (dimension) => (averages[dimension] ?? 0) < threshold,
  );

  return {
    coreMeetsStrictThreshold: missingCoreDimensions.length === 0,
    missingCoreDimensions,
  };
}

function obtenerPerfilesOrdenados(averages: Record<Dimension, number>) {
  const combinedPatterns = obtenerPatronesVocacionalesOrdenados(averages);

  return profiles
    .map((profile) => ({
      ...profile,
      score:
        puntuarPerfil(profile, averages) +
        calcularAjustePorPatronCombinado(profile, combinedPatterns),
    }))
    .sort((a, b) => b.score - a.score);
}

type RankedProfile = Profile & {
  score: number;
  rawScore?: number;
  coherenceAdjustment?: number;
  decisionEvidence?: string[];
};

function obtenerTextoAbiertoNormalizadoParaDecision(answers: Answer[]) {
  return obtenerRespuestasAbiertas(answers)
    .map((answer) => {
      if (answer.answerMode !== "typed-text") {
        return normalizarTextoAbierto(answer.text);
      }

      const analysis = analizarRespuestaLibreVocacional(answer.text);

      return analysis.usarParaRanking ? normalizarTextoAbierto(answer.text) : "";
    })
    .filter(Boolean)
    .join(" | ");
}

function obtenerBonusIncertidumbreNarrativa(
  answers: Answer[],
  narrativeAnalysis: ReturnType<typeof obtenerAnalisisNarrativo>,
) {
  const text = obtenerTextoAbiertoNormalizadoParaDecision(answers);

  const explicitUncertaintySignal = contieneAlgunaFrase(text, [
    "me siento confundido",
    "no se como explicarlo",
    "no sé cómo explicarlo",
    "me cuesta elegir",
    "varias opciones me atraen",
    "no identifico que carrera encaja",
    "no identifico qué carrera encaja",
    "no tengo claro",
    "todavia no se",
    "todavía no sé",
  ]);

  const patternUncertaintySignal =
    narrativeAnalysis.categories.includes("uncertainty");

  if (!explicitUncertaintySignal && !patternUncertaintySignal) {
    return 0;
  }

  const clarityImpactBonus = Math.abs(Math.min(0, narrativeAnalysis.clarityImpact)) * 2;

  return Math.min(40, Math.max(25, clarityImpactBonus));
}

function contieneAlgunaFrase(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(normalizarTextoAbierto(phrase)));
}

function calcularAjusteCoherenciaPerfil(
  profile: Profile & { score: number },
  answers: Answer[],
  averages: Record<Dimension, number>,
) {
  const text = obtenerTextoAbiertoNormalizadoParaDecision(answers);
  let adjustment = 0;
  const evidence: string[] = [];

  const technicalToolsSignal = contieneAlgunaFrase(text, [
    "usar instrumentos maquinas o herramientas tecnicas",
    "usar instrumentos, maquinas o herramientas tecnicas",
    "herramientas tecnicas",
    "sistemas fisicos",
    "probar ajustar o mejorar objetos herramientas o sistemas fisicos",
    "comprender como funcionan cosas o sistemas",
  ]);

  const dataAnalysisSignal = contieneAlgunaFrase(text, [
    "analizar datos numericos patrones o tendencias",
    "datos numericos",
    "patrones o tendencias",
    "analizar informacion confiable",
    "investigar y descubrir informacion",
  ]);
  const spatialDesignSignal = contieneAlgunaFrase(text, [
    "disenar o mejorar espacios productos muebles o prototipos",
    "disenar espacios fisicos considerando forma funcion y experiencia",
    "disenar espacios fisicos",
    "espacios fisicos ambientes o distribuciones funcionales para personas",
    "disenar ambientes interiores objetos o espacios funcionales",
  ]);

  const communitySignal = contieneAlgunaFrase(text, [
    "intervenir en problemas sociales o comunitarios",
    "problemas sociales",
    "problemas comunitarios",
    "comunidad",
    "trabajo social",
    "desarrollo comunitario",
  ]);

  const helpPeopleSignal = contieneAlgunaFrase(text, [
    "ayudar a otras personas",
    "ayudar y acompanar personas",
    "escuchar orientar o acompanar",
    "brindar apoyo",
    "apoyo humano",
    "acompanar procesos personales",
  ]);

  const teachingSignal = contieneAlgunaFrase(text, [
    "ensenar",
    "explicar temas",
    "facilitar el aprendizaje",
    "educacion",
  ]);

  const businessSignal = contieneAlgunaFrase(text, [
    "emprender un negocio",
    "vender una propuesta",
    "negocio",
    "ventas",
    "coordinar un proyecto",
  ]);

  const creativeSignal = contieneAlgunaFrase(text, [
    "crear propuestas innovadoras",
    "crear soluciones comunicativas",
    "disenar",
    "contenido visual",
    "contenido narrativo",
  ]);

  const hasSocialDecisionSignal =
    communitySignal || helpPeopleSignal || teachingSignal;

  const hasTechnicalDecisionSignal =
    technicalToolsSignal || dataAnalysisSignal || spatialDesignSignal;

  switch (profile.id) {
    case "educacion-ciencias-sociales": {
      if (communitySignal) {
        adjustment += 5;
        evidence.push("prioridad comunitaria/social");
      }

      if (helpPeopleSignal) {
        adjustment += 4;
        evidence.push("prioridad declarada de ayuda a personas");
      }

      if (teachingSignal) {
        adjustment += 3;
        evidence.push("señal educativa");
      }

      if (averages.social >= 4 && hasSocialDecisionSignal) {
        adjustment += 1.5;
        evidence.push("Social alto confirmado por elección guiada");
      }

      if (dataAnalysisSignal && communitySignal) {
        adjustment += 0.8;
        evidence.push("análisis aplicado a fenómenos sociales");
      }

      break;
    }

    case "salud-apoyo-humano": {
      if (helpPeopleSignal) {
        adjustment += 3;
        evidence.push("apoyo directo a personas");
      }

      if (communitySignal) {
        adjustment += 1.8;
        evidence.push("intervención social/comunitaria");
      }

      if (teachingSignal) {
        adjustment += 0.8;
        evidence.push("orientación o explicación a personas");
      }

      if (averages.amabilidad > 0 && averages.amabilidad < 3) {
        adjustment -= 1;
        evidence.push("amabilidad no suficientemente alta para cuidado directo");
      }

      break;
    }

    case "ciencia-datos-investigacion": {
      if (dataAnalysisSignal) {
        adjustment += 3;
        evidence.push("preferencia explícita por datos, patrones o tendencias");
      }

      if (spatialDesignSignal) {
        adjustment -= 3;
        evidence.push("la elección específica apunta a diseño espacial/prototipado, no a datos como centro");
      }

      if (averages.convencional <= 2 && averages.responsabilidad <= 2.5) {
        adjustment -= 3;
        evidence.push("baja afinidad con orden, revisión y seguimiento sostenido");
      }

      if (communitySignal) {
        adjustment += 1.2;
        evidence.push("investigación aplicada a problemas sociales");
      }

      if (technicalToolsSignal) {
        adjustment += 0.4;
        evidence.push("señal técnica secundaria");
      }

      break;
    }

    case "ingenieria-tecnologia": {
      if (spatialDesignSignal) {
        adjustment += 2;
        evidence.push("diseño aplicado, espacios o prototipado");
      }

      if (technicalToolsSignal) {
        adjustment += 1.8;
        evidence.push("uso de herramientas o sistemas técnicos");
      }

      if (dataAnalysisSignal) {
        adjustment += 0.8;
        evidence.push("análisis de datos como señal técnica secundaria");
      }

      if (communitySignal) {
        adjustment -= 2.5;
        evidence.push("la elección social/comunitaria contradice ingeniería como ruta principal");
      }

      if (helpPeopleSignal) {
        adjustment -= 1.8;
        evidence.push("la prioridad de ayuda humana no apunta a ingeniería como centro");
      }

      if (averages.social >= averages.realista + 0.5 && hasSocialDecisionSignal) {
        adjustment -= 1.2;
        evidence.push("Social domina sobre Realista en la decisión final");
      }

      if (!hasTechnicalDecisionSignal && averages.realista < 4) {
        adjustment -= 2;
        evidence.push("núcleo técnico insuficiente");
      }

      break;
    }

    case "negocios-gestion": {
      if (businessSignal) {
        adjustment += 2.5;
        evidence.push("emprendimiento o venta");
      }

      if (communitySignal) {
        adjustment += 0.8;
        evidence.push("gestión aplicada a problemas sociales");
      }

      if (helpPeopleSignal && !businessSignal) {
        adjustment -= 0.5;
        evidence.push("ayuda humana pesa más que gestión");
      }

      break;
    }

    case "administracion-finanzas": {
      if (businessSignal) {
        adjustment += 0.8;
        evidence.push("señal de negocio");
      }

      if (dataAnalysisSignal) {
        adjustment += 0.5;
        evidence.push("orden/análisis de datos");
      }

      if (helpPeopleSignal) {
        adjustment -= 1;
        evidence.push("prioridad humana no apunta a finanzas/operación como centro");
      }

      break;
    }

    case "arte-comunicacion-diseno": {
      if (spatialDesignSignal) {
        adjustment += 5;
        evidence.push("elección específica por diseño espacial, objetos o prototipos");
      }

      if (creativeSignal) {
        adjustment += 1.2;
        evidence.push("señal creativa");
      }

      if (averages.artistico < 2) {
        adjustment -= 2;
        evidence.push("interés artístico bajo");
      }

      break;
    }
  }

  return {
    adjustment,
    evidence,
  };
}

function reordenarPerfilesPorCoherencia(
  ranked: Array<Profile & { score: number }>,
  answers: Answer[],
  averages: Record<Dimension, number>,
): RankedProfile[] {
  return ranked
    .map((profile) => {
      const coherence = calcularAjusteCoherenciaPerfil(profile, answers, averages);
      const adjustedScore = profile.score + coherence.adjustment;

      return {
        ...profile,
        rawScore: profile.score,
        score: Number(adjustedScore.toFixed(2)),
        coherenceAdjustment: Number(coherence.adjustment.toFixed(2)),
        decisionEvidence: coherence.evidence,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function obtenerPerfilesCompatibles(
  profileRanking: Array<Profile & { score: number }>,
  mainProfileId: string,
  scoreGap = 2,
) {
  const topScore = profileRanking[0]?.score ?? 0;

  return profileRanking.filter(
    (profile) => profile.id !== mainProfileId && profile.score >= topScore - scoreGap,
  );
}

export function obtenerPerfilesCercanos(
  profileRanking: Array<Profile & { score: number }>,
  gap = NEARBY_PROFILE_GAP,
) {
  const topScore = profileRanking[0]?.score ?? 0;

  return profileRanking.filter((profile) => topScore - profile.score <= gap);
}

function obtenerFocoSemanticoPreguntaPorDimension(dimension: Dimension) {
  return Array.from(
    new Set(
      questions
        .filter((question) => question.kind === "likert" && question.dimension === dimension)
        .flatMap((question) => question.semanticFocus ?? []),
    ),
  );
}

export function obtenerCoberturaSemantica(
  answers: Answer[],
  averages = obtenerPromedios(answers),
) {
  const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));

  return measurableDimensions.map((dimension) => {
    const expectedFocus = obtenerFocoSemanticoPreguntaPorDimension(dimension);
    const exploredFocus = Array.from(
      new Set(
        questions
          .filter(
            (question) =>
              question.kind === "likert" &&
              question.dimension === dimension &&
              answeredQuestionIds.has(question.id),
          )
          .flatMap((question) => question.semanticFocus ?? []),
      ),
    );
    const missingFocus = expectedFocus.filter((focus) => !exploredFocus.includes(focus));
    const coverageRatio = expectedFocus.length
      ? exploredFocus.length / expectedFocus.length
      : 1;

    return {
      dimension,
      exploredFocus,
      missingFocus,
      coverageRatio: averages[dimension] >= SEMANTIC_FOCUS_THRESHOLD ? coverageRatio : 1,
    };
  }) satisfies SemanticCoverage[];
}

function obtenerFocoSemanticoFaltante(
  answers: Answer[],
  averages: Record<Dimension, number>,
) {
  return obtenerCoberturaSemantica(answers, averages).filter(
    (coverage) =>
      averages[coverage.dimension] >= SEMANTIC_FOCUS_THRESHOLD &&
      coverage.missingFocus.length > 0 &&
      coverage.coverageRatio < MIN_SEMANTIC_COVERAGE_RATIO,
  );
}

export function obtenerDiagnosticosAdaptativos(
  answers: Answer[],
  averages = obtenerPromedios(answers),
  profileRanking = obtenerPerfilesOrdenados(averages),
): AdaptiveDiagnostics {
  const likertCount = obtenerRespuestasLikert(answers).length;
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const nearbyProfiles = obtenerPerfilesCercanos(profileRanking);
  const highUncertainty =
    averages.incertidumbre >= 4 ||
    averages.presion >= 4 ||
    averages.neuroticismo >= 4;
  const topProfile = profileRanking[0];
  const secondProfile = profileRanking[1];
  const profileGap = topProfile && secondProfile
    ? topProfile.score - secondProfile.score
    : 0;
  const hasNearbyProfiles = nearbyProfiles.length > 1 && profileGap <= NEARBY_PROFILE_GAP;
  const hasBroadInterestPattern =
    differentiation.broadInterestPattern ||
    differentiation.possibleBroadInterest ||
    differentiation.highDimensions.length >= BROAD_INTEREST_DIMENSION_COUNT;
  const lowDifferentiation =
    hasNearbyProfiles ||
    hasBroadInterestPattern;
  const weakCoreProfileIds = nearbyProfiles
    .filter((profile) => !obtenerEstadoNucleoEstricto(profile, averages).coreMeetsStrictThreshold)
    .map((profile) => profile.id);
  const missingSemanticFocus = obtenerFocoSemanticoFaltante(answers, averages);
  const topProfileHasWeakCore = Boolean(
    topProfile && weakCoreProfileIds.includes(topProfile.id),
  );
  const needsSemanticDeepening = missingSemanticFocus.length > 0;
  const needsCoreDeepening = weakCoreProfileIds.length > 0;
  const contradictions = detectarContradicciones(averages, answers);
  const closingDecision = obtenerDecisionCierreAdaptativo(
    answers,
    averages,
    profileRanking,
    contradictions,
  );
  const hasRouteConflict =
    hasNearbyProfiles ||
    hasBroadInterestPattern ||
    (nearbyProfiles.length > 1 && topProfileHasWeakCore);
  const diagnosticPhaseReasons = [
    likertCount < COMMON_BASELINE_QUESTION_COUNT ? "baseline-incomplete" : null,
    hasNearbyProfiles ? "nearby-profiles" : null,
    hasBroadInterestPattern ? "low-differentiation" : null,
    differentiation.broadInterestPattern ? "broad-interest-pattern" : null,
    topProfileHasWeakCore ? "top-profile-weak-core" : null,
    highUncertainty ? "high-uncertainty" : null,
    needsSemanticDeepening ? "missing-semantic-focus" : null,
    needsCoreDeepening ? "weak-core-evidence" : null,
  ].filter((reason): reason is string => Boolean(reason));
  const closingPhaseReasons = closingDecision.shouldFinish
    ? [closingDecision.closingReason]
    : [];
  const phaseReasons = closingPhaseReasons.length
    ? closingPhaseReasons
    : diagnosticPhaseReasons;
  const phase =
    likertCount < COMMON_BASELINE_QUESTION_COUNT
      ? "baseline"
      : closingDecision.shouldFinish
        ? "closure"
        : hasRouteConflict
        ? "discrimination"
        : highUncertainty || needsSemanticDeepening || needsCoreDeepening
          ? "deepening"
          : "closure";

  return {
    phase,
    phaseReasons,
    closingReason: closingDecision.closingReason,
    highUncertainty,
    lowDifferentiation,
    broadInterestPattern: differentiation.broadInterestPattern,
    broadInterestReason: differentiation.broadInterestReason,
    nearbyProfileIds: nearbyProfiles.map((profile) => profile.id),
    missingSemanticFocus,
    weakCoreProfileIds,
  };
}

export function obtenerMejorPerfil(answers: Answer[]) {
  const averages = obtenerPromedios(answers);
  const combinedPattern = obtenerPatronVocacionalDominante(averages);

  const rawRanked = obtenerPerfilesOrdenados(averages);
  const ranked = reordenarPerfilesPorCoherencia(rawRanked, answers, averages);

  const strictCoreRanked = ranked.filter(
    (profile) => obtenerEstadoNucleoEstricto(profile, averages).coreMeetsStrictThreshold,
  );

  const lowCoreConfidence = strictCoreRanked.length === 0;

const strictBest = strictCoreRanked[0] ?? null;
const topCoherentProfile = ranked[0] ?? null;

const shouldUseCoherenceOverride =
  Boolean(topCoherentProfile) &&
  Boolean(strictBest) &&
  (topCoherentProfile?.coherenceAdjustment ?? 0) >= 6 &&
  (topCoherentProfile?.score ?? 0) >= (strictBest?.score ?? 0) + 1;

const best = shouldUseCoherenceOverride
  ? topCoherentProfile!
  : strictBest ?? ranked[0];

const second = ranked.find((profile) => profile.id !== best.id) ?? ranked[1] ?? best;
  const coreRejectedProfiles = ranked.filter(
    (profile) => !obtenerEstadoNucleoEstricto(profile, averages).coreMeetsStrictThreshold,
  );
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const resolution = obtenerEstadoResolucionConflicto(averages, answers);
  const narrativeAnalysis = obtenerAnalisisNarrativo(answers);
  const narrativeReliability = obtenerConfiabilidadNarrativa(obtenerTextosNarrativos(answers));
  const narrativePenalty = narrativeReliability === "low" ? 12 : 0;
  const earlyFinishPenalty = obtenerRespuestasLikert(answers).length < 15 ? 5 : 0;
  const broadInterestPenalty = differentiation.broadInterestPattern
    ? resolution.status === "resolved"
      ? 10
      : 25
    : 0;
  const contradictionPenalty =
    resolution.hasConflict && resolution.status !== "resolved"
      ? resolution.status === "attempted"
        ? 10
        : 8
      : 0;
  const uncertaintyPenalty = averages.incertidumbre * 4;
  const pressurePenalty = averages.presion * 2;
  const neuroticismPenalty = averages.neuroticismo * 1.5;
  const narrativeUncertaintyBonus = obtenerBonusIncertidumbreNarrativa(
    answers,
    narrativeAnalysis,
  );
  const confidence = Math.min(
    96,
    Math.max(
      35,
      64 + (best.score - second.score) * 10 - uncertaintyPenalty - pressurePenalty - neuroticismPenalty,
    ),
  ) -
    differentiation.clarityPenalty -
    broadInterestPenalty -
    narrativePenalty -
    narrativeUncertaintyBonus * 0.5 -
    contradictionPenalty -
    earlyFinishPenalty;
  const profileClarity = Math.max(35, confidence);
  const indicators: ResultIndicators = {
    profileClarity,
    vocationalUncertainty: Math.min(
      100,
      Math.max(0, averages.incertidumbre * 20 + narrativeUncertaintyBonus),
    ),
    externalPressure: Math.min(100, Math.max(0, averages.presion * 20)),
  };
  const validationObservation: ValidationObservation = obtenerObservacionValidacion(answers);

  return {
    best,
    ranked,
    confidence: profileClarity,
    indicators,
    averages,
    traditionalBest: rawRanked[0],
    combinedPattern,
    lowCoreConfidence,
    coreRejectedProfiles,
    validationObservation,
  };
}

function obtenerObservacionValidacion(answers: Answer[]): ValidationObservation {
  const openObservations = obtenerRespuestasAbiertas(answers)
    .map((answer) => ({
      careerReference: answer.careerReference,
      observedMismatch: answer.observedMismatch,
    }))
    .filter(
      (observation) =>
        Boolean(observation.careerReference) || observation.observedMismatch === true,
    );

  return openObservations[0] ?? {};
}

function obtenerPreguntaPorRespuesta(answer: Answer) {
  return questions.find((question) => question.id === answer.questionId);
}

function esRespuestaEleccionForzada(answer: Answer) {
  if (answer.kind !== "open") return false;

  return obtenerPreguntaPorRespuesta(answer)?.scaleType === "forced_choice";
}

function obtenerRespuestasAbiertasNarrativas(answers: Answer[]) {
  return obtenerRespuestasAbiertas(answers).filter((answer) => !esRespuestaEleccionForzada(answer));
}

function obtenerRespuestasEleccionForzada(answers: Answer[]) {
  return obtenerRespuestasAbiertas(answers).filter(esRespuestaEleccionForzada);
}

function obtenerPreguntaAbiertaActivada(answers: Answer[]) {
  const averages = obtenerPromedios(answers);
  const narrativeOpenAnswers = obtenerRespuestasAbiertasNarrativas(answers);
  const usedTriggers = new Set(narrativeOpenAnswers.map((answer) => answer.trigger));
  const openCount = narrativeOpenAnswers.length;
  const likertCount = obtenerRespuestasLikert(answers).length;
  const resolution = obtenerEstadoResolucionConflicto(averages, answers);

  if (openCount >= maxOpenQuestions || likertCount < 8) {
    return null;
  }

  if (resolution.isResolved || resolution.isExplored) {
    return null;
  }

  const topRiasecAverage = Math.max(...riasecDimensions.map((dimension) => averages[dimension]));
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const triggers: Array<NonNullable<Question["trigger"]>> = [];

  if (differentiation.possibleBroadInterest) triggers.push("prioritization");
  if (averages.incertidumbre >= 4 || averages.neuroticismo >= 4) triggers.push("uncertainty");
  if (averages.presion >= 4) triggers.push("pressure");
  if (topRiasecAverage >= 4 && averages.tolerancia > 0 && averages.tolerancia <= 2) {
    triggers.push("contradiction");
  }
  if (likertCount >= 13) triggers.push("motivation");

  const nextTrigger = triggers.find((trigger) => !usedTriggers.has(trigger));

  return questions.find((question) => question.kind === "open" && question.trigger === nextTrigger) ?? null;
}

function tieneParCercano(nearbyProfileIds: string[], first: string, second: string) {
  return nearbyProfileIds.includes(first) && nearbyProfileIds.includes(second);
}

function necesitaDesempatePorInteresesAmplios(
  averages: Record<Dimension, number>,
  answers: Answer[],
) {
  const highRiasecCount = riasecDimensions.filter(
    (dimension) => averages[dimension] >= 4,
  ).length;
  const alreadyAskedBroadTieBreaker = answers.some(
    (answer) => answer.questionId === 309,
  );

  return (
    highRiasecCount >= 5 &&
    averages.incertidumbre >= 4 &&
    !alreadyAskedBroadTieBreaker
  );
}

function obtenerPreguntaContrasteActivada(answers: Answer[]) {
  const averages = obtenerPromedios(answers);
  const forcedChoiceCount = obtenerRespuestasEleccionForzada(answers).filter(
    (answer) => answer.trigger === "contrast" || answer.questionId >= 300,
  ).length;
  const usedQuestionIds = new Set(answers.map((answer) => answer.questionId));
  const narrativeSemanticFocus = obtenerFocoSemanticoNarrativo(answers);
  const broadTieBreakerQuestion = questions.find((question) => question.id === 309);

  if (
    necesitaDesempatePorInteresesAmplios(averages, answers) &&
    broadTieBreakerQuestion &&
    !usedQuestionIds.has(broadTieBreakerQuestion.id)
  ) {
    return broadTieBreakerQuestion;
  }

  if (forcedChoiceCount >= maxForcedChoiceQuestions) {
    return null;
  }

  const diagnostics = obtenerDiagnosticosAdaptativos(
    answers,
    averages,
    obtenerPerfilesOrdenados(averages),
  );
  const hasNearbyProfiles = diagnostics.nearbyProfileIds.length > 1;
  const semanticCoverage = obtenerCoberturaSemantica(answers, averages);
  const highDimensionSemanticGaps = semanticCoverage.filter(
    (coverage) =>
      averages[coverage.dimension] >= SEMANTIC_FOCUS_THRESHOLD &&
      coverage.missingFocus.length > 0,
  );
  const hasMissingSemanticFocus =
    diagnostics.missingSemanticFocus.length > 0 ||
    highDimensionSemanticGaps.length > 0;

  if (
    diagnostics.phase !== "discrimination" ||
    !hasNearbyProfiles ||
    !diagnostics.lowDifferentiation ||
    !hasMissingSemanticFocus
  ) {
    return null;
  }

  const nearbyProfileIds = diagnostics.nearbyProfileIds;
  const missingDimensions = new Set(
    highDimensionSemanticGaps.map((coverage) => coverage.dimension),
  );
  const hasSpatialDesignSignal =
    narrativeSemanticFocus.includes("visual-spatial-creativity") ||
    narrativeSemanticFocus.includes("applied-design") ||
    narrativeSemanticFocus.includes("spatial-organization");
  const hasAppliedTechnicalAmbiguity =
    nearbyProfileIds.includes("ingenieria-tecnologia") ||
    nearbyProfileIds.includes("ciencia-datos-investigacion") ||
    nearbyProfileIds.includes("arte-comunicacion-diseno") ||
    nearbyProfileIds.includes("administracion-finanzas");
  const candidates = [
    hasAppliedTechnicalAmbiguity ? 201 : null,
    hasAppliedTechnicalAmbiguity ? 202 : null,
    hasAppliedTechnicalAmbiguity ? 203 : null,
    (nearbyProfileIds.includes("salud-apoyo-humano") ||
      nearbyProfileIds.includes("educacion-ciencias-sociales") ||
      missingDimensions.has("social"))
      ? 204
      : null,
    (nearbyProfileIds.includes("negocios-gestion") ||
      nearbyProfileIds.includes("educacion-ciencias-sociales") ||
      missingDimensions.has("emprendedor"))
      ? 205
      : null,
    (nearbyProfileIds.includes("administracion-finanzas") ||
      nearbyProfileIds.includes("negocios-gestion") ||
      missingDimensions.has("convencional"))
      ? 206
      : null,
    (nearbyProfileIds.includes("arte-comunicacion-diseno") && missingDimensions.has("artistico")) ||
    hasSpatialDesignSignal
      ? 301
      : null,
    tieneParCercano(nearbyProfileIds, "ingenieria-tecnologia", "ciencia-datos-investigacion")
      ? 302
      : null,
    nearbyProfileIds.includes("arte-comunicacion-diseno") && missingDimensions.has("artistico")
      ? 303
      : null,
    tieneParCercano(nearbyProfileIds, "salud-apoyo-humano", "educacion-ciencias-sociales")
      ? 304
      : null,
    nearbyProfileIds.includes("negocios-gestion") &&
    (nearbyProfileIds.includes("educacion-ciencias-sociales") ||
      nearbyProfileIds.includes("salud-apoyo-humano") ||
      missingDimensions.has("emprendedor"))
      ? 305
      : null,
    tieneParCercano(nearbyProfileIds, "administracion-finanzas", "ingenieria-tecnologia")
      ? 306
      : null,
    nearbyProfileIds.includes("salud-apoyo-humano") &&
    (nearbyProfileIds.includes("ciencia-datos-investigacion") || missingDimensions.has("investigativo"))
      ? 307
      : null,
    nearbyProfileIds.includes("educacion-ciencias-sociales") &&
    (nearbyProfileIds.includes("ciencia-datos-investigacion") || missingDimensions.has("social"))
      ? 308
      : null,
  ].filter((id): id is number => Boolean(id));

  return (
    candidates
      .map((id) => questions.find((question) => question.id === id))
      .find((question) => question && !usedQuestionIds.has(question.id)) ?? null
  );
}

function preguntaCoincideConBloqueTematico(question: Question, block: AdaptiveThemeBlock) {
  const questionFocus = question.semanticFocus ?? [];

  return Boolean(
    question.kind === "likert" &&
      question.dimension &&
      (block.dimensions.includes(question.dimension) ||
        questionFocus.some((focus) => block.semanticFocus.includes(focus))),
  );
}

function obtenerBloquesTematicosDePregunta(question: Question) {
  return adaptiveThemeBlocks.filter((block) => preguntaCoincideConBloqueTematico(question, block));
}

function obtenerBloqueTematicoReciente(likertAnswers: LikertAnswer[]) {
  const recentPostBaselineAnswers = [...likertAnswers]
    .filter((answer) => answer.questionId > COMMON_BASELINE_QUESTION_COUNT)
    .reverse();

  for (const answer of recentPostBaselineAnswers) {
    const question = questions.find((item) => item.id === answer.questionId);
    const block = question ? obtenerBloquesTematicosDePregunta(question)[0] : undefined;

    if (block) return block;
  }

  return null;
}

function obtenerCantidadRespuestasBloqueTematico(likertAnswers: LikertAnswer[], block: AdaptiveThemeBlock) {
  return likertAnswers.filter((answer) => {
    if (answer.questionId <= COMMON_BASELINE_QUESTION_COUNT) return false;

    const question = questions.find((item) => item.id === answer.questionId);

    return question ? preguntaCoincideConBloqueTematico(question, block) : false;
  }).length;
}

function obtenerPuntajeBloqueTematico(
  block: AdaptiveThemeBlock,
  averages: Record<Dimension, number>,
  narrativeSemanticFocus: string[],
  missingSemanticFocus: SemanticCoverage[],
  diagnostics: AdaptiveDiagnostics,
) {
  const dimensionAverage =
    block.dimensions.reduce((total, dimension) => total + averages[dimension], 0) /
    block.dimensions.length;
  const narrativeBoost = narrativeSemanticFocus.some((focus) =>
    block.semanticFocus.includes(focus),
  )
    ? 1
    : 0;
  const semanticGapBoost = missingSemanticFocus.some((coverage) => {
    const missingFocusMatches = coverage.missingFocus.some((focus) =>
      block.semanticFocus.includes(focus),
    );

    return block.dimensions.includes(coverage.dimension) || missingFocusMatches;
  })
    ? 0.8
    : 0;
  const contextBoost = block.id === "clarity-context" && diagnostics.highUncertainty ? 1 : 0;

  return dimensionAverage + narrativeBoost + semanticGapBoost + contextBoost;
}

function obtenerBloqueTematicoDominante(
  averages: Record<Dimension, number>,
  narrativeSemanticFocus: string[],
  missingSemanticFocus: SemanticCoverage[],
  diagnostics: AdaptiveDiagnostics,
  likertAnswers: LikertAnswer[],
) {
  return [...adaptiveThemeBlocks]
    .sort((a, b) => {
      const aCount = obtenerCantidadRespuestasBloqueTematico(likertAnswers, a);
      const bCount = obtenerCantidadRespuestasBloqueTematico(likertAnswers, b);
      const aSaturationPenalty = aCount >= MAX_THEME_BLOCK_QUESTIONS ? 2 : 0;
      const bSaturationPenalty = bCount >= MAX_THEME_BLOCK_QUESTIONS ? 2 : 0;
      const aScore =
        obtenerPuntajeBloqueTematico(a, averages, narrativeSemanticFocus, missingSemanticFocus, diagnostics) -
        aSaturationPenalty;
      const bScore =
        obtenerPuntajeBloqueTematico(b, averages, narrativeSemanticFocus, missingSemanticFocus, diagnostics) -
        bSaturationPenalty;

      return bScore - aScore;
    })[0] ?? null;
}

function obtenerSiguientePreguntaDeBloqueTematico(
  block: AdaptiveThemeBlock,
  unansweredLikert: Question[],
  recentDimensions: Dimension[],
  dimensionCounts: Partial<Record<Dimension, number>>,
  missingSemanticFocus: SemanticCoverage[],
) {
  const isNotTooRecent = (question: Question) =>
    Boolean(
      question.dimension &&
        recentDimensions.filter((dimension) => dimension === question.dimension).length < 2,
    );
  const blockQuestions = unansweredLikert.filter(
    (question) => preguntaCoincideConBloqueTematico(question, block) && isNotTooRecent(question),
  );
  const missingFocusQuestion = blockQuestions.find((question) =>
    missingSemanticFocus.some(
      (coverage) =>
        coverage.dimension === question.dimension &&
        (question.semanticFocus ?? []).some((focus) => coverage.missingFocus.includes(focus)),
    ),
  );

  return (
    missingFocusQuestion ??
    blockQuestions.find(
      (question) => question.dimension && (dimensionCounts[question.dimension] ?? 0) < 2,
    ) ??
    blockQuestions[0] ??
    null
  );
}

function obtenerPreguntaBloqueTematico(
  answers: Answer[],
  unansweredLikert: Question[],
  averages: Record<Dimension, number>,
  diagnostics: AdaptiveDiagnostics,
  narrativeSemanticFocus: string[],
  recentDimensions: Dimension[],
  dimensionCounts: Partial<Record<Dimension, number>>,
) {
  const likertAnswers = obtenerRespuestasLikert(answers);
  const recentBlock = obtenerBloqueTematicoReciente(likertAnswers);
  const hasSwitchReason =
    diagnostics.lowDifferentiation ||
    diagnostics.highUncertainty ||
    diagnostics.missingSemanticFocus.length > 0;

  if (recentBlock) {
    const recentBlockCount = obtenerCantidadRespuestasBloqueTematico(likertAnswers, recentBlock);
    const shouldContinueRecentBlock =
      recentBlockCount < MAX_THEME_BLOCK_QUESTIONS &&
      (recentBlockCount < MIN_THEME_BLOCK_QUESTIONS || !hasSwitchReason);
    const recentBlockQuestion = shouldContinueRecentBlock
      ? obtenerSiguientePreguntaDeBloqueTematico(
          recentBlock,
          unansweredLikert,
          recentDimensions,
          dimensionCounts,
          diagnostics.missingSemanticFocus,
        )
      : null;

    if (recentBlockQuestion) return recentBlockQuestion;
  }

  const dominantBlock = obtenerBloqueTematicoDominante(
    averages,
    narrativeSemanticFocus,
    diagnostics.missingSemanticFocus,
    diagnostics,
    likertAnswers,
  );

  return dominantBlock
    ? obtenerSiguientePreguntaDeBloqueTematico(
        dominantBlock,
        unansweredLikert,
        recentDimensions,
        dimensionCounts,
        diagnostics.missingSemanticFocus,
      )
    : null;
}

const careerBreakdownQuestionIdByProfile: Record<Profile["id"], number> = {
  "administracion-finanzas": 405,
  "arte-comunicacion-diseno": 402,
  "ciencia-datos-investigacion": 403,
  "educacion-ciencias-sociales": 401,
  "ingenieria-tecnologia": 407,
  "negocios-gestion": 405,
  "salud-apoyo-humano": 404,
};

function obtenerPreguntaDesgloseCarreraProbable(
  answers: Answer[],
  answeredIds: Set<number>,
  averages: Record<Dimension, number>,
  diagnostics: AdaptiveDiagnostics,
) {
  const forcedChoiceCount = obtenerRespuestasEleccionForzada(answers).filter(
    (answer) => answer.trigger === "contrast" || answer.questionId >= 300,
  ).length;

  if (forcedChoiceCount >= maxForcedChoiceQuestions) return null;

  const guidedBreakdownQuestion = obtenerPreguntaDeDesglosePorRespuestaGuiada(
    answers,
    answeredIds,
  );

  if (guidedBreakdownQuestion) return guidedBreakdownQuestion;

  const alreadyAskedCareerBreakdown = Array.from(answeredIds).some(
    (questionId) => questionId >= 401 && questionId <= 407,
  );

  if (alreadyAskedCareerBreakdown) return null;

  if (
    (diagnostics.lowDifferentiation || diagnostics.broadInterestPattern) &&
    !answeredIds.has(309)
  ) {
    return questions.find((question) => question.id === 309) ?? null;
  }

  const rankedProfiles = reordenarPerfilesPorCoherencia(
    obtenerPerfilesOrdenados(averages),
    answers,
    averages,
  );
  const bestProfile =
    rankedProfiles.find((profile) =>
      obtenerEstadoNucleoEstricto(profile, averages).coreMeetsStrictThreshold,
    ) ?? rankedProfiles[0];
  const breakdownQuestionId = bestProfile
    ? careerBreakdownQuestionIdByProfile[bestProfile.id]
    : undefined;

  if (!breakdownQuestionId || answeredIds.has(breakdownQuestionId)) return null;

  return questions.find((question) => question.id === breakdownQuestionId) ?? null;
}

export function seleccionarSiguientePregunta(answers: Answer[]) {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const unansweredLikert = questions.filter(
    (question) => question.kind === "likert" && !answeredIds.has(question.id),
  );
  const likertCount = obtenerRespuestasLikert(answers).length;

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return unansweredLikert[0] ?? null;
  }

  const triggeredContrastQuestion = obtenerPreguntaContrasteActivada(answers);

  if (triggeredContrastQuestion) {
    return triggeredContrastQuestion;
  }

  const averages = obtenerPromedios(answers);
  const diagnostics = obtenerDiagnosticosAdaptativos(answers, averages, obtenerPerfilesOrdenados(averages));
  const careerBreakdownQuestion = obtenerPreguntaDesgloseCarreraProbable(
    answers,
    answeredIds,
    averages,
    diagnostics,
  );

  if (careerBreakdownQuestion) {
    return careerBreakdownQuestion;
  }

  if (
    diagnostics.phase === "closure" &&
    ["high-profile-clarity", "max-question-limit"].includes(
      diagnostics.closingReason ?? "",
    )
  ) {
    return null;
  }

  const narrativeSemanticFocus = obtenerFocoSemanticoNarrativo(answers);
  const likertAnswers = obtenerRespuestasLikert(answers);
  const recentDimensions = likertAnswers.slice(-2).map((answer) => answer.dimension);
  const dimensionCounts = likertAnswers.reduce(
    (acc, answer) => ({
      ...acc,
      [answer.dimension]: (acc[answer.dimension] ?? 0) + 1,
    }),
    {} as Partial<Record<Dimension, number>>,
  );
  const hasLowRepetition = (question: Question) =>
    Boolean(question.dimension && (dimensionCounts[question.dimension] ?? 0) < 2);
  const isNotTooRecent = (question: Question) =>
    Boolean(
      question.dimension &&
        recentDimensions.filter((dimension) => dimension === question.dimension).length < 2,
    );
  const topRiasec = [...riasecDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 3);
  const priorityDimensions = Array.from(
    new Set(topRiasec.flatMap((dimension) => adaptiveFocusByRiasec[dimension])),
  );
  const thematicBlockQuestion = obtenerPreguntaBloqueTematico(
    answers,
    unansweredLikert,
    averages,
    diagnostics,
    narrativeSemanticFocus,
    recentDimensions,
    dimensionCounts,
  );

  if (thematicBlockQuestion) {
    return thematicBlockQuestion;
  }

  const triggeredOpenQuestion = obtenerPreguntaAbiertaActivada(answers);

  if (triggeredOpenQuestion) {
    return triggeredOpenQuestion;
  }

  const semanticFocusQuestion = diagnostics.missingSemanticFocus
    .flatMap((coverage) =>
      unansweredLikert.filter(
        (question) =>
          question.dimension === coverage.dimension &&
          (question.semanticFocus ?? []).some((focus) =>
            coverage.missingFocus.includes(focus),
          ) &&
          isNotTooRecent(question),
      ),
    )
    .find(Boolean);
  const narrativeSemanticFocusQuestion = narrativeSemanticFocus.length
    ? unansweredLikert.find(
        (question) =>
          (question.semanticFocus ?? []).some((focus) =>
            narrativeSemanticFocus.includes(focus),
          ) &&
          isNotTooRecent(question),
      )
    : undefined;

  return (
    narrativeSemanticFocusQuestion ??
    semanticFocusQuestion ??
    unansweredLikert.find(
      (question) =>
        question.dimension &&
        priorityDimensions.includes(question.dimension) &&
        hasLowRepetition(question) &&
        isNotTooRecent(question),
    ) ??
    unansweredLikert.find(
      (question) =>
        question.dimension &&
        contextDimensions.includes(question.dimension) &&
        hasLowRepetition(question) &&
        isNotTooRecent(question),
    ) ??
    unansweredLikert.find(
      (question) =>
        question.dimension &&
        bigFiveDimensions.includes(question.dimension) &&
        hasLowRepetition(question) &&
        isNotTooRecent(question),
    ) ??
    unansweredLikert.find(
      (question) =>
        question.dimension &&
        contextDimensions.includes(question.dimension) &&
        isNotTooRecent(question),
    ) ??
    unansweredLikert.find(
      (question) =>
        question.dimension &&
        bigFiveDimensions.includes(question.dimension) &&
        isNotTooRecent(question),
    ) ??
    null
  );
}

export function procesarRespuestaEnviada(searchParams: SearchParams) {
  const answers = decodificarRespuestas(obtenerParametro(searchParams, "state"));
  const kind = obtenerParametro(searchParams, "kind");
  const questionId = Number(obtenerParametro(searchParams, "questionId"));
  const question = questions.find((item) => item.id === questionId);
  const editQuestionId = Number(obtenerParametro(searchParams, "editQuestionId"));
  const existingAnswerIndex = answers.findIndex((answer) => answer.questionId === questionId);
  const isEditing =
    Number.isInteger(editQuestionId) &&
    editQuestionId === questionId &&
    existingAnswerIndex >= 0;
  const baseAnswers = isEditing ? answers.slice(0, existingAnswerIndex) : answers;

  if (!question || (!isEditing && existingAnswerIndex >= 0)) {
    return answers;
  }

  if (kind === "likert" && question.dimension) {
    const value = Number(obtenerParametro(searchParams, "value"));
    const comment = sanearTextoUsuarioOpcional(obtenerParametro(searchParams, "comment")?.trim());

    if (Number.isInteger(value) && value >= 1 && value <= 5) {
      const answer = {
        kind: "likert",
        questionId: question.id,
        dimension: question.dimension,
        value,
        order: baseAnswers.length + 1,
        ...(comment.text ? { comment: comment.text } : {}),
        ...(comment.suspiciousInput
          ? {
              suspiciousInput: true,
              suspiciousReason: comment.suspiciousReason,
            }
          : {}),
      } satisfies LikertAnswer;

      return [...baseAnswers, answer] satisfies Answer[];
    }
  }

  if (kind === "open" && question.trigger) {
    const selectedOptionId = obtenerParametro(searchParams, "selectedOptionId")?.trim();
    const selectedOption = obtenerOpcionSeleccionada(question, selectedOptionId);

    const guidedChoice = sanearTextoUsuarioOpcional(
      selectedOption?.text ?? obtenerParametro(searchParams, "guidedChoice")?.trim(),
    );

    const unsureDetail = sanearTextoUsuarioOpcional(
      obtenerParametro(searchParams, "unsureDetail")?.trim(),
    );

    const submittedText = sanearTextoUsuarioOpcional(
      obtenerParametro(searchParams, "text")?.trim(),
    );

    const careerReference = sanearTextoUsuarioOpcional(
      obtenerParametro(searchParams, "careerReference")?.trim(),
    );

    const observedMismatch = obtenerParametro(searchParams, "observedMismatch") === "true";

    const isUnknownAnswer =
      selectedOption?.isUnknown === true ||
      selectedOptionId === "unknown" ||
      guidedChoice.text.toLowerCase().includes("no sé") ||
      guidedChoice.text.toLowerCase().includes("no se");

    const isTypedTextAnswer =
      selectedOption?.opensTextInput === true ||
      selectedOptionId === "write-own-answer";

    const answerMode: OpenAnswer["answerMode"] = isUnknownAnswer
      ? "unknown"
      : isTypedTextAnswer
        ? "typed-text"
        : selectedOption || guidedChoice.text
          ? "guided-option"
          : "typed-text";

    const rawText =
      answerMode === "typed-text"
        ? submittedText.text || "Sin respuesta"
        : answerMode === "unknown"
          ? [
              "No lo tengo claro todavía.",
              unsureDetail.text ? `Detalle: ${unsureDetail.text}` : null,
              submittedText.text ? `Comentario: ${submittedText.text}` : null,
            ]
              .filter(Boolean)
              .join(" | ")
          : guidedChoice.text || submittedText.text || "Sin respuesta";

    const text = esRespuestaAbiertaDeBajaInformacion(rawText)
      ? "No lo tengo claro todavía."
      : rawText;

    const suspiciousReason = combinarRazonesSospechosas(
      guidedChoice.suspiciousReason,
      unsureDetail.suspiciousReason,
      submittedText.suspiciousReason,
      careerReference.suspiciousReason,
    );

    const suspiciousInput = Boolean(
      guidedChoice.suspiciousInput ||
        unsureDetail.suspiciousInput ||
        submittedText.suspiciousInput ||
        careerReference.suspiciousInput,
    );

    return [
      ...baseAnswers,
      {
        kind: "open",
        questionId: question.id,
        trigger: question.trigger,
        text,
        order: baseAnswers.length + 1,
        answerMode,
        ...(selectedOptionId ? { selectedOptionId } : {}),
        ...(selectedOption?.text ? { selectedOptionText: selectedOption.text } : {}),
        ...(careerReference.text ? { careerReference: careerReference.text } : {}),
        ...(observedMismatch ? { observedMismatch } : {}),
        ...(suspiciousInput
          ? {
              suspiciousInput: true,
              suspiciousReason,
            }
          : {}),
      },
    ] satisfies Answer[];
  }

  return answers;
}
export function obtenerSenales(answers: Answer[]) {
  const averages = obtenerPromedios(answers);
  const resolution = obtenerEstadoResolucionConflicto(averages, answers);
  const narrativeAnalysis = obtenerAnalisisNarrativo(answers);
  const narrativeReliability = obtenerConfiabilidadNarrativa(obtenerTextosNarrativos(answers));
  const narrativeOpenAnswers = obtenerRespuestasAbiertasNarrativas(answers);

const unclearOpenAnswers = narrativeOpenAnswers.filter((answer) =>
  esRespuestaAbiertaDeBajaInformacion(answer.text),
);

const contextualOpenAnswers = narrativeOpenAnswers.filter((answer) =>
  esComentarioUtil(answer.text),
);

const resolutiveOpenAnswers = narrativeOpenAnswers.filter((answer) =>
  esAclaracionUtil(answer.text),
);
  const hasVariablePersistence =
    tieneDimensionVariable(answers, "responsabilidad") ||
    tieneDimensionVariable(answers, "tolerancia");
  const hasAnyHighPressureAnswer = obtenerRespuestasLikert(answers).some(
    (answer) => answer.dimension === "presion" && answer.value >= 4,
  );
  const topRiasec = [...riasecDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 3);
  const topBigFive = [...bigFiveDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 2);
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const categories = new Set(narrativeAnalysis.categories);
  const narrativeUncertaintyBonus = obtenerBonusIncertidumbreNarrativa(
    answers,
    narrativeAnalysis,
  );
  const vocationalUncertainty = Math.min(
    100,
    Math.max(0, averages.incertidumbre * 20 + narrativeUncertaintyBonus),
  );
  const narrativeSignals = [
    categories.has("uncertainty") && categories.has("external_pressure")
      ? "Parece existir una combinación entre dudas personales y factores externos que podrían estar influyendo en la decisión."
      : null,
    categories.has("technical_motivation") && categories.has("social_motivation")
      ? "También aparecieron intereses mixtos entre áreas técnicas y trabajo con personas."
      : null,
    categories.has("identity_conflict") && categories.has("external_pressure")
      ? "Puede haber una tensión entre lo que la persona desea explorar y lo que siente que otros esperan de ella."
      : null,
    categories.has("routine_difficulty") && categories.has("resilience")
      ? "Existen señales mixtas sobre la constancia: hay disposición a intentar, pero también dificultad para sostener rutinas en el tiempo."
      : null,
    categories.has("defensive_superiority") || categories.has("rejection_of_help")
      ? "Algunas respuestas narrativas contienen afirmaciones muy absolutas o poco explicativas, por lo que el resultado debe tomarse como orientación inicial."
      : null,
  ].filter((signal): signal is string => Boolean(signal));

  return [
    `Intereses destacados: ${topRiasec.map((dimension) => dimensionLabels[dimension]).join(", ")}.`,
    `Rasgos personales destacados: ${topBigFive.map((dimension) => dimensionLabels[dimension]).join(", ")}.`,
    differentiation.broadInterestPattern
      ? "Resultado exploratorio: aparecen muchos intereses RIASEC altos y poco diferenciados, por lo que conviene usar este resultado como mapa inicial y no como una única ruta cerrada."
      : null,
    vocationalUncertainty >= 70
      ? "Incertidumbre vocacional alta: conviene validar el perfil con experiencias prácticas antes de decidir."
      : vocationalUncertainty >= 40
        ? "Incertidumbre vocacional moderada: aparecen dudas o señales narrativas de confusión que conviene aclarar."
        : "Incertidumbre vocacional controlada.",
    averages.presion >= 4
      ? "Posible influencia externa: la recomendación debe revisarse separando expectativas externas de motivación propia."
      : hasAnyHighPressureAnswer
        ? "No aparece presión externa dominante en todas las respuestas, aunque sí hay señales de preocupación por aceptación, seguridad o expectativas externas."
        : "No aparece una presión externa fuerte en las respuestas cerradas.",
    averages.tolerancia > 0 && averages.tolerancia <= 2.5
      ? "Tolerancia a la dificultad baja o media: importa explorar el área antes de asumir una decisión definitiva."
      : hasVariablePersistence
        ? "Existe disposición para sostener actividades importantes, aunque aparecen señales variables en constancia o seguimiento."
        : "Buena disposición para sostener tareas difíciles.",
    unclearOpenAnswers.length > 0
      ? "Algunas respuestas abiertas muestran poca claridad inicial; esto se interpreta como una señal de exploración pendiente, no como falta de interés."
      : resolutiveOpenAnswers.length > 0
        ? "Algunas respuestas abiertas aportan una prioridad, razón concreta o elección clara para interpretar el resultado."
        : contextualOpenAnswers.length > 0
          ? "Las respuestas abiertas aportan contexto útil, aunque no necesariamente resuelven una señal mixta."
          : "Las respuestas abiertas aportan contexto adicional para interpretar el resultado.",
    !resolution.hasConflict
      ? "No se requirió cerrar un conflicto adicional mediante preguntas aclaratorias."
      : resolution.status === "resolved"
        ? "La amplitud o contradicción detectada fue aclarada con una respuesta resolutiva."
        : resolution.status === "attempted"
          ? "Se intentó aclarar algunas señales mixtas, pero las respuestas adicionales no permitieron resolverlas completamente."
          : "Existen señales mixtas que conviene seguir explorando antes de tomar una decisión.",
    narrativeReliability === "low"
      ? "Las respuestas narrativas muestran patrones poco consistentes para interpretar preferencias reales, por lo que el resultado debe tomarse como orientación inicial."
      : "Las respuestas narrativas no muestran señales fuertes de baja confiabilidad.",
    ...narrativeSignals,
  ].filter((signal): signal is string => Boolean(signal));
}

export function obtenerEstadoAdaptativo(
  answers: Answer[],
  currentQuestion: Question | null,
): AdaptiveStatus {
  const likertCount = obtenerRespuestasLikert(answers).length;

  if (!currentQuestion) {
    return {
      title: "Resultado generado",
      detail: "El sistema ya cuenta con suficientes respuestas para estimar el perfil vocacional.",
    };
  }

  if (currentQuestion.kind === "open") {
    const triggerLabels: Record<NonNullable<Question["trigger"]>, string> = {
      uncertainty: "incertidumbre vocacional",
      pressure: "posible presión externa",
      contradiction: "contradicción entre afinidad y tolerancia",
      motivation: "motivación personal",
      prioritization: "amplitud de intereses",
      contrast: "rutas cercanas o ambigüedad semántica",
    };

    return {
      title: "Pregunta abierta adaptativa",
      detail: `Se activó por ${triggerLabels[currentQuestion.trigger ?? "motivation"]}. Esta respuesta ayudará a contextualizar la recomendación.`,
    };
  }

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return {
      title: "Núcleo común inicial",
      detail: "Primero se completa un bloque común para crear una base comparable antes de adaptar el recorrido.",
    };
  }

  const averages = obtenerPromedios(answers);
  const diagnostics = obtenerDiagnosticosAdaptativos(answers, averages, obtenerPerfilesOrdenados(averages));
  const topRiasec = [...riasecDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 3);
  const phaseDetails: Record<typeof diagnostics.phase, string> = {
    baseline: "El sistema todavía está formando la base común inicial.",
    deepening: "La pregunta busca profundizar dimensiones o focos semánticos con poca evidencia.",
    discrimination: "La pregunta ayuda a diferenciar rutas cercanas o señales poco diferenciadas.",
    closure: "El sistema ya cuenta con señales suficientes para acercarse al cierre.",
  };

  return {
    title: "Ruta adaptativa activa",
    detail: `${phaseDetails[diagnostics.phase]} Dimensiones de interés más altas: ${topRiasec
      .map((dimension) => dimensionLabels[dimension])
      .join(", ")}.`,
  };
}

export function obtenerPerfilEstatico(answers: Answer[]) {
  return obtenerMejorPerfil(
    questions.slice(0, 6).flatMap((question) => {
      const answer = answers.find(
        (item): item is LikertAnswer =>
          item.kind === "likert" && item.questionId === question.id,
      );
      return answer ? [answer] : [];
    }),
  ).best;
}

function obtenerOpcionSeleccionada(question: Question, selectedOptionId: string | undefined) {
  if (!selectedOptionId) return undefined;

  return question.forcedChoiceOptions?.find((option) => option.id === selectedOptionId);
}

function obtenerPreguntaDeDesglosePorRespuestaGuiada(
  answers: Answer[],
  answeredIds: Set<number>,
) {
  const lastOpenAnswer = [...answers]
    .reverse()
    .find((answer): answer is OpenAnswer => answer.kind === "open");

  if (!lastOpenAnswer?.selectedOptionId) return null;

  const sourceQuestion = questions.find((question) => question.id === lastOpenAnswer.questionId);
  const selectedOption = obtenerOpcionSeleccionada(sourceQuestion as Question, lastOpenAnswer.selectedOptionId);

  if (!selectedOption?.nextQuestionId) return null;
  if (answeredIds.has(selectedOption.nextQuestionId)) return null;

  return questions.find((question) => question.id === selectedOption.nextQuestionId) ?? null;
}

