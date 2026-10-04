import { Link } from "react-router-dom"
import { EmptyBooksIllustration } from "./CartIcons"

/**
 * Estado vacío del carrito. No muestra resumen para no enseñar montos en cero.
 */
export function CartEmpty() {
  return (
    <section className="cart-empty" aria-live="polite">
      <EmptyBooksIllustration />
      <h2>Tu carrito está vacío</h2>
      <p>Agrega libros desde el catálogo y aquí vas a ver el resumen de tu compra.</p>
      <Link to="/" className="cart-empty__button">Explorar el catálogo</Link>
    </section>
  )
}