import type { CartItem } from "./CartReducer"
import type { RolUsuario } from "../session/roles"
import { getStockSucursal, nombreSucursal } from "../sucursales/Sucursales"

/**
 * Reglas que impiden pasar del carrito al checkout:
 * - minimo-b2b: un cliente B2B tiene menos unidades que el mínimo del libro
 * - agotado: el libro no tiene existencias en la sucursal elegida al agregarlo
 * - stock-insuficiente: hay más unidades en el carrito que en esa sucursal
 */
export type TipoProblema = "minimo-b2b" | "agotado" | "stock-insuficiente"

export interface ProblemaCarrito {
  itemId: string
  titulo: string
  tipo: TipoProblema
  // Mensaje completo, con el nombre del libro (para el aviso del resumen y del checkout)
  mensaje: string
  // Mensaje corto, para mostrarlo dentro de la fila del libro
  detalle: string
}

function unidades(cantidad: number) {
  return `${cantidad} ${cantidad === 1 ? "unidad" : "unidades"}`
}

/**
 * Mínimo B2B que aplica a un libro del carrito. Solo se exige a clientes B2B; para el resto (o si no se conoce) es null.
 */
export function getMinimoB2B(item: CartItem, rol?: RolUsuario): number | null {
  if (rol !== "BUSINESS") return null
  const minimo = item.minOrderQuantity
  return typeof minimo === "number" && minimo > 1 ? minimo : null
}

/**
 * Existencias del libro en la sucursal de la línea. null si no se conocen (carrito anterior a las sucursales).
 */
export function getStockItem(item: CartItem): number | null {
  return item.sucursal ? getStockSucursal(item.stockByBranch, item.sucursal) : null
}

/**
 * Problemas de una línea del carrito. Si el libro está agotado solo se informa eso,
 * porque es lo que impide la compra sin importar la cantidad.
 */
export function validarItem(item: CartItem, rol: RolUsuario | undefined): ProblemaCarrito[] {
  const problemas: ProblemaCarrito[] = []
  const nombre = item.sucursal ? nombreSucursal(item.sucursal) : ""
  const stock = getStockItem(item)
  // Si el mismo libro está en dos sucursales, el nombre de la sucursal distingue cuál línea incumple
  const libro = nombre ? `"${item.title}" (sucursal ${nombre})` : `"${item.title}"`

  if (stock === 0) {
    problemas.push({
      itemId: item.id,
      titulo: item.title,
      tipo: "agotado",
      mensaje: `${libro} está agotado. Quítalo del carrito y agrégalo desde otra sucursal.`,
      detalle: `Agotado en ${nombre}`,
    })
    return problemas
  }

  const minimo = getMinimoB2B(item, rol)
  if (minimo !== null && item.quantity < minimo) {
    const faltan = minimo - item.quantity
    problemas.push({
      itemId: item.id,
      titulo: item.title,
      tipo: "minimo-b2b",
      mensaje: `${libro}: el mínimo para clientes B2B es de ${unidades(minimo)} y tienes ${item.quantity} en el carrito. Agrega ${faltan} más o quítalo del carrito.`,
      detalle: `Mínimo B2B: ${unidades(minimo)} (tienes ${item.quantity})`,
    })
  }

  if (stock !== null && item.quantity > stock) {
    problemas.push({
      itemId: item.id,
      titulo: item.title,
      tipo: "stock-insuficiente",
      mensaje: `${libro}: solo hay ${unidades(stock)} disponibles y tienes ${item.quantity} en el carrito. Reduce la cantidad.`,
      detalle: `Solo hay ${unidades(stock)} en ${nombre}`,
    })
  }

  return problemas
}

/**
 * Todos los problemas del carrito. Si la lista está vacía se puede continuar al checkout.
 */
export function validarCarrito(items: CartItem[], rol: RolUsuario | undefined): ProblemaCarrito[] {
  return items.flatMap((item) => validarItem(item, rol))
}