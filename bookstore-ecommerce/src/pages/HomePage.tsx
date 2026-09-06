import products from "../../data/products.json"

type Product = (typeof products)[number]

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(price)
}

export default function HomePage() {
  return (
    <div className="catalog-shell">
      <header className="catalog-header">
        <div className="brand-mark">
          <span className="brand-mark__symbol">P</span>
          <span>Proyecto 1</span>
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
      <main>
        <section className="catalog-intro" id="catalogo">
          <div>
            <p className="eyebrow">Librería</p>
            <h1>
              Catalogo<br />
              <em>Completo</em>
            </h1>
            <p className="catalog-intro__copy">
              Todos los libros disponibles en nuestra librería.
            </p>
          </div>
          <div className="search-area">
            <label htmlFor="catalog-search">Buscar en el catálogo</label>
            <div className="search-box">
              <input
                id="catalog-search"
                type="search"
                placeholder="Título, autor o editorial"
              />
              <button type="button" aria-label="Buscar">
                ⌕
              </button>
            </div>
            <p className="catalog-count">
              {products.length} títulos disponibles
            </p>
          </div>
        </section>
        <section className="catalog-content">
          <aside className="filters" aria-label="Filtros del catálogo">
            <div className="filters__heading">
              <h2>Explorar</h2>
            </div>
            <div className="filter-group">
              <h3>Categoría</h3>
              <p>Ficción</p>
              <p>Ciencia</p>
              <p>Comics &amp; Novelas gráficas</p>
            </div>
            <div className="filter-group">
            <h3>Marca (Editorial)</h3>
              <p>Penguin Random House</p>
              <p>Alba</p>
            </div>
            <div className="filter-group">
              <h3>Precio</h3>
              <p>Todos los precios</p>
              <p>Menos de ₡15.000</p>
            </div>
          </aside>
          <div className="results-area">
            <div className="results-toolbar">
              <p>Todos nuestros libros</p>
              <span>{products.length} resultados</span>
            </div>
            <div className="product-grid">
              {(products as Product[]).map((product) => (
                <article className="product-card" key={product.objectID}>
                  <div className="product-card__cover">
                    <img
                      src={product.productInfo.image_url}
                      alt={`Portada de ${product.productInfo.title}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="product-card__body">
                    <p className="product-card__category">
                      {product.facets.category}
                    </p>
                    <h3>{product.productInfo.title}</h3>
                    <p className="product-card__author">
                      {product.productInfo.author}
                    </p>
                    <strong>{formatPrice(product.pricing.price_crc)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="catalog-footer">
        <span>Proyecto 1 / Comercio Electrónico</span>
        <span>Limón, Costa Rica · CRC</span>
      </footer>
    </div>
  )
}