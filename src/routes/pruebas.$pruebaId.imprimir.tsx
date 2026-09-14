import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cursosQuery, preguntasQuery, pruebaQuery, temasQuery, unidadesQuery } from "@/lib/datos";
import { NIVELES_RUBRICA, rubricaPorDefecto } from "@/lib/tipos";

export const Route = createFileRoute("/pruebas/$pruebaId/imprimir")({
  validateSearch: (search: Record<string, unknown>) => ({
    rubrica: search["rubrica"] === true || search["rubrica"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Exportar prueba | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Versión imprimible de la prueba con encabezado del establecimiento, instrucciones y espacio de respuestas.",
      },
      { property: "og:title", content: "Exportar prueba" },
      { property: "og:description", content: "Formato profesional listo para imprimir." },
    ],
  }),
  component: Imprimir,
});

function Imprimir() {
  const { pruebaId } = useParams({ from: "/pruebas/$pruebaId/imprimir" });
  const { rubrica: conRubrica } = useSearch({ from: "/pruebas/$pruebaId/imprimir" });
  const prueba = useQuery(pruebaQuery(pruebaId));
  const preguntas = useQuery(preguntasQuery(pruebaId));
  const cursos = useQuery(cursosQuery);
  const unidades = useQuery(unidadesQuery);
  const temas = useQuery(temasQuery);

  const p = prueba.data;
  const lista = preguntas.data ?? [];
  const total = lista.reduce((s, q) => s + q.puntaje, 0);
  const curso = (cursos.data ?? []).find((c) => c.id === p?.curso_id);
  const unidad = (unidades.data ?? []).find((u) => u.id === p?.unidad_id);
  const tema = (temas.data ?? []).find((t) => t.id === p?.tema_id);

  return (
    <div className="min-h-screen bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] justify-end gap-2 px-4">
        <Button
          onClick={() => {
            document.title = `${p?.nombre ?? "Prueba"}${conRubrica ? " + Rúbrica" : ""}`;
            window.print();
          }}
        >
          <Printer className="size-4" /> Imprimir o guardar PDF
        </Button>
      </div>

      <article className="print-page mx-auto max-w-[820px] bg-white px-10 py-10 text-[13px] leading-relaxed text-black shadow-sm print:max-w-none print:px-0 print:shadow-none">
        <header className="border-b-2 border-black pb-3">
          <p className="text-center text-base font-semibold uppercase tracking-wide">
            {p?.establecimiento || "Establecimiento educacional"}
          </p>
          <p className="mt-1 text-center text-sm">{p?.nombre}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[12px]">
            <p>Asignatura: {curso?.asignatura ?? "________________"}</p>
            <p>Curso: {curso?.nombre ?? "________________"}</p>
            <p>Unidad: {unidad?.nombre ?? "________________"}</p>
            <p>Tema: {tema?.nombre ?? "________________"}</p>
            <p>Fecha: ____ / ____ / ______</p>
            <p>Puntaje total: {total} puntos</p>
            <p className="col-span-2">Nombre del estudiante: ______________________________________</p>
          </div>
        </header>

        {p?.instrucciones && (
          <section className="mt-4">
            <p className="font-semibold">Instrucciones</p>
            <p>{p.instrucciones}</p>
          </section>
        )}

        <section className="mt-5 space-y-5">
          {lista.map((q) => (
            <div key={q.id} className="break-inside-avoid">
              <p className="font-medium">
                {q.orden}. {q.enunciado}{" "}
                <span className="font-normal">({q.puntaje} pts)</span>
              </p>
              {q.tipo === "alternativas" && (
                <ul className="mt-1 space-y-0.5 pl-5">
                  {(q.alternativas ?? []).map((a) => (
                    <li key={a.letra}>
                      {a.letra}) {a.texto}
                    </li>
                  ))}
                </ul>
              )}
              {q.tipo === "vf" && <p className="mt-1 pl-5">V ____ F ____</p>}
              {q.tipo === "desarrollo" && (
                <div className="mt-2 space-y-4 pl-1">
                  <div className="border-b border-dotted border-black/60" />
                  <div className="border-b border-dotted border-black/60" />
                  <div className="border-b border-dotted border-black/60" />
                  <div className="border-b border-dotted border-black/60" />
                </div>
              )}
            </div>
          ))}
        </section>

        {conRubrica && (
          <section className="mt-8 break-before-page">
            <h2 className="border-b-2 border-black pb-2 text-center text-base font-semibold uppercase">
              Rúbrica de evaluación
            </h2>
            <div className="mt-4 space-y-5">
              {lista.map((q) => {
                const r = q.rubrica?.length === 4 ? q.rubrica : rubricaPorDefecto(q.puntaje);
                return (
                  <div key={q.id} className="break-inside-avoid">
                    <p className="font-medium">
                      {q.orden}. {q.enunciado} ({q.puntaje} pts)
                    </p>
                    <table className="mt-1 w-full border border-black text-[11px]">
                      <thead>
                        <tr>
                          <th className="w-40 border border-black p-1 text-left">Nivel</th>
                          <th className="border border-black p-1 text-left">Descripción</th>
                          <th className="w-16 border border-black p-1 text-left">Puntaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.map((n, i) => (
                          <tr key={i}>
                            <td className="border border-black p-1">{NIVELES_RUBRICA[i] ?? n.nivel}</td>
                            <td className="border border-black p-1">{n.descripcion}</td>
                            <td className="border border-black p-1">{n.puntaje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
