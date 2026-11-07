import { useState, type ReactNode } from "react"
import {
  endLocalSession,
  getActiveUser,
  getSessionId,
  moveSessionEventsToUser,
  recordAnalyticsEvent,
  startLocalSession,
} from "../analytics/analytics"
import { SessionContext } from "./sessionContext"
import { moveRecentSearches } from "../../utils/recentSearches"
import { moveRecentProducts } from "../../utils/recentProducts"

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getActiveUser)

  function signIn(email: string, name: string) {
    const activeUser = startLocalSession(email, name)
    // Lo que hizo como invitado en esta sesión pasa a su usuario
    moveSessionEventsToUser(activeUser.email)
    moveRecentSearches(getSessionId(), activeUser.email)
    moveRecentProducts(getSessionId(), activeUser.email)
    setUser(activeUser)
    recordAnalyticsEvent("login", {
      email: activeUser.email,
      name: activeUser.name,
      sessionId: getSessionId(),
    })
  }

  function signOut() {
    endLocalSession()
    setUser(null)
  }

  return (
    <SessionContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}