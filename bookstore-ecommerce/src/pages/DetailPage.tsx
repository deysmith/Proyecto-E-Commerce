import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { fetchProductById } from "../services/algoliaService"
import { formatPrice } from "../utils/formatPrice"
import type { ProductRecord } from "../types/productRecord"

/**
 * Página que se encarga de mostrar el detalle de un producto seleccionado
 */
export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<ProductRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(false)

    fetchProductById(id)
      .then((result) => setProduct(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

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
              </div>

              <div className="detail-info">

                <p className="detail-category">
                  {product.facets.category}
                </p>

                <h1>
                  {product.productInfo.title}
                </h1>

                <p className="detail-author">
                  Por {product.productInfo.author}
                </p>

                <div className="detail-price-section">
                  <strong className="detail-price">
                    {formatPrice(product.pricing.price_crc)}
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
                        <strong>Editorial:</strong>{" "}
                        {product.productInfo.publisher}
                      </span>
                    )}

                    <span>
                      <strong>Idioma:</strong>{" "}
                      {product.facets.language}
                    </span>

                    <span>
                      <strong>Categoría:</strong>{" "}
                      {product.facets.category}
                    </span>

                    {product.productInfo.pageCount && (
                      <span>
                        <strong>Páginas:</strong>{" "}
                        {product.productInfo.pageCount}
                      </span>
                    )}

                    {product.productInfo.publishedDate && (
                      <span>
                        <strong>Fecha de publicación:</strong>{" "}
                        {product.productInfo.publishedDate}
                      </span>
                    )}

                    {product.productInfo.isbn_13 && (
                      <span>
                        <strong>ISBN-13:</strong>{" "}
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
                    product.inventory.in_stock
                      ? "stock-available"
                      : "stock-unavailable"
                  }>
                    {product.inventory.in_stock
                      ? "Disponible"
                      : "Agotado"}
                  </p>

                  {product.inventory.in_stock && (
                    <div className="detail-stock">

                      <span>
                        <strong>San José: </strong>{" "}
                        {product.inventory.stock_by_branch["san-jose"]}
                      </span>

                      <span>
                        <strong>Cartago: </strong>{" "}
                        {product.inventory.stock_by_branch.cartago}
                      </span>

                      <span>
                        <strong>Limón: </strong>{" "}
                        {product.inventory.stock_by_branch.limon}
                      </span>

                    </div>
                  )}
                </div>

                <div className="detail-section detail-b2b">
                  <h2>Información para empresas</h2>

                  <div className="detail-meta">

                    <span>
                      <strong>Precio mayorista:</strong>{" "}
                      {formatPrice(
                        product.b2b.wholesale_price_crc
                      )}
                    </span>

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

              </div>
            </div>
          </article>
        )}
      </main>
      
      <Footer />

    </div>
  )
}