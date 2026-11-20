import type { DatosComprador } from "../checkout/CheckoutTypes"
import type { EntregaOrden } from "./OrderTypes"
import type { Empresa } from "../session/empresa"

interface OrderDataCardsProps {
  comprador: DatosComprador
  entrega: EntregaOrden
  empresa?: Empresa | null
  // Si se pasa, cada tarjeta muestra un botón "Editar" 0 para el comprador y 1 para la entrega. Se llama con el paso que se quiere editar.
  onEditar?: (paso: number) => void
}

/**
 * Tarjetas con los datos del comprador y de la entrega.
 * Se usan en el resumen del checkout (con botón Editar) y en la confirmación (solo lectura).
 */
export function OrderDataCards({ comprador, entrega, empresa, onEditar }: OrderDataCardsProps) {
  return (
    <div className="checkout-review__cards">
      {empresa && (
        <section className="checkout-review__card checkout-review__card--full" aria-labelledby="revision-empresa">
          <div className="checkout-review__card-head">
            <h3 id="revision-empresa">Empresa</h3>
          </div>
          <dl className="checkout-review__data">
            <div><dt>Razón social</dt><dd>{empresa.nombre}</dd></div>
            <div><dt>Cédula jurídica</dt><dd>{empresa.cedulaJuridica}</dd></div>
          </dl>
        </section>
      )}

      <section className="checkout-review__card" aria-labelledby="revision-comprador">
        <div className="checkout-review__card-head">
          <h3 id="revision-comprador">Datos del comprador</h3>
          {onEditar && (
            <button type="button" className="checkout-review__edit" onClick={() => onEditar(0)} aria-label="Editar datos del comprador">
              Editar
            </button>
          )}
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
          {onEditar && (
            <button type="button" className="checkout-review__edit" onClick={() => onEditar(1)} aria-label="Editar dirección de entrega">
              Editar
            </button>
          )}
        </div>
        <dl className="checkout-review__data">
          <div>
            <dt>Ubicación</dt>
            <dd>{entrega.distrito}, {entrega.canton}, {entrega.provincia}</dd>
          </div>
          <div><dt>Dirección</dt><dd>{entrega.direccion}</dd></div>
          {entrega.infoAdicional.trim() !== "" && (
            <div><dt>Información adicional</dt><dd>{entrega.infoAdicional}</dd></div>
          )}
        </dl>
      </section>
    </div>
  )
}