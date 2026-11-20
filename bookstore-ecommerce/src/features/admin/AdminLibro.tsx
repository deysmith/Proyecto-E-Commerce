import type { ProductRecord } from "../../types/productRecord"

/**
 * Celda con la portada, el título y el autor de un libro, se utiliza en las tablas del panel.
 */
export function AdminLibro({ producto }: { producto: ProductRecord }) {
  return (
    <div className="admin-libro">
      <img src={producto.productInfo.image_url} alt="" loading="lazy" />
      <div>
        <strong>{producto.productInfo.title}</strong>
        <span className="admin-tabla__sub">{producto.productInfo.author}</span>
      </div>
    </div>
  )
}