import type { ProductRecord } from "../types/productRecord";

export function tieneStock(producto:ProductRecord) {
  return producto.inventory.stock_by_branch.cartago !== 0 || producto.inventory.stock_by_branch.limon !== 0 || producto.inventory.stock_by_branch["san-jose"] !== 0
}