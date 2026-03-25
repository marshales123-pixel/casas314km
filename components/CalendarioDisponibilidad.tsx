"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  casaId: string;
};

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DIAS = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

function toISO(date: Date) {
  return date.toISOString().split("T")[0];
}

function isSameDay(a: Date, b: Date) {
  return toISO(a) === toISO(b);
}

export default function CalendarioDisponibilidad({ casaId }: Props) {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [disponibles, setDisponibles] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);

  // Traer disponibilidad del mes actual y el siguiente (para fluidez)
  const cargarDisponibilidad = useCallback(async () => {
    setCargando(true);
    const desde = new Date(anio, mes, 1);
    const hasta = new Date(anio, mes + 2, 0); // fin del mes siguiente

    const { data } = await supabase
      .from("disponibilidad")
      .select("fecha, disponible")
      .eq("casa_id", casaId)
      .eq("disponible", true)
      .gte("fecha", toISO(desde))
      .lte("fecha", toISO(hasta));

    const set = new Set<string>(data?.map((r) => r.fecha) ?? []);
    setDisponibles(set);
    setCargando(false);
  }, [casaId, mes, anio]);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  // Generar días del mes
  const primerDia = new Date(anio, mes, 1);
  // Lunes=0, ajustamos al estándar europeo
  const offsetDia = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
  };
  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
  };

  const esPasado = (dia: number) => {
    const fecha = new Date(anio, mes, dia);
    fecha.setHours(0, 0, 0, 0);
    const hoyNorm = new Date();
    hoyNorm.setHours(0, 0, 0, 0);
    return fecha < hoyNorm;
  };

  const esHoy = (dia: number) => isSameDay(new Date(anio, mes, dia), hoy);

  const esDisponible = (dia: number) => {
    const iso = toISO(new Date(anio, mes, dia));
    return disponibles.has(iso);
  };

  // No permitir navegar antes del mes actual
  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={irMesAnterior}
          disabled={esMesActual}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mes anterior"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        <h3 className="text-sm font-semibold text-stone-800">
          {MESES[mes]} {anio}
        </h3>

        <button
          onClick={irMesSiguiente}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          aria-label="Mes siguiente"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Días de semana */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {DIAS.map((d) => (
          <span key={d} className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            {d}
          </span>
        ))}
      </div>

      {/* Grilla */}
      {cargando ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-y-1">
          {/* Espacios vacíos antes del día 1 */}
          {Array.from({ length: offsetDia }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const pasado = esPasado(dia);
            const hoyFlag = esHoy(dia);
            const disponible = esDisponible(dia);

            return (
              <div
                key={dia}
                className={`
                  flex h-9 w-full items-center justify-center rounded-lg text-sm transition
                  ${hoyFlag ? "ring-2 ring-teal-500 ring-offset-1" : ""}
                  ${pasado
                    ? "text-stone-300 cursor-default"
                    : disponible
                      ? "bg-teal-500 font-semibold text-white shadow-sm"
                      : "text-stone-500"
                  }
                `}
                title={
                  pasado ? "" : disponible ? "Disponible" : "No disponible / consultar"
                }
              >
                {dia}
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-5 border-t border-stone-100 pt-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-teal-500" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-stone-100" />
          No disponible
        </span>
      </div>
    </div>
  );
}
