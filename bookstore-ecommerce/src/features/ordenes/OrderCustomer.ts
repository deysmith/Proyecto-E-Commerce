import type { LocalUser } from "../analytics/analytics"
import { NOMBRE_ROL, type RolUsuario } from "../session/roles"
import { obtenerIdInvitado } from "../../utils/guestId"
/**
 * Tipo de cliente que hizo la orden: el rol del usuario con sesión, o INVITADO si compró sin iniciar sesión.
 */
export type TipoCliente = RolUsuario | "INVITADO"

export interface IdentidadCliente {
  // Con sesión: el correo del usuario. Sin sesión: el id guardado en localStorage (guest-...)
  clienteId: string
  tipoCliente: TipoCliente
}

/**
 * Define con qué identificador se guardan y se consultan las órdenes de la persona actual.
 */
export function identidadDeCliente(user: LocalUser | null): IdentidadCliente {
  if (user) return { clienteId: user.email, tipoCliente: user.role }
  return { clienteId: obtenerIdInvitado(), tipoCliente: "INVITADO" }
}

/**
 * Nombre del tipo de cliente para mostrarlo en pantalla.
 * El invitado compra con las condiciones de un cliente B2C.
 */
export function nombreTipoCliente(tipo?: TipoCliente): string {
  if (tipo === "INVITADO") return "Invitado (B2C)"
  if (tipo) return NOMBRE_ROL[tipo]
  return "Sin registrar"
}

/**
 * Lista de precios con la que compra cada tipo de cliente.
 * Solo el cliente B2B usa precios mayoristas; B2C e invitados usan los precios B2C.
 */
export function listaPreciosDe(tipo?: TipoCliente): "B2C" | "B2B" {
  return tipo === "BUSINESS" ? "B2B" : "B2C"
}