import { Hits, Pagination, useInstantSearch  } from "react-instantsearch"
import { ProductCard } from "./ProductCard"

export function CatalogResults() {
  const { results } = useInstantSearch()
  const { nbHits, page, hitsPerPage } = results

  const rangeStart = page * hitsPerPage + 1
  const rangeEnd = Math.min((page + 1) * hitsPerPage, nbHits)

  return (
    <div className="results-area">
      {nbHits === 0 ? (
        <div className="no-results">
          <h3>No encontramos resultados</h3>
          <p>
            Intenta buscar con otro título, autor o editorial.
          </p>
        </div>
      ) : (
        <>
          <div className="results-toolbar">
            <p>Todos nuestros libros</p>

            <p className="results-count"> 
              Artículos {rangeStart} a {rangeEnd} de {nbHits} encontrados
            </p>
          </div>

          <div className="product-grid">
            <Hits hitComponent={ProductCard} />
          </div>

          <Pagination />
        </>
      )}
    </div>
  )
}