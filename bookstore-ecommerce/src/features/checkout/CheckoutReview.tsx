import { useCart } from "../carrito-de-compras/useCart"
import { entregaParaOrden, productoParaOrden } from "../ordenes/OrderBuilder"
import { OrderProductsSummary } from "../ordenes/OrderProductsSummary"
import { OrderDataCards } from "../ordenes/OrderDataCards"
import { AceptacionTerminos } from "../legal/AceptacionTerminos"
import type { DatosComprador, DatosEntrega } from "./CheckoutTypes"

interface CheckoutReviewProps {
  comprador: DatosComprador
  entrega: DatosEntrega
  // Mensaje de error si no se pudo guardar la orden (null = no hay error)
  errorGuardado: string | null
  // Casilla de aceptación de los términos y las políticas
  terminosAceptados: boolean
  // true cuando el usuario intentó confirmar sin aceptar los términos
  errorTerminos: boolean
  onCambiarTerminos: (aceptados: boolean) => void
  // Lleva al usuario al paso indicado para corregir sus datos 0 = datos del comprador, 1 = dirección de entrega
  onEditar: (paso: number) => void
  onAtras: () => void
  onConfirmar: () => void
}

/**
 * Resumen final antes de confirmar.
 * Los montos NO se calculan aquí: se leen del carrito, que es el mismo cálculo que se ve en la página del carrito, así siempre coinciden.
 * La tabla de libros y las tarjetas de datos son componentes compartidos con la pantalla de confirmación.
 * Aquí también se aceptan los términos y las políticas: es lo último que se revisa antes de generar la orden.
 */
export function CheckoutReview({
  comprador,
  entrega,
  errorGuardado,
  terminosAceptados,
  errorTerminos,
  onCambiarTerminos,
  onEditar,
  onAtras,
  onConfirmar,
}: CheckoutReviewProps) {
  const { items, totals } = useCart()

  return (
    <div className="checkout-form">
      <h2 className="checkout-section__title">Resumen de tu compra</h2>
      <p className="checkout-section__intro">
        Revisa tus libros y tus datos. Si algo no está bien, puedes corregirlo antes de continuar.
      </p>

      <OrderProductsSummary productos={items.map(productoParaOrden)} montos={totals} />

      <OrderDataCards comprador={comprador} entrega={entregaParaOrden(entrega)} onEditar={onEditar} />

      <AceptacionTerminos aceptado={terminosAceptados} mostrarError={errorTerminos} onCambiar={onCambiarTerminos} />

      {errorGuardado && (
        <div className="checkout-banner checkout-banner--error" role="alert">{errorGuardado}</div>
      )}

      <div className="checkout-actions">
        <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onAtras}>Atrás</button>
        <button type="button" className="checkout-btn" onClick={onConfirmar}>Confirmar y continuar al pago</button>
      </div>
    </div>
  )
}