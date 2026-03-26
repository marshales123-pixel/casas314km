import GaleriaCasa from "@/components/GaleriaCasa";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatPrecio(
  precio: number | null,
  moneda: string | null | undefined
) {
  if (precio == null) return null;

  if (moneda === "USD") {
    return `USD ${precio.toLocaleString("en-US")}`;
  }

  return `$${precio.toLocaleString("es-AR")}`;
}

function calcularPromo(
  precio: number | null,
  promoActiva: boolean | null | undefined,
  promoDescuento: number | null | undefined,
  descuentoValor: number | null | undefined
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

  const precioOriginalFormateado = formatPrecio(
    precioPromo.original,
    casa.moneda_precio
  );

  const precioFinalFormateado = formatPrecio(
    precioPromo.final,
    casa.moneda_precio
  );

  const whatsappMessage = encodeURIComponent(
    `Hola, quiero consultar por la casa ${casa.nombre} en Km314.`
  );

  const stats = [
    { label: "Huéspedes", value: casa.capacidad, icon: "👥" },
    { label: "Dormitorios", value: casa.dormitorios, icon: "🛏" },
    { label: "Baños", value: casa.banos, icon: "🛁" },
    { label: "Camas", value: casa.camas, icon: "🛌" },
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
        <nav className="mb-6 text-sm text-stone-400">
          <a href="/casas" className="transition-colors hover:text-teal-600">
            Casas
          </a>
          <span className="mx-2">›</span>
          <span className="text-stone-700">{casa.nombre}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <GaleriaCasa nombreCasa={casa.nombre} fotos={fotos ?? []} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl lg:text-5xl">
              {casa.nombre}
            </h1>

            {precioFinalFormateado && (
              <div className="mt-4">
                {precioPromo.tienePromo && precioOriginalFormateado && (
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-base text-stone-400 line-through">
                      {precioOriginalFormateado}
                    </span>
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      -{precioPromo.porcentaje}%
                    </span>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-teal-700 sm:text-3xl">
                    {precioFinalFormateado}
                  </span>
                  <span className="pb-1 text-sm text-stone-500">/ noche</span>
                </div>

                {precioPromo.tienePromo && (
                  <div className="mt-2 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                    Promo activa
                  </div>
                )}
              </div>
            )}

            <p className="mt-5 text-base leading-8 text-stone-600">
              {casa.descripcion ?? "Sin descripción disponible."}
            </p>

            {stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-stone-100 bg-stone-50 px-2 py-4 text-center"
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-lg font-semibold text-stone-900">
                      {value}
                    </span>
                    <span className="text-xs text-stone-400">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {casa.ubicacion && (
              <p className="mt-5 flex items-center gap-1.5 text-sm text-stone-500">
                <svg
                  className="h-4 w-4 shrink-0 text-teal-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {casa.ubicacion}
              </p>
            )}

            {tieneCondiciones && (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h2 className="text-base font-semibold text-stone-900">
                  Tarifas y condiciones
                </h2>

                <div className="mt-4 grid gap-3 text-sm text-stone-600">
                  {precioPromo.tienePromo && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">🔥</span>
                      <span>
                        Promoción activa de{" "}
                        <strong>{precioPromo.porcentaje}%</strong> sobre la tarifa
                        por noche.
                      </span>
                    </div>
                  )}

                  {casa.descuento_texto && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">🏷️</span>
                      <span>{casa.descuento_texto}</span>
                    </div>
                  )}

                  {!casa.descuento_texto &&
                    casa.descuento_valor != null &&
                    casa.descuento_valor > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">🏷️</span>
                        <span>Descuento del {casa.descuento_valor}%</span>
                      </div>
                    )}

                  {casa.estadia_descuento != null &&
                    casa.estadia_descuento > 0 &&
                    casa.estadia_min_noches != null &&
                    casa.estadia_min_noches > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">🌙</span>
                        <span>
                          <strong>{casa.estadia_descuento}% de descuento</strong>{" "}
                          por estadías de{" "}
                          <strong>
                            {casa.estadia_min_noches}{" "}
                            {casa.estadia_min_noches === 1 ? "noche" : "noches"}
                          </strong>{" "}
                          o más.
                        </span>
                      </div>
                    )}

                  {casa.min_noches_baja != null && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">🌿</span>
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
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">☀️</span>
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

            {Array.isArray(casa.amenities) && casa.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-semibold text-stone-900">
                  Comodidades
                </h2>
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

            <div className="mt-10">
              <h2 className="mb-4 text-base font-semibold text-stone-900">
                Disponibilidad
              </h2>
              <CalendarioDisponibilidad casaId={casa.id} />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/5491167330060?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L0 24l6.335-1.509A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.495-5.19-1.361l-.371-.217-3.864.92.979-3.768-.24-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Consultar por WhatsApp
              </a>

              {casa.google_maps_url && (
                <a
                  href={casa.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <svg
                    className="h-4 w-4 text-stone-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
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