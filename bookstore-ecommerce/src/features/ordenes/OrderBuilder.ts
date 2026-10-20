import type { CartItem } from "../carrito-de-compras/CartReducer"
import { getItemSubtotal, type CartTotals } from "../carrito-de-compras/CartCalculations"
import type { DatosComprador, DatosEntrega } from "../checkout/CheckoutTypes"
import { nombreCanton, nombreDistrito, nombreProvincia } from "../checkout/CheckoutLocations"
import type { EntregaOrden, Orden, ProductoOrden } from "./OrderTypes"

/**
 * Construcción de la orden a partir de lo que hay en el checkout y en el carrito.
 */

// Letras y números sin los que se confunden (sin 0, O, 1, I) para leer el número sin errores
const CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const LARGO_CODIGO = 6

function codigoAleatorio(): string {
  const valores = new Uint32Array(LARGO_CODIGO)
  crypto.getRandomValues(valores)

  let codigo = ""
  for (const valor of valores) {
    codigo += CARACTERES[valor % CARACTERES.length]
  }
  return codigo
}

/**
 * Genera un número de orden único con el formato BKS-AAAAMMDD-XXXXXX (BKS = Booksmart, fecha de hoy y un código aleatorio).
 * Si el número ya lo tiene otra orden guardada, se genera otro hasta que no se repita.
 */
export function generarNumeroOrden(numerosUsados: string[]): string {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, "0")
  const dia = String(hoy.getDate()).padStart(2, "0")

  const armarNumero = () => `BKS-${año}${mes}${dia}-${codigoAleatorio()}`

  let numero = armarNumero()
  while (numerosUsados.includes(numero)) {
    numero = armarNumero()
  }

  return numero
}

/**
 * La entrega del checkout guarda códigos (provincia: 7); en la orden se guardan los nombres para poder mostrarlos directamente.
 */
export function entregaParaOrden(entrega: DatosEntrega): EntregaOrden {
  return {
    provincia: nombreProvincia(entrega.provincia),
    canton: nombreCanton(entrega.canton),
    distrito: nombreDistrito(entrega.distrito),
    direccion: entrega.direccion.trim(),
    infoAdicional: entrega.infoAdicional.trim(),
  }
}

export function productoParaOrden(item: CartItem): ProductoOrden {
  return {
    id: item.id,
    titulo: item.title,
    autor: item.author ?? "",
    precioUnitario: item.price,
    cantidad: item.quantity,
    subtotal: getItemSubtotal(item),
    imagen: item.image,
  }
}

interface DatosParaOrden {
  numero: string
  items: CartItem[]
  // Los totales que ya calculó el carrito
  totales: CartTotals
  comprador: DatosComprador
  entrega: DatosEntrega
}

/**
 * Arma la orden. Siempre nace con estado "pendiente" y pago "pendiente": todavía no se ha intentado cobrar nada.
 */
export function construirOrden({ numero, items, totales, comprador, entrega }: DatosParaOrden): Orden {
  return {
    numero,
    fecha: new Date().toISOString(),
    comprador: {
      nombreCompleto: comprador.nombreCompleto.trim(),
      correo: comprador.correo.trim(),
      telefono: comprador.telefono.trim(),
    },
    entrega: entregaParaOrden(entrega),
    productos: items.map(productoParaOrden),
    montos: {
      subtotal: totales.subtotal,
      iva: totales.iva,
      envio: totales.envio,
      total: totales.total,
    },
    moneda: "CRC",
    estadoOrden: "pendiente",
    estadoPago: "pendiente",
    aceptacionTerminos: {
      aceptado: false,
      fecha: null,
    },
  }
}