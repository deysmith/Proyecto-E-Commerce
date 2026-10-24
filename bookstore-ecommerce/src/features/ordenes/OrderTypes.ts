import type { DatosComprador } from "../checkout/CheckoutTypes"

export type EstadoOrden = "pendiente" | "confirmada" | "fallida"
export type EstadoPago = "pendiente" | "aprobado" | "rechazado" | "error"

export const ETIQUETA_ESTADO_ORDEN: Record<EstadoOrden, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  fallida: "Fallida",
}

export const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  error: "Error del servicio",
}

/**
 * Un libro dentro de la orden.
 * Se guarda una copia con el precio del momento de la compra, así si el precio
 * del catálogo cambia después, la orden no se modifica.
 */
export interface ProductoOrden {
  id: string
  titulo: string
  autor: string
  precioUnitario: number
  cantidad: number
  subtotal: number
  imagen?: string
}

/**
 * Dirección de entrega con los nombres, para poder mostrarla en el resumen y guardarla en la orden.
 */
export interface EntregaOrden {
  provincia: string
  canton: string
  distrito: string
  direccion: string
  infoAdicional: string
}

// Montos de la orden: son los mismos que calcula el carrito
export interface MontosOrden {
  subtotal: number
  iva: number
  envio: number
  total: number
}
 /**
  * Una orden de compra, tal como se guarda en la base de datos y se muestra en la pantalla de confirmación.
  * Se guarda una copia de los datos del comprador y de la entrega, así si el usuario cambia sus datos después, la orden no se modifica.
  * Se guarda una copia de los productos y montos, así si el catálogo cambia después, la orden no se modifica.
  */
export interface Orden {
  // Número único que ve el usuario
  numero: string
  // Fecha y hora de creación en formato ISO (ej. 2026-10-11T23:50:00.000Z)
  fecha: string
  comprador: DatosComprador
  entrega: EntregaOrden
  productos: ProductoOrden[]
  montos: MontosOrden
  moneda: "CRC"
  estadoOrden: EstadoOrden
  estadoPago: EstadoPago
  // Aceptación de los términos y políticas. Se registra al generar la orden, con la versión de los documentos
  // que el cliente aceptó (opcional porque las órdenes guardadas antes de tener versión no la tienen)
  aceptacionTerminos: {
    aceptado: boolean
    fecha: string | null
    version?: string | null
  }
  intentosPago?: number
  pago?: PagoOrden
}

/**
 * Datos del último intento de pago, tal como los devolvió el servicio Sandbox.
 */
export interface PagoOrden {
  idTransaccion: string | null
  fecha: string
  mensaje: string
  tarjeta?: { marca: string; ultimos4: string } | null
}