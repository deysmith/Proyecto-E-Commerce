import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { useCart } from "../features/carrito-de-compras/useCart"
import { CartSummary } from "../features/carrito-de-compras/CartSummary"
import { CartEmpty } from "../features/carrito-de-compras/CartEmpty"
import { CheckoutSteps } from "../features/checkout/CheckoutSteps"
import { BuyerForm } from "../features/checkout/BuyerForm"
import { DeliveryForm } from "../features/checkout/DeliveryForm"
import { CheckoutReview } from "../features/checkout/CheckoutReview"
import { CheckoutPayment } from "../features/checkout/CheckoutPayment"
import { primerPasoConErrores } from "../features/checkout/CheckoutValidations"
import { construirOrden, generarNumeroOrden } from "../features/ordenes/OrderBuilder"
import { cargarOrdenes, guardarOrden } from "../features/ordenes/OrderStorage"
import type { Orden } from "../features/ordenes/OrderTypes"
import { compradorVacio, entregaVacia, type DatosComprador, type DatosEntrega } from "../features/checkout/CheckoutTypes"

const PASOS = ["Comprador", "Entrega", "Resumen", "Pago"]

/**
 * Página del checkout. Se eligió un checkout de múltiples pasos porque divide el formulario en partes cortas y deja claro en qué etapa está el usuario.
 * Los datos de cada paso se guardan aquí para no perderlos al ir y volver.
 */
export default function CheckoutPage() {
  const { items, totals, clearCart } = useCart()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(0)
  const [comprador, setComprador] = useState<DatosComprador>(compradorVacio)
  const [entrega, setEntrega] = useState<DatosEntrega>(entregaVacia)

  // Orden ya generada y guardada como pendiente
  const [orden, setOrden] = useState<Orden | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  // true cuando los formularios muestran sus errores desde el inicio
  const [forzarErrores, setForzarErrores] = useState(false)

  function irAPaso(nuevoPaso: number) {
    setPaso(nuevoPaso)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function avanzarDesde(pasoActual: number) {
    setForzarErrores(false)
    irAPaso(pasoActual + 1)
  }

  /**
   * Confirmacion de la compra: se valida todo, se genera la orden y se guarda en localStorage.
   * Si ya había una orden pendiente, se mantiene su número y se reemplaza con los datos nuevos.
   * Si no, se genera un número único nuevo.
   * Si no se puede guardar la orden, se muestra un error y no se avanza.
   */
  function confirmarCompra() {
    // Si algo esta mal, se fuerza a que los formularios muestren sus errores y se regresa al primer paso con errores
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
    irAPaso(3)
  }

  /**
   * Pago aprobado: la orden ya está confirmada y guardada. Se pasa a la pantalla de confirmación y se vacía el carrito.
   */
  function terminarCompra(ordenConfirmada: Orden) {
    // Se guarda la orden confirmada en la página para que el carrito vacío no active el bloqueo de abajo mientras se cambia de pantalla
    setOrden(ordenConfirmada)
    // replace: true para que el botón "atrás" no regrese a un checkout ya pagado
    // state: respaldo por si el navegador no deja leer la orden de localStorage
    navigate(`/confirmacion/${ordenConfirmada.numero}`, { replace: true, state: { orden: ordenConfirmada } })
    clearCart()
  }

  // Sin productos no se puede hacer checkout: se bloquea el acceso y se explica el porqué.
  // Excepción: cuando la orden se acaba de confirmar, el carrito queda vacío a propósito.
  if (items.length === 0 && orden?.estadoOrden !== "confirmada") {
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

        <div className={paso >= 2 ? "cart-layout cart-layout--single" : "cart-layout"}>
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

            {paso === 2 && (
              <CheckoutReview
                comprador={comprador}
                entrega={entrega}
                errorGuardado={errorGuardado}
                onEditar={irAPaso}
                onAtras={() => irAPaso(1)}
                onConfirmar={confirmarCompra}
              />
            )}

            {paso === 3 && orden && (
              <CheckoutPayment
                orden={orden}
                onOrdenActualizada={setOrden}
                onPagoAprobado={terminarCompra}
                onVolver={() => irAPaso(2)}
              />
            )}
          </section>

          {paso < 2 && (
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