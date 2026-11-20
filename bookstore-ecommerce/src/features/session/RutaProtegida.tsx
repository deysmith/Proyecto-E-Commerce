import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useSession } from "./sessionContext"
import type { RolAcceso } from "./roles"
import { AccesoDenegado } from "./AccesoDenegado"

interface RutaProtegidaProps {
  rolesPermitidos: RolAcceso[]
  children: ReactNode
}

/**
 * Control de acceso basado en roles (RBAC) a nivel de la interfaz.
 * - Si el rol actual está permitido, se muestra la página.
 * - Si no hay sesión y la página pide un rol, se manda al login y después vuelve aquí.
 * - Si hay sesión pero el rol no tiene permiso, se muestra la pantalla de acceso denegado.
 */
export function RutaProtegida({ rolesPermitidos, children }: RutaProtegidaProps) {
  const { user } = useSession()
  const location = useLocation()
  const rolActual: RolAcceso = user?.role ?? "INVITADO"

  if (rolesPermitidos.includes(rolActual)) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <AccesoDenegado rol={user.role} />
}