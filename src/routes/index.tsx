import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileStack, Sparkles } from "lucide-react";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { contenidosQuery, cursosQuery, pruebasQuery, todasPreguntasQuery } from "@/lib/datos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panel del docente | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Resumen de cursos, contenidos y pruebas. Crea evaluaciones con IA y rúbricas de cuatro niveles en minutos.",
      },
      { property: "og:title", content: "Panel del docente | Generador de Pruebas y Rúbricas" },
      {
        property: "og:description",
        content: "Gestiona cursos y contenidos, genera pruebas con IA y evalúa con rúbricas.",
      },
    ],
  }),
  component: Inicio,
});

function Tarjeta({
  etiqueta,
  valor,
  pie,
  destacada,
}: {
  etiqueta: string;
  valor: number;
  pie: string;
  destacada?: boolean;
}) {
  return (
    <div
      className={
        destacada
          ? "rounded-2xl bg-accent/10 p-4 ring-1 ring-inset ring-accent/20 backdrop-blur-xl"
          : "rounded-2xl bg-card/60 p-4 ring-1 ring-border backdrop-blur-xl"
      }
    >
      <p className={`text-xs ${destacada ? "text-accent" : "text-muted-foreground"}`}>{etiqueta}</p>
      <p
        className={`mt-2 font-display text-3xl font-semibold tracking-tight ${destacada ? "text-accent" : ""}`}
      >
        {valor}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{pie}</p>
    </div>
  );
}

function Inicio() {
  const cursos = useQuery(cursosQuery);
  const contenidos = useQuery(contenidosQuery);
  const pruebas = useQuery(pruebasQuery);
  const preguntas = useQuery(todasPreguntasQuery);

  const listaPruebas = pruebas.data ?? [];
  const pendientes = listaPruebas.filter((p) => p.estado !== "revisada").length;

  const puntajeDe = (pruebaId: string) =>
    (preguntas.data ?? []).filter((q) => q.prueba_id === pruebaId).reduce((s, q) => s + q.puntaje, 0);
  const cantidadDe = (pruebaId: string) =>
    (preguntas.data ?? []).filter((q) => q.prueba_id === pruebaId).length;

  return (
    <AppShell
      seccion="Inicio · Panel de control"
      titulo="Resumen del aula"
      acciones={
        <>
          <Button variant="outline" asChild>
            <Link to="/contenidos">Cargar contenido</Link>
          </Button>
          <Button asChild>
            <Link to="/generar">Generar prueba</Link>
          </Button>
        </>
      }
    >
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta etiqueta="Cursos" valor={cursos.data?.length ?? 0} pie="Cursos registrados" />
        <Tarjeta
          etiqueta="Contenidos"
          valor={contenidos.data?.length ?? 0}
          pie="PDF, Word, imágenes y enlaces"
        />
        <Tarjeta etiqueta="Pruebas creadas" valor={listaPruebas.length} pie="Total en tu biblioteca" />
        <Tarjeta
          etiqueta="Por revisar"
          valor={pendientes}
          pie="Requieren tu revisión"
          destacada
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Últimas pruebas</h2>
            <Link to="/pruebas" className="text-xs font-medium text-primary">
              Ver todas
            </Link>
          </div>
          {listaPruebas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has creado pruebas. Comienza cargando un contenido y usa el asistente.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {listaPruebas.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to="/pruebas/$pruebaId"
                  params={{ pruebaId: p.id }}
                  className="flex items-center gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-border transition-colors hover:ring-primary/30"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {p.nombre.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.nombre}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {cantidadDe(p.id)} preguntas · {puntajeDe(p.id)} pts
                    </p>
                  </div>
                  <span
                    className={
                      p.estado === "revisada"
                        ? "shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                        : "shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent"
                    }
                  >
                    {p.estado === "revisada" ? "Lista" : "Por revisar"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Accesos rápidos</h2>
          <div className="flex flex-col gap-2">
            <Link
              to="/cursos"
              className="flex items-center gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-border hover:ring-primary/30"
            >
              <BookOpen className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Crear curso</p>
                <p className="text-[11px] text-muted-foreground">Nivel, asignatura, año y unidades</p>
              </div>
            </Link>
            <Link
              to="/contenidos"
              className="flex items-center gap-3 rounded-xl bg-card/70 p-3 ring-1 ring-border hover:ring-primary/30"
            >
              <FileStack className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Cargar contenido</p>
                <p className="text-[11px] text-muted-foreground">PDF, Word, imágenes o enlaces</p>
              </div>
            </Link>
            <Link
              to="/generar"
              className="flex items-center gap-3 rounded-xl bg-accent/10 p-3 ring-1 ring-inset ring-accent/20 hover:ring-accent/40"
            >
              <Sparkles className="size-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Generar prueba</p>
                <p className="text-[11px] text-muted-foreground">Asistente paso a paso con IA</p>
              </div>
            </Link>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
