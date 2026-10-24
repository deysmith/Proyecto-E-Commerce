import { useRef, useState } from "react"
import { formatPrice } from "../../utils/formatPrice"
import { formatDate } from "../../utils/formatDate"
import { EstadoOrdenChip, EstadoPagoChip } from "../ordenes/EstadoChips"
import { aplicarResultadoPago, intentosRestantes, MAX_INTENTOS_PAGO } from "../ordenes/OrderPayment"
import { guardarOrden } from "../ordenes/OrderStorage"
import type { Orden } from "../ordenes/OrderTypes"
import { procesarPagoSandbox } from "../pagos/PaymentSandbox"
import { PaymentGatewayForm } from "../pagos/PaymentGatewayForm"
import type { DatosTarjeta, RespuestaPago } from "../pagos/PaymentTypes"

interface CheckoutPaymentProps {
  orden: Orden
  onOrdenActualizada: (orden: Orden) => void
  onPagoAprobado: (orden: Orden) => void
  onVolver: () => void
}

// Texto que indica cuántos intentos le quedan al usuario
function textoIntentos(restantes: number): string {
  return restantes === 1 ? "Te queda 1 intento." : `Te quedan ${restantes} intentos.`
}

// Mensaje para el usuario cuando el servicio de pago falla
const MENSAJE_ERROR = "Ocurrió un problema con el servicio de pago, por eso tu compra no se completó. No se te cobró nada. Inténtalo de nuevo en un momento."

/**
 * Paso del checkout donde se muestra la orden y se pide al usuario que ingrese los datos de su tarjeta para pagar.
 * Se usa la pasarela simulada (sandbox) que está en PaymentGatewayForm.
 * El pago se envía al servicio simulado y la orden se actualiza según el resultado.
 * Si el pago se aprueba, se llama a onPagoAprobado; si no, se muestra un aviso y se llama a onOrdenActualizada.
 */
export function CheckoutPayment({ orden, onOrdenActualizada, onPagoAprobado, onVolver }: CheckoutPaymentProps) {
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  // El estado "procesando" se actualiza hasta el siguiente render, así que un doble clic muy rápido podría mandar dos pagos. Esta bandera cambia al instante y lo evita.
  const enviandoPago = useRef(false)

  async function pagar(tarjeta: DatosTarjeta) {
    if (enviandoPago.current) return

    // La aceptación de los términos ya viene registrada en la orden (se pide en el resumen).
    // Si por alguna razón no está, no se cobra nada y se le indica al usuario dónde aceptarlos.
    if (!orden.aceptacionTerminos.aceptado) {
      setAviso("Para pagar primero debes aceptar los Términos y Condiciones en el resumen de tu compra.")
      return
    }

    enviandoPago.current = true
    setProcesando(true)
    setAviso(null)

    let respuesta: RespuestaPago
    try {
      respuesta = await procesarPagoSandbox({
        orderId: orden.numero,
        amount: orden.montos.total,
        currency: orden.moneda,
        card: tarjeta,
      })
    } catch {
      // Si el servicio lanza una excepción, se trata igual que un error del servicio
      respuesta = {
        orderId: orden.numero,
        status: "PAYMENT_ERROR",
        transactionId: null,
        message: "No se pudo contactar al servicio de pago.",
        card: null,
        processedAt: new Date().toISOString(),
      }
    }

    // La orden cambia según el resultado y se guarda
    const ordenActualizada = aplicarResultadoPago(orden, respuesta)
    guardarOrden(ordenActualizada)

    enviandoPago.current = false
    setProcesando(false)

    if (respuesta.status === "PAYMENT_APPROVED") {
      onPagoAprobado(ordenActualizada)
      return
    }

    // Si ya se agotaron los intentos, la orden quedó fallida y se muestra el panel de fallo en lugar del formulario
    if (ordenActualizada.estadoOrden === "fallida") {
      setAviso(null)
    } else if (respuesta.status === "PAYMENT_DECLINED") {
      setAviso(
        `Tu pago no fue aprobado. Motivo: ${respuesta.message}. No se te cobró nada y tu orden sigue pendiente. Puedes intentarlo de nuevo o usar otra tarjeta. ${textoIntentos(intentosRestantes(ordenActualizada))}`,
      )
    } else {
      setAviso(`${MENSAJE_ERROR} ${textoIntentos(intentosRestantes(ordenActualizada))}`)
    }
    onOrdenActualizada(ordenActualizada)
  }

  const fallida = orden.estadoOrden === "fallida"

  return (
    <div className="checkout-form">
      <h2 className="checkout-section__title">{fallida ? "No se pudo completar tu pago" : "Pago de tu compra"}</h2>
      <p className="checkout-section__intro">
        {fallida
          ? "Esta orden ya no se puede pagar. Tu carrito sigue intacto, así que puedes generar una nueva orden."
          : "Tu orden quedó registrada con el número que ves abajo. Todavía no se ha cobrado nada: ingresa los datos de tu tarjeta para confirmar la compra."}
      </p>

      <div className="checkout-order">
        <p className="checkout-order__label">Número de orden</p>
        <p className="checkout-order__number">{orden.numero}</p>

        <dl className="checkout-review__data">
          <div><dt>Fecha</dt><dd>{formatDate(orden.fecha)}</dd></div>
          <div><dt>Total a pagar</dt><dd>{formatPrice(orden.montos.total)}</dd></div>
          <div>
            <dt>Estado de la orden</dt>
            <dd><EstadoOrdenChip estado={orden.estadoOrden} /></dd>
          </div>
          <div>
            <dt>Estado del pago</dt>
            <dd><EstadoPagoChip estado={orden.estadoPago} /></dd>
          </div>
          {orden.aceptacionTerminos.aceptado && orden.aceptacionTerminos.fecha && (
            <div>
              <dt>Términos y políticas</dt>
              <dd>Aceptados el {formatDate(orden.aceptacionTerminos.fecha)}</dd>
            </div>
          )}
        </dl>
      </div>

      {fallida ? (
        <div className="checkout-banner checkout-banner--error" role="alert">
          <strong>No pudimos completar tu pago.</strong> Después de {MAX_INTENTOS_PAGO} intentos sin éxito, esta orden quedó como fallida.
          No se te cobró nada. Vuelve al resumen para generar una nueva orden e intentarlo con otra tarjeta.
        </div>
      ) : (
        <PaymentGatewayForm
          total={orden.montos.total}
          procesando={procesando}
          aviso={aviso}
          esReintento={orden.estadoPago !== "pendiente"}
          onPagar={pagar}
        />
      )}

      <div className="checkout-actions">
        <button
          type="button"
          className={fallida ? "checkout-btn" : "checkout-btn checkout-btn--ghost"}
          onClick={onVolver}
          disabled={procesando}
        >
          Volver al resumen
        </button>
      </div>
    </div>
  )
}