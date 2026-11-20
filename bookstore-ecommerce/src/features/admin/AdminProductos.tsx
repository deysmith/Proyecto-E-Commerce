import { useTranslation } from "react-i18next"
import { AdminSeccion } from "./AdminSeccion"
import { AdminError } from "./AdminError"
import { AdminPaginacion } from "./AdminPaginacion"
import { AdminLibro } from "./AdminLibro"
import { useProductosAdmin } from "./useProductosAdmin"
import { obtenerInventarioProducto } from "../../services/inventoryServices"
import { useInventarioActualizado } from "../sucursales/Sucursales"
import { formatPrice } from "../../utils/formatPrice"

// Si el catálogo trae un precio dañado o vacío, se muestra un guion en vez de "NaN"
function mostrarPrecio(precio: unknown) {
  return typeof precio === "number" && Number.isFinite(precio) ? formatPrice(precio) : "—"
}

/**
 * Sección "Productos" del panel: información del catálogo con precios B2C, B2B y condiciones comerciales.
 */
export default function AdminProductos() {
  const { t } = useTranslation()
  const { texto, buscar, pagina, setPagina, datos, cargando, reintentar } = useProductosAdmin()
  // Las existencias se vuelven a leer cuando cambia el inventario local (compras o cambios del admin)
  useInventarioActualizado()

  return (
    <AdminSeccion titulo="Productos" descripcion="Información del catálogo con los precios B2C, B2B y las condiciones comerciales.">
      <form className="admin-filtros admin-filtros--simple" onSubmit={(evento) => evento.preventDefault()} role="search">
        <div className="checkout-field">
          <label htmlFor="admin-buscar-producto">Buscar</label>
          <input
            id="admin-buscar-producto"
            type="search"
            placeholder="Título, autor o editorial"
            value={texto}
            onChange={(evento) => buscar(evento.target.value)}
          />
        </div>
      </form>

      {cargando && <p className="admin-estado" role="status">Consultando productos…</p>}

      {!cargando && datos === null && (
        <AdminError mensaje="No pudimos consultar el catálogo en este momento. Revisa tu conexión e inténtalo de nuevo." onReintentar={reintentar} />
      )}

      {!cargando && datos && datos.productos.length === 0 && (
        <p className="admin-estado">No hay libros que coincidan con la búsqueda.</p>
      )}

      {datos && datos.productos.length > 0 && (
        <>
          <p className="admin-estado">{datos.total} {datos.total === 1 ? "libro" : "libros"} en el catálogo</p>

          <div className={cargando ? "admin-tabla-wrap is-cargando" : "admin-tabla-wrap"}>
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th scope="col">Libro</th>
                  <th scope="col">Categoría</th>
                  <th scope="col" className="admin-tabla__numero">Precio B2C</th>
                  <th scope="col" className="admin-tabla__numero">Precio B2B</th>
                  <th scope="col" className="admin-tabla__numero">Mínimo B2B</th>
                  <th scope="col" className="admin-tabla__numero">Desc. volumen</th>
                  <th scope="col" className="admin-tabla__numero">Existencias</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos.map((producto) => {
                  const inventario = obtenerInventarioProducto(producto.objectID, producto.inventory.stock_by_branch)
                  const existencias = Object.values(inventario).reduce((suma, stock) => suma + (stock ?? 0), 0)

                  return (
                    <tr key={producto.objectID}>
                      <td><AdminLibro producto={producto} /></td>
                      <td>{t(`categories.${producto.facets.category}`, { defaultValue: producto.facets.category })}</td>
                      <td className="admin-tabla__numero">{mostrarPrecio(producto.pricing?.price_crc)}</td>
                      <td className="admin-tabla__numero">{mostrarPrecio(producto.b2b?.wholesale_price_crc)}</td>
                      <td className="admin-tabla__numero">{producto.b2b?.min_order_quantity ?? "—"}</td>
                      <td className="admin-tabla__numero">{producto.b2b?.volume_discount_pct ?? 0}%</td>
                      <td className="admin-tabla__numero">{existencias}</td>
                      <td>
                        {existencias > 0
                          ? <span className="checkout-chip checkout-chip--ok">Disponible</span>
                          : <span className="checkout-chip checkout-chip--error">Agotado</span>}
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
    </AdminSeccion>
  )
}