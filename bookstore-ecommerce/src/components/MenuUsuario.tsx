import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useSession } from "../features/session/sessionContext"
import { NOMBRE_ROL } from "../features/session/roles"

/**
 * Menú hamburguesa del Header. Reúne las opciones según el rol para no sobrecargar el encabezado:
 * - Clientes (B2C, B2B e invitados): catálogo, mis órdenes, analytics y ayuda
 * - Administrador: catálogo, panel administrativo, analytics y ayuda
 * Se cierra al elegir una opción, con Escape o haciendo clic fuera.
 */
export function MenuUsuario() {
  const { user, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const esAdmin = user?.role === "ADMIN"

  useEffect(() => {
    if (!abierto) return

    function alHacerClicFuera(evento: MouseEvent) {
      if (contenedor.current && !contenedor.current.contains(evento.target as Node)) setAbierto(false)
    }
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false)
    }

    document.addEventListener("mousedown", alHacerClicFuera)
    document.addEventListener("keydown", alPresionarTecla)
    return () => {
      document.removeEventListener("mousedown", alHacerClicFuera)
      document.removeEventListener("keydown", alPresionarTecla)
    }
  }, [abierto])

  const cerrar = () => setAbierto(false)

  function cerrarSesion() {
    setAbierto(false)
    signOut()
    navigate("/login")
  }

  return (
    <div className="menu-usuario" ref={contenedor}>
      <button
        type="button"
        className={abierto ? "menu-usuario__boton is-abierto" : "menu-usuario__boton"}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        aria-controls="menu-usuario-panel"
        onClick={() => setAbierto(!abierto)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {abierto && (
        <div id="menu-usuario-panel" className="menu-usuario__panel">
          {/* Usuario y rol activos */}
          <div className="menu-usuario__cuenta">
            {user ? (
              <>
                <strong>{user.name}</strong>
                <span>{NOMBRE_ROL[user.role]}{user.empresa ? ` · ${user.empresa.nombre}` : ""}</span>
              </>
            ) : (
              <>
                <strong>Invitado</strong>
                <span>Compras con precios B2C</span>
              </>
            )}
          </div>

          <ul className="menu-usuario__lista">
            <li><Link to="/" onClick={cerrar}>Catálogo</Link></li>
            {esAdmin ? (
              <li><Link to="/admin" onClick={cerrar}>Panel administrativo</Link></li>
            ) : (
              <li><Link to="/mis-ordenes" onClick={cerrar}>Mis órdenes</Link></li>
            )}
            <li><Link to="/analytics" onClick={cerrar}>Analytics</Link></li>
            <li><Link to="/preguntas-frecuentes" onClick={cerrar}>Ayuda</Link></li>
          </ul>

          <div className="menu-usuario__pie">
            {user ? (
              <button type="button" className="menu-usuario__salir" onClick={cerrarSesion}>Cerrar sesión</button>
            ) : (
              // Se guarda la página actual para volver a ella después de iniciar sesión
              <Link
                to="/login"
                state={{ from: location.pathname === "/login" ? "/" : location.pathname }}
                className="menu-usuario__ingresar"
                onClick={cerrar}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}