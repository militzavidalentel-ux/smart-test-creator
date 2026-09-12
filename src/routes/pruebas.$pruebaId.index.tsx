import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CheckCircle2, Plus, Printer, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  actualizarPregunta,
  actualizarPrueba,
  contenidosQuery,
  cursosQuery,
  eliminarPregunta,
  insertarPreguntas,
  preguntasQuery,
  pruebaQuery,
  temasQuery,
  unidadesQuery,
} from "@/lib/datos";
import { regenerarPreguntaIA } from "@/lib/ia.functions";
import {
  ETIQUETA_TIPO,
  NIVELES_RUBRICA,
  rubricaPorDefecto,
  type Alternativa,
  type NivelRubrica,
  type Pregunta,
  type TipoPregunta,
} from "@/lib/tipos";

export const Route = createFileRoute("/pruebas/$pruebaId/")({
  head: () => ({
    meta: [
      { title: "Revisar prueba | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Edita preguntas, alternativas, respuestas, puntajes y rúbricas antes de aplicar la evaluación.",
      },
      { property: "og:title", content: "Revisar y editar prueba" },
      {
        property: "og:description",
        content: "Ajusta cada pregunta y su rúbrica de cuatro niveles antes de imprimir.",
      },
    ],
  }),
  component: Detalle,
});

function EditorPregunta({
  q,
  total,
  onCambio,
  onMover,
  onRegenerar,
  regenerando,
}: {
  q: Pregunta;
  total: number;
  onCambio: (cambios: Partial<Pregunta>) => void;
  onMover: (dir: -1 | 1) => void;
  onRegenerar: () => void;
  regenerando: boolean;
}) {
  const rubrica = q.rubrica?.length === 4 ? q.rubrica : rubricaPorDefecto(q.puntaje);

  const setNivel = (i: number, cambios: Partial<NivelRubrica>) => {
    const copia = rubrica.map((n, j) => (i === j ? { ...n, ...cambios } : n));
    onCambio({ rubrica: copia });
  };

  const setAlt = (i: number, texto: string) => {
    const alts: Alternativa[] = (q.alternativas ?? []).map((a, j) =>
      i === j ? { ...a, texto } : a,
    );
    onCambio({ alternativas: alts });
  };

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            {q.orden}
          </span>
          <select
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
            value={q.tipo}
            onChange={(e) => onCambio({ tipo: e.target.value as TipoPregunta })}
          >
            {(Object.keys(ETIQUETA_TIPO) as TipoPregunta[]).map((t) => (
              <option key={t} value={t}>
                {ETIQUETA_TIPO[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" aria-label="Subir" onClick={() => onMover(-1)} disabled={q.orden === 1}>
            <ArrowUp className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Bajar"
            onClick={() => onMover(1)}
            disabled={q.orden === total}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRegenerar} disabled={regenerando}>
            <RefreshCw className={`size-3.5 ${regenerando ? "animate-spin" : ""}`} /> Regenerar
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Eliminar pregunta"
            onClick={() => onCambio({ id: "ELIMINAR" } as Partial<Pregunta>)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      <Textarea
        className="mt-3"
        rows={2}
        value={q.enunciado}
        onChange={(e) => onCambio({ enunciado: e.target.value })}
      />

      {q.tipo === "alternativas" && (
        <div className="mt-3 space-y-2">
          {(q.alternativas ?? []).map((a, i) => (
            <div key={a.letra + i} className="flex items-center gap-2">
              <button
                onClick={() => onCambio({ respuesta_correcta: a.letra })}
                className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold ring-1 ${
                  q.respuesta_correcta === a.letra
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "ring-border"
                }`}
              >
                {a.letra}
              </button>
              <Input value={a.texto} onChange={(e) => setAlt(i, e.target.value)} />
            </div>
          ))}
        </div>
      )}

      {q.tipo === "vf" && (
        <div className="mt-3 flex gap-2">
          {["Verdadero", "Falso"].map((v) => (
            <button
              key={v}
              onClick={() => onCambio({ respuesta_correcta: v })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ${
                q.respuesta_correcta === v
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "ring-border"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {q.tipo === "desarrollo" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Respuesta esperada</Label>
            <Textarea
              rows={3}
              value={q.respuesta_esperada ?? ""}
              onChange={(e) => onCambio({ respuesta_esperada: e.target.value })}
            />
          </div>
          <div>
            <Label>Criterios de evaluación</Label>
            <Textarea
              rows={3}
              value={q.criterios ?? ""}
              onChange={(e) => onCambio({ criterios: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Label className="text-xs">Puntaje</Label>
        <Input
          type="number"
          min={1}
          className="h-8 w-20"
          value={q.puntaje}
          onChange={(e) => {
            const p = Math.max(1, Number(e.target.value));
            onCambio({ puntaje: p, rubrica: rubricaPorDefecto(p) });
          }}
        />
      </div>

      <div className="mt-4 rounded-xl bg-card/70 p-3 ring-1 ring-border">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rúbrica de la pregunta
        </p>
        <div className="space-y-2">
          {rubrica.map((n, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[10rem_1fr_5rem]">
              <p className="self-center text-xs font-medium">{NIVELES_RUBRICA[i] ?? n.nivel}</p>
              <Textarea
                rows={2}
                className="text-xs"
                value={n.descripcion}
                onChange={(e) => setNivel(i, { descripcion: e.target.value })}
              />
              <Input
                type="number"
                className="h-9"
                value={n.puntaje}
                onChange={(e) => setNivel(i, { puntaje: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>
        {rubrica[3]?.puntaje !== q.puntaje && (
          <p className="mt-2 text-xs text-destructive">
            El nivel “Totalmente logrado” debería valer {q.puntaje} puntos.
          </p>
        )}
      </div>
    </Panel>
  );
}

function Detalle() {
  const { pruebaId } = useParams({ from: "/pruebas/$pruebaId/" });
  const qc = useQueryClient();
  const prueba = useQuery(pruebaQuery(pruebaId));
  const preguntas = useQuery(preguntasQuery(pruebaId));
  const cursos = useQuery(cursosQuery);
  const unidades = useQuery(unidadesQuery);
  const temas = useQuery(temasQuery);
  const contenidos = useQuery(contenidosQuery);
  const [regenerando, setRegenerando] = useState<string | null>(null);

  const lista = preguntas.data ?? [];
  const total = lista.reduce((s, q) => s + q.puntaje, 0);
  const p = prueba.data;

  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["preguntas"] });
    qc.invalidateQueries({ queryKey: ["pruebas"] });
  };

  const aplicar = async (q: Pregunta, cambios: Partial<Pregunta>) => {
    if ((cambios as { id?: string }).id === "ELIMINAR") {
      await eliminarPregunta(q.id);
      refrescar();
      toast.success("Pregunta eliminada");
      return;
    }
    await actualizarPregunta(q.id, cambios);
    refrescar();
  };

  const mover = async (q: Pregunta, dir: -1 | 1) => {
    const otro = lista.find((x) => x.orden === q.orden + dir);
    if (!otro) return;
    await actualizarPregunta(q.id, { orden: otro.orden });
    await actualizarPregunta(otro.id, { orden: q.orden });
    refrescar();
  };

  const agregar = async () => {
    await insertarPreguntas([
      {
        prueba_id: pruebaId,
        orden: lista.length + 1,
        tipo: "desarrollo",
        enunciado: "Nueva pregunta",
        alternativas: [],
        respuesta_correcta: null,
        respuesta_esperada: null,
        criterios: null,
        puntaje: 5,
        rubrica: rubricaPorDefecto(5),
      },
    ]);
    refrescar();
  };

  const regenerar = async (q: Pregunta) => {
    setRegenerando(q.id);
    try {
      const curso = (cursos.data ?? []).find((c) => c.id === p?.curso_id);
      const fuentes = (contenidos.data ?? [])
        .filter((c) => (p?.contenido_ids ?? []).includes(c.id))
        .map((c) => ({ nombre: c.nombre, tipo: c.tipo, url: c.url, texto: c.texto }));
      const { pregunta } = await regenerarPreguntaIA({
        data: {
          curso: curso?.nombre ?? "",
          nivel: curso?.nivel ?? "",
          asignatura: curso?.asignatura ?? "",
          unidad: (unidades.data ?? []).find((u) => u.id === p?.unidad_id)?.nombre ?? "",
          tema: (temas.data ?? []).find((t) => t.id === p?.tema_id)?.nombre ?? "",
          fuentes,
          archivos: [],
          tipo: q.tipo,
          puntaje: q.puntaje,
          evitar: lista.filter((x) => x.id !== q.id).map((x) => x.enunciado),
        },
      });
      if (!pregunta) throw new Error("La IA no devolvió una pregunta.");
      await actualizarPregunta(q.id, {
        enunciado: pregunta.enunciado,
        alternativas: pregunta.alternativas ?? [],
        respuesta_correcta: pregunta.respuesta_correcta ?? null,
        respuesta_esperada: pregunta.respuesta_esperada ?? null,
        criterios: pregunta.criterios ?? null,
        rubrica:
          pregunta.rubrica && pregunta.rubrica.length === 4
            ? pregunta.rubrica
            : rubricaPorDefecto(q.puntaje),
      });
      refrescar();
      toast.success("Pregunta regenerada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo regenerar la pregunta.");
    } finally {
      setRegenerando(null);
    }
  };

  return (
    <AppShell
      seccion="Mis Pruebas · Revisión"
      titulo={p?.nombre ?? "Prueba"}
      acciones={
        <>
          <Button variant="outline" asChild>
            <Link to="/pruebas/$pruebaId/imprimir" params={{ pruebaId }} search={{ rubrica: false }}>
              <Printer className="size-4" /> Exportar prueba
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pruebas/$pruebaId/imprimir" params={{ pruebaId }} search={{ rubrica: true }}>
              Exportar prueba + rúbrica
            </Link>
          </Button>
          <Button asChild>
            <Link to="/pruebas/$pruebaId/evaluar" params={{ pruebaId }}>
              Aplicar y evaluar
            </Link>
          </Button>
        </>
      }
    >
      <Panel className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm">
            <span className="font-medium">{lista.length}</span> preguntas ·{" "}
            <span className="font-medium">{total}</span> puntos totales
          </p>
          <p className="text-[11px] text-muted-foreground">
            La prueba no es definitiva hasta que la marques como revisada.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={agregar}>
            <Plus className="size-4" /> Agregar pregunta
          </Button>
          <Button
            onClick={async () => {
              await actualizarPrueba(pruebaId, { estado: "revisada" });
              refrescar();
              toast.success("Prueba marcada como revisada");
            }}
          >
            <CheckCircle2 className="size-4" /> Marcar revisada
          </Button>
        </div>
      </Panel>

      <div className="space-y-4">
        {lista.map((q) => (
          <EditorPregunta
            key={q.id}
            q={q}
            total={lista.length}
            regenerando={regenerando === q.id}
            onCambio={(cambios) => aplicar(q, cambios)}
            onMover={(dir) => mover(q, dir)}
            onRegenerar={() => regenerar(q)}
          />
        ))}
      </div>
    </AppShell>
  );
}
