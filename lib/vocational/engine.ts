import {
  adaptiveFocusByRiasec,
  bigFiveDimensions,
  COMMON_BASELINE_QUESTION_COUNT,
  contextDimensions,
  dimensionLabels,
  maxLikertQuestions,
  maxOpenQuestions,
  measurableDimensions,
  minLikertQuestions,
  profiles,
  questions,
  riasecDimensions,
} from "./data";
import { analyzeNarrativeText, analyzeSemanticFocusText } from "./responsePatterns";
import type {
  AdaptiveStatus,
  AdaptiveDiagnostics,
  Answer,
  ContradictionStatus,
  Dimension,
  LikertAnswer,
  OpenAnswer,
  Profile,
  Question,
  ResultIndicators,
  SearchParams,
  SemanticCoverage,
  ValidationObservation,
} from "./types";

export const CORE_THRESHOLD = 3.5;
const NEARBY_PROFILE_GAP = 1.5;
const SEMANTIC_FOCUS_THRESHOLD = 3.5;
const MIN_SEMANTIC_COVERAGE_RATIO = 0.66;
const BROAD_INTEREST_DIMENSION_COUNT = 4;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function encodeAnswers(answers: Answer[]) {
  return Buffer.from(JSON.stringify(answers), "utf8").toString("base64url");
}

export function decodeAnswers(value: string | undefined): Answer[] {
  if (!value) return [];

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLikertAnswers(answers: Answer[]) {
  return answers.filter((answer): answer is LikertAnswer => answer.kind === "likert");
}

export function getOpenAnswers(answers: Answer[]) {
  return answers.filter((answer): answer is OpenAnswer => answer.kind === "open");
}

export function getAnswerForQuestion(answers: Answer[], questionId: number) {
  return answers.find((answer) => answer.questionId === questionId);
}

export function getEditableQuestion(answers: Answer[], searchParams: SearchParams) {
  const editQuestionId = Number(getParam(searchParams, "editQuestionId"));

  if (!Number.isInteger(editQuestionId)) return null;
  if (!answers.some((answer) => answer.questionId === editQuestionId)) return null;

  return questions.find((question) => question.id === editQuestionId) ?? null;
}

function normalizeOpenText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function isLowInformationOpenAnswer(text: string) {
  const normalized = normalizeOpenText(text);

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

function hasUnresolvedDoubtText(text: string) {
  const normalized = normalizeOpenText(text);
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

function hasAbsoluteOrDefensiveTone(text: string) {
  const normalized = normalizeOpenText(text);
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
    defensivePatterns.some((pattern) => normalized.includes(normalizeOpenText(pattern))) ||
    absoluteWords.length >= 2 ||
    repeatedWords.length >= 3
  );
}

function hasAggressiveTone(text: string) {
  const normalized = normalizeOpenText(text);
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

export function isUsefulComment(comment: string | undefined) {
  if (!comment) return false;

  const trimmed = comment.trim();
  if (!trimmed) return false;

  const normalized = normalizeOpenText(trimmed);
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
  const repeatedCharactersOnly = /^(\w)\1{2,}$/.test(normalized);
  const hasLettersOrNumbers = /[a-z0-9]/.test(normalized);

  if (!hasLettersOrNumbers || repeatedCharactersOnly) return false;
  if (lowContentPatterns.includes(normalized)) return false;
  if (simpleInsults.includes(normalized)) return false;
  if (hasAggressiveTone(normalized)) return false;

  return normalized.length >= 4;
}

export function isClarificationUseful(answer: string) {
  const normalized = normalizeOpenText(answer);

  if (!isUsefulComment(answer)) return false;
  if (isLowInformationOpenAnswer(answer)) return false;
  if (hasAbsoluteOrDefensiveTone(answer)) return false;
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
    normalized.includes(normalizeOpenText(signal)),
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
    normalized.includes(normalizeOpenText(signal)),
  );
  const hasEnoughContext = normalized.split(/\s+/).length >= 6;

  if (hasUnresolvedDoubtText(answer) && !hasClearChoice) return false;

  return hasPreferenceSignal && hasEnoughContext;
}

export function getNarrativeReliability(comments: string[]) {
  const usefulComments = comments.filter(isUsefulComment);
  const analysisReliabilityImpact = comments.reduce(
    (total, comment) => total + analyzeNarrativeText(comment).reliabilityImpact,
    0,
  );

  if (usefulComments.length === 0) return "medium";

  const lowReliabilityCount = usefulComments.filter((comment) => {
    const normalized = normalizeOpenText(comment);
    const doesNotExplain = normalized.length < 12 && !["no se", "depende"].includes(normalized);

    return hasAbsoluteOrDefensiveTone(comment) || hasAggressiveTone(comment) || doesNotExplain;
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

function getNarrativeTexts(answers: Answer[]) {
  return answers.flatMap((answer) => {
    if (answer.kind === "open") return [answer.text];
    return answer.comment ? [answer.comment] : [];
  });
}

function getNarrativeAnalysis(answers: Answer[]) {
  const analyses = getNarrativeTexts(answers).map(analyzeNarrativeText);

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

function getNarrativeSemanticFocus(answers: Answer[]) {
  return Array.from(
    new Set(
      getNarrativeTexts(answers).flatMap(
        (text) => analyzeSemanticFocusText(text).semanticFocus,
      ),
    ),
  );
}

function buildInitialScores() {
  return measurableDimensions.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: { total: 0, count: 0 },
    }),
    {} as Record<Dimension, { total: number; count: number }>,
  );
}

export function getAverages(answers: Answer[]) {
  const scores = buildInitialScores();

  getLikertAnswers(answers).forEach((answer) => {
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

export function calculateScores(responses: Answer[]) {
  return getAverages(responses);
}

export function getTopDimensions(scores: Record<Dimension, number>) {
  return measurableDimensions
    .map((dimension) => ({
      dimension,
      label: dimensionLabels[dimension],
      score: scores[dimension],
    }))
    .sort((a, b) => b.score - a.score);
}

export function calculateDifferentiationScore(
  riasecScores: Pick<Record<Dimension, number>, (typeof riasecDimensions)[number]>,
) {
  const highDimensions = riasecDimensions.filter(
    (dimension) => riasecScores[dimension] >= 4,
  );
  const clarityPenalty =
    highDimensions.length >= 5
      ? 15
      : highDimensions.length === 4
        ? 10
        : highDimensions.length === 3
          ? 5
          : 0;

  return {
    highDimensions,
    possibleBroadInterest: highDimensions.length >= 5,
    clarityPenalty,
    differentiationScore: Math.max(0, 100 - clarityPenalty),
  };
}

export function getConsistencyScore(responses: Answer[]) {
  const answersByDimension = getLikertAnswers(responses).reduce(
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

function hasVariableDimension(
  responses: Answer[],
  dimension: Dimension,
  minimumGap = 2,
) {
  const values = getLikertAnswers(responses)
    .filter((answer) => answer.dimension === dimension)
    .map((answer) => answer.value);

  if (values.length < 2) return false;

  return Math.max(...values) - Math.min(...values) >= minimumGap;
}

export function getConflictResolutionStatus(
  scores: Record<Dimension, number>,
  responses: Answer[],
) {
  const consistency = getConsistencyScore(responses);
  const differentiation = calculateDifferentiationScore(scores);
  const openAnswers = getOpenAnswers(responses);
  const clarificationAnswers = openAnswers.filter((answer) =>
    ["prioritization", "contradiction", "motivation"].includes(answer.trigger),
  );
  const narrativeReliability = getNarrativeReliability(
    clarificationAnswers.map((answer) => answer.text),
  );
  const usefulClarifications = clarificationAnswers.filter((answer) =>
    narrativeReliability !== "low" && isClarificationUseful(answer.text),
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

export function detectContradictions(
  scores: Record<Dimension, number>,
  responses: Answer[],
) {
  const consistency = getConsistencyScore(responses);
  const differentiation = calculateDifferentiationScore(scores);
  const resolution = getConflictResolutionStatus(scores, responses);
  const topRiasec = getTopDimensions(scores).filter(({ dimension }) =>
    riasecDimensions.includes(dimension),
  );
  const highRiasecDimensions = topRiasec.filter(({ score }) => score >= 4);
  const topInterest = topRiasec[0];
  const hasLowTolerance = scores.tolerancia > 0 && scores.tolerancia <= 2;
  const hasUsefulLikertComment = getLikertAnswers(responses).some((answer) =>
    isUsefulComment(answer.comment),
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
        "Hay muchas dimensiones altas. Esto puede indicar amplitud de intereses más que un perfil claramente diferenciado.",
      severity: "medium",
    });
  }

  return contradictions;
}

export function shouldFinishTest(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profileRanking: Array<Profile & { score: number }>,
  contradictions: Array<{ severity: "low" | "medium" | "high" }>,
) {
  const likertCount = getLikertAnswers(responses).length;

  if (likertCount >= maxLikertQuestions) return true;
  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) return false;

  const consistency = getConsistencyScore(responses);
  const differentiation = calculateDifferentiationScore(scores);
  const resolution = getConflictResolutionStatus(scores, responses);
  const [firstProfile, secondProfile] = profileRanking;
  const profileGap = firstProfile && secondProfile
    ? firstProfile.score - secondProfile.score
    : 0;
  const topProfileScore = firstProfile?.score ?? 0;
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
  const unresolvedConflict = resolution.hasConflict && !resolution.isResolved;
  const hasHighClarity =
    topProfileScore >= 12 &&
    profileGap >= 1.5 &&
    consistency.consistencyScore >= 80 &&
    differentiation.highDimensions.length < 5 &&
    !unresolvedConflict &&
    !hasContextRisk &&
    !hasStrongContradictions &&
    !hasMixedRiasecWithoutDominance;
  const hasMediumClarity =
    topProfileScore >= 10 &&
    profileGap >= 1 &&
    consistency.consistencyScore >= 65 &&
    (!differentiation.possibleBroadInterest || resolution.isResolved) &&
    (!unresolvedConflict || resolution.isExplored) &&
    !hasContextRisk &&
    (!hasStrongContradictions || resolution.isExplored) &&
    !hasMixedRiasecWithoutDominance;

  if (hasHighClarity && likertCount >= minLikertQuestions) return true;
  if (hasMediumClarity && likertCount >= 15) return true;
  if (resolution.isExplored && likertCount >= 15 && !hasContextRisk) return true;

  return false;
}

export function getCurrentQuestionTarget(
  responses: Answer[],
  scores: Record<Dimension, number>,
  profileRanking: Array<Profile & { score: number }>,
  contradictions: Array<{ severity: "low" | "medium" | "high" }>,
) {
  const likertCount = getLikertAnswers(responses).length;

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return COMMON_BASELINE_QUESTION_COUNT;
  }

  const consistency = getConsistencyScore(responses);
  const differentiation = calculateDifferentiationScore(scores);
  const resolution = getConflictResolutionStatus(scores, responses);
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
    hasStrongContradictions ||
    hasContextRisk;

  if (hasConflict) return maxLikertQuestions;

  if (
    topProfileScore >= 12 &&
    profileGap >= 1.5 &&
    consistency.consistencyScore >= 80
  ) {
    return Math.max(14, minLikertQuestions);
  }

  if (
    topProfileScore >= 10 &&
    profileGap >= 1 &&
    consistency.consistencyScore >= 65
  ) {
    return 18;
  }

  return maxLikertQuestions;
}

function scoreProfile(profile: Profile, averages: Record<Dimension, number>) {
  return Object.entries(profile.dimensions).reduce((total, [dimension, weight]) => {
    return total + averages[dimension as Dimension] * Number(weight);
  }, 0);
}

export function getProfileCoreStatus(
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

export function getStrictCoreStatus(
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

function getRankedProfiles(averages: Record<Dimension, number>) {
  return profiles
    .map((profile) => ({
      ...profile,
      score: scoreProfile(profile, averages),
    }))
    .sort((a, b) => b.score - a.score);
}

export function getCompatibleProfiles(
  profileRanking: Array<Profile & { score: number }>,
  mainProfileId: string,
  scoreGap = 2,
) {
  const topScore = profileRanking[0]?.score ?? 0;

  return profileRanking.filter(
    (profile) => profile.id !== mainProfileId && profile.score >= topScore - scoreGap,
  );
}

export function getNearbyProfiles(
  profileRanking: Array<Profile & { score: number }>,
  gap = NEARBY_PROFILE_GAP,
) {
  const topScore = profileRanking[0]?.score ?? 0;

  return profileRanking.filter((profile) => topScore - profile.score <= gap);
}

function getQuestionSemanticFocusByDimension(dimension: Dimension) {
  return Array.from(
    new Set(
      questions
        .filter((question) => question.kind === "likert" && question.dimension === dimension)
        .flatMap((question) => question.semanticFocus ?? []),
    ),
  );
}

export function getSemanticCoverage(
  answers: Answer[],
  averages = getAverages(answers),
) {
  const answeredQuestionIds = new Set(answers.map((answer) => answer.questionId));

  return measurableDimensions.map((dimension) => {
    const expectedFocus = getQuestionSemanticFocusByDimension(dimension);
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

function getMissingSemanticFocus(
  answers: Answer[],
  averages: Record<Dimension, number>,
) {
  return getSemanticCoverage(answers, averages).filter(
    (coverage) =>
      averages[coverage.dimension] >= SEMANTIC_FOCUS_THRESHOLD &&
      coverage.missingFocus.length > 0 &&
      coverage.coverageRatio < MIN_SEMANTIC_COVERAGE_RATIO,
  );
}

export function getAdaptiveDiagnostics(
  answers: Answer[],
  averages = getAverages(answers),
  profileRanking = getRankedProfiles(averages),
): AdaptiveDiagnostics {
  const likertCount = getLikertAnswers(answers).length;
  const differentiation = calculateDifferentiationScore(averages);
  const nearbyProfiles = getNearbyProfiles(profileRanking);
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
    differentiation.possibleBroadInterest ||
    differentiation.highDimensions.length >= BROAD_INTEREST_DIMENSION_COUNT;
  const lowDifferentiation =
    hasNearbyProfiles ||
    hasBroadInterestPattern;
  const weakCoreProfileIds = nearbyProfiles
    .filter((profile) => !getStrictCoreStatus(profile, averages).coreMeetsStrictThreshold)
    .map((profile) => profile.id);
  const missingSemanticFocus = getMissingSemanticFocus(answers, averages);
  const topProfileHasWeakCore = Boolean(
    topProfile && weakCoreProfileIds.includes(topProfile.id),
  );
  const needsSemanticDeepening = missingSemanticFocus.length > 0;
  const needsCoreDeepening = weakCoreProfileIds.length > 0;
  const hasRouteConflict =
    hasNearbyProfiles ||
    hasBroadInterestPattern ||
    (nearbyProfiles.length > 1 && topProfileHasWeakCore);
  const phaseReasons = [
    likertCount < COMMON_BASELINE_QUESTION_COUNT ? "baseline-incomplete" : null,
    hasNearbyProfiles ? "nearby-profiles" : null,
    hasBroadInterestPattern ? "low-differentiation" : null,
    topProfileHasWeakCore ? "top-profile-weak-core" : null,
    highUncertainty ? "high-uncertainty" : null,
    needsSemanticDeepening ? "missing-semantic-focus" : null,
    needsCoreDeepening ? "weak-core-evidence" : null,
  ].filter((reason): reason is string => Boolean(reason));
  const phase =
    likertCount < COMMON_BASELINE_QUESTION_COUNT
      ? "baseline"
      : hasRouteConflict
        ? "discrimination"
        : highUncertainty || needsSemanticDeepening || needsCoreDeepening
          ? "deepening"
          : "closure";

  return {
    phase,
    phaseReasons,
    highUncertainty,
    lowDifferentiation,
    nearbyProfileIds: nearbyProfiles.map((profile) => profile.id),
    missingSemanticFocus,
    weakCoreProfileIds,
  };
}

export function getBestProfile(answers: Answer[]) {
  const averages = getAverages(answers);
  const ranked = getRankedProfiles(averages);

  const strictCoreRanked = ranked.filter(
    (profile) => getStrictCoreStatus(profile, averages).coreMeetsStrictThreshold,
  );
  const lowCoreConfidence = strictCoreRanked.length === 0;
  const best = strictCoreRanked[0] ?? ranked[0];
  const second = ranked.find((profile) => profile.id !== best.id) ?? ranked[1];
  const coreRejectedProfiles = ranked.filter(
    (profile) => !getStrictCoreStatus(profile, averages).coreMeetsStrictThreshold,
  );
  const differentiation = calculateDifferentiationScore(averages);
  const resolution = getConflictResolutionStatus(averages, answers);
  const narrativeReliability = getNarrativeReliability(getNarrativeTexts(answers));
  const narrativePenalty = narrativeReliability === "low" ? 12 : 0;
  const earlyFinishPenalty = getLikertAnswers(answers).length < 15 ? 5 : 0;
  const contradictionPenalty =
    resolution.hasConflict && resolution.status !== "resolved"
      ? resolution.status === "attempted"
        ? 10
        : 8
      : 0;
  const uncertaintyPenalty = averages.incertidumbre * 4;
  const pressurePenalty = averages.presion * 2;
  const neuroticismPenalty = averages.neuroticismo * 1.5;
  const confidence = Math.min(
    96,
    Math.max(
      35,
      64 + (best.score - second.score) * 10 - uncertaintyPenalty - pressurePenalty - neuroticismPenalty,
    ),
  ) - differentiation.clarityPenalty - narrativePenalty - contradictionPenalty - earlyFinishPenalty;
  const profileClarity = Math.max(35, confidence);
  const indicators: ResultIndicators = {
    profileClarity,
    vocationalUncertainty: Math.min(100, Math.max(0, averages.incertidumbre * 20)),
    externalPressure: Math.min(100, Math.max(0, averages.presion * 20)),
  };
  const validationObservation: ValidationObservation = getValidationObservation(answers);

  return {
    best,
    ranked,
    confidence: profileClarity,
    indicators,
    averages,
    traditionalBest: ranked[0],
    lowCoreConfidence,
    coreRejectedProfiles,
    validationObservation,
  };
}

function getValidationObservation(answers: Answer[]): ValidationObservation {
  const openObservations = getOpenAnswers(answers)
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

function getTriggeredOpenQuestion(answers: Answer[]) {
  const averages = getAverages(answers);
  const usedTriggers = new Set(getOpenAnswers(answers).map((answer) => answer.trigger));
  const openCount = getOpenAnswers(answers).length;
  const likertCount = getLikertAnswers(answers).length;
  const resolution = getConflictResolutionStatus(averages, answers);

  if (openCount >= maxOpenQuestions || likertCount < 8) {
    return null;
  }

  if (resolution.isResolved || resolution.isExplored) {
    return null;
  }

  const topRiasecAverage = Math.max(...riasecDimensions.map((dimension) => averages[dimension]));
  const differentiation = calculateDifferentiationScore(averages);
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

function hasNearbyPair(nearbyProfileIds: string[], first: string, second: string) {
  return nearbyProfileIds.includes(first) && nearbyProfileIds.includes(second);
}

function getTriggeredContrastQuestion(answers: Answer[]) {
  const averages = getAverages(answers);
  const openCount = getOpenAnswers(answers).length;
  const usedQuestionIds = new Set(answers.map((answer) => answer.questionId));
  const narrativeSemanticFocus = getNarrativeSemanticFocus(answers);

  if (openCount >= maxOpenQuestions) {
    return null;
  }

  const diagnostics = getAdaptiveDiagnostics(
    answers,
    averages,
    getRankedProfiles(averages),
  );
  const hasNearbyProfiles = diagnostics.nearbyProfileIds.length > 1;
  const semanticCoverage = getSemanticCoverage(answers, averages);
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
  const candidates = [
    (nearbyProfileIds.includes("arte-comunicacion-diseno") && missingDimensions.has("artistico")) ||
    hasSpatialDesignSignal
      ? 202
      : null,
    hasNearbyPair(nearbyProfileIds, "ingenieria-tecnologia", "ciencia-datos-investigacion")
      ? 201
      : null,
    hasNearbyPair(nearbyProfileIds, "salud-apoyo-humano", "educacion-ciencias-sociales")
      ? 203
      : null,
    nearbyProfileIds.includes("negocios-gestion") &&
    (nearbyProfileIds.includes("educacion-ciencias-sociales") ||
      nearbyProfileIds.includes("salud-apoyo-humano") ||
      missingDimensions.has("emprendedor"))
      ? 204
      : null,
  ].filter((id): id is number => Boolean(id));

  return (
    candidates
      .map((id) => questions.find((question) => question.id === id))
      .find((question) => question && !usedQuestionIds.has(question.id)) ?? null
  );
}

export function selectNextQuestion(answers: Answer[]) {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const unansweredLikert = questions.filter(
    (question) => question.kind === "likert" && !answeredIds.has(question.id),
  );
  const likertCount = getLikertAnswers(answers).length;

  if (likertCount < COMMON_BASELINE_QUESTION_COUNT) {
    return unansweredLikert[0] ?? null;
  }

  const triggeredContrastQuestion = getTriggeredContrastQuestion(answers);

  if (triggeredContrastQuestion) {
    return triggeredContrastQuestion;
  }

  const triggeredOpenQuestion = getTriggeredOpenQuestion(answers);

  if (triggeredOpenQuestion) {
    return triggeredOpenQuestion;
  }

  const averages = getAverages(answers);
  const diagnostics = getAdaptiveDiagnostics(answers, averages, getRankedProfiles(averages));
  const narrativeSemanticFocus = getNarrativeSemanticFocus(answers);
  const likertAnswers = getLikertAnswers(answers);
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

export function processSubmittedAnswer(searchParams: SearchParams) {
  const answers = decodeAnswers(getParam(searchParams, "state"));
  const kind = getParam(searchParams, "kind");
  const questionId = Number(getParam(searchParams, "questionId"));
  const question = questions.find((item) => item.id === questionId);
  const editQuestionId = Number(getParam(searchParams, "editQuestionId"));
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
    const value = Number(getParam(searchParams, "value"));
    const comment = getParam(searchParams, "comment")?.trim() || undefined;

    if (Number.isInteger(value) && value >= 1 && value <= 5) {
      const answer = {
        kind: "likert",
        questionId: question.id,
        dimension: question.dimension,
        value,
        order: baseAnswers.length + 1,
        ...(comment ? { comment } : {}),
      } satisfies LikertAnswer;

      return [
        ...baseAnswers,
        answer,
      ] satisfies Answer[];
    }
  }

  if (kind === "open" && question.trigger) {
    const guidedChoice = getParam(searchParams, "guidedChoice")?.trim();
    const unsureDetail = getParam(searchParams, "unsureDetail")?.trim();
    const submittedText = getParam(searchParams, "text")?.trim();
    const careerReference = getParam(searchParams, "careerReference")?.trim();
    const observedMismatch = getParam(searchParams, "observedMismatch") === "true";
    const guidedText = [
      guidedChoice ? `Opción guiada: ${guidedChoice}` : null,
      unsureDetail ? `Detalle: ${unsureDetail}` : null,
      submittedText ? `Comentario: ${submittedText}` : null,
    ].filter(Boolean).join(" | ");
    const rawText = guidedText || submittedText || "Sin respuesta";
    const text = isLowInformationOpenAnswer(rawText)
      ? "No lo tengo claro todavía."
      : rawText;

    return [
      ...baseAnswers,
      {
        kind: "open",
        questionId: question.id,
        trigger: question.trigger,
        text,
        order: baseAnswers.length + 1,
        ...(careerReference ? { careerReference } : {}),
        ...(observedMismatch ? { observedMismatch } : {}),
      },
    ] satisfies Answer[];
  }

  return answers;
}

export function getSignals(answers: Answer[]) {
  const averages = getAverages(answers);
  const resolution = getConflictResolutionStatus(averages, answers);
  const narrativeAnalysis = getNarrativeAnalysis(answers);
  const narrativeReliability = getNarrativeReliability(getNarrativeTexts(answers));
  const unclearOpenAnswers = getOpenAnswers(answers).filter((answer) =>
    isLowInformationOpenAnswer(answer.text),
  );
  const openAnswers = getOpenAnswers(answers);
  const contextualOpenAnswers = openAnswers.filter((answer) =>
    isUsefulComment(answer.text),
  );
  const resolutiveOpenAnswers = openAnswers.filter((answer) =>
    isClarificationUseful(answer.text),
  );
  const hasVariablePersistence =
    hasVariableDimension(answers, "responsabilidad") ||
    hasVariableDimension(answers, "tolerancia");
  const hasAnyHighPressureAnswer = getLikertAnswers(answers).some(
    (answer) => answer.dimension === "presion" && answer.value >= 4,
  );
  const topRiasec = [...riasecDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 3);
  const topBigFive = [...bigFiveDimensions]
    .sort((a, b) => averages[b] - averages[a])
    .slice(0, 2);
  const categories = new Set(narrativeAnalysis.categories);
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
    averages.incertidumbre >= 4 || averages.neuroticismo >= 4
      ? "Incertidumbre vocacional alta: conviene validar el perfil con experiencias prácticas."
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
  ];
}

export function getAdaptiveStatus(
  answers: Answer[],
  currentQuestion: Question | null,
): AdaptiveStatus {
  const likertCount = getLikertAnswers(answers).length;

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

  const averages = getAverages(answers);
  const diagnostics = getAdaptiveDiagnostics(answers, averages, getRankedProfiles(averages));
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

export function getStaticProfile(answers: Answer[]) {
  return getBestProfile(
    questions.slice(0, 6).flatMap((question) => {
      const answer = answers.find(
        (item): item is LikertAnswer =>
          item.kind === "likert" && item.questionId === question.id,
      );
      return answer ? [answer] : [];
    }),
  ).best;
}
