import { HashRouter, Routes, Route, Link } from "react-router-dom"
import { InstantSearch } from "react-instantsearch"
import { searchClient } from "./services/algoliaService"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import ConfirmationPage from "./pages/ConfirmationPage"
import LegalPage from "./pages/LegalPage"
import { CartProvider } from "./features/carrito-de-compras/CartProvider"
import { ErrorBoundary } from "./components/ErrorBoundary"

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
  return (
    <ErrorBoundary>
      <HashRouter>
        <CartProvider>
          <InstantSearch
            searchClient={searchClient}
            indexName={import.meta.env.VITE_INDEX_NAME}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/producto/:id" element={<DetailPage />} />
              <Route path="/cart" element={<CartPage />}/>
              <Route path="/checkout" element={<CheckoutPage />}/>
              <Route path="/confirmacion/:numero" element={<ConfirmationPage />} />
              <Route path="/terminos-y-condiciones" element={<LegalPage page="terminos" />} />
              <Route path="/politica-de-devoluciones" element={<LegalPage page="devoluciones" />} />
              <Route path="/politica-de-envios" element={<LegalPage page="envios" />} />
              <Route path="/politica-de-privacidad" element={<LegalPage page="privacidad" />} />
              <Route path="/preguntas-frecuentes" element={<LegalPage page="preguntas" />} />
              <Route path="*" element={<NoEncontrada />} />
            </Routes>
          </InstantSearch>
        </CartProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}