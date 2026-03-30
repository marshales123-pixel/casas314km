import GaleriaCasa from "@/components/GaleriaCasa";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";
import { supabase } from "@/lib/supabase";
import {
  Users,
  BedDouble,
  Bath,
  Bed,
  MapPin,
  MessageCircle,
  Map,
  Flame,
  Tag,
  Moon,
  Leaf,
  Sun,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrecio(
  precio: number | null,
  moneda: string | null | undefined
) {
  if (precio == null) return null;
  if (moneda === "USD") return `USD ${precio.toLocaleString("en-US")}`;
  return `$${precio.toLocaleString("es-AR")}`;
}

function calcularPromo(
  precio: number | null,
  promoActiva: boolean | null | undefined,
  promoDescuento: number | null | undefined,
  descuentoValor: number | null | undefined
) {
  if (precio == null) {
    return { original: null, final: null, tienePromo: false, porcentaje: null };
  }

  const porcentaje =
    promoActiva && promoDescuento != null && promoDescuento > 0
      ? promoDescuento
      : descuentoValor != null && descuentoValor > 0
        ? descuentoValor
        : null;

  if (!porcentaje) {
    return { original: precio, final: precio, tienePromo: false, porcentaje: null };
  }

  const final = Math.round(precio * (1 - porcentaje / 100));
  return { original: precio, final, tienePromo: true, porcentaje };
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CasaPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-stone-500">
        Slug inválido.
      </div>
    );
  }

  const { data: casa, error } = await supabase
    .from("casas")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !casa) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-stone-500">
        {error ? "Ocurrió un error al cargar la casa." : "Casa no encontrada."}
      </div>
    );
  }

  const { data: fotos } = await supabase
    .from("fotos")
    .select("*")
    .eq("casa_id", casa.id)
    .order("orden", { ascending: true });

  const precioPromo = calcularPromo(
    casa.precio_por_noche,
    casa.promo_activa,
    casa.promo_descuento,
    casa.descuento_valor
  );

  const precioOriginalFormateado = formatPrecio(precioPromo.original, casa.moneda_precio);
  const precioFinalFormateado = formatPrecio(precioPromo.final, casa.moneda_precio);

  const whatsappMessage = encodeURIComponent(
    `Hola, quiero consultar por la casa ${casa.nombre} en Km314.`
  );

  const stats = [
    { label: "Huéspedes", value: casa.capacidad, Icon: Users },
    { label: "Dormitorios", value: casa.dormitorios, Icon: BedDouble },
    { label: "Baños", value: casa.banos, Icon: Bath },
    { label: "Camas", value: casa.camas, Icon: Bed },
  ].filter((s) => s.value != null);

  const tieneCondiciones =
    casa.descuento_texto ||
    casa.descuento_valor != null ||
    casa.min_noches_baja != null ||
    casa.min_noches_alta != null ||
    casa.estadia_descuento != null ||
    casa.estadia_min_noches != null ||
    precioPromo.tienePromo;

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-stone-400">
          <a href="/casas" className="transition-colors hover:text-teal-600">
            Casas
          </a>
          <span>›</span>
          <span className="text-stone-700 font-medium">{casa.nombre}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Galería */}
          <div>
            <GaleriaCasa nombreCasa={casa.nombre} fotos={fotos ?? []} />
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl leading-tight">
              {casa.nombre}
            </h1>

            {/* Precio */}
            {precioFinalFormateado && (
              <div className="mt-5">
                {precioPromo.tienePromo && precioOriginalFormateado && (
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base text-stone-400 line-through">
                      {precioOriginalFormateado}
                    </span>
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      -{precioPromo.porcentaje}%
                    </span>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-teal-700 sm:text-4xl">
                    {precioFinalFormateado}
                  </span>
                  <span className="pb-1 text-sm text-stone-400">/ noche</span>
                </div>
                {precioPromo.tienePromo && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-700">
                    <Flame className="h-3.5 w-3.5" />
                    Promo activa
                  </div>
                )}
              </div>
            )}

            {/* Descripción */}
            <p className="mt-5 text-base leading-8 text-stone-600">
              {casa.descripcion ?? "Sin descripción disponible."}
            </p>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-stone-100 bg-stone-50 px-2 py-4 text-center"
                  >
                    <Icon className="h-5 w-5 text-teal-600" strokeWidth={1.75} />
                    <span className="text-lg font-bold text-stone-900">{value}</span>
                    <span className="text-xs text-stone-400">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Ubicación */}
            {casa.ubicacion && (
              <p className="mt-5 flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
                {casa.ubicacion}
              </p>
            )}

            {/* Tarifas y condiciones */}
            {tieneCondiciones && (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h2 className="text-base font-semibold text-stone-900">
                  Tarifas y condiciones
                </h2>
                <div className="mt-4 grid gap-3 text-sm text-stone-600">
                  {precioPromo.tienePromo && (
                    <div className="flex items-start gap-2.5">
                      <Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <span>
                        Promoción activa de{" "}
                        <strong>{precioPromo.porcentaje}%</strong> sobre la tarifa por noche.
                      </span>
                    </div>
                  )}
                  {casa.descuento_texto && (
                    <div className="flex items-start gap-2.5">
                      <Tag className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span>{casa.descuento_texto}</span>
                    </div>
                  )}
                  {!casa.descuento_texto &&
                    casa.descuento_valor != null &&
                    casa.descuento_valor > 0 && (
                      <div className="flex items-start gap-2.5">
                        <Tag className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                        <span>Descuento del {casa.descuento_valor}%</span>
                      </div>
                    )}
                  {casa.estadia_descuento != null &&
                    casa.estadia_descuento > 0 &&
                    casa.estadia_min_noches != null &&
                    casa.estadia_min_noches > 0 && (
                      <div className="flex items-start gap-2.5">
                        <Moon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        <span>
                          <strong>{casa.estadia_descuento}% de descuento</strong> por estadías
                          de{" "}
                          <strong>
                            {casa.estadia_min_noches}{" "}
                            {casa.estadia_min_noches === 1 ? "noche" : "noches"}
                          </strong>{" "}
                          o más.
                        </span>
                      </div>
                    )}
                  {casa.min_noches_baja != null && (
                    <div className="flex items-start gap-2.5">
                      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>
                        Mínimo fuera de temporada:{" "}
                        <strong>
                          {casa.min_noches_baja}{" "}
                          {casa.min_noches_baja === 1 ? "noche" : "noches"}
                        </strong>
                      </span>
                    </div>
                  )}
                  {casa.min_noches_alta != null && (
                    <div className="flex items-start gap-2.5">
                      <Sun className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span>
                        Mínimo en temporada:{" "}
                        <strong>
                          {casa.min_noches_alta}{" "}
                          {casa.min_noches_alta === 1 ? "noche" : "noches"}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {Array.isArray(casa.amenities) && casa.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-semibold text-stone-900">Comodidades</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {casa.amenities.map((item: string) => (
                    <span
                      key={item}
                      className="rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-xs font-medium text-teal-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Calendario */}
            <div className="mt-10">
              <h2 className="mb-4 text-base font-semibold text-stone-900">Disponibilidad</h2>
              <CalendarioDisponibilidad casaId={casa.id} nombreCasa={casa.nombre} />
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/5491167330060?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
              </a>

              {casa.google_maps_url && (
                <a
                  href={casa.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <Map className="h-4 w-4 text-stone-500" />
                  Ver en el mapa
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
