import type { ProductRecord } from "../../types/productRecord"

/**
 * Elemento guardado en el carrito.
 * Solo se guarda la información necesaria (no todo el producto de Algolia)
 * para que lo que va a localStorage sea liviano.
 * El subtotal de cada línea se calcula con getItemSubtotal (precio x cantidad).
 */
export interface CartItem {
  id: string
  title: string
  author: string
  price: number
  image: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

// Acciones que puede recibir el reducer
export type CartAction =
  | { type: "ADD_ITEM"; product: ProductRecord }
  | { type: "INCREASE"; id: string }
  | { type: "DECREASE"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }

/**
 * Convierte un producto del catálogo al formato que usa el carrito
 */
function toCartItem(product: ProductRecord): CartItem {
  return {
    id: product.objectID,
    title: product.productInfo.title,
    author: product.productInfo.author,
    price: product.pricing.price_crc,
    image: product.productInfo.image_url,
    quantity: 1,
  }
}

/**
 * Reducer del carrito. Todas las modificaciones pasan por aquí.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const yaExiste = state.items.some((item) => item.id === action.product.objectID)

      // Si ya está en el carrito se aumenta la cantidad en vez de crear otra línea
      if (yaExiste) {
        return {
          items: state.items.map((item) =>
            item.id === action.product.objectID
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }

      // Si no está, se agrega con cantidad 1
      return { items: [...state.items, toCartItem(action.product)] }
    }

    case "INCREASE":
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }

    case "DECREASE":
      // La cantidad nunca baja de 1. Para quitar el producto se usa REMOVE.
      return {
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        ),
      }

    case "REMOVE":
      return { items: state.items.filter((item) => item.id !== action.id) }

    case "CLEAR":
      return { items: [] }

    default:
      return state
  }
}