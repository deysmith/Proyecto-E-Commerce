import { useState, type ReactNode } from "react"
import type { ProductRecord } from "../../types/productRecord"
import { CartContext, type CartItem } from "./CartContext"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(product: ProductRecord) {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.objectID === product.objectID)

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.objectID === product.objectID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })
  }

  function increaseQuantity(objectID: string) {
    setItems((currentItems) => currentItems.map((item) =>
      item.product.objectID === objectID
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  }

  function decreaseQuantity(objectID: string) {
    setItems((currentItems) => currentItems.map((item) =>
      item.product.objectID === objectID
        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
        : item
    ))
  }

  function removeItem(objectID: string) {
    setItems((currentItems) => currentItems.filter((item) => item.product.objectID !== objectID))
  }

  return (
    <CartContext.Provider value={{ items, addItem, increaseQuantity, decreaseQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}