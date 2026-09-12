import { useEffect, useRef, useState } from "react"
import { useRefinementList } from "react-instantsearch"

interface PaginatedRefinementListProps {
  attribute: string
  itemsPerPage?: number
  translatedItem?: (item: {
    value: string
    label: string
    count: number
    isRefined: boolean
  }) => string
}

type PageItem = number | "ellipsis-start" | "ellipsis-end"

/**
 * Calcula cuántos botones de número de página se deben mostrar
 * según el ancho actual de la ventana.
 */
function getMaxVisiblePages() {
  const width = window.innerWidth

  if (width <= 540) return 1
  if (width <= 785) return 5

  return 7
}

/**
 * Arma la lista de páginas a mostrar, agregando "..." cuando
 * hay páginas ocultas entre el inicio, el actual y el final.
 */
function buildPageList(current: number, total: number, maxVisible: number): PageItem[] {
  if (total <= maxVisible + 2) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const half = Math.floor(maxVisible / 2)

  let start = current - half
  let end = current + half

  if (start < 2) {
    end += 2 - start
    start = 2
  }

  if (end > total - 1) {
    start -= end - (total - 1)
    end = total - 1
  }

  start = Math.max(start, 2)
  end = Math.min(end, total - 1)

  const pages: PageItem[] = [1]

  if (start > 2) {
    pages.push("ellipsis-start")
  }

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  if (end < total - 1) {
    pages.push("ellipsis-end")
  }

  pages.push(total)

  return pages
}

/**
 * Componente encargado de mostrar la lista de filtros con paginación.
 *
 * @param attribute Atributo de Algolia utilizado para realizar el filtrado.
 * @param itemsPerPage Cantidad de opciones mostradas por página.
 * @param translatedItem Se utiliza para traducir las categorías
 * @returns Lista de opciones de filtrado con controles de paginación.
 */
export function PaginatedRefinementList({ attribute, itemsPerPage = 10, translatedItem
  }: PaginatedRefinementListProps) {
    
  const { items, refine } = useRefinementList({
    attribute,
    limit: 100
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [maxVisiblePages, setMaxVisiblePages] = useState(getMaxVisiblePages)

  const listRef = useRef<HTMLUListElement>(null)
  const isFirstRender = useRef(true)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage

  const currentItems = items.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const pageList = buildPageList(currentPage, totalPages, maxVisiblePages)

  useEffect(() => {
    function handleResize() {
      setMaxVisiblePages(getMaxVisiblePages())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    listRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [currentPage])

  return (
    <>
      <ul
        ref={listRef}
        className="ais-RefinementList-list"
      >
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
                {translatedItem ? translatedItem(item) : item.label}
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

          {pageList.map((item) =>
            typeof item === "number" ? (
              <button
                type="button"
                key={item}
                className={currentPage === item ? "active" : ""}
                onClick={() => setCurrentPage(item)}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="filter-pagination__ellipsis"
              >
                …
              </span>
            )
          )}

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