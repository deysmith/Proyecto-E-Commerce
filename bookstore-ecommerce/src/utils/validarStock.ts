import type { ProductRecord } from "../types/productRecord";
import type { SucursalId } from "../features/sucursales/Sucursales";

export function tieneStock(producto:ProductRecord) {
  return producto.inventory.stock_by_branch.cartago !== 0 || producto.inventory.stock_by_branch.limon !== 0 || producto.inventory.stock_by_branch["san-jose"] !== 0
}

export function tieneStockEnSucursal(producto: ProductRecord, sucursal: SucursalId) {
  return (producto.inventory.stock_by_branch[sucursal] ?? 0) > 0
}
