import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Footer } from "../components/Footer"
import { Header } from "../components/Header"
import { getAnalyticsEvents, type AnalyticsEvent, type AnalyticsEventType } from "../features/analytics/analytics"
import { useSession } from "../features/session/sessionContext"

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
  const detail = event.details.query ?? event.details.title ?? event.details.orderNumber
  return detail === undefined ? "—" : String(detail)
}

export default function AnalyticsPage() {
  const { user } = useSession()
  const [events, setEvents] = useState<AnalyticsEvent[]>(() =>
    user ? getAnalyticsEvents(user.email) : [],
  )

  useEffect(() => {
    if (!user) return
    const refreshEvents = () => setEvents(getAnalyticsEvents(user.email))
    window.addEventListener("storage", refreshEvents)
    return () => window.removeEventListener("storage", refreshEvents)
  }, [user])

  if (!user) {
    return (
      <div className="catalog-shell">
        <Header />
        <main className="analytics-page">
          <section className="analytics-empty">
            <p className="eyebrow">Booksmart · Analytics</p>
            <h1>Inicia sesión para consultar tus métricas</h1>
            <Link to="/login" className="session-form__submit">Iniciar sesión</Link>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  const metrics = [
    { type: "product_view", label: "Productos visualizados" },
    { type: "search", label: "Búsquedas realizadas" },
    { type: "add_to_cart", label: "Productos agregados" },
    { type: "purchase_completed", label: "Compras realizadas" },
  ] as const
  const latestEvents = [...events].reverse().slice(0, 12)

  return (
    <div className="catalog-shell">
      <Header />
      <main className="analytics-page">
        <div className="analytics-heading">
          <div>
            <p className="eyebrow">Booksmart · Analytics</p>
            <h1>Tu actividad</h1>
          </div>
          <p className="analytics-heading__user">Sesión de {user.name}</p>
        </div>

        <section className="analytics-metrics" aria-label="Métricas de uso">
          {metrics.map((metric, index) => (
            <article className="analytics-metric" key={metric.type}>
              <span className="analytics-metric__index">0{index + 1}</span>
              <p>{metric.label}</p>
              <strong>{events.filter((event) => event.type === metric.type).length}</strong>
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
            <p className="analytics-activity__empty">Aún no hay actividad registrada en esta sesión.</p>
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