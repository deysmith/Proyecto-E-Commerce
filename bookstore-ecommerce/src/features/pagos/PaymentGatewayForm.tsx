import { useState, type FormEvent } from "react"
import { formatPrice } from "../../utils/formatPrice"
import { CheckoutField } from "../checkout/CheckoutField"
import { CheckoutErrorBanner } from "../checkout/CheckoutErrorBanner"
import {
  convertirATarjeta,
  detectarMarca,
  formatearNumeroTarjeta,
  formatearVencimiento,
  soloDigitos,
  tarjetaVacia,
  validarTarjeta,
  type CampoTarjeta,
  type DatosTarjetaForm,
} from "./CardValidations"
import { MarcasTarjeta } from "./MarcasTarjeta"
import type { DatosTarjeta } from "./PaymentTypes"

interface PaymentGatewayFormProps {
  total: number
  procesando: boolean
  aviso: string | null
  esReintento: boolean
  onPagar: (tarjeta: DatosTarjeta) => void
}

const ORDEN_CAMPOS: CampoTarjeta[] = ["nombre", "numero", "vencimiento", "cvc"]

/**
 * Pasarela de pago simulada (Sandbox) que se muestra en el checkout.
 * Muestra un formulario para que el usuario escriba los datos de la tarjeta y envía el pago al servicio simulado.
 * No se guarda la tarjeta completa en ningún lado: solo se envía al servicio y se guarda la marca y los últimos 4 dígitos.
 */
export function PaymentGatewayForm({
  total,
  procesando,
  aviso,
  esReintento,
  onPagar,
}: PaymentGatewayFormProps) {
  const [datos, setDatos] = useState<DatosTarjetaForm>(tarjetaVacia)
  const [tocados, setTocados] = useState<Partial<Record<CampoTarjeta, boolean>>>({})
  const [intentoPagar, setIntentoPagar] = useState(false)

  // Los errores se calculan en cada render a partir de lo que hay escrito
  const errores = validarTarjeta(datos)
  const marca = detectarMarca(datos.numero)

  function cambiarCampo(campo: CampoTarjeta, valor: string) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function marcarTocado(campo: CampoTarjeta) {
    setTocados((anterior) => ({ ...anterior, [campo]: true }))
  }

  function errorVisible(campo: CampoTarjeta) {
    return tocados[campo] || intentoPagar ? errores[campo] : undefined
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setIntentoPagar(true)

    // Si hay errores no se envía nada y se lleva el foco al primer campo con problema
    const primerError = ORDEN_CAMPOS.find((campo) => errores[campo])
    if (primerError) {
      document.getElementById(`tarjeta-${primerError}`)?.focus()
      return
    }

    onPagar(convertirATarjeta(datos))
  }

  return (
    <section className="pago" aria-labelledby="pago-titulo">
      <div className="pago__head">
        <h3 id="pago-titulo" className="pago__title">Pago con tarjeta</h3>
        <MarcasTarjeta marcaDetectada={marca} />
      </div>

      <form className="pago__form" onSubmit={enviar} noValidate>
        <CheckoutErrorBanner cantidad={intentoPagar ? Object.keys(errores).length : 0} />

        <fieldset className="pago__campos" disabled={procesando}>
          <legend className="pago__sr">Datos de la tarjeta</legend>

          <div className="pago__grid">
            <CheckoutField
              id="tarjeta-nombre"
              claseExtra="checkout-field--full"
              etiqueta="Nombre del titular"
              obligatorio
              type="text"
              name="tarjeta-nombre"
              autoComplete="off"
              maxLength={60}
              placeholder="Como aparece en la tarjeta"
              value={datos.nombre}
              onChange={(e) => cambiarCampo("nombre", e.target.value)}
              onBlur={() => marcarTocado("nombre")}
              error={errorVisible("nombre")}
            />

            <CheckoutField
              id="tarjeta-numero"
              claseExtra="checkout-field--full"
              etiqueta="Número de tarjeta"
              obligatorio
              type="text"
              inputMode="numeric"
              name="tarjeta-numero"
              autoComplete="off"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              ayuda={marca ? `Tarjeta ${marca}` : undefined}
              value={datos.numero}
              onChange={(e) => cambiarCampo("numero", formatearNumeroTarjeta(e.target.value))}
              onBlur={() => marcarTocado("numero")}
              error={errorVisible("numero")}
            />

            <CheckoutField
              id="tarjeta-vencimiento"
              etiqueta="Vencimiento"
              obligatorio
              type="text"
              inputMode="numeric"
              name="tarjeta-vencimiento"
              autoComplete="off"
              maxLength={5}
              placeholder="MM/AA"
              value={datos.vencimiento}
              onChange={(e) => cambiarCampo("vencimiento", formatearVencimiento(e.target.value))}
              onBlur={() => marcarTocado("vencimiento")}
              error={errorVisible("vencimiento")}
            />

            <CheckoutField
              id="tarjeta-cvc"
              etiqueta="CVC"
              obligatorio
              type="password"
              inputMode="numeric"
              name="tarjeta-cvc"
              autoComplete="off"
              maxLength={4}
              placeholder="•••"
              value={datos.cvc}
              onChange={(e) => cambiarCampo("cvc", soloDigitos(e.target.value))}
              onBlur={() => marcarTocado("cvc")}
              error={errorVisible("cvc")}
            />
          </div>

          {procesando && (
            <p className="checkout-processing" role="status">
              <span className="checkout-spinner" aria-hidden="true" />
              Estamos procesando tu pago. No cierres ni recargues esta página.
            </p>
          )}

          {aviso && !procesando && (
            <div className="checkout-banner checkout-banner--error" role="alert">{aviso}</div>
          )}

          <button type="submit" className="checkout-btn checkout-btn--block" disabled={procesando}>
            {procesando
              ? "Procesando pago..."
              : esReintento
                ? `Reintentar pago de ${formatPrice(total)}`
                : `Pagar ${formatPrice(total)}`}
          </button>

          <p className="pago__nota">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span>Ambiente de pruebas: no se realiza ningún cobro real. No ingreses los datos de tu tarjeta personal.</span>
          </p>
        </fieldset>
      </form>
    </section>
  )
}