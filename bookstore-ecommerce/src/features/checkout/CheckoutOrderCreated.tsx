import { formatPrice } from "../../utils/formatPrice"
import { formatDate } from "../../utils/formatDate"
import { ETIQUETA_ESTADO_ORDEN, ETIQUETA_ESTADO_PAGO, type Orden } from "../ordenes/OrderTypes"

interface CheckoutOrderCreatedProps {
  orden: Orden
  onModificar: () => void
}

/**
 * Se muestra cuando la orden ya se generó y se guardó como pendiente, antes de enviar el pago.
 */
export function CheckoutOrderCreated({ orden, onModificar }: CheckoutOrderCreatedProps) {
  return (
    <div className="checkout-form" aria-live="polite">
      <h2 className="checkout-section__title">Tu orden fue creada</h2>
      <p className="checkout-section__intro">
        Guardamos tu orden con el número que ves abajo. Todavía no se ha cobrado nada: falta procesar el pago.
      </p>

      <div className="checkout-order">
        <p className="checkout-order__label">Número de orden</p>
        <p className="checkout-order__number">{orden.numero}</p>

        <dl className="checkout-review__data">
          <div><dt>Fecha</dt><dd>{formatDate(orden.fecha)}</dd></div>
          <div><dt>Total a pagar</dt><dd>{formatPrice(orden.montos.total)}</dd></div>
          <div>
            <dt>Estado de la orden</dt>
            <dd><span className="checkout-chip checkout-chip--pendiente">{ETIQUETA_ESTADO_ORDEN[orden.estadoOrden]}</span></dd>
          </div>
          <div>
            <dt>Estado del pago</dt>
            <dd><span className="checkout-chip checkout-chip--pendiente">{ETIQUETA_ESTADO_PAGO[orden.estadoPago]}</span></dd>
          </div>
        </dl>
      </div>

      <div className="checkout-actions">
        <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onModificar}>
          Revisar o modificar mi compra
        </button>
      </div>
    </div>
  )
}