import { writeFileSync } from "node:fs";

const outputPath = "data-general.csv";

const columns = [
  "session_id",
  "anonymous_participant_id",
  "created_at",
  "finished_at",
  "session_status",
  "is_pilot_data",
  "grade",
  "school_code",
  "age_range",
  "total_questions",
  "final_profile_code",
  "final_profile_name",
  "predicted_profile_code",
  "predicted_profile_name",
  "confidence_score",
  "model_used",
  "recommendation_text",
  "riasec_realista",
  "riasec_investigativo",
  "riasec_artistico",
  "riasec_social",
  "riasec_emprendedor",
  "riasec_convencional",
  "big_five_apertura",
  "big_five_responsabilidad",
  "big_five_extraversion",
  "big_five_amabilidad",
  "big_five_neuroticismo",
  "incertidumbre_vocacional",
  "presion_externa",
  "tolerancia_dificultad",
  "likert_answer_count",
  "open_answer_count",
  "likert_answers_json",
  "open_answers_text",
  "open_answers_json",
];

const dimensions = [
  ["realista", "riasec_realista"],
  ["investigativo", "riasec_investigativo"],
  ["artistico", "riasec_artistico"],
  ["social", "riasec_social"],
  ["emprendedor", "riasec_emprendedor"],
  ["convencional", "riasec_convencional"],
  ["apertura", "big_five_apertura"],
  ["responsabilidad", "big_five_responsabilidad"],
  ["extraversion", "big_five_extraversion"],
  ["amabilidad", "big_five_amabilidad"],
  ["neuroticismo", "big_five_neuroticismo"],
  ["incertidumbre", "incertidumbre_vocacional"],
  ["presion", "presion_externa"],
  ["tolerancia", "tolerancia_dificultad"],
];

const profiles = [
  {
    code: "ingenieria-tecnologia",
    name: "Ingenieria, Tecnologia y Sistemas",
    recommendation:
      "Perfil asociado a resolver problemas tecnicos, construir soluciones, analizar sistemas y aprender mediante experimentacion practica.",
    scores: {
      riasec_realista: 4.3,
      riasec_investigativo: 4.5,
      riasec_artistico: 2.7,
      riasec_social: 2.8,
      riasec_emprendedor: 3.3,
      riasec_convencional: 4.1,
      big_five_apertura: 4.2,
      big_five_responsabilidad: 4.1,
      big_five_extraversion: 3.0,
      big_five_amabilidad: 3.2,
      big_five_neuroticismo: 2.8,
      incertidumbre_vocacional: 2.5,
      presion_externa: 2.4,
      tolerancia_dificultad: 4.1,
    },
    comments: [
      "Me gusta programar y arreglar cosas",
      "Quiero algo con computadoras",
      "Me llama la atencion ciberseguridad",
      "Programar, aunque aveces me trabo",
      "No me gusta exponer mucho, prefiero resolver",
      "Me gustaria crear apps",
    ],
  },
  {
    code: "ciencia-datos-investigacion",
    name: "Ciencia, Datos e Investigacion",
    recommendation:
      "Perfil orientado a formular preguntas, analizar evidencia, interpretar patrones y construir conocimiento verificable.",
    scores: {
      riasec_realista: 3.4,
      riasec_investigativo: 4.7,
      riasec_artistico: 3.0,
      riasec_social: 2.9,
      riasec_emprendedor: 2.7,
      riasec_convencional: 4.3,
      big_five_apertura: 4.5,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 2.8,
      big_five_amabilidad: 3.3,
      big_five_neuroticismo: 2.9,
      incertidumbre_vocacional: 2.8,
      presion_externa: 2.0,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me interesa analizar datos",
      "Quiero investigar y comprobar resultados",
      "Me gustan los patrones y graficos",
      "Analizar muestras o informacion",
      "Me gusta preguntar por que pasan las cosas",
      "No se si datos o laboratorio",
    ],
  },
  {
    code: "salud-apoyo-humano",
    name: "Salud, Psicologia y Apoyo Humano",
    recommendation:
      "Perfil vinculado al cuidado, bienestar, prevencion, escucha y acompanamiento de personas.",
    scores: {
      riasec_realista: 3.1,
      riasec_investigativo: 4.0,
      riasec_artistico: 3.2,
      riasec_social: 4.7,
      riasec_emprendedor: 3.0,
      riasec_convencional: 3.2,
      big_five_apertura: 4.0,
      big_five_responsabilidad: 4.2,
      big_five_extraversion: 3.5,
      big_five_amabilidad: 4.6,
      big_five_neuroticismo: 3.3,
      incertidumbre_vocacional: 3.0,
      presion_externa: 2.7,
      tolerancia_dificultad: 4.2,
    },
    comments: [
      "Me gusta ayudar a personas",
      "Quisiera algo de salud o psicologia",
      "Me interesa entender emociones",
      "Cuidar a otros se me hace importante",
      "Me gustaria orientar sobre bienestar",
      "No se si enfermeria o psicologia",
    ],
  },
  {
    code: "educacion-ciencias-sociales",
    name: "Educacion y Ciencias Sociales",
    recommendation:
      "Perfil enfocado en aprendizaje, orientacion, comunicacion, trabajo comunitario y desarrollo de personas o grupos.",
    scores: {
      riasec_realista: 2.8,
      riasec_investigativo: 3.5,
      riasec_artistico: 3.9,
      riasec_social: 4.7,
      riasec_emprendedor: 3.6,
      riasec_convencional: 3.1,
      big_five_apertura: 4.2,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 4.0,
      big_five_amabilidad: 4.5,
      big_five_neuroticismo: 3.1,
      incertidumbre_vocacional: 3.2,
      presion_externa: 2.6,
      tolerancia_dificultad: 3.8,
    },
    comments: [
      "Me gusta explicar temas",
      "Quiero trabajar con jovenes",
      "Enseñar se me hace natural",
      "Me interesa ayudar en problemas sociales",
      "Podria ser educacion pero no estoy segura",
      "Me gusta hablar y orientar",
    ],
  },
  {
    code: "arte-comunicacion-diseno",
    name: "Arte, Comunicacion y Diseno",
    recommendation:
      "Perfil relacionado con creatividad, comunicacion visual, expresion, contenido y solucion de problemas desde el diseno.",
    scores: {
      riasec_realista: 2.7,
      riasec_investigativo: 3.0,
      riasec_artistico: 4.8,
      riasec_social: 3.8,
      riasec_emprendedor: 3.5,
      riasec_convencional: 2.6,
      big_five_apertura: 4.8,
      big_five_responsabilidad: 3.5,
      big_five_extraversion: 3.8,
      big_five_amabilidad: 3.8,
      big_five_neuroticismo: 3.0,
      incertidumbre_vocacional: 3.1,
      presion_externa: 2.5,
      tolerancia_dificultad: 3.7,
    },
    comments: [
      "Me gusta disenar y crear contenido",
      "Quiero algo con publicidad",
      "Dibujo, edicion y redes me llaman",
      "Me gusta hacer cosas visuales",
      "No soy tan buena en numeros",
      "Me gustaria comunicacion audiovisual",
    ],
  },
  {
    code: "negocios-gestion",
    name: "Negocios, Gestion y Emprendimiento",
    recommendation:
      "Perfil asociado a organizar recursos, liderar iniciativas, tomar decisiones y desarrollar proyectos con impacto.",
    scores: {
      riasec_realista: 3.0,
      riasec_investigativo: 3.2,
      riasec_artistico: 3.1,
      riasec_social: 3.8,
      riasec_emprendedor: 4.8,
      riasec_convencional: 4.2,
      big_five_apertura: 3.8,
      big_five_responsabilidad: 4.3,
      big_five_extraversion: 4.2,
      big_five_amabilidad: 3.7,
      big_five_neuroticismo: 2.7,
      incertidumbre_vocacional: 2.6,
      presion_externa: 2.4,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me gustaria tener un negocio",
      "Me gusta organizar equipos",
      "Quiero aprender marketing y ventas",
      "Dirigir proyectos me parece interesante",
      "Prefiero algo con oportunidades laborales",
      "Me gusta liderar, aunque aveces me da nervios",
    ],
  },
  {
    code: "administracion-finanzas",
    name: "Administracion, Finanzas y Gestion Operativa",
    recommendation:
      "Perfil orientado a procesos, orden, gestion financiera, analisis operativo y mejora de organizaciones.",
    scores: {
      riasec_realista: 3.1,
      riasec_investigativo: 3.7,
      riasec_artistico: 2.3,
      riasec_social: 3.0,
      riasec_emprendedor: 4.0,
      riasec_convencional: 4.8,
      big_five_apertura: 3.5,
      big_five_responsabilidad: 4.6,
      big_five_extraversion: 3.4,
      big_five_amabilidad: 3.5,
      big_five_neuroticismo: 2.8,
      incertidumbre_vocacional: 2.5,
      presion_externa: 2.2,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me gusta ordenar informacion",
      "Finanzas me parece util",
      "Me interesan los procesos y planillas",
      "Quiero algo estable",
      "Me gusta administrar gastos",
      "No me molesta trabajar con numeros",
    ],
  },
  {
    code: "ambiente-recursos-naturales",
    name: "Ambiente y Recursos Naturales",
    recommendation:
      "Perfil conectado con territorio, sostenibilidad, recursos naturales, gestion ambiental y solucion de problemas del entorno.",
    scores: {
      riasec_realista: 4.1,
      riasec_investigativo: 4.2,
      riasec_artistico: 3.2,
      riasec_social: 3.7,
      riasec_emprendedor: 3.0,
      riasec_convencional: 3.1,
      big_five_apertura: 4.3,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 3.2,
      big_five_amabilidad: 4.0,
      big_five_neuroticismo: 2.9,
      incertidumbre_vocacional: 3.0,
      presion_externa: 2.3,
      tolerancia_dificultad: 4.1,
    },
    comments: [
      "Me interesa cuidar el ambiente",
      "Quiero trabajar con naturaleza",
      "Me gusta salir a campo",
      "Recursos naturales suena interesante",
      "Me preocupa la contaminacion",
      "No se si ambiental o biologia",
    ],
  },
];

const uncertaintyComments = [
  "No lo tengo claro todavia",
  "Estoy entre varias opciones",
  "Me preocupa elegir mal",
  "A veces cambio de idea rapido",
  "No se bien que carrera escoger",
  "tengo dudas por el trabajo despues",
];

const pressureComments = [
  "Mi familia quiere otra carrera",
  "Siento algo de presion en casa",
  "Me dicen que elija algo rentable",
  "No siento presion de otras personas",
  "Mis papas opinan mucho",
  "Me preocupa decepcionar a mi familia",
];

const priorityComments = [
  "Elegiria lo que tenga mas trabajo",
  "Prefiero algo que me guste de verdad",
  "Quiero ayudar a otras personas",
  "Busco estabilidad economica",
  "Depende de las oportunidades",
  "Me importa crecer profesionalmente",
];

let seed = 20260601;

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function pick(items) {
  return items[Math.floor(random() * items.length)];
}

function maybe(value, probability = 0.75) {
  return random() < probability ? value : "";
}

function clamp(value, min = 1, max = 5) {
  return Math.min(max, Math.max(min, value));
}

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

function score(base, spread = 0.8) {
  return String(roundHalf(clamp(base + (random() - 0.5) * spread)));
}

function uuid(index) {
  const hex = (number, size) => number.toString(16).padStart(size, "0").slice(-size);
  return `${hex(0x6a000000 + index, 8)}-${hex(0x1000 + index, 4)}-4${hex(0x200 + index, 3)}-8${hex(0x300 + index, 3)}-${hex(0x700000000000 + index * 7919, 12)}`;
}

function isoInJune(index, minutesOffset = 0) {
  const day = 1 + (index % 15);
  const hour = 7 + ((index * 3) % 11);
  const minute = (index * 11) % 60;
  const second = (index * 7) % 60;
  const timestamp = Date.UTC(
    2026,
    5,
    day,
    hour,
    minute,
    second,
    100 + ((index * 37) % 899),
  );

  return new Date(timestamp + minutesOffset * 60_000).toISOString();
}

function localAnswerTime(index, order) {
  const day = 1 + (index % 15);
  const hour = 2 + ((index * 3) % 11);
  const minute = (index * 11 + order) % 60;
  const second = (index * 7 + order * 3) % 60;
  return `2026-06-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}.${String(100 + ((index * 17 + order) % 899)).padStart(3, "0")}`;
}

function buildLikertAnswers(rowScores, index, count) {
  return Array.from({ length: count }, (_, itemIndex) => {
    const [dimension, column] = dimensions[itemIndex % dimensions.length];

    return {
    value: Number(rowScores[column] || score(3)),
    dimension,
    answered_at: localAnswerTime(index, itemIndex + 1),
    question_id: itemIndex + 1,
    question_order: itemIndex + 1,
    };
  });
}

function buildOpenAnswers(profile, index, count) {
  if (count <= 0) return [];

  const base = [
    ["contrast", pick(profile.comments), 201],
    ["contrast", pick(profile.comments), 202],
    ["prioritization", pick(priorityComments), 105],
    ["uncertainty", pick(uncertaintyComments), 101],
    ["pressure", pick(pressureComments), 102],
    ["motivation", pick(profile.comments), 104],
    ["contrast", pick(profile.comments), 203],
    ["contrast", random() < 0.35 ? "No lo tengo claro todavia" : pick(profile.comments), 204],
  ];

  return base.slice(0, count).map(([trigger, answerText, questionId], itemIndex) => ({
    trigger,
    answer_text: answerText,
    answered_at: localAnswerTime(index, 18 + itemIndex),
    question_id: questionId,
    answer_order: 18 + itemIndex,
  }));
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function rowToCsv(row) {
  return columns.map((column) => csvValue(row[column])).join(",");
}

const rows = [];

for (let index = 1; index <= 130; index += 1) {
  const completed = index <= 100;
  const profile = profiles[(index - 1) % profiles.length];
  const predicted = random() < 0.88 ? profile : pick(profiles);
  const rowScores = {};

  for (const [, column] of dimensions) {
    rowScores[column] = completed || random() < 0.82 ? score(profile.scores[column], completed ? 0.9 : 1.2) : "";
  }

  const likertCount = completed ? 22 + Math.floor(random() * 9) : 7 + Math.floor(random() * 15);
  const openCount = completed
    ? Math.floor(random() * 9)
    : Math.floor(random() * 6);
  const openAnswers = buildOpenAnswers(profile, index, openCount);
  const likertAnswers = buildLikertAnswers(rowScores, index, likertCount);

  rows.push({
    session_id: uuid(index),
    anonymous_participant_id: `P${String(index).padStart(3, "0")}`,
    created_at: isoInJune(index),
    finished_at: completed ? isoInJune(index, 18 + Math.floor(random() * 35)) : "",
    session_status: completed ? "COMPLETED" : "IN_PROGRESS",
    is_pilot_data: "true",
    grade: maybe(pick(["4to", "5to", "egresado", ""]), 0.62),
    school_code: maybe(pick(["SCH-01", "SCH-02", "SCH-03", ""]), 0.48),
    age_range: maybe(pick(["14-16", "16-18", "18-20", ""]), 0.54),
    total_questions: String(completed ? likertCount + openCount : likertCount + openCount),
    final_profile_code: completed ? profile.code : "",
    final_profile_name: completed ? profile.name : "",
    predicted_profile_code: completed ? predicted.code : "",
    predicted_profile_name: completed ? predicted.name : "",
    confidence_score: completed ? String(Math.round(42 + random() * 44)) : "",
    model_used: completed ? "rules-riasec-big-five-v1" : "",
    recommendation_text: completed ? profile.recommendation : "",
    ...rowScores,
    likert_answer_count: String(likertCount),
    open_answer_count: String(openCount),
    likert_answers_json: JSON.stringify(likertAnswers),
    open_answers_text: openAnswers.map((answer) => answer.answer_text).join(" | "),
    open_answers_json: JSON.stringify(openAnswers),
  });
}

rows.sort((left, right) => {
  const leftParticipantNumber = Number(left.anonymous_participant_id.replace("P", ""));
  const rightParticipantNumber = Number(right.anonymous_participant_id.replace("P", ""));

  return rightParticipantNumber - leftParticipantNumber;
});

const csv = [columns.join(","), ...rows.map(rowToCsv)].join("\n") + "\n";
writeFileSync(outputPath, csv, "utf8");

console.log(`Archivo generado: ${outputPath}`);
console.log("Registros: 130");
console.log("Completos: 100");
console.log("Incompletos: 30");
