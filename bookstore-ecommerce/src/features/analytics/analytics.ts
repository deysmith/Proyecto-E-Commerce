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
  type: AnalyticsEventType
  timestamp: string
  details: AnalyticsEventDetails
}

export interface LocalUser {
  email: string
  name: string
  loginAt: string
}

const USER_STORAGE_KEY = "booksmart_active_user"
const EVENTS_STORAGE_KEY = "booksmart_analytics_events"
const SESSION_STORAGE_KEY = "booksmart_analytics_session"
const MAX_EVENTS = 1000

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
      !("loginAt" in user) ||
      typeof user.loginAt !== "string"
    ) return null

    return { email: user.email, name: user.name, loginAt: user.loginAt }
  } catch {
    return null
  }
}

export function startLocalSession(email: string, name: string): LocalUser {
  const user = { email: email.trim().toLowerCase(), name: name.trim(), loginAt: new Date().toISOString() }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  return user
}

export function endLocalSession() {
  localStorage.removeItem(USER_STORAGE_KEY)
}

function getSessionId(): string {
  try {
    const existingId = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existingId) return existingId

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    return sessionId
  } catch {
    return `session-${Date.now()}`
  }
}

export function recordAnalyticsEvent(type: AnalyticsEventType, details: AnalyticsEventDetails = {}) {
  try {
    const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY)
    const events: AnalyticsEvent[] = storedEvents ? JSON.parse(storedEvents) : []
    const userId = getActiveUser()?.email ?? getSessionId()
    events.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      type,
      timestamp: new Date().toISOString(),
      details,
    })
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    return
  }
}

export function getAnalyticsEvents(userId: string): AnalyticsEvent[] {
  try {
    const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!storedEvents) return []

    const events: unknown = JSON.parse(storedEvents)
    if (!Array.isArray(events)) return []

    return events.filter(
      (event): event is AnalyticsEvent =>
        typeof event === "object" &&
        event !== null &&
        "userId" in event &&
        event.userId === userId &&
        "type" in event &&
        "timestamp" in event &&
        "details" in event,
    )
  } catch {
    return []
  }
}