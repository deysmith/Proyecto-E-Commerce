import type { RespuestaPago } from "../pagos/PaymentTypes"
import type { Orden } from "./OrderTypes"

/**
 * Aplica el resultado del pago a la orden y devuelve la orden actualizada.
 * Se usa tanto en el checkout como en el panel de administración.
 * Una orden ya confirmada no se vuelve a cobrar ni a modificar.
 * El pago se guarda en la orden, pero nunca se guarda la tarjeta completa.
 */
export function aplicarResultadoPago(orden: Orden, respuesta: RespuestaPago): Orden {
  // Una orden ya confirmada no se vuelve a cobrar ni a modificar
  if (orden.estadoOrden === "confirmada") return orden

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

  if (respuesta.status === "PAYMENT_DECLINED") {
    return { ...orden, estadoOrden: "pendiente", estadoPago: "rechazado", pago }
  }

  return { ...orden, estadoOrden: "pendiente", estadoPago: "error", pago }
}