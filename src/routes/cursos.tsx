import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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
  actualizarCurso,
  crearCurso,
  crearTema,
  crearUnidad,
  cursosQuery,
  eliminarCurso,
  eliminarTema,
  eliminarUnidad,
  temasQuery,
  unidadesQuery,
} from "@/lib/datos";
import type { Curso } from "@/lib/tipos";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Mis Cursos | Generador de Pruebas y Rúbricas" },
      {
        name: "description",
        content:
          "Crea y administra cursos con nivel, asignatura, año y descripción, y organiza sus unidades y temas.",
      },
      { property: "og:title", content: "Mis Cursos | Generador de Pruebas y Rúbricas" },
      {
        property: "og:description",
        content: "Administra cursos, unidades y temas de tus evaluaciones.",
      },
    ],
  }),
  component: Cursos,
});

const vacio = { nombre: "", nivel: "", asignatura: "", anio: String(new Date().getFullYear()), descripcion: "" };

function Cursos() {
  const qc = useQueryClient();
  const cursos = useQuery(cursosQuery);
  const unidades = useQuery(unidadesQuery);
  const temas = useQuery(temasQuery);

  const [form, setForm] = useState(vacio);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [nuevaUnidad, setNuevaUnidad] = useState("");
  const [nuevoTema, setNuevoTema] = useState<Record<string, string>>({});

  const refrescar = () => {
    qc.invalidateQueries({ queryKey: ["cursos"] });
    qc.invalidateQueries({ queryKey: ["unidades"] });
    qc.invalidateQueries({ queryKey: ["temas"] });
  };

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre: form.nombre.trim(),
        nivel: form.nivel.trim() || null,
        asignatura: form.asignatura.trim() || null,
        anio: form.anio ? Number(form.anio) : null,
        descripcion: form.descripcion.trim() || null,
      };
      if (!payload.nombre) throw new Error("El nombre del curso es obligatorio.");
      if (editando) return actualizarCurso(editando.id, payload);
      return crearCurso(payload);
    },
    onSuccess: () => {
      toast.success(editando ? "Curso actualizado" : "Curso creado");
      setAbierto(false);
      setForm(vacio);
      setEditando(null);
      refrescar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const borrar = useMutation({
    mutationFn: eliminarCurso,
    onSuccess: () => {
      toast.success("Curso eliminado");
      refrescar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirNuevo = () => {
    setEditando(null);
    setForm(vacio);
    setAbierto(true);
  };

  const abrirEditar = (c: Curso) => {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      nivel: c.nivel ?? "",
      asignatura: c.asignatura ?? "",
      anio: c.anio ? String(c.anio) : "",
      descripcion: c.descripcion ?? "",
    });
    setAbierto(true);
  };

  return (
    <AppShell
      seccion="Mis Cursos"
      titulo="Cursos y planificación"
      acciones={
        <Dialog open={abierto} onOpenChange={setAbierto}>
          <DialogTrigger asChild>
            <Button onClick={abrirNuevo}>
              <Plus className="size-4" /> Nuevo curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editando ? "Editar curso" : "Crear curso"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nombre">Nombre del curso</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="8° Básico A"
                />
              </div>
              <div>
                <Label htmlFor="nivel">Nivel</Label>
                <Input
                  id="nivel"
                  value={form.nivel}
                  onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                  placeholder="8° Básico"
                />
              </div>
              <div>
                <Label htmlFor="asignatura">Asignatura</Label>
                <Input
                  id="asignatura"
                  value={form.asignatura}
                  onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
                  placeholder="Ciencias Naturales"
                />
              </div>
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Objetivos generales del curso"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
                {guardar.isPending ? "Guardando..." : "Guardar curso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {cursos.data && cursos.data.length === 0 && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Todavía no tienes cursos. Crea el primero para organizar tus unidades, temas y contenidos.
          </p>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {(cursos.data ?? []).map((c) => {
          const us = (unidades.data ?? []).filter((u) => u.curso_id === c.id);
          const abiertoCurso = expandido === c.id;
          return (
            <Panel key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-semibold tracking-tight">
                    {c.nombre}
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {[c.nivel, c.asignatura, c.anio].filter(Boolean).join(" · ") || "Sin detalles"}
                  </p>
                  {c.descripcion && (
                    <p className="mt-2 text-sm text-muted-foreground">{c.descripcion}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => abrirEditar(c)}>
                    Editar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Eliminar curso"
                    onClick={() => borrar.mutate(c.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <button
                className="mt-4 flex items-center gap-1 text-xs font-medium text-primary"
                onClick={() => setExpandido(abiertoCurso ? null : c.id)}
              >
                {abiertoCurso ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                {us.length} unidad(es)
              </button>

              {abiertoCurso && (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  {us.map((u) => {
                    const ts = (temas.data ?? []).filter((t) => t.unidad_id === u.id);
                    return (
                      <div key={u.id} className="rounded-xl bg-card/70 p-3 ring-1 ring-border">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{u.nombre}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Eliminar unidad"
                            onClick={async () => {
                              await eliminarUnidad(u.id);
                              refrescar();
                            }}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {ts.map((t) => (
                            <li key={t.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">· {t.nombre}</span>
                              <button
                                className="text-destructive"
                                onClick={async () => {
                                  await eliminarTema(t.id);
                                  refrescar();
                                }}
                              >
                                Quitar
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex gap-2">
                          <Input
                            className="h-8 text-xs"
                            placeholder="Nuevo tema"
                            value={nuevoTema[u.id] ?? ""}
                            onChange={(e) => setNuevoTema({ ...nuevoTema, [u.id]: e.target.value })}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const nombre = (nuevoTema[u.id] ?? "").trim();
                              if (!nombre) return;
                              await crearTema({ unidad_id: u.id, nombre, orden: ts.length + 1 });
                              setNuevoTema({ ...nuevoTema, [u.id]: "" });
                              refrescar();
                            }}
                          >
                            Añadir
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-2">
                    <Input
                      className="h-9"
                      placeholder="Nueva unidad"
                      value={nuevaUnidad}
                      onChange={(e) => setNuevaUnidad(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const nombre = nuevaUnidad.trim();
                        if (!nombre) return;
                        await crearUnidad({ curso_id: c.id, nombre, orden: us.length + 1 });
                        setNuevaUnidad("");
                        refrescar();
                      }}
                    >
                      Añadir unidad
                    </Button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}
