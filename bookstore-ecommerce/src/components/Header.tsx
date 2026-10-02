import { Link } from "react-router-dom"
import type { MouseEvent } from "react"
import { useCart } from "../features/carrito-de-compras/useCart" 

function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  const sectionId = event.currentTarget.hash.slice(1)
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
}

export function Header() {
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="catalog-header">
      <div className="brand-mark">
        <span className="brand-mark__symbol">B</span>
        <span>Booksmart</span>
      </div>
      <nav aria-label="Navegación principal">
        <a href="#catalogo" onClick={handleSectionNavigation}>Catálogo</a>
        <a href="#novedades" onClick={handleSectionNavigation}>Novedades</a>
        <a href="#nosotros" onClick={handleSectionNavigation}>Nosotros</a>
      </nav>
      <Link className="bag-button" to="/cart" aria-label={`Ver carrito, ${itemCount} productos`}>
        Carrito <span>{itemCount}</span>
      </Link>
    </header>    
  )
}