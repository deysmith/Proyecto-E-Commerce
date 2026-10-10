import { useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { useCart } from "../features/carrito-de-compras/useCart"
import { CartItemRow } from "../features/carrito-de-compras/CartItemRow"
import { CartSummary } from "../features/carrito-de-compras/CartSummary"
import { CartEmpty } from "../features/carrito-de-compras/CartEmpty"

/**
 * Página del carrito: lista de libros y resumen de compra.
 */
export default function CartPage() {
  const { items, totals, clearCart } = useCart()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)

  const unidades = totals.totalUnidades

  function vaciarCarrito() {
    clearCart()
    setConfirmarVaciar(false)
  }

  return (
    <div className="catalog-shell">
      <Header />

      <main className="cart-page">
        <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Carrito</span>
        </nav>

        <div className="cart-head">
          <div>
            <h1 className="cart-head__title">Tu carrito</h1>
            {items.length > 0 && (
              <p className="cart-head__count">
                {unidades} {unidades === 1 ? "libro listo" : "libros listos"} para comprar
              </p>
            )}
          </div>

          {/* Vaciar el carrito pide confirmación para evitar borrarlo por accidente */}
          {items.length > 0 && (
            <div className="cart-clear">
              {confirmarVaciar ? (
                <>
                  <span>¿Quitar todos los libros?</span>
                  <button type="button" className="cart-clear__yes" onClick={vaciarCarrito}>
                    Sí, vaciar
                  </button>
                  <button type="button" className="cart-clear__no" onClick={() => setConfirmarVaciar(false)}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="button" className="cart-clear__open" onClick={() => setConfirmarVaciar(true)}>
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <CartEmpty texto={"Agrega libros desde el catálogo y aquí vas a ver el resumen de tu compra."} />
        ) : (
          <div className="cart-layout">
            <section className="cart-panel" aria-label="Libros en el carrito">
              <div className="cart-panel__head" aria-hidden="true">
                <span>Libro</span>
                <span>Cantidad</span>
                <span>Subtotal</span>
              </div>

              <ul className="cart-rows">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </ul>

              <div className="cart-panel__foot">
                <Link to="/" className="cart-panel__back">Seguir comprando</Link>
              </div>
            </section>

            {/* En el Proyecto 2 aquí adentro va el botón para ir al checkout */}
            <CartSummary />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}