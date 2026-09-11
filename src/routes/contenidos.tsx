import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  actualizarContenido,
  contenidosQuery,
  crearContenido,
  cursosQuery,
  eliminarContenido,
  subirArchivo,
  temasQuery,
  unidadesQuery,
  urlFirmada,
} from "@/lib/datos";
import type { Contenido } from "@/lib/tipos";

export const Route = createFileRoute("/contenidos")({
  head: () => ({
    meta: [
      { title: "Contenidos | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Sube PDF, Word e imágenes o agrega enlaces externos y asócialos a un curso, unidad y tema.",
      },
      { property: "og:title", content: "Contenidos | Generador de Pruebas y Rúbricas" },
      {
        property: "og:description",
        content: "Biblioteca de materiales fuente para generar pruebas con IA.",
      },
    ],
  }),
  component: Contenidos,
});

function tipoDeArchivo(nombre: string) {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "imagen";
  return "archivo";
}

const ETIQUETA: Record<string, string> = {
  pdf: "PDF",
  word: "Word",
  imagen: "Imagen",
  enlace: "Enlace",
  texto: "Texto",
  archivo: "Archivo",
};

function Contenidos() {
  const qc = useQueryClient();
  const contenidos = useQuery(contenidosQuery);
  const cursos = useQuery(cursosQuery);
  const unidades = useQuery(unidadesQuery);
  const temas = useQuery(temasQuery);

  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<"archivo" | "enlace" | "texto">("archivo");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [temaId, setTemaId] = useState("");

  const refrescar = () => qc.invalidateQueries({ queryKey: ["contenidos"] });

  const guardar = useMutation({
    mutationFn: async () => {
      const base = {
        curso_id: cursoId || null,
        unidad_id: unidadId || null,
        tema_id: temaId || null,
      };
      if (modo === "archivo") {
        if (!archivo) throw new Error("Selecciona un archivo.");
        const path = await subirArchivo(archivo);
        return crearContenido({
          ...base,
          nombre: nombre.trim() || archivo.name,
          tipo: tipoDeArchivo(archivo.name),
          storage_path: path,
        });
      }
      if (modo === "enlace") {
        if (!url.trim()) throw new Error("Escribe la dirección del enlace.");
        return crearContenido({
          ...base,
          nombre: nombre.trim() || url.trim(),
          tipo: "enlace",
          url: url.trim(),
        });
      }
      if (!texto.trim()) throw new Error("Escribe o pega el texto del contenido.");
      return crearContenido({
        ...base,
        nombre: nombre.trim() || "Apunte sin título",
        tipo: "texto",
        texto: texto.trim(),
      });
    },
    onSuccess: () => {
      toast.success("Contenido guardado");
      setAbierto(false);
      setArchivo(null);
      setNombre("");
      setUrl("");
      setTexto("");
      refrescar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirRecurso = async (c: Contenido) => {
    if (c.url) {
      window.open(c.url, "_blank", "noopener");
      return;
    }
    if (c.storage_path) {
      const firmada = await urlFirmada(c.storage_path);
      if (firmada) window.open(firmada, "_blank", "noopener");
      else toast.error("No se pudo abrir el archivo.");
      return;
    }
    toast.info(c.texto ?? "Sin vista previa disponible.");
  };

  const us = (unidades.data ?? []).filter((u) => !cursoId || u.curso_id === cursoId);
  const ts = (temas.data ?? []).filter((t) => !unidadId || t.unidad_id === unidadId);

  const nombreCurso = (id: string | null) =>
    (cursos.data ?? []).find((c) => c.id === id)?.nombre ?? "—";

  return (
    <AppShell
      seccion="Contenidos"
      titulo="Biblioteca de materiales"
      acciones={
        <Dialog open={abierto} onOpenChange={setAbierto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> Cargar contenido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo contenido</DialogTitle>
            </DialogHeader>

            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {(["archivo", "enlace", "texto"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                    modo === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {modo === "archivo" && (
                <div>
                  <Label htmlFor="archivo">Archivo (PDF, Word o imagen)</Label>
                  <Input
                    id="archivo"
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  />
                </div>
              )}
              {modo === "enlace" && (
                <div>
                  <Label htmlFor="url">Enlace externo</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              {modo === "texto" && (
                <div>
                  <Label htmlFor="texto">Texto del contenido</Label>
                  <Textarea
                    id="texto"
                    rows={6}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Pega aquí el material de estudio"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="nombreRecurso">Nombre visible</Label>
                <Input
                  id="nombreRecurso"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Guía Unidad 1"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
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
                    }}
                  >
                    <option value="">Sin curso</option>
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
                    <option value="">Sin unidad</option>
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
                    <option value="">Sin tema</option>
                    {ts.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
                {guardar.isPending ? "Guardando..." : "Guardar contenido"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Panel className="overflow-x-auto">
        {(contenidos.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay contenidos cargados. Sube un PDF, Word, imagen o agrega un enlace.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Recurso</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium">Curso</th>
                <th className="pb-2 font-medium">Cargado</th>
                <th className="pb-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(contenidos.data ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-3">
                    <input
                      className="w-full bg-transparent font-medium outline-none focus:underline"
                      defaultValue={c.nombre}
                      onBlur={async (e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.nombre) {
                          await actualizarContenido(c.id, { nombre: v });
                          refrescar();
                          toast.success("Nombre actualizado");
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                      {ETIQUETA[c.tipo] ?? c.tipo}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{nombreCurso(c.curso_id)}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("es-CL")}
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => abrirRecurso(c)}>
                      <ExternalLink className="size-3.5" /> Ver
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Eliminar contenido"
                      onClick={async () => {
                        await eliminarContenido(c);
                        refrescar();
                        toast.success("Contenido eliminado");
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </AppShell>
  );
}
