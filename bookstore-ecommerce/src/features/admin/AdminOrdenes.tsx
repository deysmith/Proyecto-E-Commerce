import { useEffect, useState } from "react"
import { AdminSeccion } from "./AdminSeccion"
import { consultarTodasLasOrdenes, type FiltrosOrdenesAdmin, type OrdenesAdmin } from "../../services/ordersService"
import { ETIQUETA_ESTADO_ORDEN, ETIQUETA_ESTADO_PAGO, type EstadoOrden, type EstadoPago, type Orden } from "../ordenes/OrderTypes"
import { nombreTipoCliente, type TipoCliente } from "../ordenes/OrderCustomer"
import { EstadoOrdenChip, EstadoPagoChip } from "../ordenes/EstadoChips"
import { esSucursalValida, nombreSucursal } from "../sucursales/Sucursales"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"
import { AdminError } from "./AdminError"

const FILTROS_VACIOS: FiltrosOrdenesAdmin = { texto: "", estadoOrden: "", estadoPago: "", tipoCliente: "" }

const ESTADOS_ORDEN = Object.keys(ETIQUETA_ESTADO_ORDEN) as EstadoOrden[]
const ESTADOS_PAGO = Object.keys(ETIQUETA_ESTADO_PAGO) as EstadoPago[]
const TIPOS_CLIENTE: TipoCliente[] = ["CUSTOMER", "BUSINESS", "INVITADO"]

// Fecha corta para la tabla (ej. 19/11/26, 10:25 p. m.); la fecha completa se ve al pasar el mouse
function fechaCorta(fechaIso: string) {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return ""
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "short", timeStyle: "short" }).format(fecha)
}

/**
 * Sucursales de las que salen los libros de la orden.
 */
function sucursalesDeOrden(orden: Orden): string {
  const nombres = new Set<string>()
  for (const producto of orden.productos) {
    if (esSucursalValida(producto.sucursal)) nombres.add(nombreSucursal(producto.sucursal))
  }
  return nombres.size > 0 ? [...nombres].join(", ") : "—"
}

/**
 * Sección Ordenes del panel: todas las órdenes de los clientes, consultadas en el índice de órdenes de Algolia.
 */
export default function AdminOrdenes() {
  const [filtros, setFiltros] = useState<FiltrosOrdenesAdmin>(FILTROS_VACIOS)
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<{ clave: string; datos: OrdenesAdmin | null } | null>(null)

  const clave = JSON.stringify({ filtros, intento })
  const cargando = resultado?.clave !== clave

  useEffect(() => {
    let cancelado = false
    const espera = setTimeout(() => {
      consultarTodasLasOrdenes(filtros).then((datos) => {
        if (!cancelado) setResultado({ clave, datos })
      })
    }, 300)

    return () => {
      cancelado = true
      clearTimeout(espera)
    }
  }, [filtros, clave])

  function cambiarFiltro<K extends keyof FiltrosOrdenesAdmin>(campo: K, valor: FiltrosOrdenesAdmin[K]) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_VACIOS)
  const datos = resultado?.datos

  return (
    <AdminSeccion titulo="Órdenes" descripcion="Todas las órdenes generadas por los clientes, con su estado y el estado del pago.">
      <form className="admin-filtros" onSubmit={(evento) => evento.preventDefault()} role="search">
        <div className="checkout-field admin-filtros__texto">
          <label htmlFor="admin-buscar-orden">Buscar</label>
          <input
            id="admin-buscar-orden"
            type="search"
                        placeholder="Número de orden, cliente, correo o empresa"
            value={filtros.texto}
            onChange={(evento) => cambiarFiltro("texto", evento.target.value)}
          />
        </div>

        <div className="checkout-field">
          <label htmlFor="admin-estado-orden">Estado de la orden</label>
          <select id="admin-estado-orden" value={filtros.estadoOrden} onChange={(evento) => cambiarFiltro("estadoOrden", evento.target.value as EstadoOrden | "")}>
            <option value="">Todos</option>
            {ESTADOS_ORDEN.map((estado) => <option key={estado} value={estado}>{ETIQUETA_ESTADO_ORDEN[estado]}</option>)}
          </select>
        </div>

        <div className="checkout-field">
          <label htmlFor="admin-estado-pago">Estado del pago</label>
          <select id="admin-estado-pago" value={filtros.estadoPago} onChange={(evento) => cambiarFiltro("estadoPago", evento.target.value as EstadoPago | "")}>
            <option value="">Todos</option>
            {ESTADOS_PAGO.map((estado) => <option key={estado} value={estado}>{ETIQUETA_ESTADO_PAGO[estado]}</option>)}
          </select>
        </div>

        <div className="checkout-field">
          <label htmlFor="admin-tipo-cliente">Tipo de cliente</label>
          <select id="admin-tipo-cliente" value={filtros.tipoCliente} onChange={(evento) => cambiarFiltro("tipoCliente", evento.target.value as TipoCliente | "")}>
            <option value="">Todos</option>
            {TIPOS_CLIENTE.map((tipo) => <option key={tipo} value={tipo}>{nombreTipoCliente(tipo)}</option>)}
          </select>
        </div>

        {hayFiltros && (
          <button type="button" className="checkout-btn checkout-btn--ghost admin-filtros__limpiar" onClick={() => setFiltros(FILTROS_VACIOS)}>
            Limpiar filtros
          </button>
        )}
      </form>

      {cargando && <p className="admin-estado" role="status">Consultando órdenes…</p>}

      {!cargando && datos === null && (
        <AdminError mensaje="No pudimos consultar las órdenes en este momento. Revisa tu conexión e inténtalo de nuevo." onReintentar={() => setIntento(intento + 1)} />
      )}

      {!cargando && datos && datos.ordenes.length === 0 && (
        <p className="admin-estado">{hayFiltros ? "No hay órdenes que coincidan con la búsqueda." : "Todavía no se ha generado ninguna orden."}</p>
      )}

      {datos && datos.ordenes.length > 0 && (
        <>
          <p className="admin-estado">
            {datos.total} {datos.total === 1 ? "orden encontrada" : "órdenes encontradas"}
          </p>

          <div className={cargando ? "admin-tabla-wrap is-cargando" : "admin-tabla-wrap"}>
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th scope="col">Número</th>
                  <th scope="col">Fecha</th>
                  <th scope="col" className="admin-tabla__izq">Cliente</th>
                  <th scope="col">Tipo de cliente</th>
                  <th scope="col">Empresa</th>
                  <th scope="col">Sucursal</th>
                  <th scope="col" className="admin-tabla__numero">Total</th>
                  <th scope="col">Estado de la orden</th>
                  <th scope="col">Estado del pago</th>
                </tr>
              </thead>
              <tbody>
                {datos.ordenes.map((orden) => (
                  <tr key={orden.numero}>
                    <td className="admin-tabla__orden">{orden.numero}</td>
                    <td className="admin-tabla__fecha" title={formatDate(orden.fecha)}>{fechaCorta(orden.fecha)}</td>
                    <td className="admin-tabla__izq">
                      <strong>{orden.comprador.nombreCompleto}</strong>
                      <span className="admin-tabla__sub">{orden.comprador.correo}</span>
                    </td>
                    <td>{nombreTipoCliente(orden.tipoCliente)}</td>
                    <td>
                      {orden.empresa ? (
                        <>
                          <strong>{orden.empresa.nombre}</strong>
                          <span className="admin-tabla__sub">{orden.empresa.cedulaJuridica}</span>
                        </>
                      ) : "—"}
                    </td>
                    <td>{sucursalesDeOrden(orden)}</td>
                    <td className="admin-tabla__numero">{formatPrice(orden.montos.total)}</td>
                    <td><EstadoOrdenChip estado={orden.estadoOrden} /></td>
                    <td><EstadoPagoChip estado={orden.estadoPago} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminSeccion>
  )
}