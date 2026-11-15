import type { LocalUser } from "../analytics/analytics"
import type { RolUsuario } from "../session/roles"
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
