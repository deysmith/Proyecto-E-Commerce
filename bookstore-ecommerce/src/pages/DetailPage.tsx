import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { fetchProductById } from "../services/algoliaService"
import { formatPrice } from "../utils/formatPrice"
import { useTranslation } from "react-i18next"
import type { ProductRecord } from "../types/productRecord"
import { translateLanguage } from "../utils/language"
import { useCart } from "../features/carrito-de-compras/useCart"
import { handleAddToCart } from "../utils/handleAddToCart"
import { useAnalytics } from "../features/analytics/analyticsContext"
import { addRecentProduct } from "../utils/recentProducts"
import { useSession } from "../features/session/sessionContext"
import { getPrecioLibro } from "../utils/segmentarUsuarios"
import { tieneStock } from "../utils/validarStock"
import { SUCURSALES } from "../features/sucursales/Sucursales"
import { MinusIcon, PlusIcon } from "../features/carrito-de-compras/CartIcons"


/**
 * Página que se encarga de mostrar el detalle de un producto seleccionado
 */
export default function DetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { requestAddItem } = useCart()
  const { user } = useSession()

  const puedeVerInfoEmpresas = user?.role === "BUSINESS" || user?.role === "ADMIN"

  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const lastTrackedProduct = useRef<string | null>(null)
  // Cantidad que se va a agregar al carrito. Es texto para poder borrarla mientras se escribe.
  const [cantidadTexto, setCantidadTexto] = useState("1")
  const { registrarEvento, ownerId } = useAnalytics()

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(false)

    fetchProductById(id)
      .then((result) => {
        if (!result) {
          setError(true)
          return
        }
        setProduct(result)
        if (lastTrackedProduct.current !== result.objectID) {
          lastTrackedProduct.current = result.objectID
          registrarEvento("product_view", {
            productId: result.objectID,
            title: result.productInfo.title,
            category: result.facets.category,
          })
          // Historial de vistos recientemente del usuario o sesión
          addRecentProduct(ownerId, result)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id, registrarEvento, ownerId])

  // Un cliente B2B empieza con su cantidad mínima; el resto con 1
  const minimoB2B = user?.role === "BUSINESS" ? product?.b2b?.min_order_quantity ?? 1 : 1
  useEffect(() => {
    if (!product) return
    const minimo = user?.role === "BUSINESS" ? product.b2b?.min_order_quantity ?? 1 : 1
    setCantidadTexto(String(Math.max(1, minimo)))
  }, [product, user?.role])

  // La cantidad no puede pasar de lo que tiene la sucursal con más existencias
  const maximo = product
    ? Math.max(1, ...SUCURSALES.map((s) => product.inventory.stock_by_branch[s.id] ?? 0))
    : 1
  const cantidad = Math.min(maximo, Math.max(1, Math.floor(Number(cantidadTexto)) || 1))

  return (
    <div className="catalog-shell">
      <Header />

      <main className="detail-page">
        {loading && (
          <p className="detail-state">
            Cargando producto...
          </p>
        )}

        {!loading && (error || !product) && (
          <div className="detail-state">
            <p>No encontramos este producto.</p>

            <button
              className="detail-back"
              onClick={() => navigate("/")}
            >
              Volver al catálogo
            </button>
          </div>
        )}

        {!loading && product && (
          <article className="detail-card">

            <button
              className="detail-back"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>

            <div className="detail-content">
              <div className="detail-cover">
                <img
                  src={product.productInfo.image_url}
                  alt={`Portada de ${product.productInfo.title}`}
                />
                {/* Cantidad a agregar (el administrador consulta el catálogo pero no compra) */}
                {user?.role !== "ADMIN" && tieneStock(product) && (
                  <div className="detail-qty">
                    <label className="detail-qty__label">Cantidad</label>
                    <div className="cart-stepper" role="group" aria-label="Cantidad a agregar">
                      <button
                        type="button"
                        onClick={() => setCantidadTexto(String(cantidad - 1))}
                        disabled={cantidad <= 1}
                        aria-label="Disminuir cantidad"
                      >
                        <MinusIcon />
                      </button>
                      <input
                        id="detail-cantidad"
                        className="cart-stepper__input"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={maximo}
                        value={cantidadTexto}
                        onChange={(event) => setCantidadTexto(event.target.value)}
                        onBlur={() => setCantidadTexto(String(cantidad))}
                      />
                      <button
                        type="button"
                        onClick={() => setCantidadTexto(String(cantidad + 1))}
                        disabled={cantidad >= maximo}
                        aria-label="Aumentar cantidad"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <div className="detail-qty__messages">
                      {cantidad >= maximo && (
                        <p className="detail-qty__note">
                          Es la mayor cantidad que tiene una sola sucursal.
                        </p>
                      )}

                      {minimoB2B > 1 && cantidad < minimoB2B && (
                        <p className="detail-qty__note detail-qty__note--warn">
                          El mínimo B2B es {minimoB2B} unidades.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {user?.role !== "ADMIN" && (tieneStock(product) ? (
                  <button
                    type="button"
                    className="product-detail__add"
                    onClick={(event) => handleAddToCart(event, product, requestAddItem, cantidad)}
                  >
                    Agregar al carrito
                  </button>
                ) : (
                    <button 
                      type="button"
                      className="product-detail__add"
                      disabled
                    >
                      Agotado
                    </button>
                  ) 
                )}

                {user?.role === "BUSINESS" && product.b2b.min_order_quantity > 1 && (
                  <p className="detail-min-note">
                    Compra mínima B2B: {product.b2b.min_order_quantity} unidades por libro.
                  </p>
                )}

              </div>

              <div className="detail-info">

                <p className="detail-category">
                  {t(`categories.${product.facets.category}`, {
                        defaultValue: product.facets.category
                  })}
                </p>

                <h1>
                  {product.productInfo.title}
                </h1>

                <p className="detail-author">
                  Por {product.productInfo.author}
                </p>

                <div className="detail-price-section">
                  <strong className="detail-price">
                    {formatPrice(getPrecioLibro(product, user?.role))}
                  </strong>

                  {product.pricing.discount > 0 && (
                    <span className="detail-discount">
                      {product.pricing.discount}% de descuento
                    </span>
                  )}
                </div>

                {product.productInfo.description && (
                  <div className="detail-section">
                    <h2>Descripción</h2>

                    <p className="detail-description">
                      {product.productInfo.description}
                    </p>
                  </div>
                )}

                <div className="detail-section">
                  <h2>Información del producto</h2>

                  <div className="detail-meta">

                    {product.productInfo.publisher && (
                      <span>
                        <strong>Editorial: </strong>
                        {product.productInfo.publisher}
                      </span>
                    )}

                    <span>
                      <strong>Idioma: </strong>
                      {translateLanguage(product.facets.language)}
                    </span>

                    <span>
                      <strong>Categoría: </strong>
                      {t(`categories.${product.facets.category}`, {
                        defaultValue: product.facets.category
                      })}
                    </span>

                    {product.productInfo.pageCount && (
                      <span>
                        <strong>Páginas: </strong>
                        {product.productInfo.pageCount}
                      </span>
                    )}

                    {product.productInfo.publishedDate && (
                      <span>
                        <strong>Fecha de publicación: </strong>
                        {product.productInfo.publishedDate}
                      </span>
                    )}

                    {product.productInfo.isbn_13 && (
                      <span>
                        <strong>ISBN-13: </strong>
                        {product.productInfo.isbn_13}
                      </span>
                    )}

                  </div>
                </div>

                <div className="detail-section">
                  <h2>Calificación</h2>

                  <div className="detail-rating">
                    <strong>
                      ★ {product.rating.average}
                    </strong>

                    <span>
                      ({product.rating.count} reseñas)
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h2>Disponibilidad</h2>

                  <p className={
                    tieneStock(product)
                      ? "stock-available"
                      : "stock-unavailable"
                  }>
                    {tieneStock(product)
                      ? "Disponible"
                      : "Agotado"}
                  </p>

                  {/* Existencias de cada sucursal; la sucursal se elige al agregar el libro al carrito */}
                  {product.inventory.in_stock && (
                    <div className="detail-stock">
                      {SUCURSALES.map((s) => {
                        const unidades = product.inventory.stock_by_branch[s.id] ?? 0
                        return (
                          <span key={s.id} className={unidades === 0 ? "is-out" : undefined}>
                            <strong>{s.nombre}: </strong>{" "}
                            {unidades === 0 ? "Agotado" : unidades}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {tieneStock(product) && user?.role !== "ADMIN" && (
                    <p className="detail-stock__hint">Elige la sucursal al agregar el libro al carrito.</p>
                  )}
                </div>

                {puedeVerInfoEmpresas && (
                  <div className="detail-section detail-b2b">
                    <h2>Información para empresas</h2>

                    <div className="detail-meta">

                    {user?.role === "ADMIN" && (
                      <span>
                        <strong>Precio mayorista:</strong>{" "}
                        {formatPrice(
                          product.b2b.wholesale_price_crc
                        )}
                      </span>
                    )}

                      <span>
                        <strong>Cantidad mínima:</strong>{" "}
                        {product.b2b.min_order_quantity}
                      </span>

                      <span>
                        <strong>Descuento por volumen:</strong>{" "}
                        {product.b2b.volume_discount_pct}%
                      </span>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </article>
        )}
      </main>
      
      <Footer />

    </div>
  )
}
