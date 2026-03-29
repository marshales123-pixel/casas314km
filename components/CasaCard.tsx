import Link from "next/link";
import { Users, BedDouble, Bath, ArrowRight } from "lucide-react";

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
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60">
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {fotoPrincipal?.url ? (
          <img
            src={fotoPrincipal.url}
            alt={fotoPrincipal.alt ?? casa.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            Sin imagen
          </div>
        )}

        {promo.tienePromo && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            -{promo.porcentaje}%
          </div>
        )}

        {precioFinal && (
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 shadow backdrop-blur-sm">
            {promo.tienePromo && precioOriginal && (
              <div className="text-[11px] text-stone-400 line-through leading-none mb-0.5">
                {precioOriginal}
              </div>
            )}
            <div className="text-sm font-bold text-stone-900 leading-none">
              {precioFinal}
              <span className="text-xs font-normal text-stone-500"> / noche</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h2 className="text-base font-semibold leading-snug text-stone-900 group-hover:text-teal-700 transition-colors">
          {casa.nombre}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
          {casa.descripcion ?? "Sin descripción disponible."}
        </p>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {casa.capacidad && (
            <span className="flex items-center gap-1.5 text-xs text-stone-500">
              <Users className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              {casa.capacidad} huéspedes
            </span>
          )}
          {casa.dormitorios && (
            <span className="flex items-center gap-1.5 text-xs text-stone-500">
              <BedDouble className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              {casa.dormitorios} dorm.
            </span>
          )}
          {casa.banos && (
            <span className="flex items-center gap-1.5 text-xs text-stone-500">
              <Bath className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              {casa.banos} baños
            </span>
          )}
        </div>

        <Link
          href={`/casas/${casa.slug}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 hover:gap-3"
        >
          Ver casa
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
