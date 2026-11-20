import type { ProductRecord } from "../types/productRecord"
import type { RolUsuario } from "../features/session/roles"

/**
 * Precio que corresponde al usuario actual.
 * Solo el cliente B2B paga el precio mayorista. B2C, invitados y administrador usan el precio B2C.
 * @param rol - Rol del usuario, o undefined si no hay sesión
 */
export function getPrecioLibro(product: ProductRecord, rol?: RolUsuario): number {
  return rol === "BUSINESS" ? product.b2b.wholesale_price_crc : product.pricing.price_crc
}