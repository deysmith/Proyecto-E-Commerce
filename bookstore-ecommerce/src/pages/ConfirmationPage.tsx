import { Link, useLocation, useParams } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { EstadoOrdenChip, EstadoPagoChip } from "../features/ordenes/EstadoChips"
import { OrderProductsSummary } from "../features/ordenes/OrderProductsSummary"
import { OrderDataCards } from "../features/ordenes/OrderDataCards"
import { buscarOrden } from "../features/ordenes/OrderStorage"
import type { Orden } from "../features/ordenes/OrderTypes"
import { formatDate } from "../utils/formatDate"

/**
 * Pantalla de confirmación. Solo muestra la compra como completada si la orden existe y está confirmada con el pago aprobado; en cualquier otro caso explica qué pasó.
 */
export default function ConfirmationPage() {
  const { numero = "" } = useParams()
  const location = useLocation()

  // La orden se busca en localStorage. Si no se pudo leer, se usa la que llegó al navegar desde el checkout
  const ordenRespaldo = (location.state as { orden?: Orden } | null)?.orden
  const orden = buscarOrden(numero) ?? (ordenRespaldo?.numero === numero ? ordenRespaldo : null)

  const estaConfirmada = orden !== null && orden.estadoOrden === "confirmada" && orden.estadoPago === "aprobado"

  return (
    <div className="catalog-shell">
      <Header />

      <main className="cart-page">
        <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Confirmación</span>
        </nav>

        {orden && estaConfirmada ? (
          <>
            <section className="confirmation-hero" aria-labelledby="confirmacion-titulo">
              <span className="confirmation-hero__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h1 id="confirmacion-titulo" className="confirmation-hero__title">¡Compra confirmada!</h1>
              <p className="confirmation-hero__text">
                Tu pago fue aprobado y tu orden quedó registrada. Guarda tu número de orden para cualquier consulta.
              </p>

              <p className="checkout-order__label">Número de orden</p>
              <p className="checkout-order__number confirmation-hero__number">{orden.numero}</p>

              <dl className="confirmation-hero__data">
                <div><dt>Estado de la orden</dt><dd><EstadoOrdenChip estado={orden.estadoOrden} /></dd></div>
                <div><dt>Estado del pago</dt><dd><EstadoPagoChip estado={orden.estadoPago} /></dd></div>
                <div><dt>Fecha</dt><dd>{formatDate(orden.fecha)}</dd></div>
                {orden.pago?.tarjeta && (
                  <div><dt>Método de pago</dt><dd>{orden.pago.tarjeta.marca} •••• {orden.pago.tarjeta.ultimos4}</dd></div>
                )}
                {orden.pago?.idTransaccion && (
                  <div><dt>Transacción</dt><dd>{orden.pago.idTransaccion}</dd></div>
                )}
              </dl>
            </section>

            <section className="cart-panel checkout-panel confirmation-summary" aria-label="Resumen de la compra">
              <h2 className="checkout-section__title">Resumen de la compra</h2>
              <OrderProductsSummary productos={orden.productos} montos={orden.montos} />
              <OrderDataCards comprador={orden.comprador} entrega={orden.entrega} />

              <div className="checkout-actions confirmation-actions">
                <Link to="/" className="checkout-btn">Seguir explorando el catálogo</Link>
              </div>
            </section>
          </>
        ) : (
          <section className="cart-empty" aria-live="polite">
            <h2>{orden ? "Esta orden aún no está confirmada" : "No encontramos esta orden"}</h2>
            <p>
              {orden
                ? "Su pago no ha sido aprobado, por eso no la mostramos como una compra completada. Puedes volver a tu carrito e intentar de nuevo."
                : "Revisa que el número de orden sea correcto. Si acabas de comprar, vuelve al catálogo e inténtalo otra vez."}
            </p>
            <Link to={orden ? "/cart" : "/"} className="cart-empty__button">
              {orden ? "Ir al carrito" : "Explorar el catálogo"}
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}