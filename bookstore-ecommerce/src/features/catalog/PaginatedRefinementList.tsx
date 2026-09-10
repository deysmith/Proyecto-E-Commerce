import { useState } from "react"
import { useRefinementList } from "react-instantsearch"

interface PaginatedRefinementListProps {
  attribute: string
  itemsPerPage?: number
}

/**
 * Componente encargado de mostrar la lista de filtros con paginación.
 *
 * @param attribute Atributo de Algolia utilizado para realizar el filtrado.
 * @param itemsPerPage Cantidad de opciones mostradas por página.
 * @returns Lista de opciones de filtrado con controles de paginación.
 */
export function PaginatedRefinementList({ attribute, itemsPerPage = 10
  }: PaginatedRefinementListProps) {
    
  const { items, refine } = useRefinementList({
    attribute,
    limit: 100
  })

  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage

  const currentItems = items.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <>
      <ul className="ais-RefinementList-list">
        {currentItems.map((item) => (
          <li
            key={item.value}
            className="ais-RefinementList-item"
          >
            <label className="ais-RefinementList-label">
              <input
                type="checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
                className="ais-RefinementList-checkbox"
              />

              <span className="ais-RefinementList-labelText">
                {item.label}
              </span>

              <span className="ais-RefinementList-count">
                {item.count}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="filter-pagination">
          <button
            type="button"
            className="filter-pagination__arrow"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              type="button"
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="filter-pagination__arrow"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}