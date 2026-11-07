import type { AnalyticsEvent } from "../analytics/analytics"
import type { ProductRecord } from "../../types/productRecord"

// Cuánto pesa cada tipo de evento para decidir la categoría favorita
const PESOS: Partial<Record<AnalyticsEvent["type"], number>> = {
  search: 1,
  product_view: 1,
  add_to_cart: 2,
}

/**
 * Categoría que más se repite en una lista de libros.
 * Devuelve null si la lista está vacía.
 */
export function getCategoriaMasComun(libros: ProductRecord[]): string | null {
  const conteo: Record<string, number> = {}
  for (const libro of libros) {
    const categoria = libro.facets.category
    if (categoria) conteo[categoria] = (conteo[categoria] ?? 0) + 1
  }

  let masComun: string | null = null
  for (const categoria in conteo) {
    if (masComun === null || conteo[categoria] > conteo[masComun]) masComun = categoria
  }
  return masComun
}

/**
 * Busca la categoría más vista o buscada a partir de los eventos del usuario.
 * Buscar suma 1 punto a la categoría de los resultados, ver un libro suma 1 y agregarlo al carrito suma 2.
 * Devuelve null si todavía no hay eventos con categoría.
 */
export function getCategoriaFavorita(events: AnalyticsEvent[]): string | null {
  const puntos: Record<string, number> = {}

  for (const event of events) {
    const peso = PESOS[event.type]
    const categoria = event.details.category
    if (!peso || typeof categoria !== "string" || !categoria) continue
    puntos[categoria] = (puntos[categoria] ?? 0) + peso
  }

  let favorita: string | null = null
  for (const categoria in puntos) {
    if (favorita === null || puntos[categoria] > puntos[favorita]) {
      favorita = categoria
    }
  }
  return favorita
}

/**
 * Ids de los libros que el usuario ya vio, para no recomendárselos otra vez.
 */
export function getIdsVistos(events: AnalyticsEvent[]): Set<string> {
  const ids = new Set<string>()
  for (const event of events) {
    if (event.type === "product_view" && typeof event.details.productId === "string") {
      ids.add(event.details.productId)
    }
  }
  return ids
}