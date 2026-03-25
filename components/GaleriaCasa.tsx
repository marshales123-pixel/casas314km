"use client";

import { useMemo, useState, useCallback } from "react";

type Foto = {
  id: string;
  url: string;
  alt?: string | null;
  es_principal: boolean;
  orden: number;
};

type Props = {
  nombreCasa: string;
  fotos: Foto[];
};

export default function GaleriaCasa({ nombreCasa, fotos }: Props) {
  const fotosOrdenadas = useMemo(
    () => [...(fotos ?? [])].sort((a, b) => a.orden - b.orden),
    [fotos]
  );

  const fotoInicial =
    fotosOrdenadas.find((f) => f.es_principal) ?? fotosOrdenadas[0];

  const [fotoActiva, setFotoActiva] = useState<Foto | undefined>(fotoInicial);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const indexActivo = fotosOrdenadas.findIndex((f) => f.id === fotoActiva?.id);

  const irA = useCallback(
    (delta: number) => {
      const newIndex = (indexActivo + delta + fotosOrdenadas.length) % fotosOrdenadas.length;
      setFotoActiva(fotosOrdenadas[newIndex]);
    },
    [indexActivo, fotosOrdenadas]
  );

  if (!fotosOrdenadas.length) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        Sin imágenes disponibles
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-2xl cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={fotoActiva?.url}
          alt={fotoActiva?.alt ?? nombreCasa}
          className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px] transition-transform duration-500 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        {/* Expand hint */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
          </svg>
          Ver galería
        </div>
        {/* Counter */}
        <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs text-white">
          {indexActivo + 1} / {fotosOrdenadas.length}
        </div>
      </div>

      {/* Thumbnails */}
      {fotosOrdenadas.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {fotosOrdenadas.map((foto) => {
            const activa = foto.id === fotoActiva?.id;
            return (
              <button
                key={foto.id}
                type="button"
                onClick={() => setFotoActiva(foto)}
                className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  activa
                    ? "border-teal-600 opacity-100 scale-[1.03]"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-stone-300"
                }`}
              >
                <img
                  src={foto.url}
                  alt={foto.alt ?? nombreCasa}
                  className="h-16 w-24 object-cover sm:h-20 sm:w-28"
                  referrerPolicy="no-referrer"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            onClick={() => setLightboxOpen(false)}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Prev */}
          {fotosOrdenadas.length > 1 && (
            <button
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
              onClick={(e) => { e.stopPropagation(); irA(-1); }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <img
            src={fotoActiva?.url}
            alt={fotoActiva?.alt ?? nombreCasa}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {fotosOrdenadas.length > 1 && (
            <button
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
              onClick={(e) => { e.stopPropagation(); irA(1); }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            {indexActivo + 1} / {fotosOrdenadas.length}
          </div>
        </div>
      )}
    </>
  );
}
