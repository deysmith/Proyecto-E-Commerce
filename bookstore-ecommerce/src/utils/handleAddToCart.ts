import type { ProductRecord } from "../types/productRecord"

export function handleAddToCart(
  event: React.MouseEvent<HTMLButtonElement>,
  product: ProductRecord,
  addItem: (product: ProductRecord) => void
) {
  event.preventDefault()
  event.stopPropagation()

  addItem(product)
}