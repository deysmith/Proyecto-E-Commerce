import type { CartItem, CartState } from "./CartReducer"

export const CART_STORAGE_KEY = "booksmart_cart"

/**
 * Revisa que un objeto leído de localStorage tenga la forma de un CartItem.
 * Así si hay datos viejos o dañados no se cae la aplicación.
 */
function esCartItemValido(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false
  const i = item as Record<string, unknown>

  return (
    typeof i.id === "string" &&
    typeof i.title === "string" &&
    typeof i.price === "number" &&
    typeof i.image === "string" &&
    typeof i.quantity === "number" &&
    i.quantity >= 1
  )
}

/**
 * Recupera el carrito guardado. Si no hay nada o el JSON está malo,
 * se empieza con un carrito vacío.
 */
export function loadCart(): CartState {
  try {
    const guardado = localStorage.getItem(CART_STORAGE_KEY)
    if (!guardado) return { items: [] }

    const datos = JSON.parse(guardado)
    if (!Array.isArray(datos)) return { items: [] }

    return { items: datos.filter(esCartItemValido) }
  } catch {
    return { items: [] }
  }
}

/**
 * Guarda los productos del carrito en localStorage
 */
export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Si el navegador bloquea localStorage el carrito sigue funcionando en memoria
  }
}