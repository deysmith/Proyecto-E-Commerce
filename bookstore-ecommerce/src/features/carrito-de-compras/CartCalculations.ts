import type { CartItem } from "./CartReducer"

/**
 * Reglas de negocio para los montos del carrito.
 * Se dejan como constantes para poder cambiarlas en un solo lugar.
 */

// Tasa del IVA en Costa Rica (13%)
export const IVA_RATE = 0.13

// Regla de envío: porcentaje del subtotal con un mínimo y un máximo,
// y envío gratis a partir de cierto monto
export const ENVIO_PORCENTAJE = 0.1
export const ENVIO_MINIMO = 1500
export const ENVIO_MAXIMO = 3500
export const ENVIO_GRATIS_DESDE = 40000

export interface CartTotals {
  totalUnidades: number
  subtotal: number
  iva: number
  envio: number
  total: number
}

/**
 * Subtotal de una línea del carrito: precio unitario x cantidad
 */
export function getItemSubtotal(item: CartItem) {
  return item.price * item.quantity
}

/**
 * Calcula el costo de envío según el subtotal actual.
 * - Carrito vacío: no se cobra envío
 * - Subtotal >= ENVIO_GRATIS_DESDE: envío gratis
 * - En otro caso: ENVIO_PORCENTAJE del subtotal, sin bajar de ENVIO_MINIMO
 *   ni pasar de ENVIO_MAXIMO
 */
export function getShippingCost(subtotal: number) {
  if (subtotal <= 0) return 0
  if (subtotal >= ENVIO_GRATIS_DESDE) return 0

  const envio = Math.round(subtotal * ENVIO_PORCENTAJE)
  return Math.min(ENVIO_MAXIMO, Math.max(ENVIO_MINIMO, envio))
}

/**
 * Calcula todos los montos del resumen de compra.
 * Total = Subtotal + IVA + Envío
 */
export function getCartTotals(items: CartItem[]): CartTotals {
  const totalUnidades = items.reduce((suma, item) => suma + item.quantity, 0)
  const subtotal = items.reduce((suma, item) => suma + getItemSubtotal(item), 0)
  const iva = Math.round(subtotal * IVA_RATE)
  const envio = getShippingCost(subtotal)
  const total = subtotal + iva + envio

  return { totalUnidades, subtotal, iva, envio, total }
}