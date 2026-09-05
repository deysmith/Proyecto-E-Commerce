import fs from "fs";
import { google } from "googleapis";
import readline from "readline";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/books"];
const TOKEN_PATH = path.join("scripts", "token.json");
const CREDENTIALS_PATH = path.join("scripts", "credentials.json");

/**
 * Función encargada de manejar la autenticación con la API de Google Books
 * @returns Promesa que contiene al cliente autenticado de google
 */
async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Autoriza esta aplicación visitando:", authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question("Introduce el código que te dio Google: ", async (code) => {
        rl.close();
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log("Token guardado en", TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  }
}

/**
 * Se encarga de transformar un libro de Google Books en un objeto de tipo JSON
 * @param {object} book - Objeto que viene de la API que representa al libro
 * @param {object} Objeto transformado con los atributos específicos del producto
 */
function transformarProducto(book) {
  const info = book.volumeInfo || {};

  let precioCRC = Math.floor(Math.random() * (25000 - 4000) + 4000);
  precioCRC = Math.round(precioCRC / 5) * 5;
  precioCRC = parseFloat(precioCRC.toFixed(2));

  return {
    objectID: book.id,
    productInfo: {
      title: info.title || "Título desconocido",
      author: info.authors ? info.authors.join(", ") : "Autor desconocido",
      description: info.description || "Sin descripción disponible",
      category: info.categories ? info.categories[0] : "General",
      publisher: info.publisher || "Editorial desconocida",
      language: info.language || "es",
      pageCount: info.pageCount || 0,
      publishedDate: info.publishedDate || "Fecha desconocida",
      isbn_13: info.industryIdentifiers
        ? info.industryIdentifiers.find(id => id.type === "ISBN_13")?.identifier
        : null,
      image_url: info.imageLinks ? info.imageLinks.thumbnail : ""
    },
    pricing: {
      price_crc: precioCRC,
      currency: "CRC",
      discount: 0
    },
    b2b: {
      wholesale_price_crc: parseFloat((precioCRC * 0.7).toFixed(2)),
      min_order_quantity: 10,
      volume_discount_pct: 5
    },
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
    },
    facets: {
      language: info.language || "es",
      category: info.categories ? info.categories[0] : "General",
      rating: info.averageRating || 0,
      publisher: info.publisher || "Editorial desconocida"
    }
  };
}

/**
 * Se encarga de exportar todos los libros de una estantería específica de Google Books
 * @param auth - Cliente autenticado de Google
 * @param shelfId - ID de la estantería que se desea exportar
 * 
 */
async function exportShelf(auth, shelfId = 1001) {
  const books = google.books({ version: "v1", auth });

  console.log(`Exportando estantería: ${shelfId}...`);

  let allItems = [];
  let startIndex = 0;
  const maxResults = 40; //Por la paginación de máxima de API

  while (true) {
    const volumesRes = await books.mylibrary.bookshelves.volumes.list({
      shelf: shelfId,
      startIndex,
      maxResults
    });

    const items = volumesRes.data.items || [];
    if (items.length === 0) break; 

    allItems = allItems.concat(items);
    startIndex += maxResults;

    console.log(`Página exportada, total acumulado: ${allItems.length}`);
  }

  const productos = allItems.map(transformarProducto);

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(
    `data/shelf${shelfId}.json`,
    JSON.stringify(productos, null, 2),
    "utf-8"
  );

  console.log(`Exportados ${productos.length} libros de la estantería ${shelfId} a data/shelf${shelfId}.json`);
}

async function main() {
  const auth = await authorize();
  await exportShelf(auth, 1001);
}

main().catch(console.error);
