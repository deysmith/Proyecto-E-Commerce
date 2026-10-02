import { RefinementList, RangeInput, useClearRefinements } from "react-instantsearch"
import { useState } from "react"

// const CATEGORY_TRANSLATIONS: Record<string, string> = {
//   "Juvenile Fiction": "Ficción Juvenil",
//   "Fiction": "Ficción",
//   "Juvenile Nonfiction": "No Ficción Juvenil",
//   "Science": "Ciencia",
//   "Young Adult Fiction": "Ficción Adulto Joven",
// }

export function CatalogFilters() {
  const { canRefine, refine } = useClearRefinements()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside
      className="filters"
      aria-label="Filtros del catálogo"
    >
      <button
        type="button"
        className="filters__toggle"
        aria-expanded={isOpen}
        aria-controls="catalog-filter-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>Filtros del catálogo</span>
        <span className="filters__toggle-icon" aria-hidden="true" />
      </button>

      <div
        id="catalog-filter-panel"
        className={`filters__panel${isOpen ? " filters__panel--open" : ""}`}
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
          <RefinementList
            attribute="facets.category"
            // transformItems={(items) =>
            //   items.map((item) => ({ ...item, label: CATEGORY_TRANSLATIONS[item.label] ?? item.label, }))}
          />
        </div>

        <div className="filter-group">
          <h3>Editorial</h3>
          <RefinementList attribute="facets.publisher" />
        </div>

        <div className="filter-group">
          <h3>Lenguaje</h3>
          <RefinementList attribute="facets.language" />
        </div>

        <div className="filter-group">
          <h3>Precio</h3>
          <RangeInput
            attribute="pricing.price_crc"
            translations={{
              submitButtonText: 'Aplicar'
            }}
          />
        </div>
      </div>
    </aside>
  )
}