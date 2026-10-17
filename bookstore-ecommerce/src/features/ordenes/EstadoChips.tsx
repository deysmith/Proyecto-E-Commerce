import {
  ETIQUETA_ESTADO_ORDEN,
  ETIQUETA_ESTADO_PAGO,
  type EstadoOrden,
  type EstadoPago,
} from "./OrderTypes"

/**
 * Etiquetas de color para el estado de la orden y el estado del pago.
 * Pendiente = amarillo, bueno = verde oscuro (color principal), malo = rojo.
 */
export function EstadoOrdenChip({ estado }: { estado: EstadoOrden }) {
  const clase = estado === "confirmada" ? "ok" : estado === "fallida" ? "error" : "pendiente"
  return <span className={`checkout-chip checkout-chip--${clase}`}>{ETIQUETA_ESTADO_ORDEN[estado]}</span>
}

export function EstadoPagoChip({ estado }: { estado: EstadoPago }) {
  const clase = estado === "aprobado" ? "ok" : estado === "pendiente" ? "pendiente" : "error"
  return <span className={`checkout-chip checkout-chip--${clase}`}>{ETIQUETA_ESTADO_PAGO[estado]}</span>
}