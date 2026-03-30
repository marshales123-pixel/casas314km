import Link from "next/link";
import { WA_URL, WA_DISPLAY } from "@/lib/constants";

const WaIcon = () => (
  <svg className="h-4 w-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L0 24l6.335-1.509A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.495-5.19-1.361l-.371-.217-3.864.92.979-3.768-.24-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* 2 columnas: info | mapa */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">

          {/* Columna izquierda: brand + nav + contacto */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

            {/* Brand */}
            <div className="sm:col-span-3">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase tracking-[0.3em] text-teal-600 font-medium">
                  Barrio Privado
                </span>
                <span className="mt-1 text-xl font-bold text-stone-900">
                  Km<span className="text-teal-600">314</span>
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-stone-500 leading-6">
                Casas seleccionadas dentro del barrio privado para una estadía tranquila cerca del mar.
              </p>
            </div>

            {/* Nav */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-4">
                Navegación
              </p>
              <ul className="space-y-2.5">
                {[
                  { href: "/", label: "Inicio" },
                  { href: "/casas", label: "Ver casas" },
                  { href: "/propietarios", label: "Propietarios" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-stone-600 hover:text-teal-700 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-4">
                Contacto
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-teal-700 transition-colors"
              >
                <WaIcon />
                {WA_DISPLAY}
              </a>
              <p className="mt-3 text-xs text-stone-400 leading-5">
                Atención personalizada para alquileres dentro del barrio.
              </p>
            </div>
          </div>

          {/* Columna derecha: mapa */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-4">
              Ubicación
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
              <iframe
                title="Ubicación Km314"
                src="https://maps.google.com/maps?q=-36.442087,-56.7124686&z=15&output=embed"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/vNVYEwUdXQhHt9ZH7"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Abrir en Google Maps
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-stone-200 pt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} Km314 Casas de Mar. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
