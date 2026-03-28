import CasaCard from "@/components/CasaCard";
import { getCasas } from "@/lib/getCasas";
import { homeImages } from "@/lib/homeImages";
import Link from "next/link";

export const revalidate = 60;

const amenitiesList = [
  { label: "Seguridad 24 hs", icon: "🛡️" },
  { label: "Club House", icon: "🏡" },
  { label: "Pileta", icon: "🏊" },
  { label: "Cancha de fútbol y tenis", icon: "⚽" },
  { label: "Juegos para chicos", icon: "🎠" },
  { label: "Playa semiprivada", icon: "🏖️" },
];

const valores = [
  {
    titulo: "Selección cuidada",
    descripcion: "Casas elegidas para ofrecer una experiencia prolija y de calidad.",
  },
  {
    titulo: "Atención personalizada",
    descripcion: "Todas las consultas se gestionan directamente para una mejor respuesta.",
  },
  {
    titulo: "Experiencia Km314",
    descripcion: "Un entorno privado pensado para descansar y disfrutar cerca del mar.",
  },
];

export default async function Home() {
  const casas = await getCasas();
  const casasDestacadas = casas.slice(0, 3);

  return (
    <main className="bg-white text-gray-800">

      {/* ── HERO ── */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        <img
          src={homeImages.hero}
          alt="Km314"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-400 font-medium">
            Barrio Privado · Costa Atlántica
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Casas de mar dentro del barrio
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Viví el mar, la naturaleza y la tranquilidad en un entorno privado pensado para descansar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/casas"
              className="rounded-full bg-teal-600 px-7 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-teal-500"
            >
              Ver casas disponibles
            </Link>
            <Link
              href="/propietarios"
              className="rounded-full border border-white/50 px-7 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Publicar mi casa
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTRO + AMENITIES ── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-teal-600 font-medium">Viví Km 314</p>
            <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
              Naturaleza, tranquilidad y mar
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-600">
              Ubicado en un entorno único, Km 314 es un barrio privado pensado para descansar,
              desconectar y disfrutar de la naturaleza en su estado más puro.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenitiesList.map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-2xl bg-stone-50 border border-stone-100 p-4 transition hover:border-teal-100 hover:bg-teal-50/40"
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-medium text-stone-800 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BARRIO FOTOS ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20 sm:px-6 lg:px-8">
        {/* Mobile: foto grande arriba + carrusel horizontal debajo */}
        <div className="sm:hidden">
          <img
            src={homeImages.barrio[0]}
            alt="Barrio Km314"
            className="h-60 w-full rounded-2xl object-cover"
          />
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {homeImages.barrio.slice(1).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Barrio Km314 ${i + 2}`}
                className="h-32 w-44 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        </div>

        {/* sm+: grilla 2 cols / lg: 4 cols */}
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {homeImages.barrio.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Barrio Km314 ${i + 1}`}
              className="h-52 w-full rounded-2xl object-cover transition duration-300 hover:scale-[1.02] hover:shadow-md lg:h-56"
            />
          ))}
        </div>
      </section>

      {/* ── PLAYA ── */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-teal-600 font-medium">Playa</p>
              <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
                Mar, dunas y aire libre
              </h2>
              <p className="mt-5 text-base leading-8 text-stone-600">
                A metros del barrio, la playa y el entorno natural convierten a Km314 en una propuesta
                diferente, ideal para caminar, descansar y disfrutar del mar.
              </p>
            </div>

            {/* Mobile: foto completa + segunda en scroll */}
            <div className="sm:hidden">
              <img
                src={homeImages.playa[0]}
                alt="Playa Km314"
                className="h-56 w-full rounded-2xl object-cover"
              />
              {homeImages.playa[1] && (
                <img
                  src={homeImages.playa[1]}
                  alt="Playa Km314 2"
                  className="mt-3 h-40 w-full rounded-2xl object-cover"
                />
              )}
            </div>

            {/* sm+: grid 2 cols */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3">
              {homeImages.playa.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Playa Km314 ${i + 1}`}
                  className="h-60 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES FOTOS ── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-teal-600 font-medium">Amenities</p>
        <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">
          Espacios para disfrutar todo el año
        </h2>

        {/* Mobile: 2 fotos apiladas + scroll horizontal para las otras */}
        <div className="mt-6 sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            {homeImages.amenities.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Amenity Km314 ${i + 1}`}
                className="h-36 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {homeImages.amenities.slice(2).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Amenity Km314 ${i + 3}`}
                className="h-28 w-40 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        </div>

        {/* sm+: grid 2 cols / lg: 4 cols */}
        <div className="mt-8 hidden sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {homeImages.amenities.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Amenity Km314 ${i + 1}`}
              className="h-44 w-full rounded-2xl object-cover transition duration-300 hover:scale-[1.02] hover:shadow-md"
            />
          ))}
        </div>
      </section>

      {/* ── CASAS DESTACADAS ── */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-teal-600 font-medium">
                Casas destacadas
              </p>
              <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
                Propiedades disponibles
              </h2>
            </div>
            <Link
              href="/casas"
              className="hidden items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900 transition md:flex"
            >
              Ver todas
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {casasDestacadas.length === 0 ? (
            <p className="text-stone-500">No hay casas cargadas.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {casasDestacadas.map((casa: any) => (
                <CasaCard key={casa.id} casa={casa} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/casas"
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-6 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
            >
              Ver todas las casas →
            </Link>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {valores.map(({ titulo, descripcion }) => (
            <div key={titulo} className="border-t-2 border-teal-500 pt-5">
              <h3 className="text-base font-semibold text-stone-900">{titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">{descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA PROPIETARIOS ── */}
      <section className="bg-stone-900 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-400 font-medium">Propietarios</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            ¿Tenés una casa en Km314?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-stone-400">
            Publicala con una presentación profesional y dejá en nuestras manos la gestión de consultas.
          </p>
          <Link
            href="/propietarios"
            className="mt-8 inline-flex rounded-full bg-teal-600 px-8 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-teal-500"
          >
            Publicar mi casa
          </Link>
        </div>
      </section>
    </main>
  );
}
