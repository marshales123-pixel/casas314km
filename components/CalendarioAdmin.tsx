"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  casaId: string;
  nombreCasa: string;
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarioAdmin({ casaId, nombreCasa }: Props) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [disponibles, setDisponibles] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [accionMasiva, setAccionMasiva] = useState<"marcar" | "limpiar" | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const cargarMes = useCallback(async () => {
    setCargando(true);
    setMensaje(null);

    const desde = new Date(anio, mes, 1);
    const hasta = new Date(anio, mes + 1, 0);

    const { data, error } = await supabase
      .from("disponibilidad")
      .select("fecha")
      .eq("casa_id", casaId)
      .eq("disponible", true)
      .gte("fecha", toISO(desde))
      .lte("fecha", toISO(hasta));

    if (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al cargar disponibilidad: " + error.message,
      });
      setDisponibles(new Set());
      setCargando(false);
      return;
    }

    setDisponibles(new Set(data?.map((r) => r.fecha) ?? []));
    setCargando(false);
  }, [casaId, mes, anio]);

  useEffect(() => {
    cargarMes();
  }, [cargarMes]);

  const esPasado = (dia: number) => {
    const fecha = new Date(anio, mes, dia);
    fecha.setHours(0, 0, 0, 0);

    const hoyNorm = new Date();
    hoyNorm.setHours(0, 0, 0, 0);

    return fecha < hoyNorm;
  };

  const toggleFecha = async (dia: number) => {
    const fecha = toISO(new Date(anio, mes, dia));
    if (guardando || accionMasiva) return;

    setGuardando(fecha);
    setMensaje(null);

    const yaDisponible = disponibles.has(fecha);

    if (yaDisponible) {
      const { error } = await supabase
        .from("disponibilidad")
        .delete()
        .eq("casa_id", casaId)
        .eq("fecha", fecha);

      if (!error) {
        setDisponibles((prev) => {
          const next = new Set(prev);
          next.delete(fecha);
          return next;
        });
      } else {
        setMensaje({
          tipo: "error",
          texto: "Error al actualizar: " + error.message,
        });
      }
    } else {
      const { error } = await supabase
        .from("disponibilidad")
        .upsert(
          { casa_id: casaId, fecha, disponible: true },
          { onConflict: "casa_id,fecha" }
        );

      if (!error) {
        setDisponibles((prev) => new Set([...prev, fecha]));
      } else {
        setMensaje({
          tipo: "error",
          texto: "Error al actualizar: " + error.message,
        });
      }
    }

    setGuardando(null);
  };

  const marcarTodoElMes = async () => {
    if (guardando || accionMasiva) return;

    const confirmar = confirm(
      `¿Querés marcar todo ${MESES[mes]} ${anio} como disponible para ${nombreCasa}?`
    );
    if (!confirmar) return;

    setAccionMasiva("marcar");
    setMensaje(null);

    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const hoyNorm = new Date();
    hoyNorm.setHours(0, 0, 0, 0);

    const registros = [];

    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(anio, mes, d);
      fecha.setHours(0, 0, 0, 0);

      if (fecha >= hoyNorm) {
        registros.push({
          casa_id: casaId,
          fecha: toISO(fecha),
          disponible: true,
        });
      }
    }

    const { error } = await supabase
      .from("disponibilidad")
      .upsert(registros, { onConflict: "casa_id,fecha" });

    if (!error) {
      await cargarMes();
      setMensaje({
        tipo: "ok",
        texto: "Mes completo marcado como disponible.",
      });
    } else {
      setMensaje({
        tipo: "error",
        texto: "Error al guardar: " + error.message,
      });
    }

    setAccionMasiva(null);
  };

  const limpiarMes = async () => {
    if (guardando || accionMasiva) return;

    const confirmar = confirm(
      `¿Querés limpiar toda la disponibilidad de ${MESES[mes]} ${anio} para ${nombreCasa}?`
    );
    if (!confirmar) return;

    setAccionMasiva("limpiar");
    setMensaje(null);

    const desde = toISO(new Date(anio, mes, 1));
    const hasta = toISO(new Date(anio, mes + 1, 0));

    const { error } = await supabase
      .from("disponibilidad")
      .delete()
      .eq("casa_id", casaId)
      .gte("fecha", desde)
      .lte("fecha", hasta);

    if (!error) {
      setDisponibles(new Set());
      setMensaje({ tipo: "ok", texto: "Mes limpiado." });
    } else {
      setMensaje({
        tipo: "error",
        texto: "Error al limpiar: " + error.message,
      });
    }

    setAccionMasiva(null);
  };

  const primerDia = new Date(anio, mes, 1);
  const offsetDia = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();

  const irMesAnterior = () => {
    if (guardando || accionMasiva) return;
    if (mes === 0) {
      setMes(11);
      setAnio((a) => a - 1);
    } else {
      setMes((m) => m - 1);
    }
  };

  const irMesSiguiente = () => {
    if (guardando || accionMasiva) return;
    if (mes === 11) {
      setMes(0);
      setAnio((a) => a + 1);
    } else {
      setMes((m) => m + 1);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-teal-600">
            Admin
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-stone-900">
            Disponibilidad — {nombreCasa}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Hacé click en un día para alternar disponibilidad.
          </p>
        </div>
      </div>

      {mensaje && (
        <div
          className={`mb-4 rounded-xl border px-4 py-2.5 text-sm ${
            mensaje.tipo === "ok"
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={irMesAnterior}
          disabled={esMesActual || !!accionMasiva || !!guardando}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h3 className="text-sm font-semibold text-stone-800">
          {MESES[mes]} {anio}
        </h3>

        <button
          onClick={irMesSiguiente}
          disabled={!!accionMasiva || !!guardando}
          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center">
        {DIAS.map((d) => (
          <span
            key={d}
            className="text-[10px] font-semibold uppercase tracking-wide text-stone-400"
          >
            {d}
          </span>
        ))}
      </div>

      {cargando ? (
        <div className="flex h-44 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: offsetDia }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const pasado = esPasado(dia);
            const iso = toISO(new Date(anio, mes, dia));
            const disponible = disponibles.has(iso);
            const cargandoEste = guardando === iso;

            return (
              <button
                key={dia}
                onClick={() => !pasado && toggleFecha(dia)}
                disabled={pasado || !!guardando || !!accionMasiva}
                className={`
                  relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition
                  ${
                    pasado
                      ? "cursor-default text-stone-200"
                      : disponible
                      ? "bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                      : "border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
                  }
                  ${cargandoEste ? "opacity-60" : ""}
                `}
              >
                {cargandoEste ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  dia
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
        <button
          onClick={marcarTodoElMes}
          disabled={!!guardando || !!accionMasiva}
          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {accionMasiva === "marcar" ? "Guardando..." : "✓ Marcar todo el mes"}
        </button>

        <button
          onClick={limpiarMes}
          disabled={!!guardando || !!accionMasiva}
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {accionMasiva === "limpiar" ? "Limpiando..." : "✕ Limpiar mes"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-5 text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-teal-500" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-stone-200 bg-stone-100" /> No disponible
        </span>
      </div>
    </div>
  );
}