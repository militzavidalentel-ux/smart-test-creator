export type TipoPregunta = "vf" | "alternativas" | "desarrollo";

export const NIVELES_RUBRICA = [
  "No logrado",
  "Logrado parcialmente",
  "Logrado en gran parte",
  "Totalmente logrado",
] as const;

export type NivelRubrica = {
  nivel: string;
  descripcion: string;
  puntaje: number;
};

export type Alternativa = { letra: string; texto: string };

export type Curso = {
  id: string;
  nombre: string;
  nivel: string | null;
  asignatura: string | null;
  anio: number | null;
  descripcion: string | null;
  created_at: string;
};

export type Unidad = {
  id: string;
  curso_id: string;
  nombre: string;
  orden: number;
  created_at: string;
};

export type Tema = {
  id: string;
  unidad_id: string;
  nombre: string;
  orden: number;
  created_at: string;
};

export type Contenido = {
  id: string;
  curso_id: string | null;
  unidad_id: string | null;
  tema_id: string | null;
  nombre: string;
  tipo: string;
  url: string | null;
  storage_path: string | null;
  texto: string | null;
  created_at: string;
};

export type Prueba = {
  id: string;
  nombre: string;
  curso_id: string | null;
  unidad_id: string | null;
  tema_id: string | null;
  establecimiento: string | null;
  instrucciones: string | null;
  estado: string;
  contenido_ids: string[];
  created_at: string;
};

export type Pregunta = {
  id: string;
  prueba_id: string;
  orden: number;
  tipo: TipoPregunta;
  enunciado: string;
  alternativas: Alternativa[];
  respuesta_correcta: string | null;
  respuesta_esperada: string | null;
  criterios: string | null;
  puntaje: number;
  rubrica: NivelRubrica[];
  created_at: string;
};

export type Evaluacion = {
  id: string;
  prueba_id: string;
  estudiante: string;
  resultados: Record<string, number>;
  observaciones: string | null;
  puntaje_obtenido: number;
  puntaje_maximo: number;
  porcentaje: number;
  created_at: string;
};

export function rubricaPorDefecto(puntaje: number): NivelRubrica[] {
  const p = Math.max(0, Math.round(puntaje));
  return [
    { nivel: NIVELES_RUBRICA[0], descripcion: "No responde o la respuesta no se relaciona con lo solicitado.", puntaje: 0 },
    { nivel: NIVELES_RUBRICA[1], descripcion: "Responde de forma incompleta, con errores conceptuales importantes.", puntaje: Math.round(p * 0.3) },
    { nivel: NIVELES_RUBRICA[2], descripcion: "Responde correctamente la mayor parte, con imprecisiones menores.", puntaje: Math.round(p * 0.7) },
    { nivel: NIVELES_RUBRICA[3], descripcion: "Responde de forma completa, precisa y bien fundamentada.", puntaje: p },
  ];
}

export const ETIQUETA_TIPO: Record<TipoPregunta, string> = {
  vf: "Verdadero / Falso",
  alternativas: "Alternativas",
  desarrollo: "Desarrollo",
};
