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
  moneda_precio?: string | null;
  descuento_valor?: number | null;
  promo_activa?: boolean | null;
  promo_descuento?: number | null;
  dormitorios?: number | null;
  banos?: number | null;
  camas?: number | null;
  google_maps_url?: string | null;
  fotos?: Foto[];
};

function formatPrecio(precio?: number | null, moneda?: string | null) {
  if (precio == null) return null;

  if (moneda === "USD") {
    return `USD ${precio.toLocaleString("en-US")}`;
  }

  return `$${precio.toLocaleString("es-AR")}`;
}

function calcularPromo(
  precio?: number | null,
  promoActiva?: boolean | null,
  promoDescuento?: number | null,
  descuentoValor?: number | null
) {
  if (precio == null) {
    return {
      original: null,
      final: null,
      tienePromo: false,
      porcentaje: null,
    };
  }

  const porcentaje =
    promoActiva && promoDescuento != null && promoDescuento > 0
      ? promoDescuento
      : descuentoValor != null && descuentoValor > 0
        ? descuentoValor
        : null;

  if (!porcentaje) {
    return {
      original: precio,
      final: precio,
      tienePromo: false,
      porcentaje: null,
    };
  }

  const final = Math.round(precio * (1 - porcentaje / 100));

  return {
    original: precio,
    final,
    tienePromo: true,
    porcentaje,
  };
}

export default function CasaCard({ casa }: { casa: Casa }) {
  const fotoPrincipal =
    casa.fotos?.find((f) => f.es_principal) ?? casa.fotos?.[0];

  const promo = calcularPromo(
    casa.precio_por_noche,
    casa.promo_activa,
    casa.promo_descuento,
    casa.descuento_valor
  );

  const precioOriginal = formatPrecio(promo.original, casa.moneda_precio);
  const precioFinal = formatPrecio(promo.final, casa.moneda_precio);

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-56 overflow-hidden">
        {fotoPrincipal?.url ? (
          <img
            src={fotoPrincipal.url}
            alt={fotoPrincipal.alt ?? casa.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100 text-sm text-stone-400">
            Sin imagen
          </div>
        )}

        {promo.tienePromo && (
          <div className="absolute right-3 top-3 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 shadow-sm">
            -{promo.porcentaje}%
          </div>
        )}

        {precioFinal && (
          <div className="absolute bottom-3 left-3 rounded-2xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
            {promo.tienePromo && precioOriginal && (
              <div className="text-xs text-stone-400 line-through">
                {precioOriginal}
              </div>
            )}

            <div className="text-sm font-semibold text-stone-900">
              {precioFinal}
              <span className="text-xs font-normal text-stone-500">
                {" "}
                / noche
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-lg leading-snug font-semibold text-stone-900">
          {casa.nombre}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
          {casa.descripcion ?? "Sin descripción disponible."}
        </p>

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
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v8a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-1V3a1 1 0 00-1-1H5zm0 2h10v1H5V4zm0 3h10v7H5V7z"
                  clipRule="evenodd"
                />
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
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}