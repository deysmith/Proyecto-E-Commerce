import { useState } from "react"
import { RangeInput, useClearRefinements } from "react-instantsearch"
import { PaginatedRefinementList } from "./PaginatedRefinementList"
import { translateLanguage } from "../../utils/language"
import { useTranslation } from "react-i18next"

/**
 * Componente encargado de mostrar y organizar los filtros disponibles para 
 * el catálogo de productos.
 *
 * @returns un panel lateral con filtros de categoría, editorial, lenguaje 
 * y precio.
 */
export function CatalogFilters() {
  const { t } = useTranslation()
  const { canRefine, refine } = useClearRefinements()
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <aside className="filters" aria-label="Filtros del catálogo">

      <div className="filters__heading">
        <h2>Explorar</h2>

        <button
          type="button"
          className="filters-toggle"
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
          aria-label={filtersOpen ? "Cerrar filtros" : "Abrir filtros"}
        >
          {filtersOpen ? "−" : "+"}
        </button>
      </div>

      <div className={`filters__content ${filtersOpen ? "is-open" : ""}`}>

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
            translatedItem={(item) =>
              t(`categories.${item.value}`, {
                defaultValue: item.label
              })
            }
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
            translatedItem={(item) => translateLanguage(item.value)}
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

      </div>
    </aside>
  )
}