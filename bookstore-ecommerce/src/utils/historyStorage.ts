/**
 * Funciones para guardar y recuperar listas de historial en localStorage.
 * Se guardan como un mapa de listas, donde la clave es el ID del propietario del historial.
 * Por ejemplo, para guardar el historial de búsqueda de un usuario se puede usar su ID de usuario como clave.
 */
type HistoryMap<T> = Record<string, T[]>

function readMap<T>(storageKey: string): HistoryMap<T> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}

    const data: unknown = JSON.parse(raw)
    // Si el formato no es el esperado se ignora
    if (typeof data !== "object" || data === null || Array.isArray(data)) return {}

    return data as HistoryMap<T>
  } catch {
    return {}
  }
}

function saveMap<T>(storageKey: string, map: HistoryMap<T>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(map))
  } catch {
    // Si el LocalStorage está lleno o no se puede escribir, se ignora el error
  }
}

export function readHistory<T>(storageKey: string, ownerId: string): T[] {
  const list = readMap<T>(storageKey)[ownerId]
  return Array.isArray(list) ? list : []
}

export function saveHistory<T>(storageKey: string, ownerId: string, list: T[]) {
  const map = readMap<T>(storageKey)
  map[ownerId] = list
  saveMap(storageKey, map)
}

export function clearHistory(storageKey: string, ownerId: string) {
  const map = readMap(storageKey)
  delete map[ownerId]
  saveMap(storageKey, map)
}