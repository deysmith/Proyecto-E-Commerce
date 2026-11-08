/**
 * Tipos y funciones para manejar la analítica de la app. Los eventos se guardan en localStorage y se pueden consultar desde cualquier parte de la app.
 * Los eventos se guardan con el correo del usuario si hay sesión iniciada, o con el id de la sesión si es un invitado.
 * Se pueden consultar los eventos de un usuario o sesión con getAnalyticsEvents(userId).
 * Cuando un invitado inicia sesión, los eventos que hizo en esta sesión pasan a ser de su usuario con moveSessionEventsToUser(email).
 */

import { esRolValido, type RolUsuario } from "../session/roles"

export type AnalyticsEventType =
  | "login"
  | "search"
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "purchase_completed"

export type AnalyticsEventDetails = Record<string, string | number | boolean>

export interface AnalyticsEvent {
  id: string
  userId: string
  sessionId: string
  type: AnalyticsEventType
  timestamp: string
  details: AnalyticsEventDetails
}

export interface LocalUser {
  email: string
  name: string
  role: RolUsuario
  loginAt: string
}

export const USER_STORAGE_KEY = "booksmart_active_user"
export const EVENTS_STORAGE_KEY = "booksmart_analytics_events"
export const SESSION_STORAGE_KEY = "booksmart_analytics_session"
const MAX_EVENTS = 1000

// Nombre del aviso que se lanza cada vez que cambian los eventos
export const ANALYTICS_CHANGE_EVENT = "booksmart-analytics-change"

export function getActiveUser(): LocalUser | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) return null

    const user: unknown = JSON.parse(storedUser)
    if (
      typeof user !== "object" ||
      user === null ||
      !("email" in user) ||
      typeof user.email !== "string" ||
      !("name" in user) ||
      typeof user.name !== "string" ||
      !("role" in user) ||
      !esRolValido(user.role) ||
      !("loginAt" in user) ||
      typeof user.loginAt !== "string"
    ) return null

    return { email: user.email, name: user.name, role: user.role, loginAt: user.loginAt }
  } catch {
    return null
  }
}

export function startLocalSession(email: string, name: string, role: RolUsuario): LocalUser {
  const user = { email: email.trim().toLowerCase(), name: name.trim(), role, loginAt: new Date().toISOString() }
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Si el navegador bloquea localStorage la sesión solo dura mientras la página esté abierta
  }
  return user
}

export function endLocalSession() {
  try {
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch {
    // No se puede hacer nada si el navegador bloquea localStorage, la sesión se pierde al cerrar la página
  }
}

// Respaldo por si el navegador no deja usar sessionStorage
let memorySessionId: string | null = null

/**
 * Devuelve el id de la sesión actual. Si no existe uno, lo crea.
 */
export function getSessionId(): string {
  try {
    const existingId = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existingId) return existingId

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    return sessionId
  } catch {
    if (!memorySessionId) memorySessionId = `session-${Date.now()}`
    return memorySessionId
  }
}

/**
 * Dueño de los datos: el correo si hay sesión iniciada, si no el id de la sesión.
 */
export function getOwnerId(): string {
  return getActiveUser()?.email ?? getSessionId()
}

function isValidEvent(event: unknown): event is AnalyticsEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    "id" in event &&
    "userId" in event &&
    typeof event.userId === "string" &&
    "type" in event &&
    typeof event.type === "string" &&
    "timestamp" in event &&
    typeof event.timestamp === "string" &&
    "details" in event &&
    typeof event.details === "object"
  )
}

/**
 * Lee todos los eventos guardados. Si los datos no existen o están corruptos,
 * devuelve una lista vacía en vez de romper la app.
 */
function readEvents(): AnalyticsEvent[] {
  try {
    const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!storedEvents) return []

    const events: unknown = JSON.parse(storedEvents)
    if (!Array.isArray(events)) return []

    return events.filter(isValidEvent)
  } catch {
    return []
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    // Si no se puede guardar (localStorage lleno o bloqueado) la app sigue funcionando
  }
  // Avisa a la app que los eventos cambiaron
  window.dispatchEvent(new Event(ANALYTICS_CHANGE_EVENT))
}

/**
 * Registra un evento en localStorage. Se puede usar desde cualquier parte de la app.
 */
export function recordAnalyticsEvent(type: AnalyticsEventType, details: AnalyticsEventDetails = {}) {
  const events = readEvents()
  events.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId: getOwnerId(),
    sessionId: getSessionId(),
    type,
    timestamp: new Date().toISOString(),
    details,
  })
  saveEvents(events)
}

/**
 * Devuelve los eventos de un usuario o sesión.
 */
export function getAnalyticsEvents(userId: string): AnalyticsEvent[] {
  return readEvents().filter((event) => event.userId === userId)
}

/**
 * Cuando un invitado inicia sesión, los eventos que hizo en esta sesión pasan a ser de su usuario.
 */
export function moveSessionEventsToUser(email: string) {
  const sessionId = getSessionId()
  const events = readEvents().map((event) =>
    event.userId === sessionId ? { ...event, userId: email } : event,
  )
  saveEvents(events)
}