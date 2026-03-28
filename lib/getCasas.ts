import { supabase } from "./supabase";

export async function getCasas() {
  const { data: casas, error } = await supabase
    .from("casas")
    .select("*, fotos(*)")
    .eq("activa", true)
    .order("orden_home", { ascending: true })
    .order("created_at", { ascending: false })
    .order("orden", { ascending: true, referencedTable: "fotos" });

  if (error) {
    console.error("Error al traer casas:", error);
    return [];
  }

  return (casas ?? []).map((casa) => ({
    ...casa,
    fotos: (casa.fotos ?? []).sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden),
  }));
}
