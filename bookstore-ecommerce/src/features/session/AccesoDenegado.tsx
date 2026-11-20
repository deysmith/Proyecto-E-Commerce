import { Link } from "react-router-dom"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import type { RolUsuario } from "./roles"

interface AccesoDenegadoProps {
  rol: RolUsuario
}

/**
 * Pantalla que se muestra cuando el usuario con sesión no tiene permiso para ver una página.
 * El mensaje cambia según el rol para explicar el porqué.
 */
export function AccesoDenegado({ rol }: AccesoDenegadoProps) {
  const esAdmin = rol === "ADMIN"

  return (
    <div className="catalog-shell">
      <Header />

      <main className="error-page">
        <div className="error-page__card" role="alert">
          <h1 className="error-page__title">Acceso denegado</h1>
          <p className="error-page__text">
            {esAdmin
              ? "Esta sección es solo para clientes. Como administrador no puedes comprar ni tener órdenes propias."
              : "Esta sección es solo para administradores. Tu cuenta no tiene permiso para entrar aquí."}
          </p>
          <div className="error-page__actions">
            <Link to="/" className="checkout-btn">Ir al catálogo</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}