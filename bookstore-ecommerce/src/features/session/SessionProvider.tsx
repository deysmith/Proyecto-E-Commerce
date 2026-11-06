import { useState, type ReactNode } from "react"
import {
  endLocalSession,
  getActiveUser,
  recordAnalyticsEvent,
  startLocalSession,
} from "../analytics/analytics"
import { SessionContext } from "./sessionContext"

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getActiveUser)

  function signIn(email: string, name: string) {
    const activeUser = startLocalSession(email, name)
    setUser(activeUser)
    recordAnalyticsEvent("login")
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