"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { WA_NUMBER } from "@/lib/constants";

type Props = {
  casaId: string;
  nombreCasa: string;
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MESES_GEN = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES_GEN[m - 1]} de ${y}`;
}

function agruparEnRangos(isos: string[]): string[] {
  if (isos.length === 0) return [];
  const sorted = [...isos].sort();
  const rangos: string[] = [];
  let inicio = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prevDate = new Date(prev);
    const currDate = new Date(curr);
    prevDate.setDate(prevDate.getDate() + 1);
    const esConsecutivo =
      prevDate.toISOString().slice(0, 10) === curr;

    if (esConsecutivo) {
      prev = curr;
    } else {
      rangos.push(formatRango(inicio, prev));
      inicio = curr;
      prev = curr;
    }
  }
  rangos.push(formatRango(inicio, prev));
  return rangos;
}

function formatRango(desde: string, hasta: string): string {
  const [dy, dm, dd] = desde.split("-").map(Number);
  const [hy, hm, hd] = hasta.split("-").map(Number);

  if (desde === hasta) {
    return `el ${dd} de ${MESES_GEN[dm - 1]} de ${dy}`;
  }
  if (dm === hm && dy === hy) {
    return `del ${dd} al ${hd} de ${MESES_GEN[dm - 1]} de ${dy}`;
  }
  if (dy === hy) {
    return `del ${dd} de ${MESES_GEN[dm - 1]} al ${hd} de ${MESES_GEN[hm - 1]} de ${dy}`;
  }
  return `del ${dd} de ${MESES_GEN[dm - 1]} de ${dy} al ${hd} de ${MESES_GEN[hm - 1]} de ${hy}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarioDisponibilidad({ casaId, nombreCasa }: Props) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [disponibles, setDisponibles] = useState<Set<string>>(new Set());
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);

  const cargarDisponibilidad = useCallback(async () => {
    setCargando(true);

    const desde = new Date(anio, mes, 1);
    desde.setHours(0, 0, 0, 0);

    const hasta = new Date(anio, mes + 2, 0);
    hasta.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("disponibilidad")
      .select("fecha, disponible")
      .eq("casa_id", casaId)
      .eq("disponible", true)
      .gte("fecha", toISO(desde))
      .lte("fecha", toISO(hasta));

    const fechas = new Set<string>(data?.map((r) => r.fecha) ?? []);
    setDisponibles(fechas);
    setCargando(false);
  }, [casaId, mes, anio]);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  const primerDia = new Date(anio, mes, 1);
  const offsetDia = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
    else setMes((m) => m - 1);
  };

  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
    else setMes((m) => m + 1);
  };

  const esPasado = (dia: number) => {
    const fecha = new Date(anio, mes, dia);
    fecha.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  const esHoy = (dia: number) => {
    const fecha = new Date(anio, mes, dia);
    fecha.setHours(0, 0, 0, 0);
    return isSameDay(fecha, hoy);
  };

  const esDisponible = (dia: number) =>
    disponibles.has(toISO(new Date(anio, mes, dia)));

  const toggleSeleccion = (dia: number) => {
    const iso = toISO(new Date(anio, mes, dia));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();

  const seleccionadosOrdenados = [...seleccionados].sort();

  const rangos = agruparEnRangos(seleccionadosOrdenados);

  const waUrl = (() => {
    if (rangos.length === 0) return null;
    const fechas = rangos.join("\n- ");
    const texto = `Hola, quiero consultar disponibilidad para *${nombreCasa}* en Km314.\n\nFechas de interés:\n- ${fechas}`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
  })();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={irMesAnterior}
          disabled={esMesActual}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-30"
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

      <div className="mb-2 grid grid-cols-7 text-center">
        {DIAS.map((d) => (
          <span key={d} className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            {d}
          </span>
        ))}
      </div>

      {cargando ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: offsetDia }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const pasado = esPasado(dia);
            const hoyFlag = esHoy(dia);
            const disponible = esDisponible(dia);
            const iso = toISO(new Date(anio, mes, dia));
            const seleccionado = seleccionados.has(iso);

            return (
              <button
                key={dia}
                onClick={() => disponible && !pasado && toggleSeleccion(dia)}
                disabled={pasado || !disponible}
                title={
                  pasado ? "" :
                  disponible ? (seleccionado ? "Quitar selección" : "Seleccionar este día") :
                  "No disponible"
                }
                className={`
                  relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition
                  ${hoyFlag ? "ring-2 ring-offset-1 " + (seleccionado ? "ring-teal-700" : "ring-teal-500") : ""}
                  ${
                    pasado
                      ? "cursor-default text-stone-300"
                      : disponible
                        ? seleccionado
                          ? "bg-teal-700 font-bold text-white shadow-md ring-2 ring-teal-400 ring-offset-1"
                          : "cursor-pointer bg-teal-500 font-semibold text-white shadow-sm hover:bg-teal-600"
                        : "cursor-default text-stone-300"
                  }
                `}
              >
                {seleccionado ? (
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[9px]">✓</span>
                    <span>{dia}</span>
                  </span>
                ) : dia}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-5 border-t border-stone-100 pt-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-teal-500" /> Disponible — tocá para seleccionar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-stone-100" /> No disponible
        </span>
      </div>

      {seleccionadosOrdenados.length > 0 && (
        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-teal-800">
              {seleccionadosOrdenados.length} día{seleccionadosOrdenados.length !== 1 ? "s" : ""} seleccionado{seleccionadosOrdenados.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={limpiarSeleccion}
              className="text-xs text-teal-500 hover:text-teal-700"
            >
              Limpiar
            </button>
          </div>
          <p className="mb-3 text-xs text-teal-700">
            {rangos.join(" · ")}
          </p>
          <a
            href={waUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
