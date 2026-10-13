/**
 * Tipos de datos que se usan para enviar y recibir pagos en la pasarela.
 * Se usan en el checkout y en el servicio de pago (sandbox).
 */

export type ResultadoPago = "PAYMENT_APPROVED" | "PAYMENT_DECLINED" | "PAYMENT_ERROR"

/**
 * Datos de la tarjeta que el comprador escribe en la pasarela.
 * Solo se usan para enviar el pago: nunca se guardan en localStorage ni en la orden.
 */
export interface DatosTarjeta {
  holderName: string
  number: string
  expMonth: number
  expYear: number
  cvc: string
}

/**
 * Lo que la tienda le envía al proveedor para cobrar una orden.
 */
export interface SolicitudPago {
  orderId: string
  amount: number
  currency: "CRC"
  card: DatosTarjeta
}

/**
 * Lo que el proveedor responde.
 */
export interface RespuestaPago {
  orderId: string
  status: ResultadoPago
  transactionId: string | null
  message: string
  card: { brand: string; last4: string } | null
  processedAt: string
}