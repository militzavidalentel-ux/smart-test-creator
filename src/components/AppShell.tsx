import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  FileStack,
  LayoutDashboard,
  ListChecks,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/cursos", label: "Mis Cursos", icon: BookOpen },
  { to: "/contenidos", label: "Contenidos", icon: FileStack },
  { to: "/generar", label: "Generar Prueba", icon: Sparkles },
  { to: "/pruebas", label: "Mis Pruebas", icon: ClipboardList },
  { to: "/rubricas", label: "Rúbricas", icon: ListChecks },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-secondary"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-primary/15",
          }}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="grid size-9 place-items-center rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground">
        R
      </div>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-semibold tracking-tight">Pruebas y Rúbricas</p>
        <p className="text-[11px] text-muted-foreground">Estudio docente</p>
      </div>
    </div>
  );
}

export function AppShell({
  titulo,
  seccion,
  acciones,
  children,
}: {
  titulo: string;
  seccion: string;
  acciones?: ReactNode;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-brand-soft/10 blur-3xl" />
        </div>

        <div className="relative flex">
          <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-border bg-card/55 px-4 py-6 backdrop-blur-xl md:flex">
            <div className="pb-6">
              <Marca />
            </div>
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Principal
            </p>
            <NavLinks />
            <div className="mt-auto rounded-xl bg-card/70 p-3 ring-1 ring-border">
              <p className="text-xs font-semibold">Flujo sugerido</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Contenidos → Configurar → IA → Revisar → Rúbrica → Evaluar → Resultados
              </p>
            </div>
          </aside>

          {abierto && (
            <div className="no-print fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-foreground/30" onClick={() => setAbierto(false)} />
              <div className="absolute left-0 top-0 flex h-full w-72 flex-col gap-1 bg-card px-4 py-6 shadow-xl">
                <div className="flex items-center justify-between pb-6">
                  <Marca />
                  <button aria-label="Cerrar menú" onClick={() => setAbierto(false)}>
                    <X className="size-5" />
                  </button>
                </div>
                <NavLinks onNavigate={() => setAbierto(false)} />
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <header className="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  className="mt-1 rounded-lg p-2 ring-1 ring-border md:hidden"
                  aria-label="Abrir menú"
                  onClick={() => setAbierto(true)}
                >
                  <Menu className="size-4" />
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {seccion}
                  </p>
                  <h1 className="mt-1 text-balance font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {titulo}
                  </h1>
                </div>
              </div>
              {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-card/60 p-5 ring-1 ring-border backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
