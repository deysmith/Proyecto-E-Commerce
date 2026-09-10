import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { fetchProductById } from "../services/algoliaService"
import { formatPrice } from "../utils/formatPrice"
import type { ProductRecord } from "../types/productRecord"

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
          <p className="detail-state">Cargando producto...</p>
        )}

        {!loading && (error || !product) && (
          <div className="detail-state">
            <p>No encontramos este producto.</p>
            <button className="detail-back" onClick={() => navigate("/")}>
              Volver al catálogo
            </button>
          </div>
        )}

        {!loading && product && (
          <article className="detail-card">
            <button className="detail-back" onClick={() => navigate(-1)}>
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

                <h1>{product.productInfo.title}</h1>

                <p className="detail-author">
                  Por {product.productInfo.author}
                </p>

                <strong className="detail-price">
                  {formatPrice(product.pricing.price_crc)}
                </strong>

                {product.productInfo.description && (
                  <p className="detail-description">
                    {product.productInfo.description}
                  </p>
                )}

                <div className="detail-meta">
                  {product.productInfo.publisher && (
                    <span>
                      <strong>Editorial:</strong> {product.productInfo.publisher}
                    </span>
                  )}

                  <span>
                    <strong>Idioma:</strong> {product.facets.language}
                  </span>
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