import type { EstadoOrden, EstadoPago, Orden } from "./OrderTypes"

/**
 * Guarda las órdenes en localStorage, así la orden queda registrada aunque el usuario recargue la página.
 */

export const ORDERS_STORAGE_KEY = "booksmart_orders"

const ESTADOS_ORDEN: EstadoOrden[] = ["pendiente", "confirmada", "fallida"]
const ESTADOS_PAGO: EstadoPago[] = ["pendiente", "aprobado", "rechazado", "error"]

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null
}

/**
 * Revisa que un objeto leído de localStorage tenga la forma de una Orden.
 * Así si hay datos viejos o dañados no se cae la aplicación.
 */
function esOrdenValida(dato: unknown): dato is Orden {
  if (!esObjeto(dato)) return false

  return (
    typeof dato.numero === "string" &&
    typeof dato.fecha === "string" &&
    ESTADOS_ORDEN.includes(dato.estadoOrden as EstadoOrden) &&
    ESTADOS_PAGO.includes(dato.estadoPago as EstadoPago) &&
    esObjeto(dato.comprador) &&
    esObjeto(dato.entrega) &&
    Array.isArray(dato.productos) &&
    esObjeto(dato.montos) &&
    typeof dato.montos.total === "number"
  )
}

/**
 * Devuelve todas las órdenes guardadas. Si no hay nada o el JSON está malo, devuelve una lista vacía.
 */
export function cargarOrdenes(): Orden[] {
  try {
    const guardado = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!guardado) return []

    const datos = JSON.parse(guardado)
    if (!Array.isArray(datos)) return []

    return datos.filter(esOrdenValida)
  } catch {
    return []
  }
}

/**
 * Guarda una orden. Si ya existe una con el mismo número la reemplaza (así no se duplica); si no, la agrega al final.
 * Devuelve true si se pudo guardar y false si falló (por ejemplo, si el navegador bloquea localStorage), para que la pantalla avise al usuario en vez de seguir como si nada.
 */
export function guardarOrden(orden: Orden): boolean {
  try {
    const ordenes = cargarOrdenes()
    const posicion = ordenes.findIndex((existente) => existente.numero === orden.numero)

    if (posicion >= 0) {
      ordenes[posicion] = orden
    } else {
      ordenes.push(orden)
    }

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordenes))
    return true
  } catch {
    return false
  }
}