import { Link } from "react-router-dom"
import { useCart } from "./useCart"
import { getItemSubtotal } from "./CartCalculations"
import type { CartItem } from "./CartReducer"
import { formatPrice } from "../../utils/formatPrice"
import { MinusIcon, PlusIcon, TrashIcon } from "./CartIcons"
import { useState } from "react"
import { useSession } from "../session/sessionContext"
import { nombreSucursal } from "../sucursales/Sucursales"
import { getMinimoB2B, getStockItem, validarItem } from "./CartValidation"

interface CartItemRowProps {
  item: CartItem
}

/**
 * Una fila del carrito: portada, datos del libro, control de cantidad
 * y subtotal de la línea.
 */
export function CartItemRow({ item }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const { user } = useSession()
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const subtotal = getItemSubtotal(item)

  // Stock en la sucursal que se eligió al agregar el libro (null si el carrito es anterior a esta función y no se conoce)
  const nombreDeSucursal = item.sucursal ? nombreSucursal(item.sucursal) : ""
  const stock = getStockItem(item)
  const minimoB2B = getMinimoB2B(item, user?.role)
  // El agotado ya se informa en la línea de stock, así que aquí solo se muestran los demás motivos
  const problemas = validarItem(item, user?.role).filter((problema) => problema.tipo !== "agotado")
  const llegoAlStock = stock !== null && item.quantity >= stock

  function eliminarProducto() {
    removeItem(item)
    setConfirmarEliminar(false)
  }

  return (
    <li className="cart-row">
      <Link to={`/producto/${item.id}`} className="cart-book" tabIndex={-1} aria-hidden="true">
        <img src={item.image} alt="" loading="lazy" />
      </Link>

      <div className="cart-row__info">
        <h2 className="cart-row__title">
          <Link to={`/producto/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="cart-row__author">{item.author}</p>
        <p className="cart-row__unit">
          Precio unitario <span>{formatPrice(item.price)}</span>
          {user?.role === "BUSINESS" && <small> (precio mayorista B2B)</small>}
        </p>

        {minimoB2B !== null && (
          <p className="cart-row__min">Cantidad mínima B2B: {minimoB2B}</p>
        )}

        {item.sucursal && (
          <p className="cart-row__branch">Sucursal: <strong>{nombreDeSucursal}</strong></p>
        )}

        {stock !== null && (
          <p className={stock === 0 ? "cart-row__stock is-out" : "cart-row__stock"}>
            {stock === 0
              ? `Agotado en ${nombreDeSucursal}`
              : `Disponibles en ${nombreDeSucursal}: ${stock}`}
          </p>
        )}

        {problemas.map((problema) => (
          <p key={problema.tipo} className="cart-row__issue">{problema.detalle}</p>
        ))}

        {confirmarEliminar ? (
          <div className="cart-clear">
            <span>¿Desea quitar este libro?</span>
            <button
              type="button"
              className="cart-clear__yes"
              onClick={eliminarProducto}
            >
              Sí, eliminar
          </button>

          <button
            type="button"
            className="cart-clear__no"
            onClick={() => setConfirmarEliminar(false)}
          >
            Cancelar
          </button>
          </div>
        ):(
          <button
            type="button"
            className="cart-row__remove"
            onClick={() => setConfirmarEliminar(true)}
            aria-label={`Eliminar ${item.title} del carrito`}
        >
          <TrashIcon />
          Eliminar
        </button>
        )}
      </div>

      <div className="cart-row__qty">
        <span className="cart-row__mobile-label">Cantidad</span>
        <div className="cart-stepper" role="group" aria-label={`Cantidad de ${item.title}`}>
          {/* En 1 se deshabilita: para quitar el libro se usa "Eliminar" */}
          <button
            type="button"
            onClick={() => decreaseQuantity(item)}
            disabled={item.quantity === 1}
            aria-label="Disminuir cantidad"
            title={item.quantity === 1 ? "Usa Eliminar para quitar el libro" : undefined}
          >
            <MinusIcon />
          </button>

          {/* El key hace que la animación se repita cada vez que cambia la cantidad */}
          <output key={item.quantity} className="cart-stepper__value" aria-live="polite">
            {item.quantity}
          </output>

          <button
            type="button"
            onClick={() => increaseQuantity(item)}
            disabled={llegoAlStock}
            aria-label="Aumentar cantidad"
            title={llegoAlStock ? `Es todo lo que hay en ${nombreDeSucursal}` : undefined}
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <div className="cart-row__subtotal">
        <span className="cart-row__mobile-label">Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
        {item.quantity > 1 && (
          <span className="cart-row__math">
            {item.quantity} × {formatPrice(item.price)}
          </span>
        )}
      </div>
    </li>
  )
}