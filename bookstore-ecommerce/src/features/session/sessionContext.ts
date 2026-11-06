import { createContext, useContext } from "react"
import type { LocalUser } from "../analytics/analytics"

interface SessionContextValue {
  user: LocalUser | null
  signIn: (email: string, name: string) => void
  signOut: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider")
  return context
}