
import Popup from 'reactjs-popup';
import { useCart } from './useCart';
import { useNavigate } from 'react-router-dom';
import { CartItemRow } from './CartItemRow';
import { CartEmpty } from './CartEmpty';
import { getItemSubtotal } from "./CartCalculations";
import { formatPrice } from '../../utils/formatPrice'; 
import { useState } from 'react';

/**
 * Componenete encargado de mostrar la vista previa del carrito de compras
 */
export function CartPopUp() {
  const { items, totals } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const itemCount = totals.totalUnidades;

  const total = items.reduce(
    (acumulado, item) => acumulado + getItemSubtotal(item),
    0
  );

  function irAlCarrito() {
    setOpen(false);
    navigate("/cart");
  }

  function seguirExplorando() {
    setOpen(false);
    navigate("/");
  }

  return (
    <Popup
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      trigger={<div className="bag-button"><span className="bag-button__text">Carrito</span><span className="bag-button__count">{itemCount}</span></div>} 

      position="bottom right"
      on="click"
      arrow={false}
      closeOnDocumentClick
      closeOnEscape
      repositionOnResize
      className="cart-popup"
    >
      <section className="cart-popup__panel">
        <header className="cart-popup__header">
          <div>
            <p className="cart-popup__eyebrow">Vista Previa</p>
            <h2 className="cart-popup__title">Tu carrito</h2>
            <p className="cart-popup__count">
              {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
            </p>
          </div>

          <button
            type="button"
            className="cart-popup__close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-popup__empty">
            <CartEmpty texto={''} onClose={() => setOpen(false)}/>
          </div>
        ) : (
          <>
            <div className="cart-popup__items">
              <div className="cart-popup__items-heading">
                <span>TUS LIBROS</span>
                <span>{itemCount} en total</span>
              </div>

              <ul className="cart-popup__list">
                {items.map((item) => (
                  <li key={item.id} className="cart-popup__item">
                    <CartItemRow item={item} />
                  </li>
                ))}
              </ul>
              <ul className="cart-popup__list">

              </ul>
            </div>

            <footer className="cart-popup__footer">
              <div className="cart-popup__total">
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <p className="cart-popup__note">
                Los gastos de envío y otros cargos, si corresponden, se
                calcularán al continuar con tu compra.
              </p>

              <button
                type="button"
                className="cart-popup__view-cart"
                onClick={irAlCarrito}
              >
                <span>Ver mi carrito</span>
              </button>

              <button
                type="button"
                className="cart-popup__continue"
                onClick={seguirExplorando}
              >
                Seguir explorando
              </button>
            </footer>
          </>
        )}
      </section>
    </Popup>
  );
}