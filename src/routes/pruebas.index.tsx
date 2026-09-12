import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  cursosQuery,
  duplicarPrueba,
  eliminarPrueba,
  pruebasQuery,
  todasPreguntasQuery,
} from "@/lib/datos";

export const Route = createFileRoute("/pruebas/")({
  head: () => ({
    meta: [
      { title: "Mis Pruebas | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content: "Biblioteca de pruebas guardadas: editar, duplicar, evaluar, imprimir y exportar.",
      },
      { property: "og:title", content: "Mis Pruebas" },
      {
        property: "og:description",
        content: "Todas tus evaluaciones con preguntas, puntajes y rúbricas guardadas.",
      },
    ],
  }),
  component: Pruebas,
});

function Pruebas() {
  const qc = useQueryClient();
  const pruebas = useQuery(pruebasQuery);
  const preguntas = useQuery(todasPreguntasQuery);
  const cursos = useQuery(cursosQuery);

  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["pruebas"] });
    qc.invalidateQueries({ queryKey: ["preguntas"] });
  };

  const deLaPrueba = (id: string) => (preguntas.data ?? []).filter((q) => q.prueba_id === id);

  return (
    <AppShell
      seccion="Mis Pruebas"
      titulo="Biblioteca de evaluaciones"
      acciones={
        <Button asChild>
          <Link to="/generar">Nueva prueba</Link>
        </Button>
      }
    >
      {(pruebas.data ?? []).length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Aún no tienes pruebas guardadas. Usa el asistente para crear la primera.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(pruebas.data ?? []).map((p) => {
            const qs = deLaPrueba(p.id);
            const total = qs.reduce((s, q) => s + q.puntaje, 0);
            const curso = (cursos.data ?? []).find((c) => c.id === p.curso_id);
            return (
              <Panel key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold tracking-tight">
                      {p.nombre}
                    </h2>
                    <p className="text-[12px] text-muted-foreground">
                      {curso?.nombre ?? "Sin curso"} · {qs.length} preguntas · {total} pts
                    </p>
                  </div>
                  <span
                    className={
                      p.estado === "revisada"
                        ? "shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                        : "shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent"
                    }
                  >
                    {p.estado === "revisada" ? "Revisada" : "Por revisar"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to="/pruebas/$pruebaId" params={{ pruebaId: p.id }}>
                      <Pencil className="size-3.5" /> Revisar y editar
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/pruebas/$pruebaId/evaluar" params={{ pruebaId: p.id }}>
                      Evaluar
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/pruebas/$pruebaId/imprimir"
                      params={{ pruebaId: p.id }}
                      search={{ rubrica: false }}
                    >
                      <Printer className="size-3.5" /> Exportar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await duplicarPrueba(p, qs);
                      refrescar();
                      toast.success("Prueba duplicada");
                    }}
                  >
                    <Copy className="size-3.5" /> Duplicar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Eliminar prueba"
                    onClick={async () => {
                      await eliminarPrueba(p.id);
                      refrescar();
                      toast.success("Prueba eliminada");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
