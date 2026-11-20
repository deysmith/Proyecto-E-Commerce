/**
 * Datos de la empresa de un cliente B2B. Vienen del índice de usuarios de Algolia.
 */
export interface Empresa {
  nombre: string
  cedulaJuridica: string
}

// Formato de la cédula jurídica en Costa Rica: 3-XXX-XXXXXX
const FORMATO_CEDULA_JURIDICA = /^3-\d{3}-\d{6}$/

/**
 * Revisa que los datos de empresa estén completos y con una cédula jurídica válida.
 */
export function esEmpresaValida(dato: unknown): dato is Empresa {
  if (typeof dato !== "object" || dato === null) return false
  const empresa = dato as Record<string, unknown>

  return (
    typeof empresa.nombre === "string" &&
    empresa.nombre.trim() !== "" &&
    typeof empresa.cedulaJuridica === "string" &&
    FORMATO_CEDULA_JURIDICA.test(empresa.cedulaJuridica)
  )
}