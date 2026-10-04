import { createContext } from "react"
import type { ProductRecord } from "../../types/productRecord"
import type { CartItem } from "./CartReducer"
import type { CartTotals } from "./CartCalculations"

export type { CartItem }

/**
 * Lo que expone el contexto del carrito a cualquier componente
 */
export interface CartContextValue {
  items: CartItem[]
  totals: CartTotals
  addItem: (product: ProductRecord) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
  removeItem: (id: string) => void
  clearCart: () => void
  notification: string | null
  closeNotification: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)