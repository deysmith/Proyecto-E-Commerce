import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"

const placeholder = " [Espacio para completar esta información.]"

const legalPages = {
  terminos: {
    title: "Términos y Condiciones",
    sections: [
      { title: "Condiciones de uso del sitio", text: placeholder },
      { title: "Condiciones generales de compra", text: placeholder },
      { title: "Responsabilidades del cliente", text: placeholder },
      { title: "Responsabilidades de la tienda", text: placeholder },
    ],
  },
  devoluciones: {
    title: "Política de Devoluciones",
    sections: [
      { title: "Plazo para solicitar devoluciones", text: placeholder },
      { title: "Condiciones para aprobar una devolución", text: placeholder },
      { title: "Casos en los que no se aceptan devoluciones", text: placeholder },
      { title: "Procedimiento para gestionar solicitudes", text: placeholder },
    ],
  },
  envios: {
    title: "Política de Envíos",
    sections: [
      { title: "Cobertura de entrega", text: placeholder },
      { title: "Tiempos estimados de envío", text: placeholder },
      { title: "Costos de envío", text: placeholder },
      { title: "Restricciones y condiciones especiales", text: placeholder },
    ],
  },
  privacidad: {
    title: "Política de Privacidad",
    sections: [
      { title: "Información que recopila la tienda", text: placeholder },
      { title: "Uso de la información del cliente", text: placeholder },
      { title: "Protección de datos", text: placeholder },
    ],
  },
  preguntas: {
    title: "Preguntas Frecuentes (FAQ)",
    sections: [
      { title: "¿Cómo puedo realizar una compra?", text: placeholder },
      { title: "¿Qué métodos de pago se aceptan?", text: placeholder },
      { title: "¿Cuáles son las opciones y tiempos de envío?", text: placeholder },
      { title: "¿Cómo puedo solicitar una devolución?", text: placeholder },
      { title: "¿Cómo puedo contactar a atención al cliente?", text: placeholder },
    ],
  },
} as const

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
