import { writeFileSync } from "node:fs";

const outputPath = "fio.csv";

const columns = [
  "session_id",
  "anonymous_participant_id",
  "created_at",
  "finished_at",
  "session_status",
  "total_questions",
  "final_profile_code",
  "final_profile_name",
  "predicted_profile_code",
  "predicted_profile_name",
  "confidence_score",
  "model_used",
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
  "compatible_route_codes",
  "compatible_route_names",
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
    scores: {
      riasec_realista: 4.1,
      riasec_investigativo: 4.5,
      riasec_artistico: 2.6,
      riasec_social: 2.8,
      riasec_emprendedor: 3.4,
      riasec_convencional: 4.0,
      big_five_apertura: 4.1,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 3.0,
      big_five_amabilidad: 3.2,
      big_five_neuroticismo: 2.8,
      incertidumbre_vocacional: 2.8,
      presion_externa: 2.4,
      tolerancia_dificultad: 4.2,
    },
    comments: [
      "Me gusta programar aunque a veces me trabo",
      "Me llama la atencion sistemas y soporte tecnico",
      "Quiero crear una app o algo con computadoras",
      "Me gusta arreglar cosas y probar soluciones",
      "No se si elegir software o redes",
    ],
  },
  {
    code: "ciencia-datos-investigacion",
    name: "Ciencia, Datos e Investigacion",
    scores: {
      riasec_realista: 3.3,
      riasec_investigativo: 4.7,
      riasec_artistico: 3.0,
      riasec_social: 2.9,
      riasec_emprendedor: 2.9,
      riasec_convencional: 4.2,
      big_five_apertura: 4.4,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 2.8,
      big_five_amabilidad: 3.3,
      big_five_neuroticismo: 3.0,
      incertidumbre_vocacional: 3.0,
      presion_externa: 2.2,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me interesa analizar datos y encontrar patrones",
      "Me gusta investigar antes de decidir",
      "Prefiero comprobar con evidencia",
      "Podria ser laboratorio o datos, no estoy seguro",
      "Me gustan los graficos y sacar conclusiones",
    ],
  },
  {
    code: "salud-apoyo-humano",
    name: "Salud, Psicologia y Apoyo Humano",
    scores: {
      riasec_realista: 3.0,
      riasec_investigativo: 4.0,
      riasec_artistico: 3.1,
      riasec_social: 4.6,
      riasec_emprendedor: 3.0,
      riasec_convencional: 3.2,
      big_five_apertura: 4.0,
      big_five_responsabilidad: 4.2,
      big_five_extraversion: 3.4,
      big_five_amabilidad: 4.6,
      big_five_neuroticismo: 3.2,
      incertidumbre_vocacional: 3.2,
      presion_externa: 2.8,
      tolerancia_dificultad: 4.1,
    },
    comments: [
      "Me gusta ayudar y escuchar a personas",
      "Me interesa psicologia pero tambien salud",
      "Quisiera trabajar cuidando a otros",
      "Me preocupa no saber manejar casos fuertes",
      "Siento que puedo orientar bien a mis amigos",
    ],
  },
  {
    code: "educacion-ciencias-sociales",
    name: "Educacion y Ciencias Sociales",
    scores: {
      riasec_realista: 2.8,
      riasec_investigativo: 3.5,
      riasec_artistico: 3.8,
      riasec_social: 4.7,
      riasec_emprendedor: 3.6,
      riasec_convencional: 3.0,
      big_five_apertura: 4.1,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 4.0,
      big_five_amabilidad: 4.4,
      big_five_neuroticismo: 3.1,
      incertidumbre_vocacional: 3.1,
      presion_externa: 2.7,
      tolerancia_dificultad: 3.8,
    },
    comments: [
      "Me gusta explicar temas a mis companeros",
      "Quiero trabajar con jovenes o comunidad",
      "Me interesa orientar y comunicar",
      "Podria ser educacion, pero no lo tengo cerrado",
      "Me gusta organizar talleres y conversar",
    ],
  },
  {
    code: "arte-comunicacion-diseno",
    name: "Arte, Comunicacion y Diseno",
    scores: {
      riasec_realista: 2.6,
      riasec_investigativo: 3.0,
      riasec_artistico: 4.8,
      riasec_social: 3.8,
      riasec_emprendedor: 3.5,
      riasec_convencional: 2.6,
      big_five_apertura: 4.8,
      big_five_responsabilidad: 3.4,
      big_five_extraversion: 3.8,
      big_five_amabilidad: 3.8,
      big_five_neuroticismo: 3.0,
      incertidumbre_vocacional: 3.3,
      presion_externa: 2.6,
      tolerancia_dificultad: 3.7,
    },
    comments: [
      "Me gusta disenar, editar y crear contenido",
      "Quiero algo con publicidad o audiovisuales",
      "Dibujo y redes me llaman bastante",
      "No soy tan bueno en numeros",
      "Me interesa comunicar ideas de forma visual",
    ],
  },
  {
    code: "negocios-gestion",
    name: "Negocios, Gestion y Emprendimiento",
    scores: {
      riasec_realista: 3.0,
      riasec_investigativo: 3.2,
      riasec_artistico: 3.1,
      riasec_social: 3.8,
      riasec_emprendedor: 4.7,
      riasec_convencional: 4.1,
      big_five_apertura: 3.8,
      big_five_responsabilidad: 4.3,
      big_five_extraversion: 4.2,
      big_five_amabilidad: 3.7,
      big_five_neuroticismo: 2.7,
      incertidumbre_vocacional: 2.8,
      presion_externa: 2.5,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me gustaria tener un negocio propio",
      "Me gusta coordinar personas y vender ideas",
      "Quiero aprender marketing o gestion",
      "Me interesa liderar proyectos aunque me da nervios",
      "Busco algo con oportunidades laborales",
    ],
  },
  {
    code: "administracion-finanzas",
    name: "Administracion, Finanzas y Gestion Operativa",
    scores: {
      riasec_realista: 3.1,
      riasec_investigativo: 3.7,
      riasec_artistico: 2.3,
      riasec_social: 3.0,
      riasec_emprendedor: 4.0,
      riasec_convencional: 4.8,
      big_five_apertura: 3.4,
      big_five_responsabilidad: 4.6,
      big_five_extraversion: 3.4,
      big_five_amabilidad: 3.5,
      big_five_neuroticismo: 2.8,
      incertidumbre_vocacional: 2.7,
      presion_externa: 2.3,
      tolerancia_dificultad: 4.0,
    },
    comments: [
      "Me gusta ordenar informacion y hacer cuentas",
      "Finanzas me parece util y estable",
      "Me interesan planillas, procesos y control",
      "Quiero una carrera con trabajo seguro",
      "No me molesta revisar detalles",
    ],
  },
  {
    code: "ambiente-recursos-naturales",
    name: "Ambiente y Recursos Naturales",
    scores: {
      riasec_realista: 4.1,
      riasec_investigativo: 4.2,
      riasec_artistico: 3.2,
      riasec_social: 3.7,
      riasec_emprendedor: 3.0,
      riasec_convencional: 3.1,
      big_five_apertura: 4.2,
      big_five_responsabilidad: 4.0,
      big_five_extraversion: 3.2,
      big_five_amabilidad: 4.0,
      big_five_neuroticismo: 2.9,
      incertidumbre_vocacional: 3.1,
      presion_externa: 2.4,
      tolerancia_dificultad: 4.1,
    },
    comments: [
      "Me preocupa la contaminacion",
      "Me gusta la naturaleza y salir a campo",
      "Quiero trabajar en algo ambiental",
      "No se si biologia o gestion ambiental",
      "Me interesa cuidar recursos naturales",
    ],
  },
];

const genericComments = [
  "No lo tengo claro todavia",
  "Estoy entre varias opciones",
  "Me preocupa elegir mal",
  "Mi familia opina bastante",
  "Quiero algo que tenga salida laboral",
  "A veces cambio de idea rapido",
  "No conozco bien todas las carreras",
  "Creo que depende de donde estudie",
  "Me interesa, pero no se si soy bueno para eso",
  "Prefiero probar antes de decidir",
];

const idNoise = ["", "", "", " DNI pendiente", " sin codigo", "duplicado?", "P0", "localidad no clara"];
const schools = ["SCH-01", "SCH-02", "SCH-03", "NORTE", "SUR", "", "", "colegio no indicado"];
const grades = ["4to", "5to", "egresado", "", "", "quinto", "4", "sin dato"];

let seed = 20260618;

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function int(min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

function pick(items) {
  return items[int(0, items.length - 1)];
}

function chance(probability) {
  return random() < probability;
}

function clamp(value, min = 1, max = 5) {
  return Math.min(max, Math.max(min, value));
}

function roundedHalf(value) {
  return Math.round(value * 2) / 2;
}

function score(base, spread = 1.15) {
  return roundedHalf(clamp(base + (random() - 0.5) * spread));
}

function uuid(index) {
  const hex = (number, size) => Math.abs(number).toString(16).padStart(size, "0").slice(-size);
  return `${hex(0xf1000000 + index * 97, 8)}-${hex(0x1500 + index, 4)}-4${hex(0x260 + index * 3, 3)}-${hex(0x820 + index, 3)}-${hex(0x900000000000 + index * 6547, 12)}`;
}

function dateInWindow(index) {
  const day = 1 + ((index * 7 + int(0, 5)) % 18);
  const hour = int(7, 21);
  const minute = int(0, 59);
  const second = int(0, 59);
  const ms = int(20, 980);
  return new Date(Date.UTC(2026, 5, day, hour, minute, second, ms));
}

function timestamp(date) {
  return date.toISOString().replace("T", " ").replace("Z", "");
}

function answerTimestamp(date) {
  return date.toISOString().replace("Z", "");
}

function participantCode(index) {
  if (chance(0.06)) return "";
  if (chance(0.05)) return `P${String(int(1, 110)).padStart(3, "0")}`;
  if (chance(0.12)) return `P${String(index).padStart(int(2, 4), "0")}${pick(idNoise)}`.trim();
  return `P${String(index).padStart(3, "0")}`;
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function buildScores(profile, completed) {
  const rowScores = {};

  for (const [, column] of dimensions) {
    if (!completed && chance(0.18)) {
      rowScores[column] = "";
      continue;
    }

    const value = score(profile.scores[column], completed ? 1.25 : 1.6);
    rowScores[column] = String(value);
  }

  if (chance(completed ? 0.14 : 0.26)) {
    const [, column] = pick(dimensions);
    rowScores[column] = String(score(3, 2.5));
  }

  return rowScores;
}

function buildLikertAnswers(rowScores, startedAt, count) {
  const answers = [];
  const questionIds = [1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 19, 21, 23, 24, 25, 26, 7, 8, 18, 20, 9, 22, 10, 11, 12, 27, 28, 29, 30];

  for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
    const [dimension, column] = dimensions[itemIndex % dimensions.length];
    const value = Number(rowScores[column] || score(3, 2));
    const delaySeconds = itemIndex * int(2, 18) + int(0, 12);
    const answeredAt = new Date(startedAt.getTime() + delaySeconds * 1000);

    answers.push({
      question_id: questionIds[itemIndex % questionIds.length],
      dimension,
      value: Math.round(clamp(value)),
      question_order: itemIndex + 1,
      answered_at: chance(0.08) ? null : answerTimestamp(answeredAt),
    });
  }

  return answers;
}

function buildOpenAnswers(profile, startedAt, count, offset) {
  const triggers = ["contrast", "motivation", "uncertainty", "pressure", "prioritization", "context"];
  const questionIds = [201, 202, 203, 204, 104, 101, 102, 105, 309, 401, 403];
  const answers = [];

  for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
    const messyText = chance(0.23)
      ? pick(genericComments)
      : pick(profile.comments);
    const typoText = chance(0.12)
      ? messyText.replace("gest", "gesit").replace("programar", "progamar").replace("carrera", "carera")
      : messyText;
    const delaySeconds = (offset + itemIndex) * int(8, 35) + int(10, 55);
    const answeredAt = new Date(startedAt.getTime() + delaySeconds * 1000);

    answers.push({
      question_id: questionIds[itemIndex % questionIds.length],
      trigger: pick(triggers),
      answer_text: typoText,
      answer_order: offset + itemIndex + 1,
      answered_at: chance(0.1) ? null : answerTimestamp(answeredAt),
    });
  }

  return answers;
}

function compatibleRoutes(profile) {
  const alternatives = profiles
    .filter((item) => item.code !== profile.code)
    .sort(() => random() - 0.5)
    .slice(0, chance(0.62) ? 1 : 2);

  if (chance(0.22)) return ["", ""];

  return [
    alternatives.map((item) => item.code).join(","),
    alternatives.map((item) => item.name).join(" | "),
  ];
}

function rowToCsv(row) {
  return columns.map((column) => csvValue(row[column])).join(",");
}

const rows = [];

for (let index = 1; index <= 130; index += 1) {
  const completed = index <= 100;
  const profile = profiles[(index + int(0, 3)) % profiles.length];
  const predictedProfile = chance(completed ? 0.84 : 0.5) ? profile : pick(profiles);
  const startedAt = dateInWindow(index);
  const likertCount = completed ? int(21, 30) : int(6, 20);
  const openCount = completed ? int(0, 8) : int(0, 5);
  const totalQuestions = likertCount + openCount + (chance(0.12) ? int(-2, 2) : 0);
  const durationMinutes = completed ? int(5, 32) : int(1, 16);
  const finishedAt = completed || chance(0.18)
    ? new Date(startedAt.getTime() + durationMinutes * 60_000 + int(5, 55) * 1000)
    : null;
  const rowScores = buildScores(profile, completed);
  const likertAnswers = buildLikertAnswers(rowScores, startedAt, likertCount);
  const openAnswers = buildOpenAnswers(profile, startedAt, openCount, likertCount);
  const [compatibleCodes, compatibleNames] = compatibleRoutes(profile);
  const confidence = completed ? Math.round((48 + random() * 39) * 10) / 10 : "";

  rows.push({
    session_id: uuid(index),
    anonymous_participant_id: participantCode(index),
    created_at: timestamp(startedAt),
    finished_at: finishedAt ? timestamp(finishedAt) : "",
    session_status: completed ? "COMPLETED" : "IN_PROGRESS",
    total_questions: String(Math.max(1, totalQuestions)),
    final_profile_code: completed ? profile.code : "",
    final_profile_name: completed ? profile.name : "",
    predicted_profile_code: completed ? predictedProfile.code : "",
    predicted_profile_name: completed ? predictedProfile.name : "",
    confidence_score: confidence === "" ? "" : String(confidence),
    model_used: completed ? "rules-riasec-big-five-v1" : "",
    ...rowScores,
    likert_answer_count: String(likertCount),
    open_answer_count: String(openCount),
    likert_answers_json: JSON.stringify(likertAnswers),
    open_answers_text: openAnswers.map((answer) => answer.answer_text).join(" | "),
    open_answers_json: JSON.stringify(openAnswers),
    compatible_route_codes: compatibleCodes,
    compatible_route_names: compatibleNames,
  });
}

rows.sort((left, right) => new Date(left.created_at) - new Date(right.created_at));

const csv = [columns.join(","), ...rows.map(rowToCsv)].join("\n") + "\n";
writeFileSync(outputPath, csv, "utf8");

console.log(`Archivo generado: ${outputPath}`);
console.log(`Registros: ${rows.length}`);
console.log(`Completos: ${rows.filter((row) => row.session_status === "COMPLETED").length}`);
console.log(`Incompletos: ${rows.filter((row) => row.session_status !== "COMPLETED").length}`);
