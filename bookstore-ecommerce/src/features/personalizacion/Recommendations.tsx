import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ProductRecord } from "../../types/productRecord"
import { fetchProductsByCategory } from "../../services/algoliaService"
import { useAnalytics } from "../analytics/analyticsContext"
import { getCategoriaFavorita, getIdsVistos } from "./categoriaFavorita"
import { ProductRow } from "./ProductRow"

const MAX_RECOMENDADOS = 8

/**
 * "Recomendados para ti": libros de la categoría que más ha consultado el usuario,
 * sin repetir los que ya vio. Si no hay suficiente actividad, no se muestra.
 */
export function Recommendations() {
  const { t } = useTranslation()
  const { events } = useAnalytics()
  const categoria = useMemo(() => getCategoriaFavorita(events), [events])
  const idsVistos = useMemo(() => getIdsVistos(events), [events])

  // Se guarda la categoría junto con los libros para saber de cuál consulta vienen
  const [resultado, setResultado] = useState<{ categoria: string; libros: ProductRecord[] } | null>(null)

  useEffect(() => {
    if (!categoria) return
    let cancelado = false

    fetchProductsByCategory(categoria)
      .then((libros) => {
        if (!cancelado) setResultado({ categoria, libros })
      })
      // Si Algolia falla, la sección simplemente no aparece
      .catch(() => {
        if (!cancelado) setResultado(null)
      })

    return () => {
      cancelado = true
    }
  }, [categoria])

  if (!categoria || !resultado || resultado.categoria !== categoria) return null

  const recomendados = resultado.libros
    .filter((libro) => !idsVistos.has(libro.objectID))
    .slice(0, MAX_RECOMENDADOS)

  if (recomendados.length === 0) return null

  return (
    <ProductRow
      eyebrow={`Porque te interesa ${t(`categories.${categoria}`, { defaultValue: categoria })}`}
      title="Recomendados para ti"
      products={recomendados}
    />
  )
}