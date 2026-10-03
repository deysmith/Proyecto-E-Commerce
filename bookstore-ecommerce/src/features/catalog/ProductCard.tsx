import { Link } from "react-router-dom"
import type { Hit } from "instantsearch.js"
import type { ProductRecord } from "../../types/productRecord"
import { formatPrice } from "../../utils/formatPrice"
import { useTranslation } from "react-i18next"
import { handleAddToCart } from "../../utils/handleAddToCart"
import { useCart } from "../carrito-de-compras/useCart"

/**
 * Las propiedades necesarias para el componente ProductCard
 */
interface ProductCardProps {
  hit: Hit<ProductRecord>
}

/**
 * Componente encargado de mostrar la información de un producto dentro de un
 * catálogo y permitir la navegación hacia su página de detalle.
 * @param hit - Información del producto obtenida mediante Algolia 
 * @returns Una tarjeta visual con la información principal (título, autor, 
 *          precio e imagen) del producto.
 */
export function ProductCard({ hit }: ProductCardProps) {
  const { t } = useTranslation()
  const { addItem } = useCart()
  
  return (
    <Link to={`/producto/${hit.objectID}`} className="product-card">
      {/* <div className="product-card__flip"> */}

        <div className="product-card__face product-card__face--front">
          <div className="product-card__cover">
            <img
              className="product-image"
              src={hit.productInfo.image_url}
              alt={`Portada de ${hit.productInfo.title}`}
              loading="lazy"
            />
          </div>

          <div className="product-card__body">
            <p className="product-card__category">
              {t(`categories.${hit.facets.category}`, {
                defaultValue: hit.facets.category
              })}
            </p>

            <h3>{hit.productInfo.title}</h3>

            <p className="product-card__author">
              {hit.productInfo.author}
            </p>

            <strong>
              {formatPrice(hit.pricing.price_crc)}
            </strong>
          </div>

          <button
            type="button"
            className="product-card__add"
            onClick={(event) => handleAddToCart(event, hit, addItem)}
          >
            Agregar al carrito
          </button>
        </div>

        {/* <div className="product-card__face product-card__face--back">
          <p className="product-card__category">
            {t(`categories.${hit.facets.category}`, {
                defaultValue: hit.facets.category
            })}
          </p>

          <h3>{hit.productInfo.title}</h3>

          {hit.productInfo.description ? (
            <p className="product-card__description">
              {hit.productInfo.description}
            </p>
          ) : (
            <p className="product-card__description">
              Sin descripción disponible.
            </p>
          )}

          <div className="product-card__extra">
            {hit.productInfo.publisher && (
              <span>{hit.productInfo.publisher}</span>
            )}
            <span>Idioma: {translateLanguage(hit.facets.language)}</span>
          </div>

          <strong className="product-card__back-price">
            {formatPrice(hit.pricing.price_crc)}
          </strong>
        </div> */}

      {/* </div> */}
    </Link>
  )
}