import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { useSession } from "../features/session/sessionContext"
import { identidadDeCliente } from "../features/ordenes/OrderCustomer"
import { EstadoOrdenChip, EstadoPagoChip } from "../features/ordenes/EstadoChips"
import { OrderProductsSummary } from "../features/ordenes/OrderProductsSummary"
import { consultarOrdenesDelCliente } from "../services/ordersService"
import type { OrdenesDelCliente } from "../services/ordersService"
import { formatDate } from "../utils/formatDate"
import { formatPrice } from "../utils/formatPrice"

interface OrdersPageProps {
  clienteId: string
  esInvitado: boolean
}

/**
 * Lista las órdenes de la persona actual. Se monta con key={clienteId}, así al iniciar o cerrar sesión
 * se vuelve a cargar desde cero sin tener que reiniciar el estado a mano.
 */
function ListaOrdenes({ clienteId, esInvitado }: OrdersPageProps) {
  const [resultado, setResultado] = useState<OrdenesDelCliente | null>(null)

  useEffect(() => {
    let cancelado = false
    consultarOrdenesDelCliente(clienteId).then((datos) => {
      if (!cancelado) setResultado(datos)
    })
    return () => { cancelado = true }
  }, [clienteId])

  if (resultado === null) {
    return <p className="orders-status" role="status">Cargando tus órdenes…</p>
  }

  return (
    <>
      {esInvitado && (
        <p className="orders-note">
          Estás comprando como invitado. Estas son las órdenes hechas desde este navegador; si borras los datos del navegador dejarás de verlas.
          Inicia sesión para consultar tus órdenes desde cualquier dispositivo.
        </p>
      )}

      {!resultado.algoliaDisponible && (
        <p className="orders-note orders-note--aviso" role="status">
          No pudimos consultar el registro central de órdenes en este momento. Te mostramos las órdenes guardadas en este dispositivo.
        </p>
      )}

      {resultado.ordenes.length === 0 ? (
        <section className="cart-empty" aria-live="polite">
          <h2>Todavía no tienes órdenes</h2>
          <p>Cuando completes una compra, aparecerá aquí con su estado y el detalle de los libros.</p>
          <Link to="/" className="cart-empty__button">Explorar el catálogo</Link>
        </section>
      ) : (
        <ul className="orders-list">
          {resultado.ordenes.map((orden) => (
            <li key={orden.numero} className="orders-item">
              <div className="orders-item__head">
                <div>
                  <p className="orders-item__number">{orden.numero}</p>
                  <p className="orders-item__date">{formatDate(orden.fecha)}</p>
                </div>
                <div className="orders-item__chips">
                  <EstadoOrdenChip estado={orden.estadoOrden} />
                  <EstadoPagoChip estado={orden.estadoPago} />
                </div>
                <strong className="orders-item__total">{formatPrice(orden.montos.total)}</strong>
              </div>

              <details className="orders-item__details">
                <summary>Ver detalle ({orden.productos.length} {orden.productos.length === 1 ? "libro" : "libros"})</summary>
                <OrderProductsSummary productos={orden.productos} montos={orden.montos} />
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/**
 * Pantalla "Mis órdenes". Muestra las órdenes que tienen como cliente a la persona actual:
 * el correo si inició sesión, o el id de invitado guardado en este navegador si no.
 */
export default function OrdersPage() {
  const { user } = useSession()
  const esAdmin = user?.role === "ADMIN"
  const { clienteId, tipoCliente } = identidadDeCliente(user)

  return (
    <div className="catalog-shell">
      <Header />

      <main className="cart-page">
        <nav className="cart-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Mis órdenes</span>
        </nav>

        <div className="cart-head">
          <div>
            <h1 className="cart-head__title">Mis órdenes</h1>
          </div>
        </div>

        {esAdmin ? (
          <section className="cart-empty" aria-live="polite">
            <h2>Los administradores no tienen órdenes propias</h2>
            <p>Esta sección es para los clientes. Las órdenes de todos los clientes se consultan desde el panel administrativo.</p>
            <Link to="/" className="cart-empty__button">Ir al catálogo</Link>
          </section>
        ) : (
          <ListaOrdenes key={clienteId} clienteId={clienteId} esInvitado={tipoCliente === "INVITADO"} />
        )}
      </main>

      <Footer />
    </div>
  )
}
