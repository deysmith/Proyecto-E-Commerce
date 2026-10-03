import { Link } from "react-router-dom"
import { SearchBar } from "./SearchBar"
import { useCart } from "../features/carrito-de-compras/useCart"

export function Header() {
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  
  return (
    <header className="catalog-header">
      <div className="brand-mark">
        <button 
          className="brand-mark__symbol" 
          onClick={() => window.location.href = '/'}
          aria-label="Ir al inicio"
        >
          B
        </button>

        <button 
          className="brand-mark__text" 
          onClick={() => window.location.href = '/'} 
          aria-label="Ir al inicio"
          >
            Booksmart
          </button>
      </div>

      <SearchBar />

      {/* <nav aria-label="Navegación principal">
        <a href="#catalogo">Catálogo</a>
        <a href="#novedades">Novedades</a>
        <a href="#nosotros">Nosotros</a>
      </nav> */}

      {/* <button className="bag-button" aria-label="Ver carrito">
        Carrito <span>0</span>
      </button> */}
      <Link className="bag-button" to="/cart" aria-label={`Ver carrito, ${itemCount} productos`}>
        Carrito <span>{itemCount}</span>
      </Link>
    </header>    
  )
}