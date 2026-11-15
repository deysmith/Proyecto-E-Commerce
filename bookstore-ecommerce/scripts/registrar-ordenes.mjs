
import "dotenv/config"
import fs from "node:fs"
import { algoliasearch } from "algoliasearch"

const { ALGOLIA_APP_ID,
  ALGOLIA_ADMIN_KEY,
  INDEX_NAME_ORDERS,
} = process.env

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY || !INDEX_NAME_ORDERS) {
  throw new Error("Faltan variables de entorno de Algolia.")
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

async function registrarOrdenes() {
  const ruta = "data/ordenes-nuevas.json"

  if (!fs.existsSync(ruta)) {
    throw new Error("No se encontró el archivo de órdenes.")
  }

  const ordenes = JSON.parse(fs.readFileSync(ruta, "utf-8"))

  if (!Array.isArray(ordenes)) {
    throw new Error("El archivo debe contener un arreglo de órdenes.")
  }

  if (ordenes.length === 0) {
    console.log("No hay órdenes nuevas para registrar.")
    return
  }

  const objetos = ordenes.map((orden) => ({
    ...orden,
    objectID: orden.numero,
  }))

  await client.saveObjects({
    indexName: INDEX_NAME_ORDERS,
    objects: objetos,
  })

}

registrarOrdenes().catch((error) => {
  console.error("Error al registrar órdenes:", error)
  process.exit(1)
})
