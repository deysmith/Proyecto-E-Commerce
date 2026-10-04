import type { ReactNode } from "react"
import { useCart } from "./useCart"
import { ENVIO_GRATIS_DESDE } from "./CartCalculations"
import { formatPrice } from "../../utils/formatPrice"
import { TruckIcon } from "./CartIcons"

interface CartSummaryProps {
  // Espacio para botones extra (por ejemplo, el botón de checkout del Proyecto 2)
  children?: ReactNode
}

/**
 * Resumen de compra: progreso al envío gratis, subtotal, IVA, envío y total.
 * Lee los montos del contexto, así que se puede reutilizar en el checkout.
 */
export function CartSummary({ children }: CartSummaryProps) {
  const { totals } = useCart()
  const { totalUnidades, subtotal, iva, envio, total } = totals

  const faltaParaGratis = Math.max(0, ENVIO_GRATIS_DESDE - subtotal)
  const progreso = Math.min(100, Math.round((subtotal / ENVIO_GRATIS_DESDE) * 100))

  return (
    <aside className="cart-summary" aria-label="Resumen de compra">
      <h2 className="cart-summary__title">Resumen de compra</h2>

      <div className="cart-shipping">
        <p className="cart-shipping__text">
          <TruckIcon />
          {faltaParaGratis > 0 ? (
            <span>
              Te faltan <strong>{formatPrice(faltaParaGratis)}</strong> para el envío gratis
            </span>
          ) : (
            <span>
              Tu pedido tiene <strong>envío gratis</strong>
            </span>
          )}
        </p>

        <div
          className="cart-shipping__bar"
          role="progressbar"
          aria-label="Progreso hacia el envío gratis"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso}
        >
          <span style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <dl className="cart-summary__rows" aria-live="polite">
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
          <dd className={envio === 0 ? "is-free" : undefined}>
            {envio === 0 ? "Gratis" : formatPrice(envio)}
          </dd>
        </div>
      </dl>

      <div className="cart-summary__total" aria-live="polite">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <p className="cart-summary__note">Incluye IVA. Envío gratis desde {formatPrice(ENVIO_GRATIS_DESDE)}.</p>

      {children}
    </aside>
  )
}