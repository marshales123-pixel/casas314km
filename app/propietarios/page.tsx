import { Camera, ClipboardList, MessageCircle, Search } from "lucide-react";
import { WA_URL } from "@/lib/constants";

const beneficios = [
  {
    titulo: "Publicación prolija",
    descripcion: "Tu propiedad presentada con fotos, descripción y todos los detalles que el inquilino necesita.",
    Icon: Camera,
  },
  {
    titulo: "Gestión de consultas",
    descripcion: "Centralizamos todas las consultas y te las enviamos de forma ordenada.",
    Icon: ClipboardList,
  },
  {
    titulo: "Contacto directo",
    descripcion: "Los interesados se comunican directamente con vos, sin intermediarios.",
    Icon: MessageCircle,
  },
  {
    titulo: "Mayor visibilidad",
    descripcion: "Una web enfocada exclusivamente en Km314 atrae a quienes ya buscan alquilar en el barrio.",
    Icon: Search,
  },
];

const WaIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L0 24l6.335-1.509A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.495-5.19-1.361l-.371-.217-3.864.92.979-3.768-.24-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

export default function PropietariosPage() {
  return (
    <main className="bg-white text-gray-800">
      {/* Hero */}
      <section className="border-b border-stone-100 bg-stone-50 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Propietarios</p>
          <h1 className="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl leading-tight">
            Publicá tu casa con nosotros
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-500">
            Ofrecemos un servicio de publicación y gestión de consultas para casas dentro de Km314,
            con una presentación profesional y atención personalizada.
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-stone-900 mb-8">¿Qué incluye el servicio?</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {beneficios.map(({ titulo, descripcion, Icon }) => (
            <div
              key={titulo}
              className="flex gap-4 rounded-2xl border border-stone-100 bg-stone-50/80 p-6 transition-all hover:border-teal-200 hover:bg-teal-50/40 hover:-translate-y-0.5"
            >
              <div className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100">
                <Icon className="h-4.5 w-4.5 text-teal-700" strokeWidth={1.75} size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-6 text-stone-500">{descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            ¿Listo para publicar?
          </h2>
          <p className="mt-3 text-stone-400 text-sm leading-relaxed">
            Escribinos por WhatsApp y te contamos cómo empezar.
          </p>
          <a
            href={`${WA_URL}?text=Hola,%20quiero%20publicar%20mi%20casa%20en%20Km314.`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-500"
          >
            <WaIcon />
            Quiero publicar mi casa
          </a>
        </div>
      </section>
    </main>
  );
}
