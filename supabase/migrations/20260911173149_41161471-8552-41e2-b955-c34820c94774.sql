CREATE TABLE public.cursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  nivel text,
  asignatura text,
  anio integer,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.temas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  orden integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.contenidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid REFERENCES public.cursos(id) ON DELETE SET NULL,
  unidad_id uuid REFERENCES public.unidades(id) ON DELETE SET NULL,
  tema_id uuid REFERENCES public.temas(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  tipo text NOT NULL DEFAULT 'archivo',
  url text,
  storage_path text,
  texto text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.pruebas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  curso_id uuid REFERENCES public.cursos(id) ON DELETE SET NULL,
  unidad_id uuid REFERENCES public.unidades(id) ON DELETE SET NULL,
  tema_id uuid REFERENCES public.temas(id) ON DELETE SET NULL,
  establecimiento text,
  instrucciones text,
  estado text NOT NULL DEFAULT 'pendiente',
  contenido_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.preguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prueba_id uuid NOT NULL REFERENCES public.pruebas(id) ON DELETE CASCADE,
  orden integer NOT NULL DEFAULT 1,
  tipo text NOT NULL,
  enunciado text NOT NULL DEFAULT '',
  alternativas jsonb NOT NULL DEFAULT '[]'::jsonb,
  respuesta_correcta text,
  respuesta_esperada text,
  criterios text,
  puntaje integer NOT NULL DEFAULT 10,
  rubrica jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prueba_id uuid NOT NULL REFERENCES public.pruebas(id) ON DELETE CASCADE,
  estudiante text NOT NULL DEFAULT '',
  resultados jsonb NOT NULL DEFAULT '{}'::jsonb,
  observaciones text,
  puntaje_obtenido integer NOT NULL DEFAULT 0,
  puntaje_maximo integer NOT NULL DEFAULT 0,
  porcentaje numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursos, public.unidades, public.temas, public.contenidos, public.pruebas, public.preguntas, public.evaluaciones TO anon, authenticated;
GRANT ALL ON public.cursos, public.unidades, public.temas, public.contenidos, public.pruebas, public.preguntas, public.evaluaciones TO service_role;

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contenidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pruebas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso publico cursos" ON public.cursos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico unidades" ON public.unidades FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico temas" ON public.temas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico contenidos" ON public.contenidos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico pruebas" ON public.pruebas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico preguntas" ON public.preguntas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acceso publico evaluaciones" ON public.evaluaciones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
