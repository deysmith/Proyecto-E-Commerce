import { RangeInput, useClearRefinements, useRefinementList } from "react-instantsearch"
import { useState } from "react"

function PaginatedRefinementList({
  attribute,
  itemsPerPage = 10
}: {
  attribute: string
  itemsPerPage?: number
}) {
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

export function CatalogFilters() {
  const { canRefine, refine } = useClearRefinements()

  return (
    <aside
      className="filters"
      aria-label="Filtros del catálogo"
    >
      <div className="filters__heading">
        <h2>Explorar</h2>
      </div>

      {canRefine && (
        <button
          type="button"
          className="clear-filters"
          onClick={refine}
        >
          Borrar filtros
        </button>
      )}

      <div className="filter-group">
        <h3>Categoría</h3>

        <PaginatedRefinementList
          attribute="facets.category"
          itemsPerPage={10}
        />
      </div>

      <div className="filter-group">
        <h3>Editorial</h3>

        <PaginatedRefinementList
          attribute="facets.publisher"
          itemsPerPage={10}
        />
      </div>

      <div className="filter-group">
        <h3>Lenguaje</h3>

        <PaginatedRefinementList
          attribute="facets.language"
          itemsPerPage={10}
        />
      </div>

      <div className="filter-group">
        <h3>Precio</h3>

        <RangeInput
          attribute="pricing.price_crc"
          translations={{
            submitButtonText: "Aplicar"
          }}
        />
      </div>
    </aside>
  )
}