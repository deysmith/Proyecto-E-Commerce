import type { DatosComprador, ErroresComprador } from "./CheckoutTypes"

/**
 * Validaciones del checkout.
 * Cada función devuelve el mensaje de error, o "" si el valor es válido.
 * Así los mensajes quedan en un solo lugar y se pueden probar sin la interfaz.
 */

// Letras (con tildes y ñ), espacios, guiones y apóstrofes
const REGEX_NOMBRE = /^[\p{L}][\p{L}'’ -]*$/u
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Nombre completo: obligatorio, solo letras y al menos nombre y un apellido
 */
export function validarNombreCompleto(valor: string): string {
  // Se quitan espacios repetidos para contar bien las palabras
  const nombre = valor.trim().replace(/\s+/g, " ")

  if (nombre === "") return "Ingresa tu nombre completo."
  if (nombre.length > 80) return "El nombre es demasiado largo (máximo 80 caracteres)."
  if (!REGEX_NOMBRE.test(nombre)) {
    return "El nombre solo puede tener letras, espacios, guiones y apóstrofes."
  }

  const palabras = nombre.split(" ").filter((palabra) => /\p{L}/u.test(palabra))
  if (palabras.length < 2) return "Escribe tu nombre y al menos un apellido."

  return ""
}

/**
 * Correo: obligatorio y con formato nombre@dominio.com
 */
export function validarCorreo(valor: string): string {
  const correo = valor.trim()

  if (correo === "") return "Ingresa tu correo electrónico."
  if (correo.length > 100 || !REGEX_CORREO.test(correo)) {
    return "Escribe un correo válido, por ejemplo nombre@correo.com."
  }

  return ""
}

/**
 * Quita espacios, guiones y paréntesis, y el código de país (+506) si lo trae.
 * Deja solo los dígitos del número para poder validarlo.
 */
export function limpiarTelefono(valor: string): string {
  let telefono = valor.replace(/[\s()-]/g, "")

  if (telefono.startsWith("+506")) {
    telefono = telefono.slice(4)
  } else if (telefono.startsWith("506") && telefono.length === 11) {
    telefono = telefono.slice(3)
  }

  return telefono
}

/**
 * Teléfono: obligatorio, número de Costa Rica de 8 dígitos.
 * Acepta formatos como 8888-8888, 8888 8888 o +506 8888 8888.
 */
export function validarTelefono(valor: string): string {
  if (valor.trim() === "") return "Ingresa tu número de teléfono."

  if (!/^[2-8]\d{7}$/.test(limpiarTelefono(valor))) {
    return "Escribe un teléfono de 8 dígitos, por ejemplo 8888-8888."
  }

  return ""
}

/**
 * Valida todo el formulario del comprador.
 * Si el objeto devuelto está vacío, no hay errores y se puede avanzar.
 */
export function validarComprador(datos: DatosComprador): ErroresComprador {
  const errores: ErroresComprador = {}

  const errorNombre = validarNombreCompleto(datos.nombreCompleto)
  const errorCorreo = validarCorreo(datos.correo)
  const errorTelefono = validarTelefono(datos.telefono)

  if (errorNombre) errores.nombreCompleto = errorNombre
  if (errorCorreo) errores.correo = errorCorreo
  if (errorTelefono) errores.telefono = errorTelefono

  return errores
}