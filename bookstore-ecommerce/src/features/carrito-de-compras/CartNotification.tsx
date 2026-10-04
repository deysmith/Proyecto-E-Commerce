import { Link } from "react-router-dom"

interface CartNotificationProps {
  message: string | null
  onClose: () => void
}

/**
 * Mensaje flotante que confirma que un producto se agregó al carrito
 */
export function CartNotification({ message, onClose }: CartNotificationProps) {
  if (!message) {
    return null
  }

  return (
    <div className="cart-notification" role="status" aria-live="polite">
      <span className="cart-notification__check" aria-hidden="true">✓</span>
      <span className="cart-notification__text">{message}</span>

      <Link to="/cart" className="cart-notification__link" onClick={onClose}>
        Ver carrito
      </Link>

      <button
        type="button"
        className="cart-notification__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  )
}