import { Configure, InstantSearch } from "react-instantsearch"
import { Header } from "../components/Header"
import { searchClient } from "../services/algoliaService"
import { CatalogIntro } from "../features/catalog/CatalogIntro"
import { CatalogFilters } from "../features/catalog/CatalogFilters"
import { CatalogResults } from "../features/catalog/CatalogResults"

export default function HomePage() {
  return (
    <div className="catalog-shell">
      <Header />

      <InstantSearch
        searchClient={searchClient}
        indexName={import.meta.env.VITE_INDEX_NAME}
      >
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

        <footer className="catalog-footer">
          <span>
            Laboratorio / Comercio Electrónico
          </span>

          <span>
            Limón, Costa Rica · CRC
          </span>
        </footer>
      </InstantSearch>
    </div>
  )
}