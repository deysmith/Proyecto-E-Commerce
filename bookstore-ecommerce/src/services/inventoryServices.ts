
import type { Orden } from "../features/ordenes/OrderTypes"
import type { SucursalId, StockPorSucursal } from "../features/sucursales/Sucursales"
import { fetchProductById } from "./algoliaService"

const INVENTARIO_STORAGE_KEY = "booksmart_inventory"

interface InventarioLocal {
  stock: Record<string, StockPorSucursal>
  ordenesProcesadas: string[]
}

const inventarioVacio: InventarioLocal = {
  stock: {},
  ordenesProcesadas: [],
}

/**
 * Recupera el inventario simulado del navegador.
 */
function cargarInventario(): InventarioLocal {
  try {
    const datos = localStorage.getItem(INVENTARIO_STORAGE_KEY)

    if (!datos) return inventarioVacio

    const inventario = JSON.parse(datos) as InventarioLocal

    return { stock: inventario.stock ?? {}, ordenesProcesadas: inventario.ordenesProcesadas ?? [] }
  } catch {
    return inventarioVacio
  }
}

/**
 * Guarda el inventario simulado.
 */
function guardarInventario(inventario: InventarioLocal): boolean {
  try {
    localStorage.setItem(INVENTARIO_STORAGE_KEY, JSON.stringify(inventario))
    return true

  } catch {
    return false
  }
}

/**
 * Obtiene las existencias actuales de un libro en una sucursal.
 *
 * Si existen existencias modificadas en localStorage,
 * utiliza esas. De lo contrario, utiliza Algolia.
 */
export function obtenerStockDisponible(productoId: string, stockOriginal: StockPorSucursal | undefined, sucursal: SucursalId): number | null {
  const inventario = cargarInventario()
  const stockLocal = inventario.stock[productoId]?.[sucursal]

  if (typeof stockLocal === "number" && Number.isFinite(stockLocal)) {
    return Math.max(0, stockLocal)
  }

  const stockAlgolia = stockOriginal?.[sucursal]

  if (typeof stockAlgolia !== "number" || !Number.isFinite(stockAlgolia)) {
    return null
  }

  return Math.max(0, stockAlgolia)
}

/**
 * Descuenta las existencias de los productos de una orden aprobada.
 *
 * Se procesa cada combinación de producto y sucursal.
 * Una misma orden nunca puede descontar dos veces.
 */
export async function descontarInventarioOrden(orden: Orden): Promise<boolean> {
  if (orden.estadoOrden !== "confirmada" || orden.estadoPago !== "aprobado") {
    return false
  }

  const inventario = cargarInventario()

  // Evita procesar dos veces la misma compra.
  if (inventario.ordenesProcesadas.includes(orden.numero)) {
    return true
  }

  // Agrupa cantidades por producto y sucursal.
  const cantidades = new Map<string, {
    productoId: string
    sucursal: SucursalId
    cantidad: number
  }>()

  for (const producto of orden.productos) {
    if (!producto.sucursal) continue

    const sucursal = producto.sucursal as SucursalId
    const clave = `${producto.id}::${sucursal}`

    const existente = cantidades.get(clave)

    cantidades.set(clave, {
      productoId: producto.id,
      sucursal,
      cantidad: (existente?.cantidad ?? 0) + producto.cantidad,
    })
  }

  if (cantidades.size === 0) return false

  // Recupera los datos originales de Algolia.
  const productos = new Map()

  for (const linea of cantidades.values()) {
    if (!productos.has(linea.productoId)) {
      const producto = await fetchProductById(linea.productoId)

      if (!producto) return false

      productos.set(linea.productoId, producto)
    }
  }

  // Primero valida todas las existencias.
  // No modifica nada si alguna línea no tiene stock suficiente.
  const nuevosStocks: {
    productoId: string
    sucursal: SucursalId
    restante: number
  }[] = []

  for (const linea of cantidades.values()) {
    const producto = productos.get(linea.productoId)

    const stockActual =
      inventario.stock[linea.productoId]?.[linea.sucursal] ??
      producto.inventory.stock_by_branch[linea.sucursal]

    if (
      typeof stockActual !== "number" ||
      !Number.isFinite(stockActual) ||
      stockActual < linea.cantidad
    ) {
      return false
    }

    nuevosStocks.push({
      productoId: linea.productoId,
      sucursal: linea.sucursal,
      restante: stockActual - linea.cantidad,
    })
  }

  // Aplica todos los descuentos.
  for (const linea of nuevosStocks) {
    inventario.stock[linea.productoId] ??= {}

    inventario.stock[linea.productoId][linea.sucursal] =
      linea.restante
  }

  // Registra la orden como procesada en la misma operación de guardado.
  inventario.ordenesProcesadas.push(orden.numero)

  const guardado = guardarInventario(inventario)

  if (guardado) {
    window.dispatchEvent(new Event("booksmart_inventory_updated"))
  }

  return guardado
}

/**
 * Consulta el inventario simulado de un producto.
 */
export function obtenerInventarioProducto(productoId: string, stockOriginal: StockPorSucursal): StockPorSucursal {
  const resultado: StockPorSucursal = {}

  for (const sucursal of ["san-jose", "cartago", "limon"] as const) {
    resultado[sucursal] =
      obtenerStockDisponible(productoId, stockOriginal, sucursal) ?? 0
  }

  return resultado
}