import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { pruebasQuery, todasPreguntasQuery } from "@/lib/datos";
import { NIVELES_RUBRICA, rubricaPorDefecto } from "@/lib/tipos";

export const Route = createFileRoute("/rubricas")({
  head: () => ({
    meta: [
      { title: "Rúbricas | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Consulta las rúbricas de cuatro niveles de cada pregunta: No logrado, Logrado parcialmente, Logrado en gran parte y Totalmente logrado.",
      },
      { property: "og:title", content: "Rúbricas de evaluación" },
      {
        property: "og:description",
        content: "Todas las rúbricas por pregunta, con descriptores y puntajes.",
      },
    ],
  }),
  component: Rubricas,
});

function Rubricas() {
  const pruebas = useQuery(pruebasQuery);
  const preguntas = useQuery(todasPreguntasQuery);

  return (
    <AppShell seccion="Rúbricas" titulo="Criterios de evaluación">
      {(pruebas.data ?? []).length === 0 && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Las rúbricas aparecerán aquí cuando generes tu primera prueba.
          </p>
        </Panel>
      )}

      <div className="space-y-4">
        {(pruebas.data ?? []).map((p) => {
          const qs = (preguntas.data ?? []).filter((q) => q.prueba_id === p.id);
          if (qs.length === 0) return null;
          return (
            <Panel key={p.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold tracking-tight">{p.nombre}</h2>
                <Button size="sm" variant="outline" asChild>
                  <Link
                    to="/pruebas/$pruebaId/imprimir"
                    params={{ pruebaId: p.id }}
                    search={{ rubrica: true }}
                  >
                    <Printer className="size-3.5" /> Exportar rúbrica
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {qs.map((q) => {
                  const r = q.rubrica?.length === 4 ? q.rubrica : rubricaPorDefecto(q.puntaje);
                  return (
                    <div key={q.id} className="rounded-xl bg-card/70 p-3 ring-1 ring-border">
                      <p className="text-sm font-medium">
                        {q.orden}. {q.enunciado}{" "}
                        <span className="text-muted-foreground">({q.puntaje} pts)</span>
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {r.map((n, i) => (
                          <div key={i} className="rounded-lg bg-background/60 p-2 ring-1 ring-border">
                            <p className="text-[11px] font-semibold">{NIVELES_RUBRICA[i] ?? n.nivel}</p>
                            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                              {n.descripcion}
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-primary">{n.puntaje} pts</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}
