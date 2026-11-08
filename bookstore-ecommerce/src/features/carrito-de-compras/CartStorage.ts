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

// Dueño del carrito cuando no hay una sesión iniciada
export const CARRITO_INVITADO = "invitado"
type CarritosGuardados = Record<string, unknown>

function leerCarritos(): CarritosGuardados {
  try {
    const guardado = localStorage.getItem(CART_STORAGE_KEY)
    if (!guardado) return {}

    const datos: unknown = JSON.parse(guardado)
    // Formato anterior (una sola lista para todos): se toma como el carrito del invitado
    if (Array.isArray(datos)) return { [CARRITO_INVITADO]: datos }
    if (typeof datos !== "object" || datos === null) return {}

    return datos as CarritosGuardados
  } catch {
    return {}
  }
}

function guardarCarritos(carritos: CarritosGuardados) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carritos))
  } catch {
    // Si el navegador bloquea localStorage el carrito sigue funcionando en memoria
  }
}

/**
 * Recupera el carrito guardado de un dueño.
 * Si no hay nada o los datos están dañados, se empieza con un carrito vacío.
 */
export function loadCart(owner: string): CartState {
  const items = leerCarritos()[owner]
  if (!Array.isArray(items)) return { items: [] }

  return { items: items.filter(esCartItemValido) }
}

/**
 * Guarda los productos del carrito de un dueño en localStorage
 */
export function saveCart(owner: string, items: CartItem[]) {
  const carritos = leerCarritos()
  carritos[owner] = items
  guardarCarritos(carritos)
}

/**
 * Borra el carrito del invitado. Se usa al iniciar sesión, porque se prioriza el carrito guardado en la cuenta del usuario.
 */
export function descartarCarritoInvitado() {
  const carritos = leerCarritos()
  delete carritos[CARRITO_INVITADO]
  guardarCarritos(carritos)
}