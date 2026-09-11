import { useState } from "react"
import { Configure, SearchBox } from "react-instantsearch"

/**
 * Se encarga de mostrar la introducción del catálogo, proporcioanr el campo
 * de búsqueda y permitir activar y desactivar la búsqueda exacta.
 * 
 * @returns Sección de introducción del catálogo.
 */
export function CatalogIntro() {
  const [exactSearch, setExactSearch] = useState(false)
  
  return (
    <section className="catalog-intro" id="catalogo">
      <div>
        <p className="eyebrow">Librería</p>

        <h1>
          Catálogo
          <br />
          <em>Completo</em>
        </h1>

        <p className="catalog-intro__copy">
          Bienvenidos a Booksmart. Todos tus libros favoritos en un solo lugar.
        </p>
      </div>

      <div className="search-area">
        <label htmlFor="catalog-search">
          Buscar en el catálogo
        </label>

        <div className="search-box">
          <SearchBox
            placeholder="Título, autor o editorial"
            className="catalog-search"
          />
        </div>

        <button
          type="button"
          className={`exact-search-toggle ${exactSearch ? "is-active" : ""}`}
          onClick={() => setExactSearch((prev) => !prev)}
        >
          Búsqueda exacta {exactSearch ? "activada" : "desactivada"}
        </button>

      </div>

      <Configure typoTolerance={!exactSearch} />
    </section>
  )
}