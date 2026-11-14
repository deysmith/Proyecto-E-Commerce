import { algoliasearch } from "algoliasearch"
import {
  cargarOrdenes,
  cargarOrdenesPendientesAlgolia,
  esOrdenValida,
  marcarOrdenesSincronizadas,
} from "../features/ordenes/OrderStorage"
import type { Orden } from "../features/ordenes/OrderTypes"

/**
 * Conexión con el índice de órdenes de Algolia.
 *
 * Usa una API key propia con permisos solo de "search" y "addObject"
 * sobre el índice de órdenes.
 */
const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID
const ORDERS_KEY = import.meta.env.VITE_ALGOLIA_ORDERS_KEY
const INDEX_NAME = import.meta.env.VITE_INDEX_NAME_ORDERS

const cliente = APP_ID && ORDERS_KEY && INDEX_NAME ? algoliasearch(APP_ID, ORDERS_KEY) : null

// Los envíos se hacen de uno en uno, así una versión vieja de la orden nunca llega después de la nueva
let colaDeEnvios: Promise<unknown> = Promise.resolve()

async function enviarOrden(orden: Orden): Promise<boolean> {
  if (!cliente) return false

  try {
    // El objectID es el número de orden: enviar la misma orden otra vez la actualiza, no la duplica
    await cliente.saveObject({
      indexName: INDEX_NAME,
      body: { ...orden, objectID: orden.numero },
    })
  } catch {
    return false
  }

  // Se saca de la cola solo si no cambió mientras se enviaba (si cambió, sigue pendiente su versión nueva)
  const enCola = cargarOrdenesPendientesAlgolia().find((pendiente) => pendiente.numero === orden.numero)
  if (!enCola || JSON.stringify(enCola) === JSON.stringify(orden)) {
    marcarOrdenesSincronizadas([orden.numero])
  }
  return true
}

/**
 * Envía una orden (nueva o actualizada) al índice de órdenes de Algolia.
 * Nunca lanza error: devuelve false si no se pudo y la orden sigue en la cola para reintentarla.
 */
export function sincronizarOrden(orden: Orden): Promise<boolean> {
  const envio = colaDeEnvios.then(() => enviarOrden(orden))
  colaDeEnvios = envio
  return envio
}

/**
 * Reintenta enviar las órdenes que quedaron pendientes (por ejemplo, si no había internet al comprar).
 * Devuelve cuántas se lograron sincronizar.
 */
export async function sincronizarPendientes(): Promise<number> {
  if (!cliente) return 0

  const resultados = await Promise.all(cargarOrdenesPendientesAlgolia().map(sincronizarOrden))
  return resultados.filter(Boolean).length
}

/**
 * Trae de Algolia las órdenes de un cliente. Devuelve null si Algolia no está disponible.
 * Requiere que "clienteId" esté como filterOnly en attributesForFaceting del índice
 */
async function obtenerOrdenesDeAlgolia(clienteId: string): Promise<Orden[] | null> {
  if (!cliente) return null

  try {
    // Se escapan las comillas y las barras para que el filtro de Algolia no se rompa
    const idSeguro = clienteId.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

    const respuesta = await cliente.searchSingleIndex({
      indexName: INDEX_NAME,
      searchParams: { query: "", filters: `clienteId:"${idSeguro}"`, hitsPerPage: 100 },
    })

    return (respuesta.hits as unknown[]).filter(esOrdenValida)
  } catch {
    return null
  }
}

// Las órdenes anteriores a este cambio no tienen clienteId: en esas el dueño es el usuarioId (el correo)
function perteneceAlCliente(orden: Orden, clienteId: string): boolean {
  return orden.clienteId === clienteId || (orden.clienteId === undefined && orden.usuarioId === clienteId)
}

export interface OrdenesDelCliente {
  ordenes: Orden[]
  // false si no se pudo consultar Algolia y solo se muestran las órdenes guardadas en este dispositivo
  algoliaDisponible: boolean
}

/**
 * Órdenes de una persona (usuario con sesión o invitado): las de Algolia más las guardadas en este dispositivo.
 * Si una orden está en los dos lados se usa la copia local, porque es la más reciente mientras esté pendiente de sincronizar.
 */
export async function consultarOrdenesDelCliente(clienteId: string): Promise<OrdenesDelCliente> {
  const locales = cargarOrdenes().filter((orden) => perteneceAlCliente(orden, clienteId))
  const remotas = await obtenerOrdenesDeAlgolia(clienteId)

  const porNumero = new Map<string, Orden>()
  for (const orden of remotas ?? []) porNumero.set(orden.numero, orden)
  for (const orden of locales) porNumero.set(orden.numero, orden)

  const ordenes = [...porNumero.values()].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return { ordenes, algoliaDisponible: remotas !== null }
}
