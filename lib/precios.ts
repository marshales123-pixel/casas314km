export function formatPrecio(
  precio: number | null | undefined,
  moneda: string | null | undefined
): string | null {
  if (precio == null) return null;
  if (moneda === "USD") return `USD ${precio.toLocaleString("en-US")}`;
  return `$${precio.toLocaleString("es-AR")}`;
}

export function calcularPromo(
  precio: number | null | undefined,
  promoActiva: boolean | null | undefined,
  promoDescuento: number | null | undefined,
  descuentoValor: number | null | undefined
) {
  if (precio == null) {
    return { original: null, final: null, tienePromo: false, porcentaje: null };
  }

  const porcentaje =
    promoActiva && promoDescuento != null && promoDescuento > 0
      ? promoDescuento
      : descuentoValor != null && descuentoValor > 0
        ? descuentoValor
        : null;

  if (!porcentaje) {
    return { original: precio, final: precio, tienePromo: false, porcentaje: null };
  }

  const final = Math.round(precio * (1 - porcentaje / 100));
  return { original: precio, final, tienePromo: true, porcentaje };
}
