import { createContext } from "react"
import type { ProductRecord } from "../../types/productRecord"

export interface CartItem {
  product: ProductRecord
  quantity: number
}

export interface CartContextValue {
  items: CartItem[]
  addItem: (product: ProductRecord) => void
  increaseQuantity: (objectID: string) => void
  decreaseQuantity: (objectID: string) => void
  removeItem: (objectID: string) => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)