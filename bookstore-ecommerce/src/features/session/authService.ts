import { searchClient } from "../../services/algoliaService"
import { esRolValido, type RolUsuario } from "./roles"

/**
 * Registro tal como está guardado en el índice de usuarios de Algolia
 */
interface UsuarioAlgolia {
  correo: string
  clave: string
  nombre: string
  rol: string
}

// Datos del usuario que se guardan en la sesión (sin la clave)
export interface UsuarioValidado {
  correo: string
  nombre: string
  rol: RolUsuario
}

export type ResultadoLogin =
  | { ok: true; usuario: UsuarioValidado }
  | { ok: false; error: string }

// Mismo mensaje si el correo no existe o la clave está mal, para no revelar qué correos están registrados
const ERROR_CREDENCIALES = "El correo o la contraseña son incorrectos."

/**
 * Busca en el índice de usuarios el registro con ese correo exacto.
 * Devuelve null si no existe.
 */
async function buscarUsuarioPorCorreo(correo: string): Promise<UsuarioAlgolia | null> {
  const response = await searchClient.search([
    {
      indexName: import.meta.env.VITE_INDEX_NAME_USERS,
      params: { query: correo, restrictSearchableAttributes: ["correo"], hitsPerPage: 10 },
    },
  ])

  const result = response.results[0]
  if (!result || !("hits" in result)) return null

  // Algolia busca por palabras, así que se confirma que el correo sea exactamente igual
  const usuarios = result.hits as unknown as UsuarioAlgolia[]
  return usuarios.find((usuario) => usuario.correo?.toLowerCase() === correo) ?? null
}

/**
 * Valida el correo y la contraseña contra el índice de usuarios de Algolia.
 */
export async function validarCredenciales(correo: string, clave: string): Promise<ResultadoLogin> {
  try {
    const usuario = await buscarUsuarioPorCorreo(correo.trim().toLowerCase())

    if (!usuario || usuario.clave !== clave) {
      return { ok: false, error: ERROR_CREDENCIALES }
    }

    if (!esRolValido(usuario.rol)) {
      return { ok: false, error: "Tu cuenta no tiene un rol válido. Contacta a soporte para revisarla." }
    }

    return {
      ok: true,
      usuario: { correo: usuario.correo.toLowerCase(), nombre: usuario.nombre, rol: usuario.rol },
    }
  } catch {
    // Error de red o de Algolia: se muestra un mensaje entendible en vez del error técnico
    return { ok: false, error: "No pudimos validar tu cuenta en este momento. Intenta de nuevo en unos segundos." }
  }
}