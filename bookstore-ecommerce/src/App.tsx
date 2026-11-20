import { useEffect } from "react"
import { HashRouter, Routes, Route, Link, Navigate } from "react-router-dom"
import { InstantSearch } from "react-instantsearch"
import { searchClient } from "./services/algoliaService"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import ConfirmationPage from "./pages/ConfirmationPage"
import LegalPage from "./pages/LegalPage"
import LoginPage from "./pages/LoginPage"
import OrdersPage from "./pages/OrdersPage"
import { sincronizarPendientes } from "./services/ordersService"
import AnalyticsPage from "./pages/AnalyticsPage"
import { CartProvider } from "./features/carrito-de-compras/CartProvider"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { SessionProvider } from "./features/session/SessionProvider"
import { AnalyticsProvider } from "./features/analytics/AnalyticsProvider"
import { RutaProtegida } from "./features/session/RutaProtegida"
import { ROLES_ADMIN, ROLES_CLIENTES } from "./features/session/roles"
import AdminLayout from "./features/admin/AdminLayout"
import AdminOrdenes from "./features/admin/AdminOrdenes"
import AdminProductos from "./features/admin/AdminProductos"
import AdminInventario from "./features/admin/AdminInventario"

// Pantalla para direcciones que no existen
function NoEncontrada() {
  return (
    <main className="error-page">
      <div className="error-page__card">
        <h1 className="error-page__title">Página no encontrada</h1>
        <p className="error-page__text">La dirección que buscas no existe o fue movida.</p>
        <div className="error-page__actions">
          <Link to="/" className="checkout-btn">Ir al catálogo</Link>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  // Al abrir la app, y cada vez que vuelve la conexión, se reenvían a Algolia las órdenes que quedaron pendientes
  useEffect(() => {
    const reintentar = () => { void sincronizarPendientes() }
    reintentar()
    window.addEventListener("online", reintentar)
    return () => window.removeEventListener("online", reintentar)
  }, [])

    return (
    <ErrorBoundary>
      <HashRouter>
        <SessionProvider>
          <AnalyticsProvider>
            <CartProvider>
              <InstantSearch
                searchClient={searchClient}
                indexName={import.meta.env.VITE_INDEX_NAME_PRODUCTS}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/producto/:id" element={<DetailPage />} />
                  <Route path="/cart" element={<RutaProtegida rolesPermitidos={ROLES_CLIENTES}><CartPage /></RutaProtegida>} />
                  <Route path="/checkout" element={<RutaProtegida rolesPermitidos={ROLES_CLIENTES}><CheckoutPage /></RutaProtegida>} />
                  <Route path="/confirmacion/:numero" element={<RutaProtegida rolesPermitidos={ROLES_CLIENTES}><ConfirmationPage /></RutaProtegida>} />
                  <Route path="/mis-ordenes" element={<RutaProtegida rolesPermitidos={ROLES_CLIENTES}><OrdersPage /></RutaProtegida>} />
                  <Route path="/admin" element={<RutaProtegida rolesPermitidos={ROLES_ADMIN}><AdminLayout /></RutaProtegida>}>
                    <Route index element={<Navigate to="ordenes" replace />} />
                    <Route path="ordenes" element={<AdminOrdenes />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="inventario" element={<AdminInventario />} />
                  </Route>
                  <Route path="/terminos-y-condiciones" element={<LegalPage page="terminos" />} />
                  <Route path="/politica-de-devoluciones" element={<LegalPage page="devoluciones" />} />
                  <Route path="/politica-de-envios" element={<LegalPage page="envios" />} />
                  <Route path="/politica-de-privacidad" element={<LegalPage page="privacidad" />} />
                  <Route path="/preguntas-frecuentes" element={<LegalPage page="preguntas" />} />
                  <Route path="*" element={<NoEncontrada />} />
                </Routes>
              </InstantSearch>
            </CartProvider>
          </AnalyticsProvider>
        </SessionProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}