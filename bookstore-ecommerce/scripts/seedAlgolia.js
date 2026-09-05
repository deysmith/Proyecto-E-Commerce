import "dotenv/config";
import fs from "fs";
import { algoliasearch } from "algoliasearch";

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME = process.env.INDEX_NAME;

/**
 * Se encarga de cargar los productos desde un archivo JSON local
 * @returns {Array} Lista de productos
 */
function cargarProductos() {
  const data = fs.readFileSync("data/products.json", "utf-8");
  return JSON.parse(data);
}

/**
 * Se encarga de realizar la indexación de los productos en algolia
 * @param {Array} productos - Lista de productos a indexar
 * @returns {Promise<void>}
 */
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
        "searchable(facets.category)",
        "searchable(facets.publisher)",
        "facets.language",
        "facets.rating",
        "pricing.price_crc"
      ]
    }
  });

  await client.saveObjects({
    indexName: INDEX_NAME,
    objects: productos
  });
  console.log(`Indexado en Algolia: ${INDEX_NAME} con ${productos.length} productos`);
}

async function main() {
  const productos = cargarProductos();
  await indexarEnAlgolia(productos);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
