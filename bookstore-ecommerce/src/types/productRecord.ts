export interface ProductRecord {
  objectID: string

  productInfo: {
    title: string
    author: string
    description: string
    category: string
    publisher: string
    language: string
    pageCount: number
    publishedDate: string
    isbn_13?: string
    image_url: string
  };

  pricing: {
    price_crc: number
    currency: string
    discount: number
  };

  b2b: {
    wholesale_price_crc: number
    min_order_quantity: number
    volume_discount_pct: number
  }

  inventory: {
      in_stock: boolean
      stock_by_branch: {
        "san-jose": number
        "cartago": number
        "limon": number
      }
    }
    rating: {
      average: number
      count: number
    }

  facets: {
    category: string
    publisher: string
    language: string
  }
}