import { createContext, useContext } from "react"
import type { SucursalId } from "./Sucursales"

interface SucursalContextValue {
  sucursal: SucursalId
  setSucursal: (id: SucursalId) => void
}

export const SucursalContext = createContext<SucursalContextValue | null>(null)

export function useSucursal() {
  const context = useContext(SucursalContext)
  if (!context) throw new Error("useSucursal debe usarse dentro de SucursalProvider")
  return context
}
