import { Link } from "react-router-dom"
import type { Hit } from "instantsearch.js"
import type { ProductRecord } from "../../types/productRecord"
import { formatPrice } from "../../utils/formatPrice"

interface ProductCardProps {
  hit: Hit<ProductRecord>
}

export function ProductCard({ hit }: ProductCardProps) {
  return (
    <Link to={`/producto/${hit.objectID}`} className="product-card">
      <div className="product-card__cover">
        <img
          src={hit.productInfo.image_url}
          alt={`Portada de ${hit.productInfo.title}`}
          loading="lazy"
        />
      </div>

      <div className="product-card__body">
        <p className="product-card__category">
          {hit.facets.category}
        </p>

        <h3>{hit.productInfo.title}</h3>

        <p className="product-card__author">
          {hit.productInfo.author}
        </p>

        <strong>
          {formatPrice(hit.pricing.price_crc)}
        </strong>
      </div>
    </Link>
  )
}