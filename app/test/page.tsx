import { PaginaVocacional } from "@/frontend/vocational/PaginaVocacional";
import {
  codificarRespuestas,
  detectarContradicciones,
  obtenerMejorPerfil,
  obtenerObjetivoPreguntasActual,
  obtenerPreguntaEditable,
  obtenerRespuestaDePregunta,
  obtenerRespuestasLikert,
  obtenerSenales,
  procesarRespuestaEnviada,
  seleccionarSiguientePregunta,
} from "@/lib/vocational/engine";
import type { SearchParams } from "@/lib/vocational/types";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parametrosBusqueda = await searchParams;
  const idSesion = obtenerPrimerValor(parametrosBusqueda.sessionId);
  const vista = obtenerPrimerValor(parametrosBusqueda.view);
  const respuestas = procesarRespuestaEnviada(parametrosBusqueda);
  const preguntaEditable = obtenerPreguntaEditable(respuestas, parametrosBusqueda);
  const resultado = obtenerMejorPerfil(respuestas);
  const contradicciones = detectarContradicciones(resultado.averages, respuestas);
  const siguientePregunta = seleccionarSiguientePregunta(respuestas);
  const cantidadLikert = obtenerRespuestasLikert(respuestas).length;
  const totalPreguntas = obtenerObjetivoPreguntasActual(
    respuestas,
    resultado.averages,
    resultado.ranked,
    contradicciones,
  );
  const finalizado = !preguntaEditable && !siguientePregunta;
  const mostrarResultados = finalizado && vista === "results";
  const preguntaActual = preguntaEditable ?? (finalizado ? null : siguientePregunta);
  const respuestaActual = preguntaActual
    ? obtenerRespuestaDePregunta(respuestas, preguntaActual.id)
    : undefined;
  const numeroPregunta =
    respuestaActual?.order ?? Math.min(cantidadLikert + 1, totalPreguntas);
  const progreso = finalizado
    ? 100
    : Math.min(100, Math.round(((numeroPregunta - 1) / totalPreguntas) * 100));
  const estadoCodificado = codificarRespuestas(respuestas);
  const urlResultados = construirUrl({
    idSesion,
    estado: estadoCodificado,
    vista: "results",
  });
  const ultimaRespuesta = respuestas.at(-1);
  const urlVolverPreguntas = ultimaRespuesta
    ? construirUrl({
        idSesion,
        estado: estadoCodificado,
        idPreguntaEditable: String(ultimaRespuesta.questionId),
      })
    : "/test";

  return (
    <PaginaVocacional
      estadoCodificado={estadoCodificado}
      estaEditando={Boolean(preguntaEditable)}
      finalizado={finalizado}
      idSesion={idSesion}
      indicadores={resultado.indicators}
      mostrarResultados={mostrarResultados}
      numeroPregunta={numeroPregunta}
      perfilPrincipal={resultado.best}
      preguntaActual={preguntaActual}
      progreso={progreso}
      ranking={resultado.ranked}
      respuestaActual={respuestaActual}
      respuestas={respuestas}
      senales={obtenerSenales(respuestas)}
      totalPreguntas={totalPreguntas}
      urlResultados={urlResultados}
      urlVolverPreguntas={urlVolverPreguntas}
    />
  );
}

function obtenerPrimerValor(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function construirUrl(params: {
  estado?: string;
  idPreguntaEditable?: string;
  idSesion?: string;
  vista?: string;
}) {
  const parametros = new URLSearchParams();

  if (params.idSesion) parametros.set("sessionId", params.idSesion);
  if (params.estado) parametros.set("state", params.estado);
  if (params.idPreguntaEditable) {
    parametros.set("editQuestionId", params.idPreguntaEditable);
  }
  if (params.vista) parametros.set("view", params.vista);

  const consulta = parametros.toString();

  return consulta ? `/test?${consulta}` : "/test";
}
