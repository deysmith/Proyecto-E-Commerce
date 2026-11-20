import { listaPreciosDe, nombreTipoCliente, type TipoCliente } from "./OrderCustomer"

interface OrderCondicionesProps {
  tipoCliente?: TipoCliente
  // Lista de precios guardada en la orden. Si no viene (resumen antes de crear la orden) se calcula con el tipo de cliente
  listaPrecios?: "B2C" | "B2B"
}

/**
 * Condiciones comerciales con las que se hace la compra: tipo de cliente, lista de precios y condición de compra.
 * Se muestra en el resumen del checkout, en la confirmación y en Mis órdenes.
 */
export function OrderCondiciones({ tipoCliente, listaPrecios }: OrderCondicionesProps) {
  if (!tipoCliente && !listaPrecios) return null

  const lista = listaPrecios ?? listaPreciosDe(tipoCliente)
  const esB2B = lista === "B2B"

  return (
    <section className="checkout-condiciones" aria-label="Condiciones comerciales">
      <div>
        <span className="checkout-condiciones__label">Tipo de cliente</span>
        <strong>{nombreTipoCliente(tipoCliente)}</strong>
      </div>
      <div>
        <span className="checkout-condiciones__label">Lista de precios</span>
        <strong>{esB2B ? "Precios mayoristas (B2B)" : "Precios regulares (B2C)"}</strong>
      </div>
      <div>
        <span className="checkout-condiciones__label">Condición de compra</span>
        <strong>{esB2B ? "Compra mínima por libro según el catálogo" : "Sin compra mínima"}</strong>
      </div>
    </section>
  )
}