import { useEffect, useState } from "react"
import { Hits, Pagination, useInstantSearch  } from "react-instantsearch"
import { ProductCard } from "./ProductCard"

/**
 * Calcula cuántas páginas mostrar a cada lado de la página
 * actual, según el ancho de pantalla.
 */
function getPaginationPadding() {
  const width = window.innerWidth

  if (width <= 785) return 2

  return 3
}

/**
 * Componente encargado de mostrar los resultados del catálogo, calcular
 * el rango de productos visibles y gestionar la páginación
 * 
 * @returns La zona de resultados con los productos encontrados o un mensaje 
 *          si no se encontraron productos.
 */
export function CatalogResults() {
  const { results } = useInstantSearch()
  const { nbHits, page, hitsPerPage } = results

  const [paginationPadding, setPaginationPadding] = useState(getPaginationPadding)

  const rangeStart = page * hitsPerPage + 1
  const rangeEnd = Math.min((page + 1) * hitsPerPage, nbHits)

  useEffect(() => {
    function handleResize() {
      setPaginationPadding(getPaginationPadding())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

          <Pagination padding={paginationPadding} />
        </>
      )}
    </div>
  )
}