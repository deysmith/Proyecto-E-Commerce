import { useState, type FormEvent } from "react"
import { CheckoutCombobox } from "./CheckoutCombobox"
import { CheckoutTextArea } from "./CheckoutTextArea"
import { CheckoutErrorBanner } from "./CheckoutErrorBanner"
import { obtenerCantones, obtenerDistritos, obtenerProvincias } from "./CheckoutLocations"
import type { CampoEntrega, DatosEntrega } from "./CheckoutTypes"
import { INFO_ADICIONAL_MAXIMO, DIRECCION_MAXIMO, validarEntrega } from "./CheckoutValidations"

interface DeliveryFormProps {
  datos: DatosEntrega
  mostrarErroresInicial?: boolean
  onCambio: (datos: DatosEntrega) => void
  onAtras: () => void
  onContinuar: () => void
}

// Orden en que aparecen los campos (sirve para enfocar el primero con error)
const ORDEN_CAMPOS: CampoEntrega[] = ["provincia", "canton", "distrito", "direccion", "infoAdicional"]

/**
 * Información de entrega. Se valida en cada render y se muestran los errores.
 */
export function DeliveryForm({ datos, onCambio, onAtras, onContinuar, mostrarErroresInicial = false }: DeliveryFormProps) {
  const [tocados, setTocados] = useState<Partial<Record<CampoEntrega, boolean>>>({})
  const [intentoContinuar, setIntentoContinuar] = useState(mostrarErroresInicial)

  const errores = validarEntrega(datos)

  const provincias = obtenerProvincias()
  const cantones = obtenerCantones(datos.provincia)
  const distritos = obtenerDistritos(datos.canton)

  function marcarTocado(campo: CampoEntrega) {
    setTocados((anterior) => ({ ...anterior, [campo]: true }))
  }

  function errorVisible(campo: CampoEntrega) {
    return tocados[campo] || intentoContinuar ? errores[campo] : undefined
  }

  // El cantón y el distrito están deshabilitados hasta elegir el de arriba, así que no se les muestra error
  function estaOculto(campo: CampoEntrega) {
    return (campo === "canton" && datos.provincia === null) || (campo === "distrito" && datos.canton === null)
  }

  const erroresQueSeVen = ORDEN_CAMPOS.filter((campo) => errores[campo] && !estaOculto(campo)).length

  function cambiarProvincia(codigo: number | null) {
    // Al cambiar de provincia los cantones y distritos anteriores ya no sirven
    onCambio({ ...datos, provincia: codigo, canton: null, distrito: null })
    setTocados((anterior) => ({ ...anterior, canton: false, distrito: false }))
  }

  function cambiarCanton(codigo: number | null) {
    onCambio({ ...datos, canton: codigo, distrito: null })
    setTocados((anterior) => ({ ...anterior, distrito: false }))
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setIntentoContinuar(true)

    // Si hay errores no se avanza y se lleva el foco al primer campo con problema
    const primerError = ORDEN_CAMPOS.find((campo) => errores[campo])
    if (primerError) {
      document.getElementById(`entrega-${primerError}`)?.focus()
      return
    }

    // Se guardan los textos sin espacios sobrantes
    onCambio({
      ...datos,
      direccion: datos.direccion.trim().replace(/\s+/g, " "),
      infoAdicional: datos.infoAdicional.trim(),
    })
    onContinuar()
  }

  return (
    <form className="checkout-form" onSubmit={enviar} noValidate>
      <h2 className="checkout-section__title">Información de entrega</h2>
      <p className="checkout-section__intro">
        Elige primero la provincia, luego el cantón y el distrito, y escribe las señas para que el repartidor encuentre tu casa.
      </p>

      <CheckoutErrorBanner cantidad={intentoContinuar ? erroresQueSeVen : 0} />

      <div className="checkout-grid">
        <CheckoutCombobox
          id="entrega-provincia"
          etiqueta="Provincia"
          obligatorio
          placeholder="Escribe o elige una provincia"
          opciones={provincias}
          valor={datos.provincia}
          onSeleccionar={cambiarProvincia}
          onBlur={() => marcarTocado("provincia")}
          error={errorVisible("provincia")}
        />

        {/* La key hace que el combobox se reinicie cuando cambia la provincia */}
        <CheckoutCombobox
          key={`canton-${datos.provincia}`}
          id="entrega-canton"
          etiqueta="Cantón"
          obligatorio
          placeholder={datos.provincia === null ? "Primero elige una provincia" : "Escribe o elige un cantón"}
          opciones={cantones}
          valor={datos.canton}
          deshabilitado={datos.provincia === null}
          onSeleccionar={cambiarCanton}
          onBlur={() => marcarTocado("canton")}
          error={estaOculto("canton") ? undefined : errorVisible("canton")}
        />

        <CheckoutCombobox
          key={`distrito-${datos.canton}`}
          id="entrega-distrito"
          etiqueta="Distrito"
          obligatorio
          placeholder={datos.canton === null ? "Primero elige un cantón" : "Escribe o elige un distrito"}
          opciones={distritos}
          valor={datos.distrito}
          deshabilitado={datos.canton === null}
          onSeleccionar={(codigo) => onCambio({ ...datos, distrito: codigo })}
          onBlur={() => marcarTocado("distrito")}
          error={estaOculto("distrito") ? undefined : errorVisible("distrito")}
        />

        <CheckoutTextArea
          id="entrega-direccion"
          claseExtra="checkout-field--full"
          etiqueta="Dirección exacta"
          obligatorio
          name="direccion"
          autoComplete="street-address"
          maxLength={DIRECCION_MAXIMO}
          rows={3}
          placeholder="Ej. 200 m norte de la escuela, casa verde con portón negro"
          value={datos.direccion}
          onChange={(e) => onCambio({ ...datos, direccion: e.target.value })}
          onBlur={() => marcarTocado("direccion")}
          error={errorVisible("direccion")}
        />

        <CheckoutTextArea
          id="entrega-infoAdicional"
          claseExtra="checkout-field--full"
          etiqueta="Información adicional para la entrega (opcional)"
          name="infoAdicional"
          maxLength={INFO_ADICIONAL_MAXIMO}
          rows={2}
          placeholder="Ej. Horario preferido, dejar con el guarda, llamar al llegar"
          ayuda={`${datos.infoAdicional.length}/${INFO_ADICIONAL_MAXIMO} caracteres`}
          value={datos.infoAdicional}
          onChange={(e) => onCambio({ ...datos, infoAdicional: e.target.value })}
          onBlur={() => marcarTocado("infoAdicional")}
          error={errorVisible("infoAdicional")}
        />
      </div>

      <div className="checkout-actions">
        <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onAtras}>Atrás</button>
        <button type="submit" className="checkout-btn">Continuar al resumen</button>
      </div>
    </form>
  )
}