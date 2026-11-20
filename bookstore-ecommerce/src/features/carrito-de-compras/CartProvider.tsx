import { useEffect, useReducer, useState, type ReactNode } from "react"
import type { ProductRecord } from "../../types/productRecord"
import { CartContext } from "./CartContext"
import { cartReducer, type CartItem } from "./CartReducer"
import { getCartTotals } from "./CartCalculations"
import { CARRITO_INVITADO, loadCart, saveCart } from "./CartStorage"
import { CartNotification } from "./CartNotification"
import { useAnalytics } from "../analytics/analyticsContext"
import { useSession } from "../session/sessionContext"
import { getPrecioLibro } from "../../utils/segmentarUsuarios"
import { SelectorSucursal } from "../sucursales/SucursalSelector"
import { nombreSucursal, type SucursalId } from "../sucursales/Sucursales"
import { obtenerStockDisponible } from "../../services/inventoryServices"

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
  // Libro que espera a que el cliente elija la sucursal (null = ventana cerrada)
  const [productoPendiente, setProductoPendiente] = useState<ProductRecord | null>(null)
  // Unidades que se van a agregar cuando el cliente elija la sucursal
  const [cantidadPendiente, setCantidadPendiente] = useState(1)

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

  function requestAddItem(product: ProductRecord, cantidad = 1) {
    setCantidadPendiente(cantidad)
    setProductoPendiente(product)
  }

  function addItem(product: ProductRecord, sucursal: SucursalId, cantidad = 1) {
    // Sin existencias suficientes en esa sucursal no se agrega
    const stockDisponible = obtenerStockDisponible(product.objectID, product.inventory.stock_by_branch, sucursal) ?? 0

    if (stockDisponible < cantidad) return
    // El precio se decide aquí, que es donde se conoce al usuario: B2B paga el mayorista, el resto el precio B2C
    dispatch({ type: "ADD_ITEM", product, price: getPrecioLibro(product, user?.role), sucursal, cantidad })
    // Cada clic en "Agregar al carrito" suma las unidades elegidas
    registrarEvento("add_to_cart", {
      productId: product.objectID,
      title: product.productInfo.title,
      category: product.facets.category,
      quantity: cantidad,
    })
    setNotification(
      cantidad > 1
        ? `${cantidad} unidades de "${product.productInfo.title}" se agregaron al carrito (sucursal ${nombreSucursal(sucursal)})`
        : `"${product.productInfo.title}" se agregó al carrito (sucursal ${nombreSucursal(sucursal)})`
    )
  }

  function confirmarSucursal(sucursal: SucursalId) {
    if (productoPendiente) addItem(productoPendiente, sucursal, cantidadPendiente)
    setProductoPendiente(null)
  }

  function increaseQuantity(item: CartItem) {
    dispatch({ type: "INCREASE", id: item.id, sucursal: item.sucursal })
    registrarEvento("add_to_cart", {
      productId: item.id,
      title: item.title,
      quantity: 1,
    })
  }

  function decreaseQuantity(item: CartItem) {
    dispatch({ type: "DECREASE", id: item.id, sucursal: item.sucursal })
  }

  function removeItem(item: CartItem) {
    dispatch({ type: "REMOVE", id: item.id, sucursal: item.sucursal })
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
        requestAddItem,
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
      <SelectorSucursal
        producto={productoPendiente}
        cantidad={cantidadPendiente}
        minimoB2B={user?.role === "BUSINESS" ? productoPendiente?.b2b?.min_order_quantity : null}
        onConfirmar={confirmarSucursal}
        onCancelar={() => setProductoPendiente(null)}
      />
    </CartContext.Provider>
  )
}