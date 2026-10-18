import type { InputHTMLAttributes } from "react"

interface CheckoutFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
  // Clase extra para el contenedor (por ejemplo, para ocupar todo el ancho)
  claseExtra?: string
}

/**
 * Campo de texto del checkout: etiqueta + input + mensaje de ayuda o de error.
 * Conecta el mensaje con el input (aria-describedby) para lectores de pantalla.
 */
export function CheckoutField({
  id,
  etiqueta,
  error,
  ayuda,
  obligatorio = false,
  claseExtra = "",
  ...resto
}: CheckoutFieldProps) {
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  return (
    <div className={`checkout-field ${claseExtra}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span className="checkout-field__required" aria-hidden="true">*</span>}
      </label>

      <input
        id={id}
        aria-required={obligatorio || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
        {...resto}
      />

      {error ? (
        <p id={idError} className="checkout-field__error" role="alert">{error}</p>
      ) : (
        ayuda && <p id={idAyuda} className="checkout-field__help">{ayuda}</p>
      )}
    </div>
  )
}