import "dotenv/config";
import fs from "fs";
import { algoliasearch } from "algoliasearch";

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const INDEX_NAME_PRODUCTS = process.env.INDEX_NAME_PRODUCTS;
const INDEX_NAME_USERS = process.env.INDEX_NAME_USERS;
const INDEX_NAME_ORDERS = process.env.INDEX_NAME_ORDERS;
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

/**
 * Se encarga de cargar los productos desde un archivo JSON local y mejorar la
 * resolución de las imagenes
 * @returns {Array} Lista de productos
 */
function cargarProductos() {
  const data = fs.readFileSync("data/products.json", "utf-8");
  const productos = JSON.parse(data);

  return productos.map((producto) => ({
    ...producto,
    productInfo: {
      ...producto.productInfo,
      image_url: producto.productInfo.image_url?.replace(
        "zoom=1",
        "zoom=2"
      )
    }
  }));
}

/**
 * Se encarga de realizar la indexación de los productos en algolia
 * @param {Array} productos - Lista de productos a indexar
 * @returns {Promise<void>}
 */
async function indexarEnAlgolia(productos) {

  await client.setSettings({
    indexName: INDEX_NAME_PRODUCTS,
    indexSettings: {
      searchableAttributes: [
        "productInfo.title",
        "productInfo.author",
        "productInfo.publisher"
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
    indexName: INDEX_NAME_PRODUCTS,
    objects: productos
  });
  console.log(`Indexado en Algolia: ${INDEX_NAME_PRODUCTS} con ${productos.length} productos`);
}

/**
 * Creación de los indices de los usuarios, los roles de estos son: ADMIN, CUSTOMER y BUSINESS
 */
async function crearIndiceUsuarios() {
  const data = fs.readFileSync("data/users.json", "utf-8");
  const usuarios = JSON.parse(data);

  await client.setSettings({
    indexName : INDEX_NAME_USERS,
    indexSettings: {
      searchableAttributes: [
        "correo",
        "nombre"
      ]
    }
  });

  await client.saveObjects({
    indexName: INDEX_NAME_USERS,
    objects: usuarios
  });
  console.log(`Indexado en Algolia: ${INDEX_NAME_USERS} con ${usuarios.length} usuarios`)
}

async function crearIndiceOrdenes() {
  await client.setSettings({
    indexName: INDEX_NAME_ORDERS,
    indexSettings: {
      searchableAttributes: [
        "numero",
        "comprador.nombreCompleto",
        "comprador.correo"
      ],
      attributesForFaceting: [
        //clienteId (correo o id de invitado) permite traer solo las órdenes de una persona.
        //filterOnly: sirve para filtrar pero no se muestra como faceta
        "filterOnly(clienteId)",
        "tipoCliente",
        "estadoOrden",
        "estadoPago",
        "fecha",
        "moneda"
      ]
    }
  });
}

async function main() {
  await crearIndiceOrdenes();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
