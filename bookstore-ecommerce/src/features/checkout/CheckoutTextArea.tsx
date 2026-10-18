import type { TextareaHTMLAttributes } from "react"

interface CheckoutTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
  claseExtra?: string
}

/**
 * Igual que CheckoutField pero para textos largos (dirección, información adicional)
 */
export function CheckoutTextArea({
  id,
  etiqueta,
  error,
  ayuda,
  obligatorio = false,
  claseExtra = "",
  ...resto
}: CheckoutTextAreaProps) {
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  return (
    <div className={`checkout-field ${claseExtra}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span className="checkout-field__required" aria-hidden="true">*</span>}
      </label>

      <textarea
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