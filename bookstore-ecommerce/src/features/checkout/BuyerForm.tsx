import { useState, type FormEvent } from "react"
import { CheckoutField } from "./CheckoutField"
import { CheckoutErrorBanner } from "./CheckoutErrorBanner"
import type { CampoComprador, DatosComprador } from "./CheckoutTypes"
import { prefijoTelefonoInvalido, validarComprador } from "./CheckoutValidations"

interface BuyerFormProps {
  datos: DatosComprador
  mostrarErroresInicial?: boolean
  onCambio: (datos: DatosComprador) => void
  onContinuar: () => void
  onVolverAlCarrito: () => void
}

// Orden en que aparecen los campos (sirve para enfocar el primero con error)
const ORDEN_CAMPOS: CampoComprador[] = ["nombreCompleto", "correo", "telefono"]

/**
 * Formulario de datos del comprador. Se valida en cada render y se muestran los errores
 */
export function BuyerForm({ datos, onCambio, onContinuar, onVolverAlCarrito, mostrarErroresInicial = false }: BuyerFormProps) {
  const [tocados, setTocados] = useState<Partial<Record<CampoComprador, boolean>>>({})
  const [intentoContinuar, setIntentoContinuar] = useState(mostrarErroresInicial)

  // Los errores se calculan en cada render a partir de lo que hay escrito
  const errores = validarComprador(datos)

  function cambiarCampo(campo: CampoComprador, valor: string) {
    onCambio({ ...datos, [campo]: valor })
  }

  function marcarTocado(campo: CampoComprador) {
    setTocados((anterior) => ({ ...anterior, [campo]: true }))
  }

  function errorVisible(campo: CampoComprador) {
    // El error del teléfono se muestra apenas el número empieza mal (0, 1, 3 o 9), sin esperar a que salga del campo
    const prefijoMalo = campo === "telefono" && prefijoTelefonoInvalido(datos.telefono)
    return tocados[campo] || intentoContinuar || prefijoMalo ? errores[campo] : undefined
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setIntentoContinuar(true)

    // Si hay errores no se avanza y se lleva el foco al primer campo con problema
    const primerError = ORDEN_CAMPOS.find((campo) => errores[campo])
    if (primerError) {
      document.getElementById(`comprador-${primerError}`)?.focus()
      return
    }

    // Se guardan los datos sin espacios sobrantes
    onCambio({
      nombreCompleto: datos.nombreCompleto.trim().replace(/\s+/g, " "),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim(),
    })
    onContinuar()
  }

  return (
    <form className="checkout-form" onSubmit={enviar} noValidate>
      <h2 className="checkout-section__title">Información del comprador</h2>
      <p className="checkout-section__intro">
        Con estos datos te enviamos la confirmación de tu compra y te contactamos si hay algún problema con la entrega.
      </p>

      <CheckoutErrorBanner cantidad={intentoContinuar ? Object.keys(errores).length : 0} />

      <div className="checkout-grid">
        <CheckoutField
          id="comprador-nombreCompleto"
          claseExtra="checkout-field--full"
          etiqueta="Nombre completo"
          obligatorio
          type="text"
          name="nombreCompleto"
          autoComplete="name"
          maxLength={80}
          placeholder="Ej. María Fernández Mora"
          value={datos.nombreCompleto}
          onChange={(e) => cambiarCampo("nombreCompleto", e.target.value)}
          onBlur={() => marcarTocado("nombreCompleto")}
          error={errorVisible("nombreCompleto")}
        />

        <CheckoutField
          id="comprador-correo"
          etiqueta="Correo electrónico"
          obligatorio
          type="email"
          name="correo"
          autoComplete="email"
          maxLength={100}
          placeholder="nombre@correo.com"
          value={datos.correo}
          onChange={(e) => cambiarCampo("correo", e.target.value)}
          onBlur={() => marcarTocado("correo")}
          error={errorVisible("correo")}
        />

        <CheckoutField
          id="comprador-telefono"
          etiqueta="Teléfono"
          obligatorio
          type="tel"
          inputMode="tel"
          name="telefono"
          autoComplete="tel"
          maxLength={20}
          placeholder="8888-8888"
          ayuda="Número de Costa Rica, 8 dígitos."
          value={datos.telefono}
          onChange={(e) => cambiarCampo("telefono", e.target.value)}
          onBlur={() => marcarTocado("telefono")}
          error={errorVisible("telefono")}
        />
      </div>

      <div className="checkout-actions">
        <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onVolverAlCarrito}>Volver al carrito</button>
        <button type="submit" className="checkout-btn">Continuar a entrega</button>
      </div>
    </form>
  )
}