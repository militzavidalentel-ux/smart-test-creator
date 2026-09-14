import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  evaluacionesQuery,
  guardarEvaluacion,
  preguntasQuery,
  pruebaQuery,
} from "@/lib/datos";
import { NIVELES_RUBRICA, rubricaPorDefecto } from "@/lib/tipos";

export const Route = createFileRoute("/pruebas/$pruebaId/evaluar")({
  head: () => ({
    meta: [
      { title: "Evaluar prueba | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Corrige cada pregunta con su rúbrica de cuatro niveles y obtén puntaje y porcentaje de logro en tiempo real.",
      },
      { property: "og:title", content: "Evaluar prueba con rúbrica" },
      {
        property: "og:description",
        content: "Selecciona el nivel de logro por pregunta y obtén el resultado automáticamente.",
      },
    ],
  }),
  component: Evaluar,
});

function Evaluar() {
  const { pruebaId } = useParams({ from: "/pruebas/$pruebaId/evaluar" });
  const qc = useQueryClient();
  const prueba = useQuery(pruebaQuery(pruebaId));
  const preguntas = useQuery(preguntasQuery(pruebaId));
  const evaluaciones = useQuery(evaluacionesQuery(pruebaId));

  const [estudiante, setEstudiante] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [resultados, setResultados] = useState<Record<string, number>>({});

  const lista = preguntas.data ?? [];
  const maximo = lista.reduce((s, q) => s + q.puntaje, 0);
  const obtenido = lista.reduce((s, q) => s + (resultados[q.id] ?? 0), 0);
  const porcentaje = maximo > 0 ? Math.round((obtenido / maximo) * 1000) / 10 : 0;

  const guardar = async () => {
    if (!estudiante.trim()) {
      toast.error("Escribe el nombre del estudiante.");
      return;
    }
    await guardarEvaluacion({
      prueba_id: pruebaId,
      estudiante: estudiante.trim(),
      resultados,
      observaciones: observaciones.trim() || null,
      puntaje_obtenido: obtenido,
      puntaje_maximo: maximo,
      porcentaje,
    });
    qc.invalidateQueries({ queryKey: ["evaluaciones"] });
    toast.success("Evaluación guardada");
    setEstudiante("");
    setObservaciones("");
    setResultados({});
  };

  return (
    <AppShell seccion="Evaluar Prueba" titulo={prueba.data?.nombre ?? "Evaluación"}>
      <Panel className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <Label htmlFor="estudiante">Estudiante</Label>
          <Input
            id="estudiante"
            value={estudiante}
            onChange={(e) => setEstudiante(e.target.value)}
            placeholder="Nombre y apellido"
          />
        </div>
        <div className="self-end rounded-xl bg-accent/10 px-4 py-3 text-right ring-1 ring-inset ring-accent/20">
          <p className="font-display text-2xl font-semibold text-accent">
            {obtenido} / {maximo}
          </p>
          <p className="text-[11px] text-muted-foreground">{porcentaje}% de logro</p>
        </div>
      </Panel>

      <div className="space-y-4">
        {lista.map((q) => {
          const rubrica = q.rubrica?.length === 4 ? q.rubrica : rubricaPorDefecto(q.puntaje);
          return (
            <Panel key={q.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {q.orden}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{q.enunciado}</p>
                  <p className="text-[11px] text-muted-foreground">{q.puntaje} puntos</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {rubrica.map((n, i) => {
                  const activo = resultados[q.id] === n.puntaje && resultados[q.id] !== undefined;
                  return (
                    <button
                      key={i}
                      onClick={() => setResultados({ ...resultados, [q.id]: n.puntaje })}
                      className={`rounded-xl p-3 text-left ring-1 transition-colors ${
                        activo ? "bg-primary/10 ring-primary/40" : "bg-card/70 ring-border hover:ring-primary/20"
                      }`}
                    >
                      <p className="text-xs font-semibold">{NIVELES_RUBRICA[i] ?? n.nivel}</p>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {n.descripcion}
                      </p>
                      <p className="mt-2 text-xs font-medium text-primary">{n.puntaje} pts</p>
                    </button>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="mt-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">Resumen final</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">N°</th>
                <th className="pb-2 font-medium">Nivel de logro</th>
                <th className="pb-2 font-medium">Obtenido</th>
                <th className="pb-2 font-medium">Máximo</th>
                <th className="pb-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((q) => {
                const rubrica = q.rubrica?.length === 4 ? q.rubrica : rubricaPorDefecto(q.puntaje);
                const pts = resultados[q.id];
                const idx = rubrica.findIndex((n) => n.puntaje === pts);
                return (
                  <tr key={q.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2">{q.orden}</td>
                    <td className="py-2 text-muted-foreground">
                      {idx >= 0 ? (NIVELES_RUBRICA[idx] ?? rubrica[idx]!.nivel) : "Sin evaluar"}
                    </td>
                    <td className="py-2">{pts ?? 0}</td>
                    <td className="py-2">{q.puntaje}</td>
                    <td className="py-2">
                      {q.puntaje > 0 ? Math.round(((pts ?? 0) / q.puntaje) * 100) : 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Label htmlFor="obs">Observaciones del docente</Label>
          <Textarea
            id="obs"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Retroalimentación para el estudiante"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Total: <span className="font-medium">{obtenido}</span> de {maximo} ({porcentaje}%)
          </p>
          <Button onClick={guardar}>Guardar evaluación</Button>
        </div>
      </Panel>

      {(evaluaciones.data ?? []).length > 0 && (
        <Panel className="mt-4">
          <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Evaluaciones guardadas
          </h2>
          <ul className="space-y-2">
            {(evaluaciones.data ?? []).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-card/70 p-3 text-sm ring-1 ring-border"
              >
                <span className="font-medium">{e.estudiante}</span>
                <span className="text-muted-foreground">
                  {e.puntaje_obtenido}/{e.puntaje_maximo} · {e.porcentaje}%
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </AppShell>
  );
}
