import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { LegalBlock } from "../features/legal/LegalBlocks"
import { LegalSidebar } from "../features/legal/LegalSidebar"
import { listaPaginasLegales, paginasLegales } from "../features/legal/LegalContent"
import { CORREO_ATENCION, FECHA_ACTUALIZACION, HORARIO_ATENCION, VERSION_LEGAL } from "../features/legal/InfoTienda"
import type { ClavePaginaLegal } from "../features/legal/LegalTypes"

export type LegalPageKey = ClavePaginaLegal

type LegalPageProps = {
  page: LegalPageKey
}

// Prefijo de los ids de las secciones en el HTML, para no chocar con otros ids de la página
const PREFIJO_SECCION = "seccion-"

/**
 * Página informativa de la tienda (términos, devoluciones, envíos, privacidad y preguntas frecuentes).
 * Las cinco usan este mismo diseño: panel de navegación a la izquierda y el contenido a la derecha.
 * Lo que dice cada una está en features/legal/LegalContent.ts.
 */
export default function LegalPage({ page }: LegalPageProps) {
  const pagina = paginasLegales[page]
  const [idVisible, setIdVisible] = useState("")

  // Si el id guardado no es de esta página (porque se cambió de página), se resalta la primera sección
  const seccionActiva = pagina.secciones.some((seccion) => seccion.id === idVisible) ? idVisible : pagina.secciones[0].id

  // Anterior y siguiente página en el orden del menú
  const posicion = listaPaginasLegales.findIndex((item) => item.clave === page)
  const anterior = listaPaginasLegales[posicion - 1]
  const siguiente = listaPaginasLegales[posicion + 1]

  // Al cambiar de página se vuelve arriba, porque el router no lo hace solo
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [page])

  // Detecta qué sección se está leyendo para resaltarla en el índice del panel
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setIdVisible(entrada.target.id.replace(PREFIJO_SECCION, ""))
        }
      },
      // Franja angosta cerca de la parte de arriba de la pantalla: la sección que la cruza es la que se está leyendo
      { rootMargin: "-15% 0px -75% 0px" },
    )

    for (const seccion of pagina.secciones) {
      const elemento = document.getElementById(PREFIJO_SECCION + seccion.id)
      if (elemento) observador.observe(elemento)
    }

    return () => observador.disconnect()
  }, [pagina])

  function irASeccion(id: string) {
    const elemento = document.getElementById(PREFIJO_SECCION + id)
    if (!elemento) return

    // Se respeta la preferencia de quienes tienen desactivadas las animaciones
    const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    elemento.scrollIntoView({ behavior: sinAnimacion ? "auto" : "smooth", block: "start" })
    // El foco pasa a la sección para que lectores de pantalla y teclado sigan desde ahí
    elemento.focus({ preventScroll: true })
    setIdVisible(id)
  }

  return (
    <div className="catalog-shell">
      <Header />

      <main className="legal-page">
        <nav className="legal-page__breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span>Información</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{pagina.tituloCorto}</span>
        </nav>

        <header className="legal-hero">
          <p className="eyebrow">Centro de información</p>
          <h1>{pagina.titulo}</h1>
          <p className="legal-hero__descripcion">{pagina.descripcion}</p>
          <p className="legal-hero__version">
            Versión {VERSION_LEGAL} · Última actualización: {FECHA_ACTUALIZACION}
          </p>
        </header>

        {pagina.destacados && (
          <ul className="legal-destacados">
            {pagina.destacados.map((destacado) => (
              <li key={destacado.valor}>
                <strong>{destacado.valor}</strong>
                <span>{destacado.etiqueta}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="legal-layout">
          <LegalSidebar paginaActual={page} seccionActiva={seccionActiva} onIrASeccion={irASeccion} />

          <div className="legal-main">
            <article className="legal-article">
              {pagina.secciones.map((seccion, indice) => (
                <section
                  className="legal-section"
                  id={PREFIJO_SECCION + seccion.id}
                  key={seccion.id}
                  tabIndex={-1}
                  aria-labelledby={`${PREFIJO_SECCION}${seccion.id}-titulo`}
                >
                  <div className="legal-section__head">
                    <span className="legal-section__numero" aria-hidden="true">{String(indice + 1).padStart(2, "0")}</span>
                    <h2 id={`${PREFIJO_SECCION}${seccion.id}-titulo`}>{seccion.titulo}</h2>
                  </div>

                  {seccion.bloques.map((bloque, posicionBloque) => (
                    <LegalBlock bloque={bloque} key={posicionBloque} />
                  ))}
                </section>
              ))}
            </article>

            <section className="legal-ayuda" aria-labelledby="legal-ayuda-titulo">
              <div>
                <h2 id="legal-ayuda-titulo">¿Tienes dudas?</h2>
                <p>{HORARIO_ATENCION}</p>
              </div>
              <a href={`mailto:${CORREO_ATENCION}`} className="checkout-btn">{CORREO_ATENCION}</a>
            </section>

            <nav className="legal-paginas" aria-label="Páginas anterior y siguiente">
              {anterior ? (
                <Link to={anterior.ruta} className="legal-paginas__enlace">
                  <span>Anterior</span>
                  <strong>{anterior.tituloCorto}</strong>
                </Link>
              ) : (
                <span />
              )}
              {siguiente && (
                <Link to={siguiente.ruta} className="legal-paginas__enlace legal-paginas__enlace--siguiente">
                  <span>Siguiente</span>
                  <strong>{siguiente.tituloCorto}</strong>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}