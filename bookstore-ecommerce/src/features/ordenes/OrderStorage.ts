import type { EstadoOrden, EstadoPago, Orden } from "./OrderTypes"

/**
 * Guarda las órdenes en localStorage, así la orden queda registrada aunque el usuario recargue la página.
 */

export const ORDERS_STORAGE_KEY = "booksmart_orders"

/**
 * Guarda las órdenes nuevas que todavía no se han sincronizado con Algolia.
 */
export const ORDERS_PENDING_ALGOLIA_KEY = "booksmart_orders_pendientes_algolia"

const ESTADOS_ORDEN: EstadoOrden[] = ["pendiente", "confirmada", "fallida"]
const ESTADOS_PAGO: EstadoPago[] = ["pendiente", "aprobado", "rechazado", "error"]

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null
}

/**
 * Revisa que un objeto leído de localStorage tenga la forma de una Orden.
 * Así si hay datos viejos o dañados no se cae la aplicación.
 */
export function esOrdenValida(dato: unknown): dato is Orden {
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
 * Devuelve las órdenes nuevas que todavía están pendientes
 * de sincronización con Algolia.
 */
export function cargarOrdenesPendientesAlgolia(): Orden[] {
  try {
    const guardado = localStorage.getItem(ORDERS_PENDING_ALGOLIA_KEY)
    if (!guardado) return []

    const datos = JSON.parse(guardado)
    if (!Array.isArray(datos)) return []

    return datos.filter(esOrdenValida)
  } catch {
    return []
  }
}

/**
 * Guarda una orden en localStorage.
 *
 * Toda orden guardada (nueva o actualizada) queda en la cola de sincronización
 * hasta que Algolia confirme que recibió esa versión. Así, si el envío falla
 * (sin internet, por ejemplo), el cambio se reintenta después y Algolia no se
 * queda con un estado viejo de la orden.
 */
export function guardarOrden(orden: Orden): boolean {
  try {
    const ordenes = cargarOrdenes()
    const pendientes = cargarOrdenesPendientesAlgolia()

    const posicion = ordenes.findIndex(
      (existente) => existente.numero === orden.numero
    )

    const esNueva = posicion < 0

    if (esNueva) {
      ordenes.push(orden)
    } else {
      ordenes[posicion] = orden
    }

    // Siempre queda en la cola: se reemplaza su versión si ya estaba.
    const posicionPendiente = pendientes.findIndex(
      (existente) => existente.numero === orden.numero
    )

    if (posicionPendiente >= 0) {
      pendientes[posicionPendiente] = orden
    } else {
      pendientes.push(orden)
    }

    const ordenesAnteriores = localStorage.getItem(ORDERS_STORAGE_KEY)
    const pendientesAnteriores = localStorage.getItem(
      ORDERS_PENDING_ALGOLIA_KEY
    )

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordenes))

    try {
      localStorage.setItem(
        ORDERS_PENDING_ALGOLIA_KEY,
        JSON.stringify(pendientes)
      )
    } catch {
      // Si falla la cola, se intenta restaurar el almacenamiento anterior.
      if (ordenesAnteriores === null) {
        localStorage.removeItem(ORDERS_STORAGE_KEY)
      } else {
        localStorage.setItem(ORDERS_STORAGE_KEY, ordenesAnteriores)
      }

      if (pendientesAnteriores === null) {
        localStorage.removeItem(ORDERS_PENDING_ALGOLIA_KEY)
      } else {
        localStorage.setItem(
          ORDERS_PENDING_ALGOLIA_KEY,
          pendientesAnteriores
        )
      }

      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Marca como sincronizadas las órdenes indicadas.
 *
 * Se debe llamar únicamente después de que Algolia confirme que
 * recibió correctamente las órdenes (lo hace ordersService, o el script
 * de Node si se usa el registro manual).
 *
 * No elimina las órdenes originales de localStorage.
 */
export function marcarOrdenesSincronizadas(numeros: string[]): boolean {
  try {
    const numerosSincronizados = new Set(numeros)

    const pendientes = cargarOrdenesPendientesAlgolia().filter(
      (orden) => !numerosSincronizados.has(orden.numero)
    )

    localStorage.setItem(
      ORDERS_PENDING_ALGOLIA_KEY,
      JSON.stringify(pendientes)
    )

    return true
  } catch {
    return false
  }
}

/**
 * Busca una orden por su número. Devuelve null si no existe.
 */
export function buscarOrden(numero: string): Orden | null {
  return cargarOrdenes().find((orden) => orden.numero === numero) ?? null
}