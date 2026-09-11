import { supabase } from "@/integrations/supabase/client";
import type {
  Contenido,
  Curso,
  Evaluacion,
  Pregunta,
  Prueba,
  Tema,
  Unidad,
} from "./tipos";

function check<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}


/* ---------------- Cursos ---------------- */

export const cursosQuery = {
  queryKey: ["cursos"],
  queryFn: async (): Promise<Curso[]> =>
    check(await supabase.from("cursos").select("*").order("created_at", { ascending: false })),
};

export async function crearCurso(payload: Partial<Curso>) {
  return check(await supabase.from("cursos").insert(payload as never).select().single());
}
export async function actualizarCurso(id: string, payload: Partial<Curso>) {
  return check(await supabase.from("cursos").update(payload as never).eq("id", id).select().single());
}
export async function eliminarCurso(id: string) {
  const { error } = await supabase.from("cursos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- Unidades y temas ---------------- */

export const unidadesQuery = {
  queryKey: ["unidades"],
  queryFn: async (): Promise<Unidad[]> =>
    check(await supabase.from("unidades").select("*").order("orden")),
};

export const temasQuery = {
  queryKey: ["temas"],
  queryFn: async (): Promise<Tema[]> =>
    check(await supabase.from("temas").select("*").order("orden")),
};

export async function crearUnidad(payload: { curso_id: string; nombre: string; orden: number }) {
  return check(await supabase.from("unidades").insert(payload as never).select().single());
}
export async function eliminarUnidad(id: string) {
  const { error } = await supabase.from("unidades").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
export async function crearTema(payload: { unidad_id: string; nombre: string; orden: number }) {
  return check(await supabase.from("temas").insert(payload as never).select().single());
}
export async function eliminarTema(id: string) {
  const { error } = await supabase.from("temas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- Contenidos ---------------- */

export const contenidosQuery = {
  queryKey: ["contenidos"],
  queryFn: async (): Promise<Contenido[]> =>
    check(await supabase.from("contenidos").select("*").order("created_at", { ascending: false })),
};

export async function subirArchivo(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
  const { error } = await supabase.storage.from("contenidos").upload(path, file);
  if (error) throw new Error(error.message);
  return path;
}

export async function urlFirmada(path: string) {
  const { data, error } = await supabase.storage.from("contenidos").createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function crearContenido(payload: Partial<Contenido>) {
  return check(await supabase.from("contenidos").insert(payload as never).select().single());
}
export async function actualizarContenido(id: string, payload: Partial<Contenido>) {
  return check(
    await supabase.from("contenidos").update(payload as never).eq("id", id).select().single(),
  );
}
export async function eliminarContenido(c: Contenido) {
  if (c.storage_path) await supabase.storage.from("contenidos").remove([c.storage_path]);
  const { error } = await supabase.from("contenidos").delete().eq("id", c.id);
  if (error) throw new Error(error.message);
}

/* ---------------- Pruebas ---------------- */

export const pruebasQuery = {
  queryKey: ["pruebas"],
  queryFn: async (): Promise<Prueba[]> =>
    check(await supabase.from("pruebas").select("*").order("created_at", { ascending: false })),
};

export function pruebaQuery(id: string) {
  return {
    queryKey: ["prueba", id],
    queryFn: async (): Promise<Prueba> =>
      check(await supabase.from("pruebas").select("*").eq("id", id).single()),
  };
}

export function preguntasQuery(pruebaId: string) {
  return {
    queryKey: ["preguntas", pruebaId],
    queryFn: async (): Promise<Pregunta[]> =>
      check(
        await supabase.from("preguntas").select("*").eq("prueba_id", pruebaId).order("orden"),
      ),
  };
}

export const todasPreguntasQuery = {
  queryKey: ["preguntas"],
  queryFn: async (): Promise<Pregunta[]> =>
    check(await supabase.from("preguntas").select("*").order("orden")),
};

export async function crearPrueba(payload: Partial<Prueba>) {
  return check(await supabase.from("pruebas").insert(payload as never).select().single()) as Prueba;
}
export async function actualizarPrueba(id: string, payload: Partial<Prueba>) {
  return check(await supabase.from("pruebas").update(payload as never).eq("id", id).select().single());
}
export async function eliminarPrueba(id: string) {
  const { error } = await supabase.from("pruebas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertarPreguntas(rows: Partial<Pregunta>[]) {
  if (rows.length === 0) return [];
  return check(await supabase.from("preguntas").insert(rows as never).select());
}
export async function actualizarPregunta(id: string, payload: Partial<Pregunta>) {
  return check(
    await supabase.from("preguntas").update(payload as never).eq("id", id).select().single(),
  );
}
export async function eliminarPregunta(id: string) {
  const { error } = await supabase.from("preguntas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicarPrueba(prueba: Prueba, preguntas: Pregunta[]) {
  const nueva = await crearPrueba({
    nombre: `${prueba.nombre} (copia)`,
    curso_id: prueba.curso_id,
    unidad_id: prueba.unidad_id,
    tema_id: prueba.tema_id,
    establecimiento: prueba.establecimiento,
    instrucciones: prueba.instrucciones,
    estado: "pendiente",
    contenido_ids: prueba.contenido_ids,
  });
  await insertarPreguntas(
    preguntas.map((p) => ({
      prueba_id: nueva.id,
      orden: p.orden,
      tipo: p.tipo,
      enunciado: p.enunciado,
      alternativas: p.alternativas,
      respuesta_correcta: p.respuesta_correcta,
      respuesta_esperada: p.respuesta_esperada,
      criterios: p.criterios,
      puntaje: p.puntaje,
      rubrica: p.rubrica,
    })),
  );
  return nueva;
}

/* ---------------- Evaluaciones ---------------- */

export function evaluacionesQuery(pruebaId?: string) {
  return {
    queryKey: ["evaluaciones", pruebaId ?? "todas"],
    queryFn: async (): Promise<Evaluacion[]> => {
      let q = supabase.from("evaluaciones").select("*").order("created_at", { ascending: false });
      if (pruebaId) q = q.eq("prueba_id", pruebaId);
      return check(await q);
    },
  };
}

export async function guardarEvaluacion(payload: Partial<Evaluacion>) {
  return check(await supabase.from("evaluaciones").insert(payload as never).select().single());
}
export async function eliminarEvaluacion(id: string) {
  const { error } = await supabase.from("evaluaciones").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
