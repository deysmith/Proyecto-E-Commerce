import { Link } from "react-router-dom"
import { useCart } from "./useCart"
import { getItemSubtotal } from "./CartCalculations"
import type { CartItem } from "./CartReducer"
import { formatPrice } from "../../utils/formatPrice"
import { MinusIcon, PlusIcon, TrashIcon } from "./CartIcons"

interface CartItemRowProps {
  item: CartItem
}

/**
 * Una fila del carrito: portada, datos del libro, control de cantidad
 * y subtotal de la línea.
 */
export function CartItemRow({ item }: CartItemRowProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const subtotal = getItemSubtotal(item)

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
        </p>

        <button
          type="button"
          className="cart-row__remove"
          onClick={() => removeItem(item.id)}
          aria-label={`Eliminar ${item.title} del carrito`}
        >
          <TrashIcon />
          Eliminar
        </button>
      </div>

      <div className="cart-row__qty">
        <span className="cart-row__mobile-label">Cantidad</span>
        <div className="cart-stepper" role="group" aria-label={`Cantidad de ${item.title}`}>
          {/* En 1 se deshabilita: para quitar el libro se usa "Eliminar" */}
          <button
            type="button"
            onClick={() => decreaseQuantity(item.id)}
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
            onClick={() => increaseQuantity(item.id)}
            aria-label="Aumentar cantidad"
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