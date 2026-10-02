import { HashRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./features/carrito-de-compras/CartProvider"

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/catalogo" element={<HomePage />}/>
          <Route path="/detail" element={<DetailPage />}/>
          <Route path="/cart" element={<CartPage />}/>
        </Routes>
      </HashRouter>
    </CartProvider>
  )
}