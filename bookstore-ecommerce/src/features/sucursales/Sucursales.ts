import { useEffect, useState } from "react"
import type { ProductRecord } from "../../types/productRecord"

/**
 * Sucursales de la tienda. Los ids son las llaves de inventory.stock_by_branch en Algolia.
 */
export type SucursalId = keyof ProductRecord["inventory"]["stock_by_branch"]

// Existencias por sucursal. Es parcial porque los carritos guardados antes de esta versión no la tienen.
export type StockPorSucursal = Partial<Record<SucursalId, number>>

export const SUCURSALES: { id: SucursalId; nombre: string }[] = [
  { id: "san-jose", nombre: "San José" },
  { id: "cartago", nombre: "Cartago" },
  { id: "limon", nombre: "Limón" },
]

export const SUCURSAL_POR_DEFECTO: SucursalId = "san-jose"

export function esSucursalValida(valor: unknown): valor is SucursalId {
  return SUCURSALES.some((sucursal) => sucursal.id === valor)
}

export function nombreSucursal(id: SucursalId): string {
  return SUCURSALES.find((sucursal) => sucursal.id === id)?.nombre ?? id
}

export function useInventarioActualizado() {
  const [versionInventario, setVersionInventario] = useState(0)

  useEffect(() => {
    function actualizarInventario() {
      setVersionInventario((version) => version + 1)
    }

    window.addEventListener("booksmart_inventory_updated",actualizarInventario)

    return () => {
      window.removeEventListener("booksmart_inventory_updated",actualizarInventario)
    }
  }, [])

  return versionInventario
}