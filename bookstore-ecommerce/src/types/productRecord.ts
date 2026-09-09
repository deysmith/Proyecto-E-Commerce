export interface ProductRecord {
  objectID: string

  productInfo: {
    title: string
    author: string
    description?: string
    image_url: string
    publisher?: string
  };

  pricing: {
    price_crc: number
  };

  facets: {
    category: string
    publisher: string
    language: string
  }
}