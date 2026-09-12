import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Configure, useSearchBox } from "react-instantsearch"
import type { ProductRecord } from "../types/productRecord"
import { fetchSearchSuggestions } from "../services/algoliaService"
import { addRecentSearch, getRecentSearches } from "../utils/recentSearches"
import { formatPrice } from "../utils/formatPrice"

/**
 * Buscador global del Header: muestra sugerencias con portada mientras
 * se escribe y búsquedas recientes cuando el campo está vacío y enfocado.
 */
export function SearchBar() {
  const navigate = useNavigate()
  const { refine } = useSearchBox()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ProductRecord[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [exactSearch, setExactSearch] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [query])

  function openDropdown() {
    setRecentSearches(getRecentSearches())
    setIsOpen(true)
  }

  function runSearch(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return

    addRecentSearch(trimmed)
    refine(trimmed)
    setQuery(trimmed)
    setIsOpen(false)
    navigate(`/?q=${encodeURIComponent(trimmed)}`)

  }

  function goToProduct(hit: ProductRecord) {
    addRecentSearch(query.trim() || hit.productInfo.title)
    setIsOpen(false)
    setQuery("")
    navigate(`/producto/${hit.objectID}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    runSearch(query)
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

      <form
        className="header-search__box"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          value={query}
          placeholder="Buscar título, autor o editorial"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={openDropdown}
          aria-label="Buscar en el catálogo"
        />
        <button type="submit" aria-label="Buscar">
          🔎︎
        </button>
      </form>
      {/* <button
        type="button"
        className={`exact-search-toggle ${
          exactSearch ? "is-active" : ""
        }`}
        onClick={() => setExactSearch((prev) => !prev)}
      >
        Búsqueda exacta {exactSearch ? "activada" : "desactivada"}
      </button> */}
      <Configure typoTolerance={!exactSearch} />
      {(showRecent || showSuggestions) && (
        <div className="header-search__dropdown">
          {showRecent && (
            <div>

              <p className="header-search__section-title">
                Búsquedas recientes
              </p>

              <ul className="header-search__recent-list">
                {recentSearches.map((term) => (
                  <li key={term}>

                    <button
                      type="button"
                      onClick={() => runSearch(term)}
                    >

                      <span className="header-search__recent-icon">
                        ↺
                      </span>

                      {term}
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