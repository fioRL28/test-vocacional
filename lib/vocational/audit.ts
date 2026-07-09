import {
  adaptiveThemeBlocks,
  bigFiveDimensions,
  contextDimensions,
  profiles,
  questions,
  riasecDimensions,
  vocationalSubroutes,
} from "./data";
import {
  calcularPuntajeDiferenciacion,
  detectarContradicciones,
  obtenerDecisionCierreAdaptativo,
  obtenerPromedios,
  obtenerMejorPerfil,
  obtenerRespuestasLikert,
  obtenerRespuestasAbiertas,
  obtenerDimensionesPrincipales,
} from "./engine";
import type {
  Answer,
  AuditInterpretation,
  AuditIssue,
  Dimension,
  FlowEfficiencyAudit,
  InternalInstrumentAuditReport,
  Profile,
  ProfileAbsorptionAudit,
  ProfileSignalConsistencyAudit,
  Question,
  QuestionCoherenceAudit,
  RedundancyAudit,
} from "./types";

const DIMENSION_FOCUS_KEYWORDS: Record<Dimension, string[]> = {
  realista: ["hands-on", "technical", "practical", "building", "testing", "manipulation"],
  investigativo: ["scientific", "analysis", "pattern", "causal", "evidence", "reasoning"],
  artistico: ["creativity", "design", "visual", "spatial", "expressive", "creation"],
  social: ["support", "care", "teaching", "guidance", "collaborative", "interpersonal"],
  emprendedor: ["initiative", "persuasion", "leadership", "decision", "coordination"],
  convencional: ["organization", "precision", "process", "information", "structure"],
  apertura: ["novelty", "curiosity", "flexibility", "creation", "learning"],
  responsabilidad: ["persistence", "discipline", "planning", "progress", "task", "routine"],
  extraversion: ["social", "public", "communication", "initiative", "confidence"],
  amabilidad: ["cooperative", "perspective", "relationship", "care", "conflict"],
  neuroticismo: ["anxiety", "worry", "fear", "disappointment"],
  incertidumbre: ["uncertainty", "clarity", "identity", "conflict"],
  presion: ["pressure", "expectations", "security", "acceptance", "economic"],
  tolerancia: ["tolerance", "difficulty", "coping", "persistence"],
};

const TRIGGER_OPTION_KEYWORDS: Record<NonNullable<Question["trigger"]>, string[]> = {
  uncertainty: ["no sé", "duda", "equivocarme", "cuesta elegir", "preocupa", "clara"],
  pressure: ["familia", "rentable", "estabilidad", "decepcionar", "esperan", "entorno"],
  contradiction: ["intentar", "ayuda", "frustro", "difícil", "depende", "reaccionar"],
  motivation: ["diseñar", "crear", "comprender", "ayudar", "organizar", "investigar"],
  prioritization: ["elegiría", "curiosidad", "sostener", "priorizar", "oportunidades", "probar"],
  contrast: ["ambas", "probar", "revisar", "diseñar", "escuchar", "convencer", "coordinar"],
};

function limitarPuntaje(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function interpretarCoherenciaPregunta(score: number, issues: AuditIssue[] = []): AuditInterpretation {
  if (score >= 95) {
    return {
      status: "ok",
      reason: "La pregunta, opciones, dimension y foco semantico son coherentes.",
    };
  }

  if (score >= 85) {
    return {
      status: "warning",
      reason: issues[0]?.message ?? "La pregunta requiere revision metodologica menor.",
    };
  }

  return {
    status: "critical",
    reason: issues[0]?.message ?? "La pregunta presenta una inconsistencia metodologica critica.",
  };
}

function interpretarRedundancia(redundancyPercent: number): AuditInterpretation {
  if (redundancyPercent < 15) {
    return {
      status: "ok",
      reason: "No se detecta redundancia relevante entre preguntas de la misma dimension.",
    };
  }

  if (redundancyPercent <= 30) {
    return {
      status: "warning",
      reason: "Existen preguntas parecidas que conviene revisar antes de ampliar validaciones.",
    };
  }

  return {
    status: "critical",
    reason: "Hay alta similitud entre preguntas y puede generar fatiga o sesgo de repeticion.",
  };
}

function interpretarAbsorcionPerfil(
  score: number,
  profileId: string,
  riskFactors: string[],
  mismatchCount: number,
): AuditInterpretation {
  if (score < 20) {
    return {
      status: "ok",
      reason: "No se observa riesgo relevante de absorcion para este perfil.",
    };
  }

  if (score <= 35) {
    return {
      status: "warning",
      reason:
        riskFactors[0] ??
        `El perfil ${profileId} muestra senales moderadas de absorcion metodologica.`,
    };
  }

  return {
    status: "critical",
    reason:
      mismatchCount > 0
        ? `${profileId} concentra casos marcados como mismatch observado.`
        : `${profileId} puede absorber perfiles por dimensiones generales elevadas.`,
  };
}

function interpretarConsistenciaSenalesPerfil(
  score: number,
  issues: AuditIssue[] = [],
): AuditInterpretation {
  if (score > 80) {
    return {
      status: "ok",
      reason: "El perfil principal es coherente con las senales RIASEC destacadas.",
    };
  }

  if (score >= 60) {
    return {
      status: "warning",
      reason: issues[0]?.message ?? "Hay alineacion parcial entre perfil y senales destacadas.",
    };
  }

  return {
    status: "critical",
    reason:
      issues[0]?.message ??
      "El perfil principal no es consistente con las senales vocacionales dominantes.",
  };
}

function interpretarEficienciaFlujo(
  score: number,
  questionCount: number,
  profileClarity: number,
): AuditInterpretation {
  if (profileClarity >= 75 && questionCount <= 22) {
    return {
      status: "ok",
      reason: "Claridad alta con una cantidad razonable de preguntas.",
    };
  }

  if (profileClarity < 60 && questionCount >= 24) {
    return {
      status: "critical",
      reason: "Baja claridad con muchas preguntas; el flujo no esta reduciendo incertidumbre.",
    };
  }

  if (score >= 70) {
    return {
      status: "ok",
      reason: "La relacion entre claridad y cantidad de preguntas es adecuada.",
    };
  }

  return {
    status: "warning",
    reason: "Claridad media con una cantidad alta de preguntas; conviene revisar cierre dinamico.",
  };
}

function normalizarTexto(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizar(value: string) {
  const stopWords = new Set([
    "a",
    "al",
    "algo",
    "con",
    "de",
    "del",
    "donde",
    "el",
    "en",
    "la",
    "las",
    "lo",
    "los",
    "me",
    "mi",
    "o",
    "para",
    "por",
    "que",
    "si",
    "un",
    "una",
    "y",
  ]);

  return normalizarTexto(value)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function calcularSimilitudJaccard(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const union = new Set([...leftSet, ...rightSet]);
  const intersection = [...leftSet].filter((token) => rightSet.has(token));

  return union.size ? intersection.length / union.size : 0;
}

function focoSemanticoCoincideConDimension(question: Question) {
  if (!question.dimension) return true;

  const keywords = DIMENSION_FOCUS_KEYWORDS[question.dimension];
  const semanticFocusText = (question.semanticFocus ?? []).join(" ");

  return keywords.some((keyword) => semanticFocusText.includes(keyword));
}

function obtenerIdsBloquesTematicosPregunta(question: Question) {
  return adaptiveThemeBlocks
    .filter((block) => {
      const focus = question.semanticFocus ?? [];

      return Boolean(
        question.dimension &&
          (block.dimensions.includes(question.dimension) ||
            focus.some((item) => block.semanticFocus.includes(item))),
      );
    })
    .map((block) => block.id);
}

function obtenerModeloEsperadoPorDimension(dimension: Dimension | undefined) {
  if (!dimension) return undefined;
  if (riasecDimensions.includes(dimension)) return "RIASEC";
  if (bigFiveDimensions.includes(dimension)) return "Big Five";
  if (contextDimensions.includes(dimension)) return "Contexto";
  return undefined;
}

export function obtenerAuditoriaCoherenciaPregunta(question: Question): QuestionCoherenceAudit {
  const issues: AuditIssue[] = [];
  let score = 100;

  if (question.kind === "likert" && !question.dimension) {
    score -= 35;
    issues.push({
      code: "likert_without_dimension",
      severity: "high",
      message: "La pregunta Likert no tiene dimension asignada.",
      targetId: question.id,
    });
  }

  const expectedModel = obtenerModeloEsperadoPorDimension(question.dimension);

  if (question.model && expectedModel && question.model !== expectedModel) {
    score -= 18;
    issues.push({
      code: "model_dimension_mismatch",
      severity: "medium",
      message: `La pregunta usa model=${question.model}, pero la dimension pertenece a ${expectedModel}.`,
      targetId: question.id,
    });
  }

  if (question.kind === "likert" && question.dimension && !focoSemanticoCoincideConDimension(question)) {
    score -= 14;
    issues.push({
      code: "semantic_focus_dimension_gap",
      severity: "medium",
      message: "El semanticFocus no parece alinearse claramente con la dimension asignada.",
      targetId: question.id,
    });
  }

  if (question.kind === "open") {
    if (!question.trigger) {
      score -= 25;
      issues.push({
        code: "open_without_trigger",
        severity: "high",
        message: "La pregunta abierta no tiene trigger metodologico.",
        targetId: question.id,
      });
    }

    if (question.guidedOptions?.length && question.trigger) {
      const expectedKeywords = TRIGGER_OPTION_KEYWORDS[question.trigger];
      const optionText = normalizarTexto(question.guidedOptions.join(" "));
      const matchingKeywords = expectedKeywords.filter((keyword) =>
        optionText.includes(normalizarTexto(keyword)),
      );
      const minimumMatches = question.trigger === "contrast" ? 1 : 2;

      if (matchingKeywords.length < minimumMatches) {
        score -= 30;
        issues.push({
          code: "guided_options_intention_mismatch",
          severity: "high",
          message: "Las opciones guiadas no parecen corresponder a la intencion del trigger.",
          targetId: question.id,
        });
      }
    }
  }

  const finalScore = limitarPuntaje(score);
  const interpretation = interpretarCoherenciaPregunta(finalScore, issues);

  return {
    questionId: question.id,
    score: finalScore,
    status: interpretation.status,
    reason: interpretation.reason,
    dimension: question.dimension,
    trigger: question.trigger,
    adaptiveThemeBlockIds: obtenerIdsBloquesTematicosPregunta(question),
    issues,
  };
}

export function obtenerReporteCoherenciaPreguntas() {
  const questionAudits = questions.map(obtenerAuditoriaCoherenciaPregunta);
  const score =
    questionAudits.reduce((total, item) => total + item.score, 0) / questionAudits.length;
  const finalScore = limitarPuntaje(score);
  const interpretation = interpretarCoherenciaPregunta(
    finalScore,
    questionAudits.flatMap((question) => question.issues),
  );

  return {
    score: finalScore,
    status: interpretation.status,
    reason: interpretation.reason,
    questions: questionAudits,
  };
}

export function obtenerAuditoriaRedundancia(): RedundancyAudit {
  const likertQuestions = questions.filter(
    (question) => question.kind === "likert" && question.dimension,
  );
  const pairs = likertQuestions.flatMap((question, index) =>
    likertQuestions.slice(index + 1).flatMap((candidate) => {
      if (question.dimension !== candidate.dimension) return [];

      const textSimilarity = calcularSimilitudJaccard(tokenizar(question.text), tokenizar(candidate.text));
      const sharedSemanticFocus = (question.semanticFocus ?? []).filter((focus) =>
        (candidate.semanticFocus ?? []).includes(focus),
      );
      const semanticSimilarity =
        sharedSemanticFocus.length /
        Math.max(1, new Set([...(question.semanticFocus ?? []), ...(candidate.semanticFocus ?? [])]).size);
      const similarity = Math.max(textSimilarity, semanticSimilarity);

      if (similarity < 0.33) return [];

      return [
        {
          questionIds: [question.id, candidate.id] as [number, number],
          dimension: question.dimension,
          similarity: Number(similarity.toFixed(2)),
          sharedSemanticFocus,
        },
      ];
    }),
  );
  const maxSimilarity = pairs.reduce(
    (currentMax, pair) => Math.max(currentMax, pair.similarity),
    0,
  );
  const redundancyPercent = maxSimilarity * 100;
  const interpretation = interpretarRedundancia(redundancyPercent);

  return {
    score: limitarPuntaje(redundancyPercent),
    status: interpretation.status,
    reason: interpretation.reason,
    pairs: pairs.sort((a, b) => b.similarity - a.similarity),
  };
}

function obtenerRiesgoAbsorcionEstaticaPerfil(profile: Profile) {
  const weightedDimensions = Object.entries(profile.dimensions);
  const totalWeight = weightedDimensions.reduce(
    (total, [, weight]) => total + Math.abs(Number(weight)),
    0,
  );
  const nonCoreWeight = weightedDimensions
    .filter(([dimension]) => !profile.coreRiasec.includes(dimension as Dimension))
    .reduce((total, [, weight]) => total + Math.abs(Number(weight)), 0);
  const riskFactors: string[] = [];

  if (weightedDimensions.length >= 6) {
    riskFactors.push("usa seis o mas dimensiones ponderadas");
  }

  if (totalWeight && nonCoreWeight / totalWeight >= 0.45) {
    riskFactors.push("gran parte del peso esta fuera del nucleo RIASEC");
  }

  if (profile.supportBigFive.length >= 2) {
    riskFactors.push("usa varios Big Five como apoyo dentro de dimensions");
  }

  const linkedSubroutes = vocationalSubroutes.filter((subroute) =>
    subroute.relatedProfileIds.includes(profile.id),
  );

  if (linkedSubroutes.length >= 3) {
    riskFactors.push("esta relacionado con muchas subrutas candidatas");
  }

  return riskFactors;
}

export function obtenerAuditoriaAbsorcionPerfil(answerSets: Answer[][] = []): ProfileAbsorptionAudit[] {
  const predictions = answerSets.map((answers) => {
    const result = obtenerMejorPerfil(answers);
    const openAnswers = obtenerRespuestasAbiertas(answers);
    const careerReferences = openAnswers.flatMap((answer) =>
      answer.careerReference ? [answer.careerReference] : [],
    );
    const hasObservedMismatch = openAnswers.some((answer) => answer.observedMismatch);

    return {
      profileId: result.best.id,
      careerReferences,
      hasObservedMismatch,
    };
  });
  const totalPredictions = Math.max(1, predictions.length);

  return profiles.map((profile) => {
    const profilePredictions = predictions.filter((prediction) => prediction.profileId === profile.id);
    const staticRiskFactors = obtenerRiesgoAbsorcionEstaticaPerfil(profile);
    const mismatchCount = profilePredictions.filter((prediction) => prediction.hasObservedMismatch).length;
    const careerReferences = Array.from(
      new Set(profilePredictions.flatMap((prediction) => prediction.careerReferences)),
    );
    const predictionShare = profilePredictions.length / totalPredictions;
    const staticRisk = staticRiskFactors.length * 12;
    const observedRisk = predictionShare * 55 + mismatchCount * 12 + careerReferences.length * 6;

    const score = limitarPuntaje(staticRisk + observedRisk);
    const interpretation = interpretarAbsorcionPerfil(
      score,
      profile.id,
      staticRiskFactors,
      mismatchCount,
    );

    return {
      score,
      status: interpretation.status,
      reason: interpretation.reason,
      profileId: profile.id,
      predictedCount: profilePredictions.length,
      mismatchCount,
      careerReferences,
      staticRiskFactors,
    };
  }).sort((a, b) => b.score - a.score);
}

export function obtenerAuditoriaConsistenciaSenalesPerfil(
  answers: Answer[],
): ProfileSignalConsistencyAudit {
  const result = obtenerMejorPerfil(answers);
  const averages = obtenerPromedios(answers);
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const topRiasecDimensions = obtenerDimensionesPrincipales(averages)
    .filter((item) => riasecDimensions.includes(item.dimension))
    .slice(0, 3)
    .map((item) => item.dimension);
  const alignedDimensions = topRiasecDimensions.filter((dimension) =>
    result.best.coreRiasec.includes(dimension),
  );
  const issues: AuditIssue[] = [];
  let score = 100;

  if (alignedDimensions.length === 0) {
    score -= 40;
    issues.push({
      code: "main_profile_without_top_signal_alignment",
      severity: "high",
      message: "El perfil principal no comparte dimensiones con las tres señales RIASEC más altas.",
      targetId: result.best.id,
    });
  } else if (alignedDimensions.length < result.best.coreRiasec.length) {
    score -= 18;
    issues.push({
      code: "partial_core_signal_alignment",
      severity: "medium",
      message: "Solo una parte del núcleo RIASEC aparece entre las señales destacadas.",
      targetId: result.best.id,
    });
  }

  if (result.traditionalBest.id !== result.best.id) {
    score -= 20;
    issues.push({
      code: "strict_core_changed_main_profile",
      severity: "medium",
      message: "El perfil final difiere del mejor perfil por score tradicional.",
      targetId: result.best.id,
    });
  }

  if (differentiation.broadInterestPattern) {
    score -= 25;
    issues.push({
      code: "broad_interest_pattern",
      severity: "high",
      message:
        differentiation.broadInterestReason ??
        "Muchas dimensiones RIASEC aparecen altas con poca diferencia entre ellas.",
      targetId: result.best.id,
    });
  }

  const finalScore = limitarPuntaje(score);
  const interpretation = interpretarConsistenciaSenalesPerfil(finalScore, issues);

  return {
    score: finalScore,
    status: interpretation.status,
    reason: interpretation.reason,
    broadInterestPattern: differentiation.broadInterestPattern,
    broadInterestReason: differentiation.broadInterestReason,
    profileId: result.best.id,
    traditionalProfileId: result.traditionalBest.id,
    topRiasecDimensions,
    alignedDimensions,
    issues,
  };
}

export function obtenerAuditoriaEficienciaFlujo(answers: Answer[]): FlowEfficiencyAudit {
  const result = obtenerMejorPerfil(answers);
  const averages = obtenerPromedios(answers);
  const differentiation = calcularPuntajeDiferenciacion(averages);
  const contradictions = detectarContradicciones(averages, answers);
  const closingDecision = obtenerDecisionCierreAdaptativo(
    answers,
    averages,
    result.ranked,
    contradictions,
  );
  const questionCount = answers.length;
  const likertCount = obtenerRespuestasLikert(answers).length;
  const profileClarity = result.indicators.profileClarity;
  const clarityPerQuestion = questionCount ? profileClarity / questionCount : 0;
  const expectedQuestionCount = 20;
  const efficiency = profileClarity * Math.min(1, expectedQuestionCount / Math.max(1, questionCount));
  const issues: AuditIssue[] = [];

  if (questionCount > 30) {
    issues.push({
      code: "excessive_question_count",
      severity: "high",
      message: "La sesion supera 30 preguntas totales.",
    });
  } else if (questionCount > 24 && profileClarity < 65) {
    issues.push({
      code: "long_flow_low_clarity",
      severity: "medium",
      message: "El flujo es largo y aun asi la claridad del perfil es baja o moderada.",
    });
  }

  const score = limitarPuntaje(efficiency);
  const interpretation = interpretarEficienciaFlujo(score, questionCount, profileClarity);

  return {
    score,
    status: interpretation.status,
    reason: interpretation.reason,
    closingReason: closingDecision.closingReason,
    broadInterestPattern: differentiation.broadInterestPattern,
    broadInterestReason: differentiation.broadInterestReason,
    questionCount,
    likertCount,
    profileClarity,
    clarityPerQuestion: Number(clarityPerQuestion.toFixed(2)),
    issues,
  };
}

function promediarPuntajes(values: number[]) {
  if (!values.length) return 100;

  return limitarPuntaje(values.reduce((total, value) => total + value, 0) / values.length);
}

function agregarInterpretacion<T extends { status: string; reason: string }>(
  items: T[],
  fallback: AuditInterpretation,
): AuditInterpretation {
  const critical = items.find((item) => item.status === "critical");
  const warning = items.find((item) => item.status === "warning");

  if (critical) {
    return {
      status: "critical",
      reason: critical.reason,
    };
  }

  if (warning) {
    return {
      status: "warning",
      reason: warning.reason,
    };
  }

  return fallback;
}

export function obtenerReporteAuditoriaInstrumentoInterno(
  answerSets: Answer[][] = [],
): InternalInstrumentAuditReport {
  const questionCoherence = obtenerReporteCoherenciaPreguntas();
  const redundancy = obtenerAuditoriaRedundancia();
  const profileAbsorption = obtenerAuditoriaAbsorcionPerfil(answerSets);
  const profileSignalConsistencySessions = answerSets.map(obtenerAuditoriaConsistenciaSenalesPerfil);
  const flowEfficiencySessions = answerSets.map(obtenerAuditoriaEficienciaFlujo);
  const profileSignalConsistencyScore = promediarPuntajes(
    profileSignalConsistencySessions.map((session) => session.score),
  );
  const profileSignalConsistencyInterpretation = agregarInterpretacion(
    profileSignalConsistencySessions,
    interpretarConsistenciaSenalesPerfil(profileSignalConsistencyScore),
  );
  const flowEfficiencyScore = promediarPuntajes(flowEfficiencySessions.map((session) => session.score));
  const flowEfficiencyInterpretation = agregarInterpretacion(
    flowEfficiencySessions,
    interpretarEficienciaFlujo(flowEfficiencyScore, 0, flowEfficiencyScore),
  );
  const issues = [
    ...questionCoherence.questions.flatMap((question) => question.issues),
    ...profileSignalConsistencySessions.flatMap((session) => session.issues),
    ...flowEfficiencySessions.flatMap((session) => session.issues),
    ...profileAbsorption.flatMap((profile) =>
      profile.score >= 65
        ? [
            {
              code: "profile_absorption_risk",
              severity: "medium" as const,
              message: `El perfil ${profile.profileId} muestra riesgo de absorcion.`,
              targetId: profile.profileId,
            },
          ]
        : [],
    ),
  ];

  return {
    generatedAt: new Date().toISOString(),
    questionCoherence,
    redundancy,
    profileAbsorption,
    profileSignalConsistency: {
      score: profileSignalConsistencyScore,
      status: profileSignalConsistencyInterpretation.status,
      reason: profileSignalConsistencyInterpretation.reason,
      sessions: profileSignalConsistencySessions,
    },
    flowEfficiency: {
      score: flowEfficiencyScore,
      status: flowEfficiencyInterpretation.status,
      reason: flowEfficiencyInterpretation.reason,
      sessions: flowEfficiencySessions,
    },
    issues,
  };
}

