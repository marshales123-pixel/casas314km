"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Foto = {
  id: string;
  casa_id: string;
  url: string;
  alt: string | null;
  es_principal: boolean;
  orden: number;
};

type Casa = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  capacidad: number | null;
  dormitorios: number | null;
  banos: number | null;
  camas: number | null;
  ubicacion: string | null;
  precio_por_noche: number | null;
  moneda_precio: string | null;
  descuento_texto: string | null;
  descuento_valor: number | null;
  min_noches_baja: number | null;
  min_noches_alta: number | null;
  google_maps_url: string | null;
  activa: boolean;
  destacada: boolean;
  orden_home: number;
  amenities: string[];
  fotos?: Foto[];
};

type FormData = Omit<Casa, "id" | "fotos">;

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const emptyForm: FormData = {
  nombre: "",
  slug: "",
  descripcion: "",
  capacidad: null,
  dormitorios: null,
  banos: null,
  camas: null,
  ubicacion: "",
  precio_por_noche: null,
  moneda_precio: "ARS",
  descuento_texto: "",
  descuento_valor: null,
  min_noches_baja: 1,
  min_noches_alta: 1,
  google_maps_url: "",
  activa: true,
  destacada: false,
  orden_home: 999,
  amenities: [],
};

function Badge({ activa }: { activa: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        activa
          ? "border border-emerald-700 bg-emerald-950 text-emerald-400"
          : "border border-[#2A3352] bg-[#0C0F1A] text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          activa ? "bg-emerald-400" : "bg-slate-600"
        }`}
      />
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}

export default function AdminCasasPage() {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Casa | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cargarCasas = async () => {
    setCargando(true);
    setMensaje(null);

    const { data: casasData, error: casasError } = await supabase
      .from("casas")
      .select("*")
      .order("orden_home", { ascending: true });

    const { data: fotosData, error: fotosError } = await supabase
      .from("fotos")
      .select("*")
      .order("orden", { ascending: true });

    if (casasError || fotosError) {
      setMensaje({
        tipo: "error",
        texto:
          "Error al cargar datos." +
          (casasError?.message ? ` ${casasError.message}` : "") +
          (fotosError?.message ? ` ${fotosError.message}` : ""),
      });
      setCargando(false);
      return;
    }

    const result = (casasData ?? []).map((c) => ({
      ...c,
      amenities: Array.isArray(c.amenities) ? c.amenities : [],
      fotos: (fotosData ?? []).filter((f) => f.casa_id === c.id),
    }));

    setCasas(result);
    setCargando(false);
  };

  const recargarFotosDeCasa = async (casaId: string) => {
    const { data: fotos } = await supabase
      .from("fotos")
      .select("*")
      .eq("casa_id", casaId)
      .order("orden", { ascending: true });

    setEditando((prev) => (prev ? { ...prev, fotos: fotos ?? [] } : prev));
  };

  useEffect(() => {
    cargarCasas();
  }, []);

  const abrirEditar = (casa: Casa) => {
    setEditando(casa);
    setCreando(false);

    setForm({
      nombre: casa.nombre,
      slug: casa.slug,
      descripcion: casa.descripcion ?? "",
      capacidad: casa.capacidad,
      dormitorios: casa.dormitorios,
      banos: casa.banos,
      camas: casa.camas,
      ubicacion: casa.ubicacion ?? "",
      precio_por_noche: casa.precio_por_noche,
      moneda_precio: casa.moneda_precio ?? "ARS",
      descuento_texto: casa.descuento_texto ?? "",
      descuento_valor: casa.descuento_valor,
      min_noches_baja: casa.min_noches_baja ?? 1,
      min_noches_alta: casa.min_noches_alta ?? 1,
      google_maps_url: casa.google_maps_url ?? "",
      activa: casa.activa,
      destacada: casa.destacada,
      orden_home: casa.orden_home,
      amenities: casa.amenities ?? [],
    });

    setAmenitiesInput((casa.amenities ?? []).join(", "));
    setMensaje(null);
  };

  const abrirCrear = () => {
    setEditando(null);
    setCreando(true);
    setForm(emptyForm);
    setAmenitiesInput("");
    setMensaje(null);
  };

  const cerrar = () => {
    setEditando(null);
    setCreando(false);
    setMensaje(null);
  };

  const set = (key: keyof FormData, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "nombre" && creando) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const parseAmenities = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const guardar = async () => {
    if (!form.nombre.trim() || !form.slug.trim()) {
      setMensaje({
        tipo: "error",
        texto: "Nombre y slug son obligatorios.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    const amenities = parseAmenities(amenitiesInput);

    const payload = {
      ...form,
      amenities,
      descuento_texto: form.descuento_texto?.trim() || null,
      moneda_precio: form.moneda_precio || "ARS",
    };

    if (creando) {
      const { data, error } = await supabase
        .from("casas")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setMensaje({
          tipo: "error",
          texto: "Error al crear: " + error.message,
        });
      } else {
        setMensaje({ tipo: "ok", texto: "Casa creada correctamente." });
        await cargarCasas();

        if (data) {
          abrirEditar({
            ...data,
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            fotos: [],
          });
        }
      }
    } else if (editando) {
      const { data, error } = await supabase
        .from("casas")
        .update(payload)
        .eq("id", editando.id)
        .select()
        .single();

      if (error) {
        setMensaje({
          tipo: "error",
          texto: "Error al guardar: " + error.message,
        });
      } else {
        setMensaje({ tipo: "ok", texto: "Guardado correctamente." });
        await cargarCasas();

        if (data) {
          setEditando((prev) =>
            prev
              ? {
                  ...prev,
                  ...data,
                  amenities: Array.isArray(data.amenities) ? data.amenities : [],
                }
              : prev
          );
        }
      }
    }

    setGuardando(false);
  };

  const toggleActiva = async (casa: Casa) => {
    const { error } = await supabase
      .from("casas")
      .update({ activa: !casa.activa })
      .eq("id", casa.id);

    if (error) {
      setMensaje({
        tipo: "error",
        texto: "No se pudo actualizar el estado: " + error.message,
      });
      return;
    }

    await cargarCasas();

    if (editando?.id === casa.id) {
      setEditando((prev) =>
        prev ? { ...prev, activa: !casa.activa } : prev
      );
      setForm((prev) => ({ ...prev, activa: !casa.activa }));
    }
  };

  const borrarCasa = async () => {
    if (!editando) return;

    const confirmar = confirm(
      `¿Querés borrar la casa "${editando.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setGuardando(true);
    setMensaje(null);

    try {
      const fotosCasa = editando.fotos ?? [];

      if (fotosCasa.length > 0) {
        const archivos = fotosCasa
          .map((foto) => {
            const parts = foto.url.split("/fotos/");
            return parts[1];
          })
          .filter(Boolean) as string[];

        if (archivos.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("fotos")
            .remove(archivos);

          if (storageError) {
            setMensaje({
              tipo: "error",
              texto:
                "Error al borrar archivos de fotos: " + storageError.message,
            });
            setGuardando(false);
            return;
          }
        }
      }

      const { error: casaError } = await supabase
        .from("casas")
        .delete()
        .eq("id", editando.id);

      if (casaError) {
        setMensaje({
          tipo: "error",
          texto: "Error al borrar la casa: " + casaError.message,
        });
        setGuardando(false);
        return;
      }

      await cargarCasas();
      cerrar();
    } finally {
      setGuardando(false);
    }
  };

  const subirArchivos = async (files: FileList | File[]) => {
    if (!editando || !files.length) return;

    setSubiendoFoto(true);
    setMensaje(null);

    try {
      let fotosActuales = [...(editando.fotos ?? [])].sort(
        (a, b) => a.orden - b.orden
      );

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const filename = `${editando.slug}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(filename, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("fotos")
          .getPublicUrl(filename);

        const url = urlData.publicUrl;

        const ultimoOrden =
          fotosActuales.length > 0
            ? Math.max(...fotosActuales.map((f) => Number(f.orden ?? 0)))
            : -1;

        const esPrimera = fotosActuales.length === 0;

        const { error: dbError } = await supabase.from("fotos").insert({
          casa_id: editando.id,
          url,
          es_principal: esPrimera,
          orden: ultimoOrden + 1,
          alt: null,
        });

        if (dbError) throw dbError;

        fotosActuales = [
          ...fotosActuales,
          {
            id: crypto.randomUUID(),
            casa_id: editando.id,
            url,
            alt: null,
            es_principal: esPrimera,
            orden: ultimoOrden + 1,
          },
        ];
      }

      setMensaje({ tipo: "ok", texto: "Fotos subidas correctamente." });
      await cargarCasas();
      await recargarFotosDeCasa(editando.id);
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: "Error al subir fotos: " + err.message,
      });
    }

    setSubiendoFoto(false);
    setDragActive(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const subirFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    subirArchivos(e.target.files);
  };

  const borrarFoto = async (foto: Foto) => {
    if (!editando) return;
    if (!confirm("¿Borrar esta foto?")) return;

    const parts = foto.url.split("/fotos/");
    const filename = parts[1];

    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove(filename ? [filename] : []);

    if (storageError) {
      setMensaje({
        tipo: "error",
        texto: "Error al borrar el archivo: " + storageError.message,
      });
      return;
    }

    const { error: deleteError } = await supabase
      .from("fotos")
      .delete()
      .eq("id", foto.id);

    if (deleteError) {
      setMensaje({
        tipo: "error",
        texto: "Error al borrar la foto: " + deleteError.message,
      });
      return;
    }

    const restantes = (editando.fotos ?? []).filter((f) => f.id !== foto.id);

    if (foto.es_principal && restantes.length > 0) {
      const primera = [...restantes].sort((a, b) => a.orden - b.orden)[0];
      await supabase
        .from("fotos")
        .update({ es_principal: true })
        .eq("id", primera.id);
    }

    for (let i = 0; i < restantes.length; i++) {
      await supabase
        .from("fotos")
        .update({ orden: i })
        .eq("id", restantes[i].id);
    }

    setMensaje({ tipo: "ok", texto: "Foto borrada correctamente." });
    await cargarCasas();
    await recargarFotosDeCasa(editando.id);
  };

  const setPrincipal = async (foto: Foto) => {
    if (!editando) return;

    const { error: clearError } = await supabase
      .from("fotos")
      .update({ es_principal: false })
      .eq("casa_id", editando.id);

    if (clearError) {
      setMensaje({
        tipo: "error",
        texto:
          "No se pudo actualizar la foto principal: " + clearError.message,
      });
      return;
    }

    const { error: setError } = await supabase
      .from("fotos")
      .update({ es_principal: true })
      .eq("id", foto.id);

    if (setError) {
      setMensaje({
        tipo: "error",
        texto:
          "No se pudo marcar la foto como principal: " + setError.message,
      });
      return;
    }

    setMensaje({ tipo: "ok", texto: "Foto principal actualizada." });
    await cargarCasas();
    await recargarFotosDeCasa(editando.id);
  };

  const moverFoto = async (foto: Foto, direccion: "izq" | "der") => {
    if (!editando || !editando.fotos) return;

    const fotosOrdenadas = [...editando.fotos].sort((a, b) => a.orden - b.orden);
    const index = fotosOrdenadas.findIndex((f) => f.id === foto.id);

    if (index === -1) return;
    if (direccion === "izq" && index === 0) return;
    if (direccion === "der" && index === fotosOrdenadas.length - 1) return;

    const otraFoto =
      direccion === "izq"
        ? fotosOrdenadas[index - 1]
        : fotosOrdenadas[index + 1];

    const { error: error1 } = await supabase
      .from("fotos")
      .update({ orden: otraFoto.orden })
      .eq("id", foto.id);

    if (error1) {
      setMensaje({
        tipo: "error",
        texto: "No se pudo mover la foto: " + error1.message,
      });
      return;
    }

    const { error: error2 } = await supabase
      .from("fotos")
      .update({ orden: foto.orden })
      .eq("id", otraFoto.id);

    if (error2) {
      setMensaje({
        tipo: "error",
        texto: "No se pudo mover la foto: " + error2.message,
      });
      return;
    }

    setMensaje({ tipo: "ok", texto: "Orden de fotos actualizado." });
    await cargarCasas();
    await recargarFotosDeCasa(editando.id);
  };

  const panelAbierto = editando !== null || creando;

  return (
    <div className="flex min-h-screen bg-[#0C0F1A]">
      <div
        className={`flex flex-col transition-all duration-300 ${
          panelAbierto ? "w-full shrink-0 lg:w-80 xl:w-96" : "w-full"
        }`}
      >
        <div className="sticky top-0 z-10 border-b border-[#2A3352] bg-[#141826] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A84C]">
                Admin
              </p>
              <h1 className="text-lg font-bold text-slate-100">Casas</h1>
            </div>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-1.5 rounded-xl bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1c1107] transition hover:bg-[#E4C06E]"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nueva
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
          </div>
        ) : casas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-4xl">🏠</p>
            <p className="mt-3 text-sm">No hay casas cargadas</p>
            <button
              onClick={abrirCrear}
              className="mt-4 text-sm text-[#C9A84C] hover:underline"
            >
              Crear la primera
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#2A3352] overflow-y-auto">
            {casas.map((casa) => {
              const foto = casa.fotos?.find((f) => f.es_principal) ?? casa.fotos?.[0];
              const seleccionada = editando?.id === casa.id;

              return (
                <li
                  key={casa.id}
                  className={`flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#141826] ${
                    seleccionada ? "border-l-2 border-[#C9A84C] bg-[#141826]" : ""
                  }`}
                  onClick={() => abrirEditar(casa)}
                >
                  {foto?.url ? (
                    <img
                      src={foto.url}
                      alt={casa.nombre}
                      className="h-14 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-[#2A3352] text-xs text-slate-500">
                      Sin foto
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {casa.nombre}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{casa.slug}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge activa={casa.activa} />
                      {casa.fotos?.length ? (
                        <span className="text-xs text-slate-500">
                          {casa.fotos.length} foto{casa.fotos.length !== 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <svg
                    className="h-4 w-4 shrink-0 text-slate-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {panelAbierto && (
        <div className="flex-1 overflow-y-auto border-l border-[#2A3352] bg-[#141826]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2A3352] bg-[#141826] px-6 py-4">
            <h2 className="text-base font-semibold text-slate-100">
              {creando ? "Nueva casa" : `Editando: ${editando?.nombre}`}
            </h2>
            <button
              onClick={cerrar}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[#2A3352] hover:text-slate-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="max-w-2xl space-y-8 px-6 py-6">
            {mensaje && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  mensaje.tipo === "ok"
                    ? "border-emerald-700 bg-emerald-950 text-emerald-300"
                    : "border-red-700 bg-red-950 text-red-300"
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Datos básicos
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Nombre</label>
                    <input
                      className="input"
                      value={form.nombre}
                      onChange={(e) => set("nombre", e.target.value)}
                      placeholder="Casa Los Médanos"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="label">Slug (URL)</label>
                    <input
                      className="input font-mono text-sm"
                      value={form.slug}
                      onChange={(e) => set("slug", slugify(e.target.value))}
                      placeholder="casa-los-medanos"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      casas314.netlify.app/casas/<strong className="text-slate-400">{form.slug || "..."}</strong>
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="label">Descripción</label>
                    <textarea
                      className="input min-h-[90px] resize-y"
                      value={form.descripcion ?? ""}
                      onChange={(e) => set("descripcion", e.target.value)}
                      placeholder="Hermosa casa rodeada de naturaleza..."
                    />
                  </div>

                  <div>
                    <label className="label">Ubicación</label>
                    <input
                      className="input"
                      value={form.ubicacion ?? ""}
                      onChange={(e) => set("ubicacion", e.target.value)}
                      placeholder="Km 314, Costa Atlántica"
                    />
                  </div>

                  <div>
                    <label className="label">Google Maps URL</label>
                    <input
                      className="input"
                      value={form.google_maps_url ?? ""}
                      onChange={(e) => set("google_maps_url", e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Capacidad
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {([
                  { key: "capacidad", label: "Huéspedes" },
                  { key: "dormitorios", label: "Dormitorios" },
                  { key: "banos", label: "Baños" },
                  { key: "camas", label: "Camas" },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={form[key] ?? ""}
                      onChange={(e) =>
                        set(key, e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Tarifas y condiciones
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Precio por noche</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.precio_por_noche ?? ""}
                    onChange={(e) =>
                      set(
                        "precio_por_noche",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="label">Moneda</label>
                  <select
                    className="input"
                    value={form.moneda_precio ?? "ARS"}
                    onChange={(e) => set("moneda_precio", e.target.value)}
                  >
                    <option value="ARS">Pesos (ARS)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Texto de descuento</label>
                  <input
                    className="input"
                    value={form.descuento_texto ?? ""}
                    onChange={(e) => set("descuento_texto", e.target.value)}
                    placeholder="10% por estadías de 7 noches o más"
                  />
                </div>

                <div>
                  <label className="label">Valor de descuento (%)</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.descuento_valor ?? ""}
                    onChange={(e) =>
                      set(
                        "descuento_valor",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="label">Orden en home</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.orden_home}
                    onChange={(e) => set("orden_home", Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="label">Mínimo noches fuera de temporada</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.min_noches_baja ?? ""}
                    onChange={(e) =>
                      set(
                        "min_noches_baja",
                        e.target.value ? Number(e.target.value) : 1
                      )
                    }
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="label">Mínimo noches en temporada</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.min_noches_alta ?? ""}
                    onChange={(e) =>
                      set(
                        "min_noches_alta",
                        e.target.value ? Number(e.target.value) : 1
                      )
                    }
                    placeholder="7"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Comodidades
              </h3>
              <label className="label">Separadas por coma</label>
              <input
                className="input"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="WiFi, Parrilla, Pileta, Aire acondicionado"
              />
              {parseAmenities(amenitiesInput).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {parseAmenities(amenitiesInput).map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-[#2A3352] bg-[#0C0F1A] px-3 py-1 text-xs text-slate-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Estado
              </h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#2A3352] bg-[#0C0F1A] accent-[#C9A84C]"
                    checked={form.activa}
                    onChange={(e) => set("activa", e.target.checked)}
                  />
                  <span className="text-sm text-slate-300">
                    Casa activa (visible en el sitio)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#2A3352] bg-[#0C0F1A] accent-[#C9A84C]"
                    checked={form.destacada}
                    onChange={(e) => set("destacada", e.target.checked)}
                  />
                  <span className="text-sm text-slate-300">Destacada</span>
                </label>
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex items-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-2.5 text-sm font-semibold text-[#1c1107] transition hover:bg-[#E4C06E] disabled:opacity-50"
              >
                {guardando ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1c1107] border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {guardando ? "Guardando..." : "Guardar"}
              </button>

              {editando && (
                <button
                  onClick={() => toggleActiva(editando)}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                    editando.activa
                      ? "border-[#2A3352] text-slate-400 hover:bg-[#2A3352]"
                      : "border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                  }`}
                >
                  {editando.activa ? "Desactivar" : "Activar"}
                </button>
              )}

              {editando && (
                <button
                  onClick={borrarCasa}
                  disabled={guardando}
                  className="rounded-xl border border-red-800 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950 disabled:opacity-50"
                >
                  Borrar casa
                </button>
              )}
            </div>

            {editando && (
              <section className="border-t border-[#2A3352] pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Fotos
                  </h3>

                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={subiendoFoto}
                    className="flex items-center gap-1.5 rounded-xl border border-[#2A3352] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-[#2A3352] disabled:opacity-50"
                  >
                    {subiendoFoto ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {subiendoFoto ? "Subiendo..." : "Subir foto"}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={subirFoto}
                  />
                </div>

                {!editando.fotos?.length ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files?.length) {
                        subirArchivos(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 transition ${
                      dragActive
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-[#2A3352] text-slate-500 hover:border-[#C9A84C]/50 hover:text-slate-300"
                    }`}
                  >
                    <svg className="mb-2 h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      Arrastrá fotos acá o hacé click
                    </p>
                    <p className="mt-1 text-xs opacity-60">
                      Podés subir varias imágenes juntas
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files?.length) {
                          subirArchivos(e.dataTransfer.files);
                        }
                      }}
                      className={`mb-4 rounded-2xl border-2 border-dashed p-4 text-center text-sm transition ${
                        dragActive
                          ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                          : "border-[#2A3352] text-slate-500"
                      }`}
                    >
                      Arrastrá más fotos acá para agregarlas
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {editando.fotos
                        .slice()
                        .sort((a, b) => a.orden - b.orden)
                        .map((foto, index, arr) => (
                          <div
                            key={foto.id}
                            className="group relative overflow-hidden rounded-xl"
                          >
                            <img
                              src={foto.url}
                              alt={foto.alt ?? ""}
                              className="h-32 w-full object-cover"
                            />

                            {foto.es_principal && (
                              <div className="absolute left-2 top-2 rounded-full bg-[#C9A84C] px-2 py-0.5 text-[10px] font-bold text-[#1c1107] shadow">
                                Principal
                              </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 opacity-0 transition group-hover:opacity-100">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => moverFoto(foto, "izq")}
                                  disabled={index === 0}
                                  className="rounded-lg bg-white/15 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/25"
                                  title="Mover izquierda"
                                >
                                  ←
                                </button>

                                <button
                                  onClick={() => moverFoto(foto, "der")}
                                  disabled={index === arr.length - 1}
                                  className="rounded-lg bg-white/15 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/25"
                                  title="Mover derecha"
                                >
                                  →
                                </button>
                              </div>

                              {!foto.es_principal && (
                                <button
                                  onClick={() => setPrincipal(foto)}
                                  className="rounded-lg bg-[#C9A84C] px-2.5 py-1.5 text-[11px] font-bold text-[#1c1107] transition hover:bg-[#E4C06E]"
                                  title="Marcar como principal"
                                >
                                  Principal
                                </button>
                              )}

                              <button
                                onClick={() => borrarFoto(foto)}
                                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-red-500"
                                title="Borrar foto"
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                <p className="mt-3 text-xs text-slate-600">
                  Podés arrastrar varias fotos o hacer click para subirlas. La foto
                  principal es la que aparece en las cards y como imagen destacada.
                </p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 