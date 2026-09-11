import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODELO = "google/gemini-3.8-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const archivoSchema = z.object({
  nombre: z.string(),
  mime: z.string(),
  base64: z.string(),
});

const fuenteSchema = z.object({
  nombre: z.string(),
  tipo: z.string(),
  url: z.string().nullable().optional(),
  texto: z.string().nullable().optional(),
});

const contextoSchema = z.object({
  curso: z.string().optional().default(""),
  nivel: z.string().optional().default(""),
  asignatura: z.string().optional().default(""),
  unidad: z.string().optional().default(""),
  tema: z.string().optional().default(""),
  fuentes: z.array(fuenteSchema).default([]),
  archivos: z.array(archivoSchema).default([]),
});

const generarSchema = contextoSchema.extend({
  bloques: z
    .array(
      z.object({
        tipo: z.enum(["vf", "alternativas", "desarrollo"]),
        cantidad: z.number().int().min(1).max(30),
        puntaje: z.number().int().min(1).max(100),
      }),
    )
    .min(1),
});

const regenerarSchema = contextoSchema.extend({
  tipo: z.enum(["vf", "alternativas", "desarrollo"]),
  puntaje: z.number().int().min(1).max(100),
  evitar: z.array(z.string()).default([]),
});

type Mensaje = { role: string; content: unknown };

export type NivelIA = { nivel: string; descripcion: string; puntaje: number };
export type PreguntaIA = {
  tipo: string;
  enunciado: string;
  alternativas?: { letra: string; texto: string }[];
  respuesta_correcta?: string | null;
  respuesta_esperada?: string | null;
  criterios?: string | null;
  puntaje?: number;
  rubrica?: NivelIA[];
};

function errorGateway(status: number, texto: string): Error {
  if (status === 429) return new Error("Demasiadas solicitudes a la IA. Espera unos segundos e inténtalo otra vez.");
  if (status === 402)
    return new Error("Se agotaron los créditos de IA del espacio de trabajo. Agrega créditos para seguir generando.");
  if (status === 403) return new Error("El uso de IA está bloqueado para este espacio de trabajo.");
  return new Error(`La IA no pudo responder (${status}). ${texto.slice(0, 300)}`);
}

function partesContexto(data: z.infer<typeof contextoSchema>) {
  const fuentes = data.fuentes
    .map((f, i) => {
      const partes = [`FUENTE ${i + 1}: ${f.nombre} (${f.tipo})`];
      if (f.url) partes.push(`Enlace: ${f.url}`);
      if (f.texto) partes.push(`Contenido: ${f.texto.slice(0, 6000)}`);
      return partes.join("\n");
    })
    .join("\n\n");

  return [
    `Curso: ${data.curso || "sin especificar"}`,
    `Nivel: ${data.nivel || "sin especificar"}`,
    `Asignatura: ${data.asignatura || "sin especificar"}`,
    `Unidad: ${data.unidad || "sin especificar"}`,
    `Tema: ${data.tema || "sin especificar"}`,
    "",
    "MATERIAL DE ORIGEN:",
    fuentes || "(sin material textual; usa los archivos adjuntos y el tema indicado)",
  ].join("\n");
}

function adjuntos(data: z.infer<typeof contextoSchema>) {
  const partes: unknown[] = [];
  for (const a of data.archivos.slice(0, 4)) {
    const dataUrl = `data:${a.mime};base64,${a.base64}`;
    if (a.mime.startsWith("image/")) {
      partes.push({ type: "image_url", image_url: { url: dataUrl } });
    } else if (a.mime === "application/pdf") {
      partes.push({ type: "file", file: { filename: a.nombre, file_data: dataUrl } });
    }
  }
  return partes;
}

const SISTEMA = `Eres un experto en evaluación educativa chilena. Redactas pruebas y rúbricas en español neutro.
Reglas obligatorias:
- Todas las preguntas deben basarse directamente en el material entregado.
- Nunca repitas preguntas ni formules enunciados ambiguos.
- Adapta el vocabulario y la dificultad al nivel del curso indicado.
- Cada pregunta lleva una rúbrica de exactamente 4 niveles en este orden: "No logrado", "Logrado parcialmente", "Logrado en gran parte", "Totalmente logrado".
- El puntaje del nivel "No logrado" es 0 y el de "Totalmente logrado" es exactamente el puntaje de la pregunta. Los intermedios son crecientes y están entre esos valores.
- Para "alternativas" entrega 4 alternativas (A, B, C, D) y la letra correcta.
- Para "vf" el enunciado es una afirmación y la respuesta correcta es "Verdadero" o "Falso".
- Para "desarrollo" entrega respuesta esperada y criterios de evaluación.
Responde SOLO con JSON válido.`;

const ESQUEMA_PREGUNTA = `{
  "tipo": "vf" | "alternativas" | "desarrollo",
  "enunciado": string,
  "alternativas": [{"letra": "A", "texto": string}],
  "respuesta_correcta": string,
  "respuesta_esperada": string,
  "criterios": string,
  "puntaje": number,
  "rubrica": [{"nivel": string, "descripcion": string, "puntaje": number}]
}`;

async function llamarIA(mensajes: Mensaje[], apiKey: string) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: MODELO,
      messages: mensajes,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw errorGateway(res.status, await res.text());
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const texto = json.choices?.[0]?.message?.content ?? "";
  const limpio = texto.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(limpio) as Record<string, unknown>;
  } catch {
    const m = limpio.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as Record<string, unknown>;
    throw new Error("La IA devolvió una respuesta que no se pudo interpretar. Inténtalo nuevamente.");
  }
}

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Falta la configuración de IA en el servidor.");
  return key;
}

export const generarPreguntasIA = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => generarSchema.parse(d))
  .handler(async ({ data }) => {
    const key = apiKey();
    const detalle = data.bloques
      .map((b) => `- ${b.cantidad} preguntas de tipo "${b.tipo}" con ${b.puntaje} puntos cada una`)
      .join("\n");

    const instruccion = `${partesContexto(data)}

Genera exactamente estas preguntas:
${detalle}

Devuelve un objeto JSON con la forma {"preguntas": [ ${ESQUEMA_PREGUNTA} ]} respetando el orden de los tipos solicitados.`;

    const contenido = [{ type: "text", text: instruccion }, ...adjuntos(data)];
    const mensajes: Mensaje[] = [
      { role: "system", content: SISTEMA },
      { role: "user", content: contenido },
    ];

    let json: Record<string, unknown>;
    try {
      json = await llamarIA(mensajes, key);
    } catch (e) {
      if (data.archivos.length === 0) throw e;
      json = await llamarIA(
        [
          { role: "system", content: SISTEMA },
          { role: "user", content: instruccion },
        ],
        key,
      );
    }
    const preguntas = (json["preguntas"] ?? []) as PreguntaIA[];
    return { preguntas };
  });

export const regenerarPreguntaIA = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => regenerarSchema.parse(d))
  .handler(async ({ data }) => {
    const key = apiKey();
    const instruccion = `${partesContexto(data)}

Genera UNA sola pregunta nueva de tipo "${data.tipo}" que valga ${data.puntaje} puntos.
No repitas ninguna de estas preguntas ya existentes:
${data.evitar.map((e, i) => `${i + 1}. ${e}`).join("\n") || "(ninguna)"}

Devuelve un objeto JSON con la forma {"pregunta": ${ESQUEMA_PREGUNTA}}.`;

    const json = await llamarIA(
      [
        { role: "system", content: SISTEMA },
        { role: "user", content: instruccion },
      ],
      key,
    );
    return { pregunta: (json["pregunta"] ?? null) as PreguntaIA | null };
  });

const rubricaSchema = z.object({
  enunciado: z.string(),
  tipo: z.enum(["vf", "alternativas", "desarrollo"]),
  puntaje: z.number().int().min(1).max(100),
  respuesta_esperada: z.string().nullable().optional(),
});

export const generarRubricaIA = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => rubricaSchema.parse(d))
  .handler(async ({ data }) => {
    const key = apiKey();
    const instruccion = `Crea la rúbrica de evaluación para esta pregunta de tipo "${data.tipo}" que vale ${data.puntaje} puntos.
Pregunta: ${data.enunciado}
Respuesta esperada: ${data.respuesta_esperada ?? "(no indicada)"}

Devuelve JSON {"rubrica": [{"nivel": string, "descripcion": string, "puntaje": number}]} con exactamente 4 niveles.`;

    const json = await llamarIA(
      [
        { role: "system", content: SISTEMA },
        { role: "user", content: instruccion },
      ],
      key,
    );
    return { rubrica: (json["rubrica"] ?? []) as NivelIA[] };
  });
