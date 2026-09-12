import { liteClient as algoliasearch } from "algoliasearch/lite";
import type { ProductRecord } from "../types/productRecord";

export const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

export async function fetchProductById(objectID: string): Promise<ProductRecord | null> {
  const response = await searchClient.search([
    {
      indexName: import.meta.env.VITE_INDEX_NAME,
      params: {
        filters: `objectID:${objectID}`,
        hitsPerPage: 1,
      },
    },
  ])

  const result = response.results[0]

  if (!result || !("hits" in result) || result.hits.length === 0) {
    return null
  }

  return result.hits[0] as ProductRecord
}

// Trae sugerencias de búsqueda en vivo para el autocompletado del buscador, según lo que el usuario va escribiendo.
export async function fetchSearchSuggestions(query: string, hitsPerPage = 5): Promise<ProductRecord[]> {
  if (!query.trim()) return []

  const response = await searchClient.search([
    {
      indexName: import.meta.env.VITE_INDEX_NAME,
      params: { query, hitsPerPage },
    },
  ])

  const result = response.results[0]

  if (!result || !("hits" in result)) {
    return []
  }

  return result.hits as ProductRecord[]
}

// Trae un lote de productos y los mezcla en el cliente, ya que Algolia
export async function fetchRandomProducts(count = 10): Promise<ProductRecord[]> {
  const samplePoolSize = Math.max(count * 3, 30)

  const response = await searchClient.search([
    {
      indexName: import.meta.env.VITE_INDEX_NAME,
      params: { query: "", hitsPerPage: samplePoolSize },
    },
  ])

  const result = response.results[0]

  if (!result || !("hits" in result)) {
    return []
  }

  const shuffled = [...(result.hits as ProductRecord[])].sort(() => Math.random() - 0.5)

  return shuffled.slice(0, count)
}