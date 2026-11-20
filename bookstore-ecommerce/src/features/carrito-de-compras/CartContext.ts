import { createContext } from "react"
import type { ProductRecord } from "../../types/productRecord"
import type { CartItem } from "./CartReducer"
import type { SucursalId } from "../sucursales/Sucursales"
import type { CartTotals } from "./CartCalculations"

/**
 * Lo que expone el contexto del carrito a cualquier componente
 */
export interface CartContextValue {
  items: CartItem[]
  totals: CartTotals
  // Agrega el libro desde una sucursal ya elegida
  addItem: (product: ProductRecord, sucursal: SucursalId, cantidad?: number) => void
  // Abre la ventana para elegir la sucursal y, al confirmar, agrega el libro. Es lo que usan los botones "Agregar al carrito"
  requestAddItem: (product: ProductRecord, cantidad?: number) => void
  increaseQuantity: (item: CartItem) => void
  decreaseQuantity: (item: CartItem) => void
  removeItem: (item: CartItem) => void
  clearCart: () => void
  notification: string | null
  closeNotification: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)