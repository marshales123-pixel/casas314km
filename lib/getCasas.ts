import { supabase } from "./supabase";
import { unstable_cache } from "next/cache";

async function fetchCasas() {
  const { data: casas, error: casasError } = await supabase
    .from("casas")
    .select("*")
    .eq("activa", true)
    .order("orden_home", { ascending: true })
    .order("created_at", { ascending: false });

  if (casasError) {
    console.log("Error al traer casas:", casasError);
    return [];
  }

  const { data: fotos, error: fotosError } = await supabase
    .from("fotos")
    .select("*")
    .order("orden", { ascending: true });

  if (fotosError) {
    console.log("Error al traer fotos:", fotosError);
  }

  const casasConFotos = (casas ?? []).map((casa) => {
    const fotosDeCasa = (fotos ?? [])
      .filter((foto) => foto.casa_id === casa.id)
      .sort((a, b) => a.orden - b.orden);

    return {
      ...casa,
      fotos: fotosDeCasa,
    };
  });

  return casasConFotos;
}

export const getCasas = unstable_cache(fetchCasas, ["casas"], {
  tags: ["casas"],
  revalidate: 3600,
});
