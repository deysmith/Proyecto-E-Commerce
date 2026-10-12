import provinciasJson from "../../../data/provincias.json"
import cantonesJson from "../../../data/cantones.json"
import distritosJson from "../../../data/distritos.json"

/**
 * Datos de ubicación de Costa Rica (provincias, cantones y distritos).
 */

export interface Provincia {
  codigo: number
  nombre: string
}

export interface Canton {
  codigo: number
  nombre: string
  idProvincia: number
}

export interface Distrito {
  codigo: number
  nombre: string
  idCanton: number
}

const provincias = provinciasJson as Provincia[]
const cantones = cantonesJson as Canton[]
const distritos = distritosJson as Distrito[]

export function obtenerProvincias(): Provincia[] {
  return provincias
}

/**
 * Cantones de una provincia. Si no hay provincia elegida devuelve una lista vacía.
 */
export function obtenerCantones(idProvincia: number | null): Canton[] {
  if (idProvincia === null) return []
  return cantones.filter((canton) => canton.idProvincia === idProvincia)
}

/**
 * Distritos de un cantón. Si no hay cantón elegido devuelve una lista vacía.
 */
export function obtenerDistritos(idCanton: number | null): Distrito[] {
  if (idCanton === null) return []
  return distritos.filter((distrito) => distrito.idCanton === idCanton)
}

// Nombres para mostrar en el resumen y guardar en la orden
export function nombreProvincia(codigo: number | null): string {
  return provincias.find((p) => p.codigo === codigo)?.nombre ?? ""
}

export function nombreCanton(codigo: number | null): string {
  return cantones.find((c) => c.codigo === codigo)?.nombre ?? ""
}

export function nombreDistrito(codigo: number | null): string {
  return distritos.find((d) => d.codigo === codigo)?.nombre ?? ""
}