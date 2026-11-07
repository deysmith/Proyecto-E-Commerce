import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import type { AnalyticsEvent, AnalyticsEventType } from "../features/analytics/analytics"
import { useAnalytics } from "../features/analytics/analyticsContext"
import { useSession } from "../features/session/sessionContext"
import { formatPrice } from "../utils/formatPrice"

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

  const metrics = [
    { type: "product_view", label: "Productos visualizados" },
    { type: "search", label: "Búsquedas realizadas" },
    { type: "add_to_cart", label: "Productos agregados al carrito" },
    { type: "purchase_completed", label: "Compras realizadas" },
  ] as const
  const latestEvents = [...events].reverse().slice(0, 12)

  // Para los productos agregados al carrito se suman las cantidades, en las demás se cuentan los eventos
  function calcularMetrica(type: AnalyticsEventType) {
    const delTipo = events.filter((event) => event.type === type)
    if (type !== "add_to_cart") return delTipo.length
    return delTipo.reduce(
      (total, event) => total + (typeof event.details.quantity === "number" ? event.details.quantity : 1),
      0,
    )
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

          {latestEvents.length === 0 ? (
            <div className="analytics-activity__empty">
              <p>Aún no hay actividad registrada. Explora el catálogo, busca un libro o agrega algo al carrito y aquí verás tus métricas.</p>
              <Link to="/" className="session-form__submit">Ir al catálogo</Link>
            </div>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Evento</th><th>Detalle</th><th>Fecha y hora</th></tr>
                </thead>
                <tbody>
                  {latestEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{EVENT_LABELS[event.type]}</td>
                      <td>{getEventDescription(event)}</td>
                      <td>{formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}