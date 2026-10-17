import tarjetasPruebaJson from "../../../data/tarjetasPrueba.json"
import { detectarMarca } from "./CardValidations"
import type { RespuestaPago, ResultadoPago, SolicitudPago } from "./PaymentTypes"

/**
 * Servicio de pago simulado (Sandbox).
 * Representa a un proveedor externo de pagos (una pasarela, como Stripe o PayPal).
 * Por eso lo que le enviamos y lo que nos responde usa nombres en inglés (orderId, amount, currency),
 * como lo haría una API real; el resto de la aplicación sigue usando nombres en español.
 * 1. Se le envía una solicitud de pago con los datos de la orden y de la tarjeta.
 * 2. Devuelve un resultado que indica si el pago fue aprobado, rechazado o hubo un error del servicio.
 * 3. La orden se actualiza según el resultado y se guarda.
 */

export interface TarjetaPrueba {
  numero: string
  resultado: ResultadoPago
  descripcion: string
}

export const TARJETAS_PRUEBA = tarjetasPruebaJson as TarjetaPrueba[]

const ESPERA_MINIMA = 1500
const ESPERA_MAXIMA = 2500

// Letras y números sin los que se confunden, para el id de la transacción
const CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function esperar(milisegundos: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, milisegundos))
}

function tiempoDeRespuesta(): number {
  return ESPERA_MINIMA + Math.random() * (ESPERA_MAXIMA - ESPERA_MINIMA)
}

function generarIdTransaccion(): string {
  const valores = new Uint32Array(8)
  crypto.getRandomValues(valores)

  let codigo = ""
  for (const valor of valores) {
    codigo += CARACTERES[valor % CARACTERES.length]
  }
  return `SBX-${codigo}`
}

/**
 * Revisa que la solicitud tenga sentido. Un proveedor real también rechaza solicitudes mal formadas.
 */
function solicitudEsValida(solicitud: SolicitudPago): boolean {
  return (
    solicitud.orderId.trim() !== "" &&
    Number.isFinite(solicitud.amount) &&
    solicitud.amount > 0 &&
    solicitud.currency === "CRC" &&
    /^\d{13,19}$/.test(solicitud.card.number)
  )
}

/**
 * Procesa un pago en el Sandbox.
 *
 * @param solicitud datos del cobro: { orderId, amount, currency, card }
 * @returns la respuesta del "proveedor". Siempre se resuelve con un resultado, incluso
 *          cuando hay un error del servicio en este caso.
 */
export async function procesarPagoSandbox(solicitud: SolicitudPago): Promise<RespuestaPago> {
  await esperar(tiempoDeRespuesta())

  const base = { orderId: solicitud.orderId, processedAt: new Date().toISOString() }

  // Si la solicitud viene mal, el proveedor no la procesa
  if (!solicitudEsValida(solicitud)) {
    return {
      ...base,
      status: "PAYMENT_ERROR",
      transactionId: null,
      message: "Solicitud inválida: revise orderId, amount, currency y card.",
      card: null,
    }
  }

  // Solo se devuelve la marca y los últimos 4 dígitos, nunca el número completo
  const tarjeta = {
    brand: detectarMarca(solicitud.card.number) ?? "Tarjeta",
    last4: solicitud.card.number.slice(-4),
  }

  // El resultado depende de la tarjeta: si está en la lista de prueba se usa lo que dice la lista, si no, se aprueba
  const tarjetaPrueba = TARJETAS_PRUEBA.find((prueba) => prueba.numero === solicitud.card.number)
  const resultado: ResultadoPago = tarjetaPrueba ? tarjetaPrueba.resultado : "PAYMENT_APPROVED"

  if (resultado === "PAYMENT_APPROVED") {
    return {
      ...base,
      status: "PAYMENT_APPROVED",
      transactionId: generarIdTransaccion(),
      message: "Pago aprobado (Sandbox).",
      card: tarjeta,
    }
  }

  return {
    ...base,
    status: resultado,
    transactionId: null,
    message: tarjetaPrueba?.descripcion ?? "No se pudo procesar el pago.",
    card: tarjeta,
  }
}