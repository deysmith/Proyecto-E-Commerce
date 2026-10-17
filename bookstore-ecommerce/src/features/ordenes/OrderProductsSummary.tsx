import { formatPrice } from "../../utils/formatPrice"
import type { MontosOrden, ProductoOrden } from "./OrderTypes"

interface OrderProductsSummaryProps {
  productos: ProductoOrden[]
  montos: MontosOrden
}

/**
 * Tabla con los libros de la compra y los montos (subtotal, IVA, envío y total).
 * Se usa en el resumen del checkout y en la pantalla de confirmación, así se ven igual.
 * No calcula nada: muestra los montos que recibe.
 */
export function OrderProductsSummary({ productos, montos }: OrderProductsSummaryProps) {
  const totalUnidades = productos.reduce((suma, producto) => suma + producto.cantidad, 0)

  return (
    <section className="checkout-review__block" aria-label="Libros de la compra">
      <div className="checkout-review__head" aria-hidden="true">
        <span>Libro</span>
        <span>Cantidad</span>
        <span>Precio unitario</span>
        <span>Subtotal</span>
      </div>

      <ul className="checkout-review__items">
        {productos.map((producto) => (
          <li key={producto.id} className="checkout-review__item">
            <span className="cart-book checkout-review__cover" aria-hidden="true">
              {producto.imagen && <img src={producto.imagen} alt="" loading="lazy" />}
            </span>

            <div className="checkout-review__info">
              <strong className="checkout-review__title">{producto.titulo}</strong>
              <span className="checkout-review__author">{producto.autor}</span>
            </div>

            <div className="checkout-review__figures">
              <span className="checkout-review__figure">
                <span className="checkout-review__label">Cantidad</span>
                <span>{producto.cantidad}</span>
              </span>
              <span className="checkout-review__figure">
                <span className="checkout-review__label">Precio unitario</span>
                <span>{formatPrice(producto.precioUnitario)}</span>
              </span>
              <span className="checkout-review__figure checkout-review__figure--total">
                <span className="checkout-review__label">Subtotal</span>
                <strong>{formatPrice(producto.subtotal)}</strong>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="checkout-review__totals">
        <dl className="cart-summary__rows">
          <div>
            <dt>
              Subtotal <small>({totalUnidades} {totalUnidades === 1 ? "unidad" : "unidades"})</small>
            </dt>
            <dd>{formatPrice(montos.subtotal)}</dd>
          </div>
          <div>
            <dt>IVA (13 %)</dt>
            <dd>{formatPrice(montos.iva)}</dd>
          </div>
          <div>
            <dt>Envío</dt>
            <dd className={montos.envio === 0 ? "is-free" : undefined}>
              {montos.envio === 0 ? "Gratis" : formatPrice(montos.envio)}
            </dd>
          </div>
        </dl>

        <div className="cart-summary__total">
          <span>Total</span>
          <strong>{formatPrice(montos.total)}</strong>
        </div>
      </div>
    </section>
  )
}