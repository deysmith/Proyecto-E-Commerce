/**
 * Roles que existen en el índice de usuarios de Algolia
 */
export type RolUsuario = "CUSTOMER" | "BUSINESS" | "ADMIN"

// Nombre que se le muestra al usuario para cada rol
export const NOMBRE_ROL: Record<RolUsuario, string> = {
  CUSTOMER: "Cliente B2C",
  BUSINESS: "Cliente B2B",
  ADMIN: "Administrador",
}

export function esRolValido(rol: unknown): rol is RolUsuario {
  return rol === "CUSTOMER" || rol === "BUSINESS" || rol === "ADMIN"
}