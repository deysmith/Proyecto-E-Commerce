import { useEffect, useState, type ReactNode } from "react"
import {
  ANALYTICS_CHANGE_EVENT,
  getAnalyticsEvents,
  getSessionId,
  recordAnalyticsEvent,
} from "./analytics"
import { AnalyticsContext } from "./analyticsContext"
import { useSession } from "../session/sessionContext"

/**
 * Proveedor global de analytics.
 * Al cargar la app crea el id de sesión si no existe uno activo.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const [sessionId] = useState(getSessionId)
  const [, setVersion] = useState(0)

  const ownerId = user?.email ?? sessionId

  useEffect(() => {
    const refresh = () => setVersion((actual) => actual + 1)
    window.addEventListener(ANALYTICS_CHANGE_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(ANALYTICS_CHANGE_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  // Se leen en cada render: el Provider solo se vuelve a dibujar cuando cambia el usuario o los eventos
  const events = getAnalyticsEvents(ownerId)

  return (
    <AnalyticsContext.Provider value={{ ownerId, events, registrarEvento: recordAnalyticsEvent }}>
      {children}
    </AnalyticsContext.Provider>
  )
}