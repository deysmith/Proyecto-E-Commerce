import { HashRouter, Routes, Route } from "react-router-dom"
import { InstantSearch } from "react-instantsearch"
import { searchClient } from "./services/algoliaService"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./features/carrito-de-compras/CartProvider"

export default function App() {
  return (
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
          </Routes>
        </InstantSearch>
      </CartProvider>
    </HashRouter>
  )
}