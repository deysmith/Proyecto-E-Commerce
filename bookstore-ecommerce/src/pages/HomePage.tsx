import { Configure, InstantSearch } from "react-instantsearch"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { CatalogIntro } from "../features/catalog/CatalogIntro"
import { CatalogFilters } from "../features/catalog/CatalogFilters"
import { CatalogResults } from "../features/catalog/CatalogResults"
import { searchClient } from "../services/algoliaService"

/**
 * Componente que representa a la página principal de la página web
 */
export default function HomePage() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={import.meta.env.VITE_INDEX_NAME}
    >
      <div className="catalog-shell">
        <Header />
        <Configure
          hitsPerPage={12}
          typoTolerance={true}
        />
        <main>
          <CatalogIntro />
          <section className="catalog-content">
            <CatalogFilters />
            <CatalogResults />
          </section>
        </main>

        <Footer />
      </div>
    </InstantSearch>
  )
}