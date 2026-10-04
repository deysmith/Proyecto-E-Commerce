import { Link } from "react-router-dom"
import { Header } from "../components/Header"
import { useCart } from "../features/carrito-de-compras/useCart"
import { formatPrice } from "../utils/formatPrice"
import { Footer } from "../components/Footer"

export default function CartPage() {
  const { items, increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const total = items.reduce(
    (amount, item) => amount + item.product.pricing.price_crc * item.quantity,
    0
  )

  return (
    <>
      <div className="catalog-shell">
        <Header />
        <main className="cart-page">
          <div className="cart-page__heading">
            <p className="eyebrow">Booksmart / Tu compra</p>
            <h1>Tu carrito</h1>
          </div>

          {items.length === 0 ? (
            <section className="cart-empty" aria-live="polite">
              <p>Tu carrito está vacío.</p>
              <Link to="/">Volver al catálogo</Link>
            </section>
          ) : (
            <>
              <section className="cart-list" aria-label="Productos en el carrito">
                {items.map(({ product, quantity }) => {
                  const unitPrice = product.pricing.price_crc
                  const subtotal = unitPrice * quantity

                  return (
                    <article className="cart-item" key={product.objectID}>
                      <img
                        className="cart-item__image"
                        src={product.productInfo.image_url}
                        alt={`Portada de ${product.productInfo.title}`}
                      />

                      <div className="cart-item__details">
                        <h2>{product.productInfo.title}</h2>
                        <p>{product.productInfo.author}</p>
                      </div>

                      <div className="cart-item__unit-price">
                        <span className="cart-item__label">Precio unitario</span>
                        <strong>{formatPrice(unitPrice)}</strong>
                      </div>

                      <div className="cart-item__quantity">
                        <span className="cart-item__label">Cantidad</span>
                        <div className="quantity-control">
                          <button
                            type="button"
                            aria-label={`Disminuir cantidad de ${product.productInfo.title}`}
                            onClick={() => decreaseQuantity(product.objectID)}
                            disabled={quantity === 1}
                          >
                            -
                          </button>
                          <output aria-live="polite">{quantity}</output>
                          <button
                            type="button"
                            aria-label={`Aumentar cantidad de ${product.productInfo.title}`}
                            onClick={() => increaseQuantity(product.objectID)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item__subtotal">
                        <span className="cart-item__label">Subtotal</span>
                        <strong>{formatPrice(subtotal)}</strong>
                      </div>

                      <button
                        type="button"
                        className="cart-item__remove"
                        onClick={() => removeItem(product.objectID)}
                      >
                        Eliminar
                      </button>
                    </article>
                  )
                })}
              </section>

              <section className="cart-summary" aria-label="Resumen del carrito" aria-live="polite">
                
                <div className="cart-summary">
                  <p>Subtotal:{formatPrice(total)}</p>
                </div>

                <div className="cart-summary">
                  <p>IVA: {formatPrice(total * 0.13)}</p>
                </div>

                <div className="cart-summary">
                  {total > 50000 ? (
                    <p>Envío gratis</p>
                  ) : ( 
                    <p>Costo de envío {formatPrice(2500)}</p>
                  )}
                </div>

                <div className="cart-summary">
                  <p>Total <strong>{formatPrice(total + (total * 0.13) + 2500)}</strong></p>
                </div>

                <Link to="/">Seguir explorando</Link>
              </section>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  )
}