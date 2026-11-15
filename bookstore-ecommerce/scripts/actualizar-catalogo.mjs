import "dotenv/config"
import { algoliasearch } from "algoliasearch"
import fs from "node:fs"
import path from "node:path"

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY
const INDEX_NAME_PRODUCTS = process.env.INDEX_NAME_PRODUCTS

const DATA_FILE = path.resolve("data/products.json")
const PORCENTAJE_B2B = 0.85;

const RANGOS_INVENTARIO = {
  "san-jose": { min: 30, max: 40 },
  "cartago": { min: 35, max: 65 },
  "limon": { min: 40, max: 75 }
}

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
  throw new Error("Faltan las credenciales de Algolia.")
}

if (!fs.existsSync(DATA_FILE)) {
  throw new Error(`No existe el archivo: ${DATA_FILE}`)
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function redondearMultiplo10(precio) {
  return Math.round(precio / 10) * 10;
}

function generarInventario() {
  return Object.fromEntries(
    Object.entries(RANGOS_INVENTARIO).map(
      ([provincia, rango]) => [
        provincia,
        numeroAleatorio(rango.min, rango.max)
      ]
    )
  )
}

async function actualizarCatalogo() {
  const contenido = fs.readFileSync(DATA_FILE, "utf-8")
  const datos = JSON.parse(contenido)

  const productos = Array.isArray(datos) ? datos : datos.products

  if (!Array.isArray(productos)) {
    throw new Error(
      "No se encontró el arreglo de productos."
    )
  }

  const productosActualizados = productos.map(
    (producto) => {

      const precioB2C = redondearMultiplo10(
        producto.pricing.price_crc
      )

      const precioB2B = redondearMultiplo10(
        precioB2C * PORCENTAJE_B2B
      )

      if ( typeof precioB2C !== "number" || !Number.isFinite(precioB2C)) {
        throw new Error(
          `Precio B2C inválido: ${producto.objectID}`
        )
      }
      
      const inventario = generarInventario()
      const totalInventario = Object.values(inventario).reduce((total, cantidad) => total + cantidad, 0)

      return {
        ...producto,

        pricing: {
          ...producto.pricing,
          price_crc: precioB2C
        },

        b2b: {
          ...producto.b2b,
          wholesale_price_crc: precioB2B,
          min_order_quantity:
            producto.b2b?.min_order_quantity ?? 10,
          volume_discount_pct:
            producto.b2b?.volume_discount_pct ?? 5
        },

        inventory: {
          ...producto.inventory,
          in_stock: totalInventario > 0,
          stock_by_branch: inventario
        }
      }
    }
  )

  const nuevoContenido = Array.isArray(datos) ? productosActualizados : {
    ...datos,
    products: productosActualizados
  }

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(nuevoContenido, null, 2),
    "utf-8"
  )

  const objetosAlgolia = productosActualizados.map(
    (producto) => {
      const objectID = producto.objectID;

      if (!objectID) {
        throw new Error(
          "Hay productos sin objectID."
        );
      }

      return producto;
    }
  );

  await client.saveObjects({
    indexName: INDEX_NAME_PRODUCTS,
    objects: objetosAlgolia
  })
}

actualizarCatalogo().catch((error) => {
  console.error("Error actualizando catálogo:", error)
  process.exitCode = 1
});
