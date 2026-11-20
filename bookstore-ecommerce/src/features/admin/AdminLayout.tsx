import { Link, NavLink, Outlet } from "react-router-dom"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { useSession } from "../session/sessionContext"

// Secciones del panel. Cada una es una ruta hija de /admin
const SECCIONES = [
  { ruta: "ordenes", nombre: "Órdenes" },
  { ruta: "productos", nombre: "Productos" },
  { ruta: "inventario", nombre: "Inventario" },
]

/**
 * Estructura del panel administrativo: encabezado, pestañas de navegación y la sección actual (Outlet).
 * Solo se llega aquí con rol ADMIN, porque la ruta /admin está envuelta en RutaProtegida.
 */
export default function AdminLayout() {
  const { user } = useSession()

  return (
    <div className="catalog-shell">
      <Header />

      <main className="admin-page">
        <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Panel administrativo</span>
        </nav>

        <div className="admin-head">
          <div>
            <p className="admin-head__etiqueta">Modo administrador</p>
            <h1 className="admin-head__titulo">Panel administrativo</h1>
            <p className="admin-head__texto">
              Hola, {user?.name}. Desde aquí consultas las órdenes de todos los clientes, el catálogo y el inventario de cada sucursal.
            </p>
          </div>
        </div>

        <nav className="admin-tabs" aria-label="Secciones del panel">
          {SECCIONES.map((seccion) => (
            <NavLink
              key={seccion.ruta}
              to={seccion.ruta}
              className={({ isActive }) => (isActive ? "admin-tab is-active" : "admin-tab")}
            >
              {seccion.nombre}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </main>

      <Footer />
    </div>
  )
}