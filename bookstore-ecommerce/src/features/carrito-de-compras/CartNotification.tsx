interface CartNotificationProps { message: string | null, onClose: () => void }

export function CartNotification({ message, onClose }: CartNotificationProps) {
  if (!message) {
    return null
  }

  return (
    <div className="cart-notification">
      <span>{message}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  )
}
