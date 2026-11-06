import type { MouseEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { CartPopUp } from "../features/carrito-de-compras/CartPopUp"
import { useSession } from "../features/session/sessionContext"

interface HeaderProps {
  esCheckout?: boolean
  onSalir?: (destino: string) => void
}

export function Header( { esCheckout, onSalir }: HeaderProps) {
  const { user, signOut } = useSession()
  const navigate = useNavigate()

  function alHacerClicEnLogo(evento: MouseEvent<HTMLAnchorElement>) {
    if (!onSalir) return
    evento.preventDefault()
    onSalir("/")
  }

  return (
    <header className="catalog-header">
      {/* Se usa Link en vez de window.location para respetar la base de GitHub Pages */}
      <Link to="/" className="brand-mark" aria-label="Ir al inicio" onClick={alHacerClicEnLogo}>
        <span className="brand-mark__symbol">B</span>
        <span className="brand-mark__text">Booksmart</span>
      </Link>

      {esCheckout ? (
        <></>
        ) : (
        <><SearchBar /> <CartPopUp /></>
        )
      }

        {user ? (
          <>
            <Link to="/analytics" className="header-account__analytics">Analytics</Link>
            <button
              type="button"
              className="header-account__action"
              onClick={() => {
                signOut()
                navigate("/login")
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className="header-account__action">Ingresar</Link>
        )}
    </header>
  )
}