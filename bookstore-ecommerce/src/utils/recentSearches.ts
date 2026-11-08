import { clearHistory, readHistory, saveHistory } from "./historyStorage"

const STORAGE_KEY = "booksmart_recent_searches"
const MAX_RECENT_SEARCHES = 5

/**
 * Búsquedas recientes del usuario o sesión, la más reciente va de primero.
 */
export function getRecentSearches(ownerId: string): string[] {
  return readHistory<unknown>(STORAGE_KEY, ownerId).filter(
    (item): item is string => typeof item === "string",
  )
}

/**
 * Agrega una búsqueda al inicio. Si ya existía se mueve al inicio en vez de repetirla.
 */
export function addRecentSearch(ownerId: string, term: string) {
  const trimmed = term.trim()
  if (!trimmed) return

  const withoutDuplicates = getRecentSearches(ownerId).filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  )

  const updated = [trimmed, ...withoutDuplicates].slice(0, MAX_RECENT_SEARCHES)
  saveHistory(STORAGE_KEY, ownerId, updated)
}

/**
 * Elimina una sola búsqueda del historial.
 */
export function removeRecentSearch(ownerId: string, term: string) {
  const updated = getRecentSearches(ownerId).filter(
    (item) => item.toLowerCase() !== term.toLowerCase()
  )
  saveHistory(STORAGE_KEY, ownerId, updated)
}

export function clearRecentSearches(ownerId: string) {
  clearHistory(STORAGE_KEY, ownerId)
}

/**
 * Al iniciar sesión, las búsquedas del invitado se unen a las del usuario.
 */
export function moveRecentSearches(fromOwner: string, toOwner: string) {
  const merged = [...getRecentSearches(fromOwner), ...getRecentSearches(toOwner)]
  const withoutDuplicates = merged.filter(
    (term, index) => merged.findIndex((item) => item.toLowerCase() === term.toLowerCase()) === index
  )
  saveHistory(STORAGE_KEY, toOwner, withoutDuplicates.slice(0, MAX_RECENT_SEARCHES))
  clearHistory(STORAGE_KEY, fromOwner)
}