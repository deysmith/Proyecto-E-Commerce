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