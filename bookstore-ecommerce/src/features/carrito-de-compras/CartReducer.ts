import type { ProductRecord } from "../../types/productRecord"
import type { SucursalId, StockPorSucursal } from "../sucursales/Sucursales"

/**
 * Elemento guardado en el carrito.
 * Solo se guarda la información necesaria (no todo el producto de Algolia)
 * para que lo que va a localStorage sea liviano.
 * El subtotal de cada línea se calcula con getItemSubtotal (precio x cantidad).
 *
 * "price" es el precio unitario que paga el cliente: el B2C o el B2B según su rol cuando agregó el libro.
 * Se guarda aquí una sola vez y de aquí lo leen el carrito, el checkout y la orden, así nunca se contradicen.
 */
export interface CartItem {
  id: string
  title: string
  author: string
  price: number
  image: string
  quantity: number
  sucursal?: SucursalId
  minOrderQuantity?: number
  stockByBranch?: StockPorSucursal
}

export interface CartState {
  items: CartItem[]
}

// Identifica una línea del carrito: el libro y la sucursal desde la que se agregó
export interface LineaId {
  id: string
  sucursal?: SucursalId
}

export function itemKey(linea: LineaId): string {
  return `${linea.id}::${linea.sucursal ?? ""}`
}

// Acciones que puede recibir el reducer
export type CartAction =
  // El precio ya viene resuelto según el rol (el reducer no conoce al usuario, solo recibe el precio)
  // cantidad: unidades que se agregan de una vez (el detalle del producto permite elegirla)
  | { type: "ADD_ITEM"; product: ProductRecord; price: number; sucursal: SucursalId; cantidad: number }
  | ({ type: "INCREASE" } & LineaId)
  | ({ type: "DECREASE" } & LineaId)
  | ({ type: "REMOVE" } & LineaId)
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] }

/**
 * Mínimo B2B y existencias por sucursal del producto, tal como están en el catálogo en este momento
 */
function datosDeValidacion(product: ProductRecord) {
  return {
    minOrderQuantity: product.b2b?.min_order_quantity,
    stockByBranch: { ...product.inventory?.stock_by_branch },
  }
}

/**
 * Convierte un producto del catálogo al formato que usa el carrito
 */
function toCartItem(product: ProductRecord, price: number, sucursal: SucursalId, cantidad: number): CartItem {
  return {
    id: product.objectID,
    title: product.productInfo.title,
    author: product.productInfo.author,
    price,
    image: product.productInfo.image_url,
    quantity: cantidad,
    sucursal,
    ...datosDeValidacion(product),
  }
}

function esLinea(item: CartItem, linea: LineaId) {
  return itemKey(item) === itemKey(linea)
}

/**
 * Reducer del carrito. Todas las modificaciones pasan por aquí.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const linea = { id: action.product.objectID, sucursal: action.sucursal }
      // Siempre un entero de al menos 1
      const cantidad = Math.max(1, Math.floor(action.cantidad) || 1)
      const yaExiste = state.items.some((item) => esLinea(item, linea))

      // Si ese libro ya está en el carrito desde esa sucursal se suma la cantidad en vez de crear otra línea
      if (yaExiste) {
        return {
          items: state.items.map((item) =>
            esLinea(item, linea)
              ? { ...item, ...datosDeValidacion(action.product), quantity: item.quantity + cantidad }
              : item
          ),
        }
      }

      // Si no está, se agrega con la cantidad pedida
      return { items: [...state.items, toCartItem(action.product, action.price, action.sucursal, cantidad)] }
    }

    case "INCREASE":
      return {
        items: state.items.map((item) =>
          esLinea(item, action) ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }

    case "DECREASE":
      // La cantidad nunca baja de 1. Para quitar el producto se usa REMOVE.
      return {
        items: state.items.map((item) =>
          esLinea(item, action)
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        ),
      }

    case "REMOVE":
      return { items: state.items.filter((item) => !esLinea(item, action)) }

    case "CLEAR":
      return { items: [] }

    case "LOAD":
      return { items: action.items }

    default:
      return state
  }
}