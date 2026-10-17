import type { DatosTarjeta } from "./PaymentTypes"

/**
 * Validaciones y formato de los datos de la tarjeta.
 * Cada validación devuelve el mensaje de error, o "" si el valor es válido.
 */

// Lo que el usuario escribe en el formulario (todo como texto)
export interface DatosTarjetaForm {
  nombre: string
  numero: string
  // Formato MM/AA
  vencimiento: string
  cvc: string
}

export type CampoTarjeta = keyof DatosTarjetaForm
export type ErroresTarjeta = Partial<Record<CampoTarjeta, string>>

export const tarjetaVacia: DatosTarjetaForm = { nombre: "", numero: "", vencimiento: "", cvc: "" }

export type MarcaTarjeta = "Visa" | "Mastercard" | "American Express"

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "")
}

/**
 * Adivina la marca por los primeros dígitos del número.
 */
export function detectarMarca(numero: string): MarcaTarjeta | null {
  const digitos = soloDigitos(numero)

  if (/^3[47]/.test(digitos)) return "American Express"
  if (/^4/.test(digitos)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(digitos)) return "Mastercard"
  return null
}

/**
 * Pone el número en grupos mientras se escribe: 4242 4242 4242 4242 (American Express: 4-6-5).
 */
export function formatearNumeroTarjeta(valor: string): string {
  const esAmex = detectarMarca(valor) === "American Express"
  const digitos = soloDigitos(valor).slice(0, esAmex ? 15 : 16)

  if (esAmex) {
    return [digitos.slice(0, 4), digitos.slice(4, 10), digitos.slice(10)].filter((grupo) => grupo !== "").join(" ")
  }
  return digitos.replace(/(.{4})/g, "$1 ").trim()
}

/**
 * Pone la barra mientras se escribe el vencimiento: 1230 -> 12/30.
 */
export function formatearVencimiento(valor: string): string {
  const digitos = soloDigitos(valor).slice(0, 4)
  return digitos.length >= 3 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
}

/**
 * Algoritmo de Luhn: es la revisión que hacen todas las tarjetas reales para detectar errores al digitar.
 */
function pasaLuhn(digitos: string): boolean {
  let suma = 0
  let duplicar = false

  for (let i = digitos.length - 1; i >= 0; i--) {
    let numero = Number(digitos[i])
    if (duplicar) {
      numero *= 2
      if (numero > 9) numero -= 9
    }
    suma += numero
    duplicar = !duplicar
  }

  return suma % 10 === 0
}

export function validarNombreTarjeta(valor: string): string {
  const nombre = valor.trim().replace(/\s+/g, " ")

  if (nombre === "") return "Ingresa el nombre que aparece en la tarjeta."
  if (nombre.length < 3) return "El nombre es demasiado corto."
  if (nombre.length > 60 || !/^[\p{L}][\p{L}'’. -]*$/u.test(nombre)) {
    return "El nombre solo puede tener letras y espacios."
  }
  return ""
}

export function validarNumeroTarjeta(valor: string): string {
  const digitos = soloDigitos(valor)

  if (digitos === "") return "Ingresa el número de la tarjeta."

  const largo = detectarMarca(digitos) === "American Express" ? 15 : 16
  if (digitos.length !== largo) return `El número debe tener ${largo} dígitos.`
  if (!pasaLuhn(digitos)) return "El número de tarjeta no es válido. Revísalo."
  return ""
}

/**
 * Vencimiento en formato MM/AA. La tarjeta sirve hasta el final del mes indicado.
 */
export function validarVencimiento(valor: string, hoy: Date = new Date()): string {
  if (valor.trim() === "") return "Ingresa la fecha de vencimiento."

  const partes = /^(\d{2})\/(\d{2})$/.exec(valor.trim())
  if (!partes) return "Usa el formato MM/AA, por ejemplo 12/30."

  const mes = Number(partes[1])
  const anio = 2000 + Number(partes[2])
  if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12."

  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1
  if (anio < anioActual || (anio === anioActual && mes < mesActual)) return "La tarjeta está vencida."
  if (anio > anioActual + 20) return "La fecha de vencimiento no es válida."
  return ""
}

export function validarCvc(valor: string, numero: string): string {
  const digitos = soloDigitos(valor)
  const largo = detectarMarca(numero) === "American Express" ? 4 : 3

  if (digitos === "") return "Ingresa el CVC (código de seguridad)."
  if (digitos.length !== largo) return `El CVC tiene ${largo} dígitos.`
  return ""
}

/**
 * Valida todos los campos y devuelve solo los que tienen error.
 */
export function validarTarjeta(datos: DatosTarjetaForm, hoy: Date = new Date()): ErroresTarjeta {
  const errores: ErroresTarjeta = {}

  const nombre = validarNombreTarjeta(datos.nombre)
  const numero = validarNumeroTarjeta(datos.numero)
  const vencimiento = validarVencimiento(datos.vencimiento, hoy)
  const cvc = validarCvc(datos.cvc, datos.numero)

  if (nombre) errores.nombre = nombre
  if (numero) errores.numero = numero
  if (vencimiento) errores.vencimiento = vencimiento
  if (cvc) errores.cvc = cvc

  return errores
}

/**
 * Convierte lo escrito en el formulario (ya validado) a lo que recibe el servicio de pago.
 */
export function convertirATarjeta(datos: DatosTarjetaForm): DatosTarjeta {
  const [mes, anio] = datos.vencimiento.split("/")

  return {
    holderName: datos.nombre.trim().replace(/\s+/g, " "),
    number: soloDigitos(datos.numero),
    expMonth: Number(mes),
    expYear: 2000 + Number(anio),
    cvc: soloDigitos(datos.cvc),
  }
}