export function Header() {
  return (
    <header className="catalog-header">
      <div className="brand-mark">
        <span className="brand-mark__symbol">B</span>
        <span>Booksmart</span>
      </div>
      <nav aria-label="Navegación principal">
        <a href="#catalogo">Catálogo</a>
        <a href="#novedades">Novedades</a>
        <a href="#nosotros">Nosotros</a>
      </nav>
      <button className="bag-button" aria-label="Ver carrito">
        Carrito <span>0</span>
      </button>
    </header>    
  )
}