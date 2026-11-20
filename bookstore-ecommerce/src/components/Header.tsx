import type { MouseEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { CartPopUp } from "../features/carrito-de-compras/CartPopUp"
import { useSession } from "../features/session/sessionContext"
import { NOMBRE_ROL } from "../features/session/roles"
import { MenuUsuario } from "./MenuUsuario"

interface HeaderProps {
  esCheckout?: boolean
  onSalir?: (destino: string) => void
}

export function Header( { esCheckout, onSalir }: HeaderProps) {
  const { user } = useSession()
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
      ) : user?.role !== "ADMIN" ? (
        <>
          <SearchBar />
          <CartPopUp />
        </>
      ) : (
        <SearchBar />
      )}

      <div className="header-account">
        {/* Usuario y rol de la sesión activa (en celular se ven dentro del menú) */}
        {user ? (
          <span className="header-account__usuario">
            <strong>{user.name}</strong>
            <span>{NOMBRE_ROL[user.role]}</span>
          </span>
        ) : (
          // Se guarda la página actual para volver a ella después de iniciar sesión
          <Link to="/login" state={{ from: location.pathname === "/login" ? "/" : location.pathname }} className="header-account__action">Ingresar</Link>
        )}

        {/* En el checkout no se muestra el menú, para no salir de la compra por accidente */}
        {!esCheckout && <MenuUsuario />}
      </div>
    </header>
  )
}