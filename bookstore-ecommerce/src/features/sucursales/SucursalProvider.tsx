import { useState, type ReactNode } from "react"
import { SucursalContext } from "./sucursalContext"
import { SUCURSAL_POR_DEFECTO, esSucursalValida, type SucursalId } from "./Sucursales"

export const SUCURSAL_STORAGE_KEY = "booksmart_sucursal"

function leerSucursalGuardada(): SucursalId {
  try {
    const guardada = localStorage.getItem(SUCURSAL_STORAGE_KEY)
    return esSucursalValida(guardada) ? guardada : SUCURSAL_POR_DEFECTO
  } catch {
    return SUCURSAL_POR_DEFECTO
  }
}

/**
 * Guarda la sucursal que eligió el cliente y la recuerda en este navegador.
 * De ella salen el stock que se muestra en el detalle y en el carrito, y la validación del checkout.
 */
export function SucursalProvider({ children }: { children: ReactNode }) {
  const [sucursal, setSucursalState] = useState<SucursalId>(leerSucursalGuardada)

  function setSucursal(id: SucursalId) {
    setSucursalState(id)
    try {
      localStorage.setItem(SUCURSAL_STORAGE_KEY, id)
    } catch {
      // Si el navegador bloquea localStorage la elección sigue funcionando mientras la página esté abierta
    }
  }

  return (
    <SucursalContext.Provider value={{ sucursal, setSucursal }}>
      {children}
    </SucursalContext.Provider>
  )
}
