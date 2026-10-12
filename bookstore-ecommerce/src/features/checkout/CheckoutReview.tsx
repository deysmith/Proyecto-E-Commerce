import { useCart } from "../carrito-de-compras/useCart"
import { getItemSubtotal } from "../carrito-de-compras/CartCalculations"
import { formatPrice } from "../../utils/formatPrice"
import { nombreCanton, nombreDistrito, nombreProvincia } from "./CheckoutLocations"
import type { DatosComprador, DatosEntrega } from "./CheckoutTypes"

interface CheckoutReviewProps {
  comprador: DatosComprador
  entrega: DatosEntrega
  // Mensaje de error si no se pudo guardar la orden (null = no hay error)
  errorGuardado: string | null
  // Lleva al usuario al paso indicado para corregir sus datos 0 = datos del comprador, 1 = dirección de entrega
  onEditar: (paso: number) => void
  onAtras: () => void
  onConfirmar: () => void
}

/**
 * Resumen final antes de confirmar.
 * Los montos NO se calculan aquí: se leen del carrito, que es el mismo cálculo que se ve en la página del carrito, así siempre coinciden.
 */
export function CheckoutReview({ comprador, entrega, errorGuardado, onEditar, onAtras, onConfirmar }: CheckoutReviewProps) {
  const { items, totals } = useCart()
  const { totalUnidades, subtotal, iva, envio, total } = totals

  return (
    <div className="checkout-form">
      <h2 className="checkout-section__title">Resumen de tu compra</h2>
      <p className="checkout-section__intro">
        Revisa tus libros y tus datos. Si algo no está bien, puedes corregirlo antes de confirmar.
      </p>

      <section className="checkout-review__block" aria-label="Libros de tu compra">
        <div className="checkout-review__head" aria-hidden="true">
          <span>Libro</span>
          <span>Cantidad</span>
          <span>Precio unitario</span>
          <span>Subtotal</span>
        </div>

        <ul className="checkout-review__items">
          {items.map((item) => (
            <li key={item.id} className="checkout-review__item">
              <span className="cart-book checkout-review__cover" aria-hidden="true">
                <img src={item.image} alt="" loading="lazy" />
              </span>

              <div className="checkout-review__info">
                <strong className="checkout-review__title">{item.title}</strong>
                <span className="checkout-review__author">{item.author}</span>
              </div>

              <div className="checkout-review__figures">
                <span className="checkout-review__figure">
                  <span className="checkout-review__label">Cantidad</span>
                  <span>{item.quantity}</span>
                </span>
                <span className="checkout-review__figure">
                  <span className="checkout-review__label">Precio unitario</span>
                  <span>{formatPrice(item.price)}</span>
                </span>
                <span className="checkout-review__figure checkout-review__figure--total">
                  <span className="checkout-review__label">Subtotal</span>
                  <strong>{formatPrice(getItemSubtotal(item))}</strong>
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
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>IVA (13 %)</dt>
              <dd>{formatPrice(iva)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd className={envio === 0 ? "is-free" : undefined}>{envio === 0 ? "Gratis" : formatPrice(envio)}</dd>
            </div>
          </dl>

          <div className="cart-summary__total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>
      </section>

      <div className="checkout-review__cards">
        <section className="checkout-review__card" aria-labelledby="revision-comprador">
          <div className="checkout-review__card-head">
            <h3 id="revision-comprador">Datos del comprador</h3>
            <button type="button" className="checkout-review__edit" onClick={() => onEditar(0)} aria-label="Editar datos del comprador">
              Editar
            </button>
          </div>
          <dl className="checkout-review__data">
            <div><dt>Nombre</dt><dd>{comprador.nombreCompleto}</dd></div>
            <div><dt>Correo</dt><dd>{comprador.correo}</dd></div>
            <div><dt>Teléfono</dt><dd>{comprador.telefono}</dd></div>
          </dl>
        </section>

        <section className="checkout-review__card" aria-labelledby="revision-entrega">
          <div className="checkout-review__card-head">
            <h3 id="revision-entrega">Dirección de entrega</h3>
            <button type="button" className="checkout-review__edit" onClick={() => onEditar(1)} aria-label="Editar dirección de entrega">
              Editar
            </button>
          </div>
          <dl className="checkout-review__data">
            <div>
              <dt>Ubicación</dt>
              <dd>
                {nombreDistrito(entrega.distrito)}, {nombreCanton(entrega.canton)}, {nombreProvincia(entrega.provincia)}
              </dd>
            </div>
            <div><dt>Dirección</dt><dd>{entrega.direccion}</dd></div>
            {entrega.infoAdicional.trim() !== "" && (
              <div><dt>Información adicional</dt><dd>{entrega.infoAdicional}</dd></div>
            )}
          </dl>
        </section>
      </div>

      {errorGuardado && (
        <div className="checkout-banner checkout-banner--error" role="alert">{errorGuardado}</div>
      )}

      <div className="checkout-actions">
        <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onAtras}>Atrás</button>
        <button type="button" className="checkout-btn" onClick={onConfirmar}>Confirmar compra</button>
      </div>
    </div>
  )
}