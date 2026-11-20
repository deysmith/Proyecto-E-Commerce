import { AdminSeccion } from "./AdminSeccion"
import { AdminError } from "./AdminError"
import { AdminPaginacion } from "./AdminPaginacion"
import { AdminLibro } from "./AdminLibro"
import { useProductosAdmin } from "./useProductosAdmin"
import { obtenerInventarioProducto } from "../../services/inventoryServices"
import { SUCURSALES, useInventarioActualizado } from "../sucursales/Sucursales"

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
 */
export default function AdminInventario() {
  const { texto, buscar, pagina, setPagina, datos, cargando, reintentar } = useProductosAdmin()
  useInventarioActualizado()

  return (
    <AdminSeccion titulo="Inventario" descripcion="Disponibilidad de cada libro por sucursal.">
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <AdminPaginacion pagina={pagina} totalPaginas={datos.totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </AdminSeccion>
  )
}