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
import type { UsuarioValidado } from "./authService"
import { descartarCarritoInvitado } from "../carrito-de-compras/CartStorage"
import { moveRecentSearches } from "../../utils/recentSearches"
import { moveRecentProducts } from "../../utils/recentProducts"

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getActiveUser)

  function signIn(usuario: UsuarioValidado) {
    const activeUser = startLocalSession(usuario.correo, usuario.nombre, usuario.rol)
    descartarCarritoInvitado()
    // Lo que hizo como invitado en esta sesión pasa a su usuario
    moveSessionEventsToUser(activeUser.email)
    moveRecentSearches(getSessionId(), activeUser.email)
    moveRecentProducts(getSessionId(), activeUser.email)
    setUser(activeUser)
    recordAnalyticsEvent("login", {
      email: activeUser.email,
      name: activeUser.name,
      role: activeUser.role,
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