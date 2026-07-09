import assert from "node:assert/strict";
import test from "node:test";

import {
  obtenerMejorPerfil,
  obtenerPatronVocacionalDominante,
  obtenerPromedios,
  obtenerSenales,
} from "../lib/vocational/engine";
import { construirArquitecturaResultadoPorCapas } from "../lib/vocational/occupationalCatalog";
import type { Answer, Dimension, LikertAnswer, OpenAnswer } from "../lib/vocational/types";

const dimensionQuestionIds: Record<Dimension, number> = {
  realista: 1,
  investigativo: 2,
  artistico: 3,
  social: 4,
  emprendedor: 5,
  convencional: 6,
  apertura: 13,
  responsabilidad: 15,
  extraversion: 17,
  amabilidad: 19,
  neuroticismo: 21,
  incertidumbre: 23,
  presion: 24,
  tolerancia: 26,
};

const defaultScores: Record<Dimension, number> = {
  realista: 2,
  investigativo: 2,
  artistico: 2,
  social: 2,
  emprendedor: 2,
  convencional: 2,
  apertura: 3,
  responsabilidad: 3,
  extraversion: 3,
  amabilidad: 3,
  neuroticismo: 2,
  incertidumbre: 2,
  presion: 1,
  tolerancia: 3,
};

function likertAnswer(
  dimension: Dimension,
  value: number,
  order: number,
): LikertAnswer {
  return {
    kind: "likert",
    questionId: dimensionQuestionIds[dimension],
    dimension,
    value,
    order,
  };
}

function openAnswer(
  questionId: number,
  text: string,
  order: number,
  trigger: OpenAnswer["trigger"] = "contrast",
): OpenAnswer {
  return {
    kind: "open",
    questionId,
    trigger,
    text,
    order,
  };
}

function guidedAnswer(
  questionId: number,
  selectedOptionId: string,
  selectedOptionText: string,
  order: number,
  trigger: OpenAnswer["trigger"] = "contrast",
): OpenAnswer {
  return {
    kind: "open",
    questionId,
    trigger,
    text: selectedOptionText,
    order,
    answerMode: "guided-option",
    selectedOptionId,
    selectedOptionText,
  };
}

function answersFromScores(
  overrides: Partial<Record<Dimension, number>>,
  openTexts: Array<{ questionId: number; text: string; trigger?: OpenAnswer["trigger"] }> = [],
) {
  const scores = { ...defaultScores, ...overrides };
  const dimensions = Object.keys(dimensionQuestionIds) as Dimension[];
  const likertAnswers = dimensions.map((dimension, index) =>
    likertAnswer(dimension, scores[dimension], index + 1),
  );

  return [
    ...likertAnswers,
    ...openTexts.map((answer, index) =>
      openAnswer(
        answer.questionId,
        answer.text,
        likertAnswers.length + index + 1,
        answer.trigger,
      ),
    ),
  ] satisfies Answer[];
}

function broadExploratoryAnswers(tieBreakerText: string): Answer[] {
  return answersFromScores(
    {
      realista: 4,
      investigativo: 4,
      artistico: 4,
      social: 4,
      emprendedor: 4,
      convencional: 4,
      apertura: 4,
      responsabilidad: 3,
      extraversion: 4,
      amabilidad: 4,
      incertidumbre: 4,
      tolerancia: 3,
    },
    [{ questionId: 309, text: tieBreakerText }],
  );
}

function resultFor(answers: Answer[]) {
  const result = obtenerMejorPerfil(answers);
  const routes = construirArquitecturaResultadoPorCapas(
    answers,
    result.ranked,
  ).concreteSubroutes;

  return { result, routes };
}

function routeIds(answers: Answer[]) {
  return resultFor(answers).routes.map((route) => route.id);
}

function routeNamesAndScores(answers: Answer[]) {
  return resultFor(answers).routes.map((route) => ({
    id: route.id,
    name: route.name,
    relevance: route.relevance,
  }));
}

function assertAnyTopRoute(
  routes: string[],
  expectedIds: string[],
  message: string,
) {
  assert(
    routes.some((id) => expectedIds.includes(id)),
    `${message}. Top routes: ${routes.join(", ")}`,
  );
}

function assertNoTopRoute(
  routes: string[],
  forbiddenIds: string[],
  message: string,
) {
  const forbiddenFound = routes.filter((id) => forbiddenIds.includes(id));

  assert.equal(
    forbiddenFound.length,
    0,
    `${message}. Forbidden routes found: ${forbiddenFound.join(", ")}. Top routes: ${routes.join(", ")}`,
  );
}

function assertTop3Compatible(
  routes: string[],
  allowedIds: string[],
  scenario: string,
) {
  const incompatible = routes.slice(0, 3).filter((id) => !allowedIds.includes(id));

  assert.equal(
    incompatible.length,
    0,
    `${scenario}: incompatible top 3 routes: ${incompatible.join(", ")}. Top routes: ${routes.join(", ")}`,
  );
}

test("309 graphic tie-breaker dominates and keeps architecture out without spatial signal", () => {
  const answers = broadExploratoryAnswers(
    "Crear piezas visuales, marcas o contenido grafico.",
  );
  const routes = routeNamesAndScores(answers);

  assert.equal(routes[0]?.id, "graphic-design");
  assert.deepEqual(
    routes.map((route) => route.id),
    [
      "graphic-design",
      "communication-audiovisual",
      "journalism-public-communication",
    ],
  );
  assert(routes[0].relevance > routes[1].relevance);
  assert(routes[1].relevance > routes[2].relevance);
});

test("309 health tie-breaker prioritizes prevention and keeps laboratory out without direct lab signal", () => {
  const answers = broadExploratoryAnswers("Explorar salud, bienestar o prevencion.");
  const routes = routeIds(answers);

  assert.equal(routes[0], "salud-bienestar-prevencion");
  assertNoTopRoute(
    routes,
    ["laboratory-science", "biotechnology-health-sciences", "architecture-spatial-design"],
    "Health tie-breaker should not rank lab, biotechnology, or architecture without direct signal",
  );
});

test("309 education tie-breaker prioritizes education and keeps legal routes out without legal signal", () => {
  const answers = broadExploratoryAnswers(
    "Ensenar, orientar o facilitar el aprendizaje de otras personas.",
  );
  const routes = routeIds(answers);

  assert.equal(routes[0], "educacion-orientacion-formacion");
  assertNoTopRoute(
    routes,
    ["derecho-ciencias-juridicas", "mediacion-resolucion-conflictos"],
    "Education tie-breaker should not rank legal or mediation routes without legal signal",
  );
});

test("health profile prioritizes health, nutrition, or psychology and avoids unrelated routes", () => {
  const answers = answersFromScores(
    {
      social: 5,
      investigativo: 4,
      realista: 2,
      artistico: 1,
      emprendedor: 2,
      convencional: 3,
      amabilidad: 5,
      responsabilidad: 4,
      apertura: 3,
    },
    [
      { questionId: 307, text: "Atender directamente a personas en temas de salud o bienestar." },
      { questionId: 317, text: "Promover salud, alimentacion, habitos o bienestar en personas." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "salud-bienestar-prevencion",
    "nutrition-health-wellbeing",
    "psychology-human-support",
    "health-care",
  ];
  const forbidden = [
    "graphic-design",
    "communication-audiovisual",
    "journalism-public-communication",
    "administrative-finance",
    "systems-software",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Health profile should prioritize health-related routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Health profile should avoid unrelated routes");
  assertTop3Compatible(routes, [...expected, "psychopedagogy-orientation"], "health profile");
});

test("design and communication profile prioritizes graphic design, audiovisual communication, or journalism", () => {
  const answers = answersFromScores(
    {
      artistico: 5,
      social: 4,
      apertura: 5,
      extraversion: 4,
      investigativo: 2,
      realista: 1,
      convencional: 2,
    },
    [
      { questionId: 203, text: "Disenar piezas visuales, marcas o contenido grafico." },
      { questionId: 316, text: "Crear videos, campanas, historias o contenidos para audiencias." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "graphic-design",
    "communication-audiovisual",
    "journalism-public-communication",
    "literature-writing-cultural-studies",
  ];
  const forbidden = [
    "nutrition-health-wellbeing",
    "environmental-engineering",
    "administrative-finance",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Design profile should prioritize design/communication routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Design profile should avoid health, environmental, and finance routes");
  assertTop3Compatible(routes, expected, "design/communication profile");
});

test("engineering and systems profile prioritizes technical systems, data, or applied technology", () => {
  const answers = answersFromScores(
    {
      realista: 5,
      investigativo: 5,
      convencional: 3,
      responsabilidad: 4,
      apertura: 4,
      social: 1,
      artistico: 1,
      emprendedor: 2,
    },
    [
      { questionId: 302, text: "Construir o programar sistemas que automaticen tareas o resuelvan necesidades." },
      { questionId: 315, text: "Programar aplicaciones, sistemas digitales o automatizaciones con logica computacional." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "systems-software",
    "science-data-analysis",
    "mechatronics-applied-technology",
    "industrial-processes",
  ];
  const forbidden = [
    "psychology-human-support",
    "education-teaching",
    "educacion-orientacion-formacion",
    "graphic-design",
    "nutrition-health-wellbeing",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Engineering profile should prioritize technical routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Engineering profile should avoid social, design, and health routes");
  assertTop3Compatible(routes, expected, "engineering/systems profile");
});

test("education and social profile prioritizes education, orientation, psychology, or social management", () => {
  const answers = answersFromScores(
    {
      social: 5,
      amabilidad: 5,
      extraversion: 4,
      apertura: 4,
      investigativo: 3,
      artistico: 2,
      convencional: 2,
      emprendedor: 2,
      realista: 1,
    },
    [
      { questionId: 304, text: "Ensenar, explicar temas y acompanar procesos de aprendizaje." },
      { questionId: 312, text: "Ensenar, explicar y acompanar procesos de aprendizaje." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "educacion-orientacion-formacion",
    "education-teaching",
    "psychopedagogy-orientation",
    "psychology-human-support",
    "social-work-community-development",
    "gestion-proyectos-educativos-sociales",
  ];
  const forbidden = [
    "science-data-analysis",
    "administrative-finance",
    "graphic-design",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Education profile should prioritize education/social routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Education profile should avoid data, finance, and graphic design routes");
  assertTop3Compatible(routes, expected, "education/social profile");
});

test("environmental profile prioritizes natural resources, territory, environmental management, or environmental engineering", () => {
  const answers = answersFromScores(
    {
      realista: 4,
      investigativo: 5,
      social: 4,
      apertura: 4,
      amabilidad: 4,
      responsabilidad: 4,
      artistico: 1,
      convencional: 2,
      emprendedor: 3,
    },
    [
      { questionId: 201, text: "Trabajar con plantas, animales, alimentos o recursos naturales." },
      { questionId: 319, text: "Coordinar proyectos, normas o acciones con personas para generar impacto ambiental." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "natural-resources-territory",
    "environmental-management",
    "environmental-engineering",
  ];
  const forbidden = [
    "journalism-public-communication",
    "graphic-design",
    "administrative-finance",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Environmental profile should prioritize environmental routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Environmental profile should avoid journalism, design, and finance routes");
  assertTop3Compatible(routes, expected, "environmental profile");
});

test("business and management profile prioritizes administration, finance, project management, or processes", () => {
  const answers = answersFromScores(
    {
      emprendedor: 5,
      convencional: 5,
      responsabilidad: 5,
      extraversion: 4,
      investigativo: 3,
      social: 2,
      artistico: 1,
      realista: 2,
    },
    [
      { questionId: 318, text: "Impulsar proyectos, vender propuestas, negociar o liderar equipos hacia una meta." },
      { questionId: 206, text: "Controlar calidad, tiempos, recursos o procesos." },
    ],
  );
  const routes = routeIds(answers);
  const expected = [
    "business-project-management",
    "administrative-finance",
    "industrial-processes",
  ];
  const forbidden = [
    "nutrition-health-wellbeing",
    "psychology-human-support",
    "graphic-design",
    "education-teaching",
    "educacion-orientacion-formacion",
  ];

  assertAnyTopRoute(routes.slice(0, 3), expected, "Business profile should prioritize business/admin/process routes");
  assertNoTopRoute(routes.slice(0, 3), forbidden, "Business profile should avoid health, design, and education routes");
  assertTop3Compatible(routes, expected, "business/management profile");
});

test("project tie-breaker uses visual or process evidence instead of public policy by default", () => {
  const answers = answersFromScores(
    {
      realista: 5,
      artistico: 5,
      emprendedor: 5,
      convencional: 4,
      investigativo: 4,
      social: 4,
      apertura: 4,
      responsabilidad: 4,
      extraversion: 4,
      amabilidad: 4,
    },
    [
      { questionId: 309, text: "Organizar actividades, coordinar personas o liderar proyectos." },
      { questionId: 316, text: "Crear propuestas visuales, expresivas o comunicativas." },
    ],
  );
  const routes = routeIds(answers);
  const coherentAlternatives = [
    "graphic-design",
    "communication-audiovisual",
    "industrial-processes",
    "science-data-analysis",
    "mechatronics-applied-technology",
  ];

  assert.equal(routes[0], "business-project-management");
  assert.equal(
    routes.slice(0, 3).includes("international-relations-public-policy"),
    false,
    `Project tie-breaker should not include public policy without direct signal. Top routes: ${routes.join(", ")}`,
  );
  assertAnyTopRoute(
    routes.slice(1, 3),
    coherentAlternatives,
    "Project tie-breaker should include visual/communication or technical/process route",
  );
});

test("ambiguous high-interest and high-uncertainty case remains exploratory instead of high-confidence closed result", () => {
  const answers = answersFromScores({
    realista: 4,
    investigativo: 4,
    artistico: 4,
    social: 4,
    emprendedor: 4,
    convencional: 4,
    apertura: 4,
    responsabilidad: 3,
    extraversion: 4,
    amabilidad: 4,
    incertidumbre: 5,
    presion: 2,
    neuroticismo: 4,
    tolerancia: 3,
  });
  const { result } = resultFor(answers);

  assert(
    result.confidence <= 55,
    `Ambiguous profile should not close with high confidence. Confidence: ${result.confidence}`,
  );
  assert(
    result.indicators.vocationalUncertainty >= 80,
    `Ambiguous profile should show high uncertainty. Uncertainty: ${result.indicators.vocationalUncertainty}`,
  );
});

test("high external pressure lowers confidence and emits external-pressure warning", () => {
  const lowPressureAnswers = answersFromScores({
    realista: 5,
    investigativo: 5,
    responsabilidad: 4,
    apertura: 4,
    presion: 1,
    incertidumbre: 2,
  });
  const highPressureAnswers = answersFromScores({
    realista: 5,
    investigativo: 5,
    responsabilidad: 4,
    apertura: 4,
    presion: 5,
    incertidumbre: 2,
  });
  const lowPressure = obtenerMejorPerfil(lowPressureAnswers);
  const highPressure = obtenerMejorPerfil(highPressureAnswers);
  const signals = obtenerSenales(highPressureAnswers).join(" ");

  assert(
    highPressure.confidence < lowPressure.confidence,
    `High pressure should lower confidence. Low: ${lowPressure.confidence}, high: ${highPressure.confidence}`,
  );
  assert(
    highPressure.indicators.externalPressure >= 80,
    `High pressure indicator should be high. External pressure: ${highPressure.indicators.externalPressure}`,
  );
  assert.match(
    signals,
    /influencia externa|presion externa|presión externa/i,
    `High pressure should emit warning. Signals: ${signals}`,
  );
});

test("combined pattern detects management only when initiative is paired with organization and responsibility", () => {
  const singleDimensionAnswers = answersFromScores({
    emprendedor: 5,
    convencional: 2,
    responsabilidad: 2,
    extraversion: 2,
  });
  const combinedAnswers = answersFromScores({
    emprendedor: 5,
    convencional: 4,
    responsabilidad: 4,
    extraversion: 3,
  });

  const weakPattern = obtenerPatronVocacionalDominante(
    obtenerPromedios(singleDimensionAnswers),
  );
  const strongPattern = obtenerPatronVocacionalDominante(
    obtenerPromedios(combinedAnswers),
  );

  assert.notEqual(
    weakPattern?.id,
    "management-processes",
    "Entrepreneurial score alone should not be interpreted as project management pattern",
  );
  assert.equal(strongPattern?.id, "management-processes");
});

test("social management pattern keeps people-oriented nuance instead of replacing it with finance", () => {
  const answers = answersFromScores({
    social: 5,
    emprendedor: 4,
    extraversion: 5,
    amabilidad: 4,
    convencional: 2,
    responsabilidad: 3,
  });
  const pattern = obtenerPatronVocacionalDominante(obtenerPromedios(answers));

  assert.equal(pattern?.id, "social-leadership-education");
  assert.equal(pattern?.socialManagementNuance, true);
});

test("programming evidence and guided data choice outrank architecture without spatial evidence", () => {
  const baseAnswers = answersFromScores(
    {
      realista: 5,
      investigativo: 5,
      artistico: 5,
      convencional: 4,
      apertura: 5,
      responsabilidad: 4,
    },
    [
      { questionId: 401, text: "Quiero programar software y construir sistemas con codigo." },
      { questionId: 402, text: "Programar apps y automatizaciones me interesa bastante." },
    ],
  );
  const answers = [
    ...baseAnswers,
    guidedAnswer(
      302,
      "data-science",
      "Analizar datos, encontrar patrones y convertir información en conclusiones.",
      baseAnswers.length + 1,
    ),
  ];
  const routes = routeIds(answers);
  const architectureIndex = routes.indexOf("architecture-spatial-design");
  const technicalWinnerIndex = Math.min(
    ...["systems-software", "science-data-analysis"]
      .map((id) => routes.indexOf(id))
      .filter((index) => index >= 0),
  );

  assert(
    technicalWinnerIndex >= 0 && (architectureIndex === -1 || technicalWinnerIndex < architectureIndex),
    `Software or data should outrank architecture without spatial evidence. Top routes: ${routes.join(", ")}`,
  );
});

test("architecture cannot win without explicit spatial evidence", () => {
  const answers = answersFromScores(
    {
      realista: 5,
      investigativo: 5,
      artistico: 5,
      apertura: 5,
      responsabilidad: 4,
    },
    [
      { questionId: 203, text: "Crear piezas visuales, marcas o contenido grafico." },
      { questionId: 315, text: "Programar aplicaciones, sistemas digitales o automatizaciones con logica computacional." },
    ],
  );
  const routes = routeIds(answers);

  assert.notEqual(
    routes[0],
    "architecture-spatial-design",
    `Architecture should not win without spatial evidence. Top routes: ${routes.join(", ")}`,
  );
});

test("finance does not appear in top 3 only because conventional is high without financial evidence", () => {
  const answers = answersFromScores(
    {
      convencional: 5,
      emprendedor: 4,
      responsabilidad: 5,
      realista: 2,
      investigativo: 2,
      artistico: 2,
      social: 2,
    },
    [{ questionId: 206, text: "Registrar, clasificar o archivar informacion." }],
  );
  const routes = routeIds(answers);

  assertNoTopRoute(
    routes.slice(0, 3),
    ["administrative-finance"],
    "Finance should not rank top 3 without accounts, payments, costs, budgets, or financial records",
  );
});

test("industrial does not appear in top 3 only because realistic and conventional are high without operational evidence", () => {
  const answers = answersFromScores(
    {
      realista: 5,
      convencional: 5,
      responsabilidad: 4,
      investigativo: 2,
      artistico: 2,
      emprendedor: 2,
      social: 2,
    },
    [{ questionId: 201, text: "Usar instrumentos, maquinas o herramientas tecnicas." }],
  );
  const routes = routeIds(answers);

  assertNoTopRoute(
    routes.slice(0, 3),
    ["industrial-processes"],
    "Industrial should not rank top 3 without process, quality, production, time, or operations evidence",
  );
});
