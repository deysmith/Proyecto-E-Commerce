import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { legalPages } from "../features/footer/sections"

export type LegalPageKey = keyof typeof legalPages

type LegalPageProps = {
  page: LegalPageKey
}

export default function LegalPage({ page }: LegalPageProps) {
  const content = legalPages[page]

  return (
    <div className="catalog-shell">
      <Header />

      <main className="legal-page">
        <nav className="legal-page__breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{content.title}</span>
        </nav>

        <div className="legal-page__content">
          <p className="eyebrow">Información de la tienda</p>
          <h1>{content.title}</h1>

          <div className="legal-page__sections">
            {content.sections.map((section) => (
              <section className="legal-page__section" key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.text.trim()}</p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
