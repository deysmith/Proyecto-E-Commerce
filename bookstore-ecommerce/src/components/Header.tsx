import { Link } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { useCart } from "../features/carrito-de-compras/useCart"

export function Header() {
  const { totals } = useCart()
  const itemCount = totals.totalUnidades

  return (
    <header className="catalog-header">
      {/* Se usa Link en vez de window.location para respetar la base de GitHub Pages */}
      <Link to="/" className="brand-mark" aria-label="Ir al inicio">
        <span className="brand-mark__symbol">B</span>
        <span className="brand-mark__text">Booksmart</span>
      </Link>

      <SearchBar />

      {/* Indicador del carrito con el total de unidades agregadas */}
      <Link
        className="bag-button"
        to="/cart"
        aria-label={`Ver carrito, ${itemCount} ${itemCount === 1 ? "unidad" : "unidades"}`}
      >
        <span className="bag-button__text">Carrito</span>
        <span className="bag-button__count">{itemCount}</span>
      </Link>
    </header>
  )
}