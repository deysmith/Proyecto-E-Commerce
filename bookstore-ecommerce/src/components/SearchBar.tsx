import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox, useClearRefinements, useSearchBox } from "react-instantsearch";
import type { ProductRecord } from "../types/productRecord";
import { fetchSearchSuggestions } from "../services/algoliaService";
import { addRecentSearch, clearRecentSearches, getRecentSearches, removeRecentSearch } from "../utils/recentSearches";import { formatPrice } from "../utils/formatPrice";
import { useAnalytics } from "../features/analytics/analyticsContext";

/**
 * Buscador global del Header: muestra sugerencias con portada mientras
 * se escribe y búsquedas recientes cuando el campo está vacío y enfocado.
 */
export function SearchBar() {
  const navigate = useNavigate()
  const { query: algoliaQuery, refine } = useSearchBox()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ProductRecord[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const { refine: clearRefinements } = useClearRefinements()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { registrarEvento, ownerId } = useAnalytics()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {

        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timeoutId = setTimeout(() => {
      fetchSearchSuggestions(query).then(setSuggestions)
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    setQuery(algoliaQuery)
  }, [algoliaQuery])
  
  function openDropdown() {
    setRecentSearches(getRecentSearches(ownerId))
    setIsOpen(true)
  }

  function runSearch(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return

    clearRefinements()
    addRecentSearch(ownerId, trimmed)
    registrarEvento("search", { query: trimmed })
    refine(trimmed)
    setQuery(trimmed)
    setIsOpen(false)
    navigate(`/?q=${encodeURIComponent(trimmed)}`)

  }

  // Borra el historial de búsquedas del usuario o sesión
  function clearHistory() {
    clearRecentSearches(ownerId)
    setRecentSearches([])
  }

  // Borra solo una búsqueda (la X de cada fila)
  function removeSearch(term: string) {
    removeRecentSearch(ownerId, term)
    setRecentSearches((actuales) => actuales.filter((item) => item !== term))
  }

  function goToProduct(hit: ProductRecord) {
    const searchTerm = query.trim()
    addRecentSearch(ownerId, searchTerm || hit.productInfo.title)
    if (searchTerm) registrarEvento("search", { query: searchTerm })
    setIsOpen(false)
    setQuery("")
    navigate(`/producto/${hit.objectID}`)
  }

  const showRecent =
    isOpen &&
    query.trim() === "" &&
    recentSearches.length > 0

  const showSuggestions =
    isOpen &&
    query.trim() !== "" &&
    suggestions.length > 0

  return (
    <div className="header-search" ref={containerRef}>

      <div className="header-search__box">
        <SearchBox
          placeholder="Buscar título, autor o editorial"
          onFocus={openDropdown}
          onSubmit={() => {
            runSearch(query)
          }}
          aria-label="Buscar en el catálogo"
        />

      </div>

      {(showRecent || showSuggestions) && (
        <div className="header-search__dropdown">
          {showRecent && (
            <div>

              <div className="header-search__recent-header">
                <p className="header-search__section-title">
                  Búsquedas recientes
                </p>
                <button
                  type="button"
                  className="header-search__clear"
                  onClick={clearHistory}
                >
                  Limpiar
                </button>
              </div>

              <ul className="header-search__recent-list">
                {recentSearches.map((term) => (
                  <li key={term} className="header-search__recent-item">

                    <button
                      type="button"
                      onClick={() => runSearch(term)}
                    >

                      <span className="header-search__recent-icon">
                        ↺
                      </span>

                      {term}
                    </button>

                    <button
                      type="button"
                      className="header-search__remove"
                      onClick={() => removeSearch(term)}
                      aria-label={`Eliminar "${term}" de las búsquedas recientes`}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSuggestions && (
            <ul className="header-search__suggestions">
              {suggestions.map((hit) => (
                <li key={hit.objectID}>

                  <button
                    type="button"
                    onClick={() => goToProduct(hit)}
                  >

                    <img
                      src={hit.productInfo.image_url}
                      alt={`Portada de ${hit.productInfo.title}`}
                      loading="lazy"
                    />

                    <span className="header-search__suggestion-info">

                      <strong>
                        {hit.productInfo.title}
                      </strong>

                      <span>
                        {hit.productInfo.author}
                      </span>
                    </span>

                    <span className="header-search__suggestion-price">
                      {formatPrice(hit.pricing.price_crc)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}