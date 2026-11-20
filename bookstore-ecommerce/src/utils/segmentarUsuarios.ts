import type { ProductRecord } from "../types/productRecord"
import type { RolUsuario } from "../features/session/roles"
import { formatPrice } from "./formatPrice"

/**
 * Precio que corresponde al usuario actual.
 * Solo el cliente B2B paga el precio mayorista. B2C, invitados y administrador usan el precio B2C.
 * Devuelve null si el precio no existe o está dañado (vacío, negativo, cero o no es un número).
 * @param rol - Rol del usuario, o undefined si no hay sesión
 */
export function getPrecioLibro(product: ProductRecord, rol?: RolUsuario): number | null {
  const precio = rol === "BUSINESS" ? product.b2b?.wholesale_price_crc : product.pricing?.price_crc
  return typeof precio === "number" && Number.isFinite(precio) && precio > 0 ? precio : null
}

/**
 * Precio listo para mostrar en pantalla. Si el precio no es válido se avisa en vez de mostrar "NaN".
 */
export function textoPrecioLibro(product: ProductRecord, rol?: RolUsuario): string {
  const precio = getPrecioLibro(product, rol)
  return precio === null ? "Precio no disponible" : formatPrice(precio)
}