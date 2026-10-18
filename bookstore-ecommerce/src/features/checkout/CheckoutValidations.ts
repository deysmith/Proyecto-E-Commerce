import type { DatosComprador, DatosEntrega, ErroresComprador, ErroresEntrega } from "./CheckoutTypes"

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
 * Los números de Costa Rica nunca empiezan con 0, 1, 3 ni 9.
 * Sirve para avisarle al usuario apenas escribe el primer dígito.
 */
export function prefijoTelefonoInvalido(valor: string): boolean {
  return /^[0139]/.test(limpiarTelefono(valor))
}

/**
 * Teléfono: obligatorio, número de Costa Rica de 8 dígitos que empieza con 2, 4, 5, 6, 7 u 8.
 * Acepta formatos como 8888-8888, 8888 8888 o +506 8888 8888.
 */
export function validarTelefono(valor: string): string {
  if (valor.trim() === "") return "Ingresa tu número de teléfono."

  if (prefijoTelefonoInvalido(valor)) {
    return "En Costa Rica ese número de teléfono no es válido. Los números empiezan con 2, 4, 5, 6, 7 u 8."
  }

  if (!/^[24-8]\d{7}$/.test(limpiarTelefono(valor))) {
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

export const DIRECCION_MINIMO = 10
export const DIRECCION_MAXIMO = 200
export const INFO_ADICIONAL_MAXIMO = 250

/**
 * Provincia, cantón y distrito: obligatorios.
 * Vale null si el usuario no eligió nada o si escribió algo que no está en la lista.
 */
export function validarProvincia(codigo: number | null): string {
  return codigo === null ? "Selecciona una provincia de la lista." : ""
}

export function validarCanton(codigo: number | null): string {
  return codigo === null ? "Selecciona un cantón de la lista." : ""
}

export function validarDistrito(codigo: number | null): string {
  return codigo === null ? "Selecciona un distrito de la lista." : ""
}

/**
 * Dirección exacta: obligatoria, con un mínimo para evitar cosas como "casa"
 */
export function validarDireccion(valor: string): string {
  const direccion = valor.trim().replace(/\s+/g, " ")

  if (direccion === "") return "Ingresa tu dirección exacta."
  if (direccion.length < DIRECCION_MINIMO) {
    return `Escribe una dirección más detallada (mínimo ${DIRECCION_MINIMO} caracteres).`
  }
  if (direccion.length > DIRECCION_MAXIMO) {
    return `La dirección es demasiado larga (máximo ${DIRECCION_MAXIMO} caracteres).`
  }

  return ""
}

/**
 * Información adicional: es opcional, solo se limita el largo
 */
export function validarInfoAdicional(valor: string): string {
  if (valor.trim().length > INFO_ADICIONAL_MAXIMO) {
    return `Es demasiado largo (máximo ${INFO_ADICIONAL_MAXIMO} caracteres).`
  }

  return ""
}

/**
 * Valida todo el formulario de entrega.
 * Si el objeto devuelto está vacío, no hay errores y se puede avanzar.
 */
export function validarEntrega(datos: DatosEntrega): ErroresEntrega {
  const errores: ErroresEntrega = {}

  const errorProvincia = validarProvincia(datos.provincia)
  const errorCanton = validarCanton(datos.canton)
  const errorDistrito = validarDistrito(datos.distrito)
  const errorDireccion = validarDireccion(datos.direccion)
  const errorInfo = validarInfoAdicional(datos.infoAdicional)

  if (errorProvincia) errores.provincia = errorProvincia
  if (errorCanton) errores.canton = errorCanton
  if (errorDistrito) errores.distrito = errorDistrito
  if (errorDireccion) errores.direccion = errorDireccion
  if (errorInfo) errores.infoAdicional = errorInfo

  return errores
}

/**
 * Devuelve el primer paso con errores, o null si no hay errores.
 * 0 = datos del comprador, 1 = dirección de entrega
 */
export function primerPasoConErrores(comprador: DatosComprador, entrega: DatosEntrega): number | null {
  if (Object.keys(validarComprador(comprador)).length > 0) return 0
  if (Object.keys(validarEntrega(entrega)).length > 0) return 1
  return null
}