import { useMemo } from "react"
import { useCart } from "./useCart"
import { useSession } from "../session/sessionContext"
import { validarCarrito } from "./CartValidation"

/**
 * Valida el carrito con el rol del usuario y la sucursal de cada línea.
 * Lo usan el carrito (para deshabilitar el botón) y el checkout (para no dejar entrar por la URL).
 */
export function useCartValidation() {
  const { items } = useCart()
  const { user } = useSession()
  const rol = user?.role

  return useMemo(() => {
    const problemas = validarCarrito(items, rol)
    return { problemas, puedeContinuar: problemas.length === 0 }
  }, [items, rol])
}