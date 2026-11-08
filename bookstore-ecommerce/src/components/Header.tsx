import type { MouseEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { CartPopUp } from "../features/carrito-de-compras/CartPopUp"
import { useSession } from "../features/session/sessionContext"
import { NOMBRE_ROL } from "../features/session/roles"

interface HeaderProps {
  esCheckout?: boolean
  onSalir?: (destino: string) => void
}

export function Header( { esCheckout, onSalir }: HeaderProps) {
  const { user, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

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

      <div className="header-account">
        <Link to="/analytics" className="header-account__analytics">Analytics</Link>
        {user ? (
          <>
            {/* Usuario y rol de la sesión activa */}
            <span className="header-account__usuario">
              <strong>{user.name}</strong>
              <span>{NOMBRE_ROL[user.role]}</span>
            </span>
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
          // Se guarda la página actual para volver a ella después de iniciar sesión
          <Link to="/login" state={{ from: location.pathname === "/login" ? "/" : location.pathname }} className="header-account__action">Ingresar</Link>
        )}
      </div>
    </header>
  )
}