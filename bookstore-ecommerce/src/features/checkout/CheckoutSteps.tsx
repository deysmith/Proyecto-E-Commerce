interface CheckoutStepsProps {
  pasos: string[]
  pasoActual: number
  // Se llama cuando el usuario toca un paso que ya completó para volver a él
  onIrAPaso: (indice: number) => void
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/**
 * Indicador de etapas del checkout.
 * - Paso completado: se puede tocar para volver a él
 * - Paso actual: resaltado (aria-current="step")
 * - Paso pendiente: solo informativo, se llega a él con el botón "Continuar"
 */
export function CheckoutSteps({ pasos, pasoActual, onIrAPaso }: CheckoutStepsProps) {
  return (
    <nav aria-label="Etapas del checkout">
      <ol className="checkout-steps">
        {pasos.map((nombre, indice) => {
          const completado = indice < pasoActual
          const actual = indice === pasoActual

          const clase = completado
            ? "checkout-steps__item is-done"
            : actual
              ? "checkout-steps__item is-current"
              : "checkout-steps__item"

          const contenido = (
            <>
              <span className="checkout-steps__dot" aria-hidden="true">
                {completado ? <CheckIcon /> : indice + 1}
              </span>
              <span className="checkout-steps__label">{nombre}</span>
            </>
          )

          return (
            <li key={nombre} className={clase} aria-current={actual ? "step" : undefined}>
              {completado ? (
                <button
                  type="button"
                  className="checkout-steps__content checkout-steps__button"
                  onClick={() => onIrAPaso(indice)}
                  aria-label={`Volver al paso ${indice + 1}: ${nombre}`}
                >
                  {contenido}
                </button>
              ) : (
                <span className="checkout-steps__content">{contenido}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}