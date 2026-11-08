import type { ProductRecord } from "../types/productRecord"
import { clearHistory, readHistory, saveHistory } from "./historyStorage"

const STORAGE_KEY = "booksmart_recent_products"
const MAX_RECENT_PRODUCTS = 8

function isValidProduct(item: unknown): item is ProductRecord {
  return (
    typeof item === "object" &&
    item !== null &&
    "objectID" in item &&
    typeof item.objectID === "string" &&
    "productInfo" in item &&
    typeof item.productInfo === "object" &&
    "pricing" in item &&
    "facets" in item
  )
}

/**
 * Libros vistos recientemente por el usuario o sesión, el más reciente va de primero.
 */
export function getRecentProducts(ownerId: string): ProductRecord[] {
  return readHistory<unknown>(STORAGE_KEY, ownerId).filter(isValidProduct)
}

/**
 * Agrega un libro al inicio del historial. Si ya estaba, sube al inicio.
 * Se guarda sin la descripción para que localStorage no se llene.
 */
export function addRecentProduct(ownerId: string, product: ProductRecord) {
  const limpio: ProductRecord = {
    objectID: product.objectID,
    productInfo: { ...product.productInfo, description: "" },
    pricing: product.pricing,
    b2b: product.b2b,
    inventory: product.inventory,
    rating: product.rating,
    facets: product.facets,
  }

  const withoutDuplicates = getRecentProducts(ownerId).filter(
    (item) => item.objectID !== product.objectID
  )
  const updated = [limpio, ...withoutDuplicates].slice(0, MAX_RECENT_PRODUCTS)
  saveHistory(STORAGE_KEY, ownerId, updated)
}

/**
 * Al iniciar sesión, los libros vistos como invitado se unen a los del usuario.
 */
export function moveRecentProducts(fromOwner: string, toOwner: string) {
  const merged = [...getRecentProducts(fromOwner), ...getRecentProducts(toOwner)]
  const withoutDuplicates = merged.filter(
    (product, index) => merged.findIndex((item) => item.objectID === product.objectID) === index
  )
  saveHistory(STORAGE_KEY, toOwner, withoutDuplicates.slice(0, MAX_RECENT_PRODUCTS))
  clearHistory(STORAGE_KEY, fromOwner)
}