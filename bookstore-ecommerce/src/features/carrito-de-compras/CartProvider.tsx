import { useEffect, useReducer, useState, type ReactNode } from "react"
import type { ProductRecord } from "../../types/productRecord"
import { CartContext } from "./CartContext"
import { cartReducer } from "./CartReducer"
import { getCartTotals } from "./CartCalculations"
import { CARRITO_INVITADO, loadCart, saveCart } from "./CartStorage"
import { CartNotification } from "./CartNotification"
import { useAnalytics } from "../analytics/analyticsContext"
import { useSession } from "../session/sessionContext"

/**
 * Proveedor del estado global del carrito (Context API + useReducer).
 * Flujo: acción -> reducer actualiza el estado -> se guarda en localStorage.
 * Al cargar la app, el estado inicial se recupera de localStorage.
 * Cada usuario tiene su propio carrito; sin sesión se usa el carrito del invitado.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const owner = user?.email ?? CARRITO_INVITADO
  const [state, dispatch] = useReducer(cartReducer, owner, loadCart)
  const [ownerCargado, setOwnerCargado] = useState(owner)

  if (ownerCargado !== owner) {
    setOwnerCargado(owner)
    dispatch({ type: "LOAD", items: loadCart(owner).items })
  }
  const { registrarEvento } = useAnalytics()
  const [notification, setNotification] = useState<string | null>(null)

  // Cada vez que cambian los productos se guarda el carrito de su dueño
  useEffect(() => {
    saveCart(ownerCargado, state.items)
  }, [ownerCargado, state.items])

  // La notificación se cierra sola a los 3 segundos.
  // Si se agrega otro producto antes, el contador se reinicia.
  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => setNotification(null), 3000)
    return () => clearTimeout(timer)
  }, [notification])

  function addItem(product: ProductRecord) {
    dispatch({ type: "ADD_ITEM", product })
    // Cada clic en "Agregar al carrito" suma una unidad
    registrarEvento("add_to_cart", {
      productId: product.objectID,
      title: product.productInfo.title,
      category: product.facets.category,
      quantity: 1,
    })
    setNotification(`"${product.productInfo.title}" se agregó al carrito`)
  }

  function increaseQuantity(id: string) {
    dispatch({ type: "INCREASE", id })
  }

  function decreaseQuantity(id: string) {
    dispatch({ type: "DECREASE", id })
  }

  function removeItem(id: string) {
    dispatch({ type: "REMOVE", id })
  }

  // Se va a usar en el Proyecto 2 cuando el pago sea aprobado
  function clearCart() {
    dispatch({ type: "CLEAR" })
  }

  function closeNotification() {
    setNotification(null)
  }

  const totals = getCartTotals(state.items)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totals,
        addItem,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        notification,
        closeNotification,
      }}
    >
      {children}
      <CartNotification message={notification} onClose={closeNotification} />
    </CartContext.Provider>
  )
}