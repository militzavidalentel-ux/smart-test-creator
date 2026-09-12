import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contenidosQuery,
  crearPrueba,
  cursosQuery,
  insertarPreguntas,
  temasQuery,
  unidadesQuery,
  urlFirmada,
} from "@/lib/datos";
import { generarPreguntasIA } from "@/lib/ia.functions";
import { ETIQUETA_TIPO, rubricaPorDefecto, type Alternativa, type NivelRubrica, type TipoPregunta } from "@/lib/tipos";

export const Route = createFileRoute("/generar")({
  head: () => ({
    meta: [
      { title: "Generar Prueba con IA | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Asistente paso a paso: selecciona contenidos, configura tipos y puntajes, y genera la prueba con IA.",
      },
      { property: "og:title", content: "Generar Prueba con IA" },
      {
        property: "og:description",
        content: "Crea pruebas de Verdadero/Falso, alternativas y desarrollo con rúbricas automáticas.",
      },
    ],
  }),
  component: Generar,
});

const PASOS = ["Contenidos", "Configuración", "Generar con IA"];

type Bloque = { tipo: TipoPregunta; cantidad: number; puntaje: number };

async function archivoBase64(path: string) {
  const url = await urlFirmada(path);
  if (!url) return null;
  const res = await fetch(url);
  const blob = await res.blob();
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 1) bin += String.fromCharCode(buf[i]!);
  return { mime: blob.type, base64: btoa(bin) };
}

function Generar() {
  const navigate = useNavigate();
  const cursos = useQuery(cursosQuery);
  const unidades = useQuery(unidadesQuery);
  const temas = useQuery(temasQuery);
  const contenidos = useQuery(contenidosQuery);

  const [paso, setPaso] = useState(0);
  const [cursoId, setCursoId] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [temaId, setTemaId] = useState("");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [establecimiento, setEstablecimiento] = useState("");
  const [instrucciones, setInstrucciones] = useState(
    "Lee atentamente cada pregunta antes de responder. Usa lápiz de pasta azul o negro.",
  );
  const [bloques, setBloques] = useState<Bloque[]>([
    { tipo: "alternativas", cantidad: 5, puntaje: 2 },
  ]);
  const [mismoPuntaje, setMismoPuntaje] = useState(true);
  const [puntajeComun, setPuntajeComun] = useState(2);
  const [cargando, setCargando] = useState(false);

  const us = (unidades.data ?? []).filter((u) => !cursoId || u.curso_id === cursoId);
  const ts = (temas.data ?? []).filter((t) => !unidadId || t.unidad_id === unidadId);
  const disponibles = (contenidos.data ?? []).filter(
    (c) =>
      (!cursoId || c.curso_id === cursoId) &&
      (!unidadId || c.unidad_id === unidadId) &&
      (!temaId || c.tema_id === temaId),
  );

  const totalPreguntas = bloques.reduce((s, b) => s + b.cantidad, 0);
  const puntajeTotal = bloques.reduce(
    (s, b) => s + b.cantidad * (mismoPuntaje ? puntajeComun : b.puntaje),
    0,
  );

  const curso = (cursos.data ?? []).find((c) => c.id === cursoId);

  const generar = async () => {
    if (!nombre.trim()) {
      toast.error("Escribe el nombre de la prueba.");
      return;
    }
    setCargando(true);
    try {
      const fuentes = disponibles
        .filter((c) => seleccion.includes(c.id))
        .map((c) => ({ nombre: c.nombre, tipo: c.tipo, url: c.url, texto: c.texto }));

      const archivos: { nombre: string; mime: string; base64: string }[] = [];
      for (const c of disponibles.filter(
        (x) => seleccion.includes(x.id) && x.storage_path && ["pdf", "imagen"].includes(x.tipo),
      )) {
        const res = await archivoBase64(c.storage_path!);
        if (res) archivos.push({ nombre: c.nombre, ...res });
      }

      const { preguntas } = await generarPreguntasIA({
        data: {
          curso: curso?.nombre ?? "",
          nivel: curso?.nivel ?? "",
          asignatura: curso?.asignatura ?? "",
          unidad: us.find((u) => u.id === unidadId)?.nombre ?? "",
          tema: ts.find((t) => t.id === temaId)?.nombre ?? "",
          fuentes,
          archivos,
          bloques: bloques.map((b) => ({
            tipo: b.tipo,
            cantidad: b.cantidad,
            puntaje: mismoPuntaje ? puntajeComun : b.puntaje,
          })),
        },
      });

      if (!preguntas.length) throw new Error("La IA no devolvió preguntas. Inténtalo nuevamente.");

      const prueba = await crearPrueba({
        nombre: nombre.trim(),
        curso_id: cursoId || null,
        unidad_id: unidadId || null,
        tema_id: temaId || null,
        establecimiento: establecimiento.trim() || null,
        instrucciones: instrucciones.trim() || null,
        estado: "borrador",
        contenido_ids: seleccion,
      });

      const filas = preguntas.map((p, i) => {
        const tipo = (["vf", "alternativas", "desarrollo"].includes(p.tipo)
          ? p.tipo
          : "desarrollo") as TipoPregunta;
        const puntaje = Math.max(1, Math.round(p.puntaje ?? puntajeComun));
        const rubrica: NivelRubrica[] =
          p.rubrica && p.rubrica.length === 4
            ? p.rubrica.map((n) => ({
                nivel: n.nivel,
                descripcion: n.descripcion,
                puntaje: Math.round(n.puntaje),
              }))
            : rubricaPorDefecto(puntaje);
        const alternativas: Alternativa[] = p.alternativas ?? [];
        return {
          prueba_id: prueba.id,
          orden: i + 1,
          tipo,
          enunciado: p.enunciado,
          alternativas,
          respuesta_correcta: p.respuesta_correcta ?? null,
          respuesta_esperada: p.respuesta_esperada ?? null,
          criterios: p.criterios ?? null,
          puntaje,
          rubrica,
        };
      });

      await insertarPreguntas(filas);
      toast.success("Prueba generada. Revísala antes de aplicarla.");
      navigate({ to: "/pruebas/$pruebaId", params: { pruebaId: prueba.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar la prueba.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AppShell seccion="Generar Prueba" titulo="Asistente de creación">
      <ol className="mb-6 flex flex-wrap gap-2">
        {PASOS.map((p, i) => (
          <li
            key={p}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
              i === paso
                ? "bg-primary text-primary-foreground ring-primary"
                : i < paso
                  ? "bg-primary/10 text-primary ring-primary/20"
                  : "bg-card/60 text-muted-foreground ring-border"
            }`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-background/40">{i + 1}</span>
            {p}
          </li>
        ))}
      </ol>

      {paso === 0 && (
        <Panel>
          <h2 className="font-display text-lg font-semibold tracking-tight">1. Seleccionar contenidos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="curso">Curso</Label>
              <select
                id="curso"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={cursoId}
                onChange={(e) => {
                  setCursoId(e.target.value);
                  setUnidadId("");
                  setTemaId("");
                  setSeleccion([]);
                }}
              >
                <option value="">Todos</option>
                {(cursos.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="unidad">Unidad</Label>
              <select
                id="unidad"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={unidadId}
                onChange={(e) => {
                  setUnidadId(e.target.value);
                  setTemaId("");
                }}
              >
                <option value="">Todas</option>
                {us.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="tema">Tema</Label>
              <select
                id="tema"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={temaId}
                onChange={(e) => setTemaId(e.target.value)}
              >
                <option value="">Todos</option>
                {ts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {disponibles.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay contenidos para este filtro. Carga material en la sección Contenidos.
              </p>
            )}
            {disponibles.map((c) => {
              const activo = seleccion.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    setSeleccion(activo ? seleccion.filter((i) => i !== c.id) : [...seleccion, c.id])
                  }
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition-colors ${
                    activo ? "bg-primary/10 ring-primary/30" : "bg-card/70 ring-border"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md text-[10px] ring-1 ${
                      activo ? "bg-primary text-primary-foreground ring-primary" : "ring-border"
                    }`}
                  >
                    {activo ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.nombre}</span>
                    <span className="block text-[11px] text-muted-foreground">{c.tipo}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={() => {
                if (seleccion.length === 0) {
                  toast.error("Selecciona al menos un contenido.");
                  return;
                }
                setPaso(1);
              }}
            >
              Continuar
            </Button>
          </div>
        </Panel>
      )}

      {paso === 1 && (
        <Panel>
          <h2 className="font-display text-lg font-semibold tracking-tight">2. Configurar la prueba</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="nombrePrueba">Nombre de la prueba</Label>
              <Input
                id="nombrePrueba"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Prueba Unidad 1"
              />
            </div>
            <div>
              <Label htmlFor="establecimiento">Establecimiento</Label>
              <Input
                id="establecimiento"
                value={establecimiento}
                onChange={(e) => setEstablecimiento(e.target.value)}
                placeholder="Colegio San Andrés"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="instrucciones">Instrucciones</Label>
              <Textarea
                id="instrucciones"
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <input
              id="mismo"
              type="checkbox"
              checked={mismoPuntaje}
              onChange={(e) => setMismoPuntaje(e.target.checked)}
            />
            <Label htmlFor="mismo" className="text-sm font-normal">
              Usar el mismo puntaje para todas las preguntas
            </Label>
            {mismoPuntaje && (
              <Input
                type="number"
                min={1}
                className="ml-2 h-8 w-20"
                value={puntajeComun}
                onChange={(e) => setPuntajeComun(Math.max(1, Number(e.target.value)))}
              />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {bloques.map((b, i) => (
              <div
                key={i}
                className="grid grid-cols-2 items-end gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-border sm:grid-cols-4"
              >
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                    value={b.tipo}
                    onChange={(e) => {
                      const copia = [...bloques];
                      copia[i] = { ...b, tipo: e.target.value as TipoPregunta };
                      setBloques(copia);
                    }}
                  >
                    {(Object.keys(ETIQUETA_TIPO) as TipoPregunta[]).map((t) => (
                      <option key={t} value={t}>
                        {ETIQUETA_TIPO[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min={1}
                    value={b.cantidad}
                    onChange={(e) => {
                      const copia = [...bloques];
                      copia[i] = { ...b, cantidad: Math.max(1, Number(e.target.value)) };
                      setBloques(copia);
                    }}
                  />
                </div>
                <div>
                  <Label>Puntaje c/u</Label>
                  <Input
                    type="number"
                    min={1}
                    disabled={mismoPuntaje}
                    value={mismoPuntaje ? puntajeComun : b.puntaje}
                    onChange={(e) => {
                      const copia = [...bloques];
                      copia[i] = { ...b, puntaje: Math.max(1, Number(e.target.value)) };
                      setBloques(copia);
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setBloques(bloques.filter((_, j) => j !== i))}
                  disabled={bloques.length === 1}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setBloques([...bloques, { tipo: "vf", cantidad: 3, puntaje: puntajeComun }])}
            >
              Añadir tipo de pregunta
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent/10 p-4 ring-1 ring-inset ring-accent/20">
            <p className="text-sm">
              <span className="font-medium">{totalPreguntas}</span> preguntas ·{" "}
              <span className="font-medium">{puntajeTotal}</span> puntos totales
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaso(0)}>
                Atrás
              </Button>
              <Button onClick={() => setPaso(2)}>Continuar</Button>
            </div>
          </div>
        </Panel>
      )}

      {paso === 2 && (
        <Panel>
          <h2 className="font-display text-lg font-semibold tracking-tight">3. Generar con IA</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            La IA usará {seleccion.length} contenido(s) como fuente para crear {totalPreguntas} preguntas
            ({puntajeTotal} puntos) con su rúbrica de cuatro niveles. Después podrás revisar y editar todo.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPaso(1)} disabled={cargando}>
              Atrás
            </Button>
            <Button onClick={generar} disabled={cargando}>
              <Sparkles className="size-4" />
              {cargando ? "Generando..." : "Generar Prueba con IA"}
            </Button>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
