import { createContext, useContext } from "react"
import type { AnalyticsEvent, AnalyticsEventDetails, AnalyticsEventType } from "./analytics"

interface AnalyticsContextValue {
  ownerId: string
  events: AnalyticsEvent[]
  registrarEvento: (type: AnalyticsEventType, details?: AnalyticsEventDetails) => void
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

/**
 * Hook para registrar y consultar eventos desde cualquier componente sin pasar props
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error("useAnalytics debe usarse dentro de AnalyticsProvider")
  return context
}