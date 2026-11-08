import { useAnalytics } from "../analytics/analyticsContext"
import { getRecentProducts } from "../../utils/recentProducts"
import { ProductRow } from "./ProductRow"

/**
 * Muestra los libros que el usuario (o la sesión de invitado) vio recientemente.
 * Si todavía no hay historial, la sección no se muestra.
 */
export function RecentlyViewed() {
  const { ownerId } = useAnalytics()
  const products = getRecentProducts(ownerId)

  if (products.length === 0) return null

  return (
    <ProductRow
      eyebrow="Tu historial"
      title="Vistos recientemente"
      products={products}
    />
  )
}