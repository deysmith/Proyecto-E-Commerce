/**
 * Id del invitado
 *
 * Se genera una sola vez y se guarda en localStorage, así las órdenes que haga esa persona
 * quedan asociadas a este navegador y se pueden volver a mostrar en este mismo computador.
 */

export const GUEST_ID_STORAGE_KEY = "booksmart_guest_id"
let idEnMemoria: string | null = null

function generarId(): string {
  const aleatorio = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `guest-${aleatorio}`
}

/**
 * Devuelve el id del invitado. Si todavía no existe, lo crea y lo guarda.
 */
export function obtenerIdInvitado(): string {
  try {
    const existente = localStorage.getItem(GUEST_ID_STORAGE_KEY)
    if (existente) return existente

    const nuevo = generarId()
    localStorage.setItem(GUEST_ID_STORAGE_KEY, nuevo)
    return nuevo
  } catch {
    idEnMemoria ??= generarId()
    return idEnMemoria
  }
}
