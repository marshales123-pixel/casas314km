import FiltrosCasas from "@/components/FiltrosCasas";
import { getCasas } from "@/lib/getCasas";

export default async function CasasPage() {
  const casas = await getCasas();

  return (
    <main className="bg-white text-gray-800">
      {/* Header */}
      <section className="border-b border-stone-100 bg-stone-50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-600 font-medium">Km314</p>
          <h1 className="mt-2 text-4xl font-bold text-stone-900 sm:text-5xl">
            Casas disponibles
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-500">
            Descubrí las propiedades disponibles dentro del barrio y elegí la opción ideal para tu próxima estadía.
          </p>
        </div>
      </section>

      {/* Filtros + Grid */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {casas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-2xl">🏡</p>
            <p className="mt-3 text-stone-500">No hay casas cargadas por el momento.</p>
          </div>
        ) : (
          <FiltrosCasas casas={casas} />
        )}
      </section>
    </main>
  );
}
