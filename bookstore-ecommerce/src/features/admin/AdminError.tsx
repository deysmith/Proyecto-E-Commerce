interface AdminErrorProps {
  mensaje: string
  onReintentar: () => void
}

/**
 * Aviso de error de las consultas del panel, con botón para volver a intentar.
 */
export function AdminError({ mensaje, onReintentar }: AdminErrorProps) {
  return (
    <div className="checkout-banner checkout-banner--error admin-error" role="alert">
      <p>{mensaje}</p>
      <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onReintentar}>Reintentar</button>
    </div>
  )
}