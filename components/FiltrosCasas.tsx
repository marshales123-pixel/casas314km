"use client";

import { useState, useMemo } from "react";
import CasaCard from "@/components/CasaCard";
import { SlidersHorizontal, X } from "lucide-react";

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
  fotos?: any[];
};

const HUESPEDES_OPCIONES = [
  { label: "Todos", value: 0 },
  { label: "2+", value: 2 },
  { label: "4+", value: 4 },
  { label: "6+", value: 6 },
];

const DORMITORIOS_OPCIONES = [
  { label: "Todos", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3+", value: 3 },
];

export default function FiltrosCasas({ casas }: { casas: Casa[] }) {
  const [huespedes, setHuespedes] = useState(0);
  const [dormitorios, setDormitorios] = useState(0);
  const [precioMax, setPrecioMax] = useState<number | "">("");

  const hayFiltrosActivos = huespedes > 0 || dormitorios > 0 || precioMax !== "";

  function limpiarFiltros() {
    setHuespedes(0);
    setDormitorios(0);
    setPrecioMax("");
  }

  const casasFiltradas = useMemo(() => {
    return casas.filter((c) => {
      if (huespedes > 0 && (c.capacidad ?? 0) < huespedes) return false;
      if (dormitorios === 3 && (c.dormitorios ?? 0) < 3) return false;
      if (dormitorios > 0 && dormitorios < 3 && c.dormitorios !== dormitorios) return false;
      if (precioMax !== "" && (c.precio_por_noche ?? 0) > precioMax) return false;
      return true;
    });
  }, [casas, huespedes, dormitorios, precioMax]);

  return (
    <>
      {/* Barra de filtros */}
      <div className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex flex-wrap items-end gap-6">
          {/* Ícono */}
          <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            Filtrar
          </div>

          {/* Huéspedes */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">Huéspedes</p>
            <div className="flex gap-1.5">
              {HUESPEDES_OPCIONES.map((op) => (
                <button
                  key={op.value}
                  onClick={() => setHuespedes(op.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    huespedes === op.value
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-700"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dormitorios */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">Dormitorios</p>
            <div className="flex gap-1.5">
              {DORMITORIOS_OPCIONES.map((op) => (
                <button
                  key={op.value}
                  onClick={() => setDormitorios(op.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    dormitorios === op.value
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-700"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precio máximo */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">Precio máx. / noche</p>
            <input
              type="number"
              min={0}
              placeholder="Sin límite"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-36 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Limpiar */}
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contador */}
      <p className="mb-6 text-sm text-stone-400">
        {casasFiltradas.length}{" "}
        {casasFiltradas.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
        {hayFiltrosActivos && casasFiltradas.length !== casas.length && (
          <span className="text-stone-300"> de {casas.length}</span>
        )}
      </p>

      {/* Grid */}
      {casasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-3 text-stone-500">Ninguna casa coincide con los filtros.</p>
          <button
            onClick={limpiarFiltros}
            className="mt-4 text-sm text-teal-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {casasFiltradas.map((casa) => (
            <CasaCard key={casa.id} casa={casa} />
          ))}
        </div>
      )}
    </>
  );
}
