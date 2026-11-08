import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import type { AnalyticsEvent, AnalyticsEventType } from "../features/analytics/analytics"
import { useAnalytics } from "../features/analytics/analyticsContext"
import { useSession } from "../features/session/sessionContext"
import { formatPrice } from "../utils/formatPrice"
import { useEffect, useState } from "react"

const EVENT_LABELS: Record<AnalyticsEventType, string> = {
  login: "Inicio de sesión",
  search: "Búsqueda",
  product_view: "Producto visualizado",
  add_to_cart: "Agregado al carrito",
  checkout_start: "Inicio del checkout",
  purchase_completed: "Compra completada",
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp))
}

function getEventDescription(event: AnalyticsEvent) {
  const d = event.details
  switch (event.type) {
    case "login":
      return d.name ? `Ingresó ${d.name}` : "Inicio de sesión"
    case "search":
      return `"${d.query}"`
    case "product_view":
      return d.category ? `${d.title} · ${d.category}` : String(d.title ?? "—")
    case "add_to_cart":
      return d.quantity ? `${d.title} (x${d.quantity})` : String(d.title ?? "—")
    case "checkout_start":
      return d.quantity ? `${d.quantity} artículo(s) en el carrito` : "—"
    case "purchase_completed":
      return typeof d.total === "number"
        ? `Orden ${d.orderNumber} · ${formatPrice(d.total)}`
        : `Orden ${d.orderNumber ?? "—"}`
    default:
      return "—"
  }
}

export default function AnalyticsPage() {
  const { user } = useSession()
  // Eventos del usuario o de la sesión de invitado
  const { events } = useAnalytics()

  const [paginaActual, setPaginaActual] = useState(1)
  const eventosPorPagina = 10

  const eventosOrdenados = [...events].reverse()
  const totalPaginas = Math.ceil(eventosOrdenados.length / eventosPorPagina)

  useEffect(() => {
    if (totalPaginas === 0) {
      setPaginaActual(1)
    } else if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas)
    }
  }, [paginaActual, totalPaginas])

  const indiceFinal = paginaActual * eventosPorPagina
  const indiceInicial = indiceFinal - eventosPorPagina
  const eventosPaginados = eventosOrdenados.slice(indiceInicial, indiceFinal)

  const metrics = [
    { type: "product_view", label: "Productos visualizados" },
    { type: "search", label: "Búsquedas realizadas" },
    { type: "add_to_cart", label: "Productos agregados al carrito" },
    { type: "purchase_completed", label: "Compras realizadas" },
  ] as const

  // Para los productos agregados al carrito se suman las cantidades, en las demás se cuentan los eventos
  function calcularMetrica(type: AnalyticsEventType) {
    const delTipo = events.filter((event) => event.type === type)
    if (type !== "add_to_cart") return delTipo.length
    return delTipo.reduce(
      (total, event) => total + (typeof event.details.quantity === "number" ? event.details.quantity : 1),
      0,
    )
  }

  function cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina)
    }
  }

  function obtenerPaginas() {
    const paginas: (number | string)[] = []

    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 ||
        i === totalPaginas ||
        (i >= paginaActual - 1 && i <= paginaActual + 1)
      ) {
        paginas.push(i)
      } else if (paginas[paginas.length - 1] !== "...") {
        paginas.push("...")
      }
    }

    return paginas
  }

  return (
    <div className="catalog-shell">
      <Header />
      <main className="analytics-page">
        <div className="analytics-heading">
          <div>
            <p className="eyebrow">Booksmart · Analytics</p>
            <h1>Tu actividad</h1>
          </div>
          <p className="analytics-heading__user">
            {user ? `Sesión de ${user.name}` : <>Navegando como invitado · <Link to="/login">Iniciar sesión</Link></>}
          </p>
        </div>

        <section className="analytics-metrics" aria-label="Métricas de uso">
          {metrics.map((metric, index) => (
            <article className="analytics-metric" key={metric.type}>
              <span className="analytics-metric__index">0{index + 1}</span>
              <p>{metric.label}</p>
              <strong>{calcularMetrica(metric.type)}</strong>
            </article>
          ))}
        </section>

        <section className="analytics-activity" aria-labelledby="analytics-activity-title">
          <div className="analytics-activity__heading">
            <div>
              <p className="eyebrow">Registro local</p>
              <h2 id="analytics-activity-title">Actividad reciente</h2>
            </div>
            <span>{events.length} eventos</span>
          </div>

          {events.length === 0 ? (
            <div className="analytics-activity__empty">
              <p>Aún no hay actividad registrada. Explora el catálogo, busca un libro o agrega algo al carrito y aquí verás tus métricas.</p>
              <Link to="/" className="session-form__submit">Ir al catálogo</Link>
            </div>
          ) : (
            <>
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Detalle</th>
                      <th>Fecha y hora</th>
                    </tr>
                  </thead>

                  <tbody>
                    {eventosPaginados.map((event) => (
                      <tr key={event.id}>
                        <td>{EVENT_LABELS[event.type]}</td>
                        <td>{getEventDescription(event)}</td>
                        <td>{formatTimestamp(event.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="filter-pagination">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {obtenerPaginas().map((pagina, index) =>
                    pagina === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="filter-pagination__ellipsis"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pagina}
                        className={
                          paginaActual === pagina ? "active" : ""
                        }
                        onClick={() => cambiarPagina(Number(pagina))}
                        aria-current={
                          paginaActual === pagina ? "page" : undefined
                        }
                      >
                        {pagina}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}