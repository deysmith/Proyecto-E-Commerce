import { useEffect, useRef, useState } from "react"
import type { ProductRecord } from "../../types/productRecord"
import { SUCURSALES, type SucursalId, useInventarioActualizado } from "./Sucursales"
import { obtenerStockDisponible } from "../../services/inventoryServices"

interface SelectorSucursalProps {
  // Libro que se quiere agregar; null mantiene la ventana cerrada
  producto: ProductRecord | null
  // Unidades que se quieren agregar: solo se pueden elegir sucursales con al menos esa cantidad
  cantidad: number
  // Mínimo B2B del libro, solo cuando el cliente es B2B (para avisarlo antes de agregar)
  minimoB2B?: number | null
  onConfirmar: (sucursal: SucursalId) => void
  onCancelar: () => void
}

/**
 * Ventana que aparece al agregar un libro al carrito para elegir la sucursal.
 * Muestra las existencias de cada sucursal; las agotadas no se pueden elegir.
 * Se cierra con cancelar, con Escape o haciendo clic fuera.
 */
export function SelectorSucursal({ producto, cantidad, minimoB2B, onConfirmar, onCancelar }: SelectorSucursalProps) {
  const versionInventario = useInventarioActualizado()
  const abierto = producto !== null
  const [elegida, setElegida] = useState<SucursalId | null>(null)
  const botonCancelar = useRef<HTMLButtonElement>(null)

  const stockDe = (id: SucursalId) => producto ? obtenerStockDisponible(producto.objectID, producto.inventory.stock_by_branch, id) ?? 0 : 0
  // Cada vez que se abre para un libro, se deja marcada la primera sucursal que tenga la cantidad pedida
  useEffect(() => {
    if (!producto) return
    const primera = SUCURSALES.find((sucursal) => stockDe(sucursal.id) >= cantidad)
    setElegida(primera?.id ?? null)
  }, [producto, cantidad, versionInventario])

  useEffect(() => {
    if (!abierto) return

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCancelar()
    }

    document.addEventListener("keydown", alPresionarTecla)
    return () => document.removeEventListener("keydown", alPresionarTecla)
  }, [abierto, onCancelar])

  useEffect(() => {
    if (abierto) botonCancelar.current?.focus()
  }, [abierto])

  if (!producto) return null

  return (
    <div className="salida-fondo" onClick={onCancelar}>
      <div
        className="salida-caja sucursal-caja"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sucursal-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="sucursal-titulo" className="salida-caja__titulo">¿Desde qué sucursal?</h2>
        <p className="salida-caja__texto">
          Elige la sucursal para <strong>{cantidad} {cantidad === 1 ? "unidad" : "unidades"}</strong> de <strong>{producto.productInfo.title}</strong>.
        </p>

        {minimoB2B ? (
          <p className="sucursal-caja__min">Compra mínima B2B: {minimoB2B} unidades por libro.</p>
        ) : null}

        <fieldset className="sucursal-opciones">
          <legend className="sucursal-opciones__leyenda">Sucursal</legend>
          {SUCURSALES.map((sucursal) => {
            const stock = stockDe(sucursal.id)
            const agotado = stock === 0
            // Hay existencias pero menos de las que se piden
            const insuficiente = !agotado && stock < cantidad
            const noDisponible = agotado || insuficiente
            return (
              <label
                key={sucursal.id}
                className={`sucursal-opcion${noDisponible ? " is-out" : ""}${elegida === sucursal.id ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="sucursal"
                  value={sucursal.id}
                  checked={elegida === sucursal.id}
                  disabled={noDisponible}
                  onChange={() => setElegida(sucursal.id)}
                />
                <span className="sucursal-opcion__nombre">{sucursal.nombre}</span>
                <span className="sucursal-opcion__stock">
                  {agotado ? "Agotado" : insuficiente ? `Solo hay ${stock}` : `${stock} ${stock === 1 ? "disponible" : "disponibles"}`}
                </span>
              </label>
            )
          })}
        </fieldset>

        {elegida === null && (
          <p className="sucursal-caja__aviso" role="status">
            Ninguna sucursal tiene {cantidad} unidades de este libro. Cancela y elige una cantidad menor.
          </p>
        )}

        <div className="salida-caja__acciones">
          <button ref={botonCancelar} type="button" className="checkout-btn checkout-btn--ghost" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            type="button"
            className="checkout-btn"
            disabled={elegida === null}
            onClick={() => elegida && onConfirmar(elegida)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}