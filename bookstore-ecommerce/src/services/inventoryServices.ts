
import type { Orden } from "../features/ordenes/OrderTypes"
import type { SucursalId, StockPorSucursal } from "../features/sucursales/Sucursales"
import { fetchProductById } from "./algoliaService"

const INVENTARIO_STORAGE_KEY = "booksmart_inventory"

const CAMBIOS_STORAGE_KEY = "booksmart_inventory_changes"

// Límites para los cambios manuales del administrador
export const STOCK_MAXIMO = 9999
const MAXIMO_CAMBIOS_GUARDADOS = 20

interface InventarioLocal {
  stock: Record<string, StockPorSucursal>
  ordenesProcesadas: string[]
}

// Se crea uno nuevo cada vez, así nunca se modifica un objeto compartido por error
function inventarioVacio(): InventarioLocal {
  return { stock: {}, ordenesProcesadas: [] }
}

/**
 * Recupera el inventario simulado del navegador.
 */
function cargarInventario(): InventarioLocal {
  try {
    const datos = localStorage.getItem(INVENTARIO_STORAGE_KEY)

    if (!datos) return inventarioVacio()

    const inventario = JSON.parse(datos) as InventarioLocal

    return { stock: inventario.stock ?? {}, ordenesProcesadas: inventario.ordenesProcesadas ?? [] }
  } catch {
    return inventarioVacio()
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


/**
 * Un cambio manual de inventario hecho por el administrador (operación administrativa simulada).
 */
export interface CambioInventario {
  productoId: string
  titulo: string
  sucursal: SucursalId
  anterior: number
  nuevo: number
  // Correo del administrador que hizo el cambio
  admin: string
  fecha: string
}

/**
 * Historial de cambios manuales, del más reciente al más antiguo.
 */
export function obtenerCambiosInventario(): CambioInventario[] {
  try {
    const datos = localStorage.getItem(CAMBIOS_STORAGE_KEY)
    if (!datos) return []

    const cambios = JSON.parse(datos)
    return Array.isArray(cambios) ? cambios : []
  } catch {
    return []
  }
}

interface DatosCambioStock {
  productoId: string
  titulo: string
  stockOriginal: StockPorSucursal
  sucursal: SucursalId
  nuevo: number
  admin: string
}

/**
 * Operación administrativa simulada: cambia las existencias de un libro en una sucursal.
 * El índice de Algolia no se modifica: el nuevo valor se guarda en el inventario local, que tiene prioridad
 * sobre Algolia en toda la tienda (catálogo, detalle, carrito y checkout).
 * Devuelve el cambio registrado, o null si la cantidad no es válida o no se pudo guardar.
 */
export function actualizarStockManual({ productoId, titulo, stockOriginal, sucursal, nuevo, admin }: DatosCambioStock): CambioInventario | null {
  if (!Number.isInteger(nuevo) || nuevo < 0 || nuevo > STOCK_MAXIMO) return null

  const anterior = obtenerStockDisponible(productoId, stockOriginal, sucursal) ?? 0
  const inventario = cargarInventario()

  inventario.stock[productoId] ??= {}
  inventario.stock[productoId][sucursal] = nuevo

  if (!guardarInventario(inventario)) return null

  const cambio: CambioInventario = { productoId, titulo, sucursal, anterior, nuevo, admin, fecha: new Date().toISOString() }

  try {
    const cambios = [cambio, ...obtenerCambiosInventario()].slice(0, MAXIMO_CAMBIOS_GUARDADOS)
    localStorage.setItem(CAMBIOS_STORAGE_KEY, JSON.stringify(cambios))
  } catch {
    // Sin espacio en localStorage: solo se pierde el historial
  }

  window.dispatchEvent(new Event("booksmart_inventory_updated"))
  return cambio
}