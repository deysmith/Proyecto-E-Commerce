import "dotenv/config";
import fs from "fs";
import { algoliasearch } from "algoliasearch";

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = "grupo-08_products";
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

const CATEGORIAS = [
  "ficcion", "fantasia", "ciencia ficcion", "historia", "romance",
  "misterio", "biografia", "poesia", "negocios", "tecnologia",
  "autoayuda", "infantil", "terror", "cocina", "arte"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBooksData(searchCriteria, startIndex = 0, maxResults = 40) {
  const url = `${BASE_URL}?q=${encodeURIComponent(searchCriteria)}&startIndex=${startIndex}&maxResults=${maxResults}&langRestrict=es&printType=books&key=${GOOGLE_BOOKS_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al obtener datos de Google Books (${searchCriteria}): ${response.status}`);
  }

  return response.json();
}

// Convierte un item crudo de Google Books al esquema de negocio
function transformarProducto(book) {
  const info = book.volumeInfo || {};
  const precioCRC = Math.floor(Math.random() * (25000 - 4000) + 4000); // Se maneja un rango entre 4000 y 25000 CRC para el precio de venta al público

  return {
    objectID: book.id,

    // B2C (Business to Consumer)
    productInfo: {
      title: info.title || "Título desconocido",
      author: info.authors ? info.authors.join(", ") : "Autor desconocido",
      description: info.description || "Sin descripción disponible",
      category: info.categories ? info.categories[0] : "General",
      publisher: info.publisher || "Editorial desconocida",
      language: info.language || "es",
      pageCount: info.pageCount || 0,
      image_url: info.imageLinks ? info.imageLinks.thumbnail : ""
    },

    // Precio de venta al público
    pricing: {
      price_crc: precioCRC,
      currency: "CRC",
      discount: 0
    },

    // B2B (Business to Business)
    b2b: {
      wholesale_price_crc: Math.round(precioCRC * 0.7),
      min_order_quantity: 10,
      volume_discount_pct: 5
    },

    // Multi-sede
    inventory: {
      in_stock: true,
      stock_by_branch: {
        "san-jose": Math.floor(Math.random() * 30) + 1,
        "cartago": Math.floor(Math.random() * 20) + 1,
        "limon": Math.floor(Math.random() * 15) + 1
      }
    },

    rating: {
      average: info.averageRating || 0,
      count: info.ratingsCount || 0
    }
  };
}

// Se arma el catálogo de productos a partir de la API de Google Books
async function construirCatalogo() {
  const productosMap = new Map(); // usamos Map para evitar libros duplicados por objectID

  for (const categoria of CATEGORIAS) {
    for (const startIndex of [0, 40]) {
      try {
        const data = await fetchBooksData(categoria, startIndex, 40);
        if (!data.items) continue;

        for (const book of data.items) {
          if (!productosMap.has(book.id)) {
            productosMap.set(book.id, transformarProducto(book));
          }
        }

        console.log(`"${categoria}" (startIndex ${startIndex}): ${data.items.length} libros obtenidos`);
        await sleep(300); // pequeña pausa para no saturar la API
      } catch (error) {
        console.error(error.message);
      }
    }
  }

  const productos = Array.from(productosMap.values()).slice(0, 500);
  console.log(`Total de productos únicos: ${productos.length}`);
  return productos;
}

// Guardar ek catálogo de productos en un archivo JSON local
function guardarProductsJson(productos) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/products.json", JSON.stringify(productos, null, 2), "utf-8");
  console.log("Guardado en data/products.json");
}

// Hacer el indexado de los productos en Algolia
async function indexarEnAlgolia(productos) {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        "productInfo.title",
        "productInfo.author",
        "productInfo.publisher",
        "productInfo.description"
      ],
      attributesForFaceting: [
        "searchable(productInfo.category)",
        "searchable(productInfo.publisher)",
        "pricing.price_crc"
      ]
    }
  });

  await client.saveObjects({
    indexName: INDEX_NAME,
    objects: productos
  });

  console.log(`Indexado en Algolia: ${INDEX_NAME}`);
}

// Funcion principal
async function main() {
  const productos = await construirCatalogo();
  guardarProductsJson(productos);
  await indexarEnAlgolia(productos);
}

main().catch((err) => {
  console.error("Error corriendo el seed:", err);
  process.exit(1);
});