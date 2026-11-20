import { useState } from "react"
import { AdminSeccion } from "./AdminSeccion"
import { AdminError } from "./AdminError"
import { AdminPaginacion } from "./AdminPaginacion"
import { AdminLibro } from "./AdminLibro"
import { useProductosAdmin } from "./useProductosAdmin"
import { AdminEditarStock } from "./AdminEditarStock"
import { obtenerCambiosInventario, obtenerInventarioProducto, type CambioInventario } from "../../services/inventoryServices"
import { SUCURSALES, nombreSucursal, useInventarioActualizado } from "../sucursales/Sucursales"
import type { ProductRecord } from "../../types/productRecord"
import { formatDate } from "../../utils/formatDate"

// A partir de esta cantidad o menos se marca la existencia como baja
const STOCK_BAJO = 5

function claseStock(stock: number) {
  if (stock === 0) return "admin-stock is-agotado"
  if (stock <= STOCK_BAJO) return "admin-stock is-bajo"
  return "admin-stock"
}

/**
 * Sección "Inventario" del panel: existencias de cada libro en cada sucursal.
 * Usa el inventario actualizado (Algolia + los descuentos de las compras guardados en este navegador).
 * Desde aquí el administrador hace la operación simulada: modificar las existencias de un libro en una sucursal.
 */
export default function AdminInventario() {
  const { texto, buscar, pagina, setPagina, datos, cargando, reintentar } = useProductosAdmin()
  useInventarioActualizado()
  const [editando, setEditando] = useState<ProductRecord | null>(null)
  const [ultimoCambio, setUltimoCambio] = useState<CambioInventario | null>(null)
  const cambios = obtenerCambiosInventario().slice(0, 5)

  function alGuardar(cambio: CambioInventario) {
    setUltimoCambio(cambio)
    setEditando(null)
  }

  return (
    <AdminSeccion
      titulo="Inventario"
      descripcion="Disponibilidad de cada libro por sucursal. Los cambios se guardan como simulación en este navegador; el índice de Algolia no se modifica."
    >
      {ultimoCambio && (
        <div className="checkout-banner admin-confirmacion" role="status">
          <p>
            Inventario actualizado: <strong>{ultimoCambio.titulo}</strong> en {nombreSucursal(ultimoCambio.sucursal)} pasó
            de <strong>{ultimoCambio.anterior}</strong> a <strong>{ultimoCambio.nuevo}</strong> unidades.
          </p>
          <button type="button" className="admin-confirmacion__cerrar" onClick={() => setUltimoCambio(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <form className="admin-filtros admin-filtros--simple" onSubmit={(evento) => evento.preventDefault()} role="search">
        <div className="checkout-field">
          <label htmlFor="admin-buscar-inventario">Buscar</label>
          <input
            id="admin-buscar-inventario"
            type="search"
            placeholder="Título, autor o editorial"
            value={texto}
            onChange={(evento) => buscar(evento.target.value)}
          />
        </div>
      </form>

      <p className="admin-leyenda">
        <span><span className="admin-stock is-bajo">{STOCK_BAJO} o menos</span> existencias bajas</span>
        <span><span className="admin-stock is-agotado">Agotado</span> sin existencias en la sucursal</span>
      </p>

      {cargando && <p className="admin-estado" role="status">Consultando inventario…</p>}

      {!cargando && datos === null && (
        <AdminError mensaje="No pudimos consultar el inventario en este momento. Revisa tu conexión e inténtalo de nuevo." onReintentar={reintentar} />
      )}

      {!cargando && datos && datos.productos.length === 0 && (
        <p className="admin-estado">No hay libros que coincidan con la búsqueda.</p>
      )}

      {datos && datos.productos.length > 0 && (
        <>
          <div className={cargando ? "admin-tabla-wrap is-cargando" : "admin-tabla-wrap"}>
            <table className="admin-tabla admin-tabla--inventario">
              <thead>
                <tr>
                  <th scope="col">Libro</th>
                  {SUCURSALES.map((sucursal) => (
                    <th key={sucursal.id} scope="col" className="admin-tabla__numero">{sucursal.nombre}</th>
                  ))}
                  <th scope="col" className="admin-tabla__numero">Total</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos.map((producto) => {
                  const inventario = obtenerInventarioProducto(producto.objectID, producto.inventory.stock_by_branch)
                  const total = SUCURSALES.reduce((suma, sucursal) => suma + (inventario[sucursal.id] ?? 0), 0)

                  return (
                    <tr key={producto.objectID}>
                      <td><AdminLibro producto={producto} /></td>
                      {SUCURSALES.map((sucursal) => {
                        const stock = inventario[sucursal.id] ?? 0
                        return (
                          <td key={sucursal.id} className="admin-tabla__numero">
                            <span className={claseStock(stock)}>{stock === 0 ? "Agotado" : stock}</span>
                          </td>
                        )
                      })}
                      <td className="admin-tabla__numero"><strong>{total}</strong></td>
                      <td>
                        <button type="button" className="admin-accion" onClick={() => setEditando(producto)}>
                          Modificar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <AdminPaginacion pagina={pagina} totalPaginas={datos.totalPaginas} onCambiar={setPagina} />
        </>
      )}

      {cambios.length > 0 && (
        <div className="admin-cambios">
          <h3 className="admin-cambios__titulo">Últimos cambios de inventario</h3>
          <ul>
            {cambios.map((cambio) => (
              <li key={cambio.fecha + cambio.productoId + cambio.sucursal}>
                <strong>{cambio.titulo}</strong> · {nombreSucursal(cambio.sucursal)}: {cambio.anterior} → {cambio.nuevo}
                <span className="admin-tabla__sub">{formatDate(cambio.fecha)} · {cambio.admin}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editando && (
        <AdminEditarStock key={editando.objectID} producto={editando} onCerrar={() => setEditando(null)} onGuardado={alGuardar} />
      )}
    </AdminSeccion>
  )
}