import { useEffect, useRef, type MouseEvent } from "react"
import { Link } from "react-router-dom"
import { IconoLegal } from "./LegalIcons"
import { listaPaginasLegales } from "./LegalContent"
import type { ClavePaginaLegal } from "./LegalTypes"

interface LegalSidebarProps {
  paginaActual: ClavePaginaLegal
  // Id de la sección que se está leyendo, para resaltarla en el índice
  seccionActiva: string
  onIrASeccion: (id: string) => void
}

/**
 * Panel de navegación de la sección de información.
 * Lista las cinco páginas y, debajo de la que se está leyendo, el índice de sus secciones.
 * En celulares se convierte en una fila de botones con desplazamiento horizontal (ver Legal.css).
 */
export function LegalSidebar({ paginaActual, seccionActiva, onIrASeccion }: LegalSidebarProps) {
  const itemActual = useRef<HTMLLIElement>(null)

  // Solo en celulares: la fila de botones se desplaza, así que se centra el de la página actual para que no quede fuera de la vista
  useEffect(() => {
    if (!window.matchMedia("(max-width: 900px)").matches) return
    itemActual.current?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [paginaActual])

  // Con HashRouter el # de la URL lo usa el router, por eso no se puede usar un enlace #seccion normal.
  // El enlace apunta a la página (por si se abre en otra pestaña) pero al hacer clic solo se desplaza hasta la sección.
  function alHacerClicEnSeccion(id: string) {
    return (evento: MouseEvent<HTMLAnchorElement>) => {
      evento.preventDefault()
      onIrASeccion(id)
    }
  }

  return (
    <aside className="legal-sidebar">
      <nav aria-label="Información y políticas">
        <p className="legal-sidebar__titulo">Centro de información</p>

        <ul className="legal-nav">
          {listaPaginasLegales.map((pagina) => {
            const esActual = pagina.clave === paginaActual

            return (
              <li key={pagina.clave} ref={esActual ? itemActual : undefined} className={esActual ? "legal-nav__item is-current" : "legal-nav__item"}>
                <Link to={pagina.ruta} className="legal-nav__link" aria-current={esActual ? "page" : undefined}>
                  <IconoLegal clave={pagina.clave} />
                  <span>{pagina.tituloCorto}</span>
                </Link>

                {esActual && (
                  <ul className="legal-nav__secciones" aria-label={`Secciones de ${pagina.tituloCorto}`}>
                    {pagina.secciones.map((seccion) => (
                      <li key={seccion.id}>
                        <Link
                          to={pagina.ruta}
                          className={seccion.id === seccionActiva ? "is-active" : undefined}
                          aria-current={seccion.id === seccionActiva ? "location" : undefined}
                          onClick={alHacerClicEnSeccion(seccion.id)}
                        >
                          {seccion.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}