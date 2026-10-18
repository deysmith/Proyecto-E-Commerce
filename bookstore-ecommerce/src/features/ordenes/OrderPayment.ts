import type { RespuestaPago } from "../pagos/PaymentTypes"
import type { EstadoOrden, Orden } from "./OrderTypes"

// Intentos de pago sin éxito que se permiten. Al llegar a este número la orden queda "fallida"
export const MAX_INTENTOS_PAGO = 3

/**
 * Aplica el resultado del pago a la orden y devuelve la orden actualizada.
 * Se usa para actualizar la orden después de que el usuario realiza un pago en la pasarela de pagos.
 * Una orden ya confirmada no se vuelve a cobrar ni a modificar, y una fallida ya no se puede pagar.
 * El pago se guarda en la orden, pero nunca se guarda la tarjeta completa.
 */
export function aplicarResultadoPago(orden: Orden, respuesta: RespuestaPago): Orden {
  // Una orden ya confirmada no se vuelve a cobrar ni a modificar, y una fallida ya no se puede pagar
  if (orden.estadoOrden === "confirmada" || orden.estadoOrden === "fallida") return orden

  const pago = {
    idTransaccion: respuesta.transactionId,
    fecha: respuesta.processedAt,
    mensaje: respuesta.message,
    // Solo se guarda la marca y los últimos 4 dígitos de la tarjeta
    tarjeta: respuesta.card ? { marca: respuesta.card.brand, ultimos4: respuesta.card.last4 } : null,
  }

  if (respuesta.status === "PAYMENT_APPROVED") {
    return { ...orden, estadoOrden: "confirmada", estadoPago: "aprobado", pago }
  }

  // Rechazado o con error: cuenta como un intento sin éxito.
  // La orden sigue "pendiente" mientras queden intentos; al agotarlos queda "fallida".
  const intentosPago = (orden.intentosPago ?? 0) + 1
  const estadoOrden: EstadoOrden = intentosPago >= MAX_INTENTOS_PAGO ? "fallida" : "pendiente"
  const estadoPago = respuesta.status === "PAYMENT_DECLINED" ? "rechazado" : "error"

  return { ...orden, estadoOrden, estadoPago, intentosPago, pago }
}

/**
 * Cuántos intentos de pago le quedan a la orden.
 */
export function intentosRestantes(orden: Orden): number {
  return Math.max(0, MAX_INTENTOS_PAGO - (orden.intentosPago ?? 0))
}