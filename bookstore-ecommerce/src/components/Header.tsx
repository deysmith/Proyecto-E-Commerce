import { Link } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { CartPopUp } from "../features/carrito-de-compras/CartPopUp"

interface HeaderProps {
  esCheckout?: boolean
}

export function Header( { esCheckout }: HeaderProps) {
  return (
    <header className="catalog-header">
      {/* Se usa Link en vez de window.location para respetar la base de GitHub Pages */}
      <Link to="/" className="brand-mark" aria-label="Ir al inicio">
        <span className="brand-mark__symbol">B</span>
        <span className="brand-mark__text">Booksmart</span>
      </Link>

      {esCheckout ? (
        <></> 
        ) : (
        <><SearchBar /> <CartPopUp /></>
        )
      }
    </header>
  )
}