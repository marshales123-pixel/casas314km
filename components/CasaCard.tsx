import Link from "next/link";

type Foto = {
  id: string;
  casa_id: string;
  url: string;
  alt?: string | null;
  es_principal: boolean;
  orden: number;
};

type Casa = {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  capacidad?: number | null;
  ubicacion?: string | null;
  precio_por_noche?: number | null;
  dormitorios?: number | null;
  banos?: number | null;
  camas?: number | null;
  google_maps_url?: string | null;
  fotos?: Foto[];
};

export default function CasaCard({ casa }: { casa: Casa }) {
  const fotoPrincipal =
    casa.fotos?.find((f) => f.es_principal) ?? casa.fotos?.[0];

  return (
    <article className="group overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative overflow-hidden h-56">
        {fotoPrincipal?.url ? (
          <img
            src={fotoPrincipal.url}
            alt={fotoPrincipal.alt ?? casa.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400 text-sm">
            Sin imagen
          </div>
        )}

        {/* Price badge */}
        {casa.precio_por_noche && (
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-stone-900 shadow-sm">
            ${casa.precio_por_noche.toLocaleString("es-AR")}
            <span className="text-xs font-normal text-stone-500"> / noche</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-stone-900 leading-snug">
          {casa.nombre}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
          {casa.descripcion ?? "Sin descripción disponible."}
        </p>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-stone-600">
          {casa.capacidad && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {casa.capacidad} huéspedes
            </span>
          )}
          {casa.dormitorios && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM3 9h14v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
              </svg>
              {casa.dormitorios} dorm.
            </span>
          )}
          {casa.banos && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v8a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-1V3a1 1 0 00-1-1H5zm0 2h10v1H5V4zm0 3h10v7H5V7z" clipRule="evenodd" />
              </svg>
              {casa.banos} baños
            </span>
          )}
        </div>

        <Link
          href={`/casas/${casa.slug}`}
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
        >
          Ver casa
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
