export const dynamic = "force-dynamic";

import CalendarioAdmin from "@/components/CalendarioAdmin";
import { supabase } from "@/lib/supabase";

export default async function AdminDisponibilidadPage() {
  const { data: casas, error } = await supabase
    .from("casas")
    .select("id, nombre, slug")
    .eq("activa", true)
    .order("orden_home", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center text-red-600">
        Error al cargar las casas.
      </main>
    );
  }

  if (!casas || casas.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center text-stone-500">
        No hay casas activas cargadas.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-teal-600">
            Panel de admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            Gestión de disponibilidad
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Hacé click en los días para marcar o desmarcar disponibilidad. Los días en verde son visibles para los visitantes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {casas.map((casa) => (
            <CalendarioAdmin
              key={casa.id}
              casaId={casa.id}
              nombreCasa={casa.nombre}
            />
          ))}
        </div>
      </div>
    </main>
  );
}