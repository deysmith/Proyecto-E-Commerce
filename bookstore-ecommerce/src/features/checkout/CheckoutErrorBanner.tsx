interface CheckoutErrorBannerProps {
  // Cantidad de campos con error si es 0 no se muestra el banner
  cantidad: number
}

/**
 * Aviso general que aparece arriba del formulario cuando el usuario intenta
 * continuar con campos inválidos. Complementa los mensajes que salen junto a cada campo.
 */
export function CheckoutErrorBanner({ cantidad }: CheckoutErrorBannerProps) {
  if (cantidad === 0) return null

  return (
    <div className="checkout-banner" role="status" aria-live="polite">
      <strong>
        {cantidad === 1 ? "Hay 1 campo con errores." : `Hay ${cantidad} campos con errores.`}
      </strong>{" "}
      Revisa los mensajes en rojo para poder continuar.
    </div>
  )
}