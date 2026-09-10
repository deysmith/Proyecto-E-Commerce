import { RangeInput, useClearRefinements } from "react-instantsearch"
import { PaginatedRefinementList } from "./PaginatedRefinementList"

/**
 * Componente encargado de mostrar y organizar los filtros disponibles para 
 * el catálogo de productos.
 *
 * @returns un panel lateral con filtros de categoría, editorial, lenguaje 
 * y precio.
 */
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