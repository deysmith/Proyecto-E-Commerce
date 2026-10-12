import { useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { useCart } from "../features/carrito-de-compras/useCart"
import { CartSummary } from "../features/carrito-de-compras/CartSummary"
import { CartEmpty } from "../features/carrito-de-compras/CartEmpty"
import { CheckoutSteps } from "../features/checkout/CheckoutSteps"
import { BuyerForm } from "../features/checkout/BuyerForm"
import { DeliveryForm } from "../features/checkout/DeliveryForm"
import { compradorVacio, entregaVacia, type DatosComprador, type DatosEntrega } from "../features/checkout/CheckoutTypes"

const PASOS = ["Comprador", "Entrega", "Resumen y pago"]

/**
 * Página del checkout. Se eligió un checkout de múltiples pasos porque
 * divide el formulario en partes cortas y deja claro en qué etapa está el usuario.
 * Los datos de cada paso se guardan aquí para no perderlos al ir y volver.
 */
export default function CheckoutPage() {
  const { items } = useCart()
  const [paso, setPaso] = useState(0)
  const [comprador, setComprador] = useState<DatosComprador>(compradorVacio)
  const [entrega, setEntrega] = useState<DatosEntrega>(entregaVacia)

  function irAPaso(nuevoPaso: number) {
    setPaso(nuevoPaso)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Sin productos no se puede hacer checkout: se bloquea el acceso y se explica el porqué.
  // Cuando el pago esté implementado, se puede redirigir al usuario a la página de catálogo o carrito.
  if (items.length === 0) {
    return (
      <div className="catalog-shell">
        <Header />

        <main className="cart-page">
          <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Catálogo</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Checkout</span>
          </nav>

          <CartEmpty texto="Para iniciar el checkout necesitas al menos un libro en tu carrito. Agrega alguno desde el catálogo y vuelve aquí para completar tu compra." />
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="catalog-shell">
      <Header />

      <main className="cart-page">
        <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <Link to="/cart">Carrito</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Checkout</span>
        </nav>

        <div className="cart-head">
          <div>
            <h1 className="cart-head__title">Finalizar compra</h1>
            <p className="cart-head__count">Completa tu compra en {PASOS.length} pasos sencillos</p>
          </div>
        </div>

        <div className="cart-layout">
          <section className="cart-panel checkout-panel" aria-label="Formulario de checkout">
            <CheckoutSteps pasos={PASOS} pasoActual={paso} onIrAPaso={irAPaso} />

            <p className="eyebrow checkout-section__eyebrow">
              Paso {paso + 1} de {PASOS.length}
            </p>

            {paso === 0 && (
              <BuyerForm
                datos={comprador}
                onCambio={setComprador}
                onContinuar={() => irAPaso(1)}
              />
            )}

            {paso === 1 && (
              <DeliveryForm
                datos={entrega}
                onCambio={setEntrega}
                onAtras={() => irAPaso(0)}
                onContinuar={() => irAPaso(2)}
              />
            )}

            {paso === 2 && (
              <div className="checkout-form">
                <h2 className="checkout-section__title">Resumen y pago</h2>
                <p className="checkout-section__intro">Esta sección se completa en las siguientes tareas.</p>

                <div className="checkout-actions">
                  <button type="button" className="checkout-btn checkout-btn--ghost" onClick={() => irAPaso(1)}>
                    Atrás
                  </button>
                </div>
              </div>
            )}
          </section>

          <CartSummary>
            <Link to="/cart" className="checkout-summary__edit">Editar carrito</Link>
          </CartSummary>
        </div>
      </main>

      <Footer />
    </div>
  )
}