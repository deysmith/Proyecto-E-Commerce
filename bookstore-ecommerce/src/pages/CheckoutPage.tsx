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
import { CheckoutReview } from "../features/checkout/CheckoutReview"
import { CheckoutOrderCreated } from "../features/checkout/CheckoutOrderCreated"
import { primerPasoConErrores } from "../features/checkout/CheckoutValidations"
import { construirOrden, generarNumeroOrden } from "../features/ordenes/OrderBuilder"
import { cargarOrdenes, guardarOrden } from "../features/ordenes/OrderStorage"
import type { Orden } from "../features/ordenes/OrderTypes"
import { compradorVacio, entregaVacia, type DatosComprador, type DatosEntrega } from "../features/checkout/CheckoutTypes"

const PASOS = ["Comprador", "Entrega", "Resumen y pago"]

/**
 * Página del checkout. Se eligió un checkout de múltiples pasos porque
 * divide el formulario en partes cortas y deja claro en qué etapa está el usuario.
 * Los datos de cada paso se guardan aquí para no perderlos al ir y volver.
 */
export default function CheckoutPage() {
  const { items, totals } = useCart()
  const [paso, setPaso] = useState(0)
  const [comprador, setComprador] = useState<DatosComprador>(compradorVacio)
  const [entrega, setEntrega] = useState<DatosEntrega>(entregaVacia)

  // Orden ya generada y guardada como pendiente (null = todavía no se confirma la compra)
  const [orden, setOrden] = useState<Orden | null>(null)
  // true = se muestra el panel de "orden creada", false = se muestra el resumen para revisar
  const [mostrandoOrden, setMostrandoOrden] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  // true = los formularios muestran sus errores desde el inicio
  const [forzarErrores, setForzarErrores] = useState(false)

  function irAPaso(nuevoPaso: number) {
    setPaso(nuevoPaso)
    // Al salir del último paso se deja de mostrar el panel de orden creada, así al volver se ve el resumen actualizado y no uno viejo
    if (nuevoPaso !== 2) setMostrandoOrden(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function avanzarDesde(pasoActual: number) {
    setForzarErrores(false)
    irAPaso(pasoActual + 1)
  }

  /**
   * Confirma la compra: revisa los datos otra vez, construye la orden con la información del checkout y del carrito, y la guarda como Pendiente.
   */
  function confirmarCompra() {
    // 1) Revisión final: si algo está inválido se devuelve al usuario a ese paso
    const pasoConErrores = primerPasoConErrores(comprador, entrega)
    if (pasoConErrores !== null) {
      setForzarErrores(true)
      irAPaso(pasoConErrores)
      return
    }

    // Numero de orden: si ya se generó uno antes, se mantiene; si no, se genera uno nuevo y único
    const numero = orden && orden.estadoOrden === "pendiente"
      ? orden.numero
      : generarNumeroOrden(cargarOrdenes().map((guardada) => guardada.numero))

    // Se construye la nueva orden con los datos del checkout y del carrito
    const nuevaOrden = construirOrden({ numero, items, totales: totals, comprador, entrega })

    if (!guardarOrden(nuevaOrden)) {
      setErrorGuardado("No pudimos guardar tu orden. Revisa que tu navegador permita guardar datos e inténtalo de nuevo.")
      return
    }

    setErrorGuardado(null)
    setOrden(nuevaOrden)
    setMostrandoOrden(true)
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

        <div className={paso === 2 ? "cart-layout cart-layout--single" : "cart-layout"}>
          <section className="cart-panel checkout-panel" aria-label="Formulario de checkout">
            <CheckoutSteps pasos={PASOS} pasoActual={paso} onIrAPaso={irAPaso} />

            <p className="eyebrow checkout-section__eyebrow">
              Paso {paso + 1} de {PASOS.length}
            </p>

            {paso === 0 && (
              <BuyerForm
                datos={comprador}
                onCambio={setComprador}
                onContinuar={() => avanzarDesde(0)}
                mostrarErroresInicial={forzarErrores}
              />
            )}

            {paso === 1 && (
              <DeliveryForm
                datos={entrega}
                onCambio={setEntrega}
                onAtras={() => irAPaso(0)}
                onContinuar={() => avanzarDesde(1)}
                mostrarErroresInicial={forzarErrores}
              />
            )}

            {paso === 2 && !mostrandoOrden && (
              <CheckoutReview
                comprador={comprador}
                entrega={entrega}
                errorGuardado={errorGuardado}
                onEditar={irAPaso}
                onAtras={() => irAPaso(1)}
                onConfirmar={confirmarCompra}
              />
            )}

            {paso === 2 && mostrandoOrden && orden && (
              <CheckoutOrderCreated orden={orden} onModificar={() => setMostrandoOrden(false)} />
            )}
          </section>

          {paso !== 2 && (
            <CartSummary>
              <Link to="/cart" className="checkout-summary__edit">Editar carrito</Link>
            </CartSummary>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}