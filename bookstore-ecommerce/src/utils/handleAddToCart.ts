import type { ProductRecord } from "../types/productRecord"

export function handleAddToCart(
  event: React.MouseEvent<HTMLButtonElement>,
  product: ProductRecord,
  addItem: (product: ProductRecord, cantidad?: number) => void,
  // Unidades a agregar; el detalle del producto permite elegirla, el catálogo agrega 1
  cantidad = 1
) {
  event.preventDefault()
  event.stopPropagation()

  addItem(product, cantidad)
}