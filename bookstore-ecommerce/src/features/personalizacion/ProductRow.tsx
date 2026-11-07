import type { ProductRecord } from "../../types/productRecord"
import { ProductCard } from "../catalog/ProductCard"

interface ProductRowProps {
  eyebrow: string
  title: string
  products: ProductRecord[]
}

/**
 * Fila horizontal de libros para las secciones personalizadas del home.
 * Reutiliza la misma tarjeta del catálogo para mantener el diseño.
 */
export function ProductRow({ eyebrow, title, products }: ProductRowProps) {
  return (
    <section className="personal-section" aria-label={title}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="personal-section__title">{title}</h2>
      <ul className="personal-section__list">
        {products.map((product) => (
          <li key={product.objectID}>
            <ProductCard hit={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}