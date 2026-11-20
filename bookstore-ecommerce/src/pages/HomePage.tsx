import { Configure, useSearchBox } from "react-instantsearch"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { CatalogIntro } from "../features/catalog/CatalogIntro"
import { CatalogFilters } from "../features/catalog/CatalogFilters"
import { CatalogResults } from "../features/catalog/CatalogResults"
import { RecentlyViewed } from "../features/personalizacion/RecentlyViewed"
import { Recommendations } from "../features/personalizacion/Recommendations"
import { useSession } from "../features/session/sessionContext"

/**
 * Componente que representa a la página principal de la página web
 */
export default function HomePage() {
  const { query } = useSearchBox()
  const { user } = useSession()
  const estaBuscando = query.trim() !== ""

  return (
    <div className="catalog-shell">
      <div className="catalog-header-fijo">
        <Header />
      </div>
      <Configure
        hitsPerPage={12}
        typoTolerance={true}
      />
      <main>
        <CatalogIntro />
        {!estaBuscando && user?.role !== "ADMIN" &&(
          <>
            <RecentlyViewed />
            <Recommendations />
          </>
        )}
        <section className="catalog-content">
          <CatalogFilters />
          <CatalogResults />
        </section>
      </main>

      <Footer />
    </div>
  )
}