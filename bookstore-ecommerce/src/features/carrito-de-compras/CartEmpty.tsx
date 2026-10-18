import { Link } from "react-router-dom"
import { EmptyBooksIllustration } from "./CartIcons"

interface CartEmptyProps {
  texto: string
  onClose?: () => void
}

/**
 * Estado vacío del carrito. No muestra resumen para no enseñar montos en cero.
 */
export function CartEmpty({ texto, onClose }: CartEmptyProps) {
  return (
    <section className="cart-empty" aria-live="polite">
      <EmptyBooksIllustration />
      <h2>Tu carrito está vacío</h2>
      <p>{texto}</p>
      <Link to="/" className="cart-empty__button" onClick={onClose}>Explorar el catálogo</Link>
    </section>
  )
}