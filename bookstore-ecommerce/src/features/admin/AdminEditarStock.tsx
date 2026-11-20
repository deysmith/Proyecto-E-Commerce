import { useEffect, useRef, useState, type FormEvent } from "react"
import type { ProductRecord } from "../../types/productRecord"
import { SUCURSALES, nombreSucursal, type SucursalId } from "../sucursales/Sucursales"
import { actualizarStockManual, obtenerStockDisponible, STOCK_MAXIMO, type CambioInventario } from "../../services/inventoryServices"
import { useSession } from "../session/sessionContext"

interface AdminEditarStockProps {
  producto: ProductRecord
  onCerrar: () => void
  onGuardado: (cambio: CambioInventario) => void
}

/**
 * Ventana para modificar las existencias de un libro en una sucursal.
 * Muestra el valor actual y el nuevo antes de guardar.
 */
export function AdminEditarStock({ producto, onCerrar, onGuardado }: AdminEditarStockProps) {
  const { user } = useSession()
  const stockDe = (id: SucursalId) => obtenerStockDisponible(producto.objectID, producto.inventory.stock_by_branch, id) ?? 0

  const [sucursal, setSucursal] = useState<SucursalId>(SUCURSALES[0].id)
  const [cantidadTexto, setCantidadTexto] = useState(String(stockDe(SUCURSALES[0].id)))
  const [error, setError] = useState("")
  const campoCantidad = useRef<HTMLInputElement>(null)

  const anterior = stockDe(sucursal)
  const cantidad = Number(cantidadTexto)
  const cantidadValida = cantidadTexto.trim() !== "" && Number.isInteger(cantidad) && cantidad >= 0 && cantidad <= STOCK_MAXIMO
  const sinCambios = cantidadValida && cantidad === anterior

  useEffect(() => {
    campoCantidad.current?.focus()
    campoCantidad.current?.select()
  }, [])

  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar()
    }
    document.addEventListener("keydown", alPresionarTecla)
    return () => document.removeEventListener("keydown", alPresionarTecla)
  }, [onCerrar])

  // Al cambiar de sucursal se carga su cantidad actual
  function cambiarSucursal(id: SucursalId) {
    setSucursal(id)
    setCantidadTexto(String(stockDe(id)))
    setError("")
  }

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!cantidadValida) {
      setError(`Escribe una cantidad entera entre 0 y ${STOCK_MAXIMO}.`)
      return
    }

    const cambio = actualizarStockManual({
      productoId: producto.objectID,
      titulo: producto.productInfo.title,
      stockOriginal: producto.inventory.stock_by_branch,
      sucursal,
      nuevo: cantidad,
      admin: user?.email ?? "",
    })

    if (!cambio) {
      setError("No pudimos guardar el cambio. Revisa que tu navegador permita guardar datos e inténtalo de nuevo.")
      return
    }

    onGuardado(cambio)
  }

  return (
    <div className="salida-fondo" onClick={onCerrar}>
      <form
        className="salida-caja admin-editar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-stock-titulo"
        onClick={(evento) => evento.stopPropagation()}
        onSubmit={guardar}
        noValidate
      >
        <h2 id="editar-stock-titulo" className="salida-caja__titulo">Modificar inventario</h2>
        <p className="salida-caja__texto">{producto.productInfo.title}</p>

        <div className="checkout-field">
          <label htmlFor="editar-stock-sucursal">Sucursal</label>
          <select id="editar-stock-sucursal" value={sucursal} onChange={(evento) => cambiarSucursal(evento.target.value as SucursalId)}>
            {SUCURSALES.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>{opcion.nombre} ({stockDe(opcion.id)} disponibles)</option>
            ))}
          </select>
        </div>

        <div className={error ? "checkout-field has-error" : "checkout-field"}>
          <label htmlFor="editar-stock-cantidad">Nuevas existencias</label>
          <input
            ref={campoCantidad}
            id="editar-stock-cantidad"
            type="number"
            inputMode="numeric"
            min={0}
            max={STOCK_MAXIMO}
            step={1}
            value={cantidadTexto}
            onChange={(evento) => {
              setCantidadTexto(evento.target.value)
              setError("")
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "editar-stock-error" : undefined}
          />
          {error && <p id="editar-stock-error" className="checkout-field__error" role="alert">{error}</p>}
        </div>

        {/* Vista previa de lo que se va a modificar */}
        <p className="admin-editar__resumen">
          {nombreSucursal(sucursal)}: <strong>{anterior}</strong> → <strong>{cantidadValida ? cantidad : "?"}</strong> unidades
        </p>

        <div className="salida-caja__acciones">
          <button type="button" className="checkout-btn checkout-btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="checkout-btn" disabled={sinCambios}>Guardar cambio</button>
        </div>
      </form>
    </div>
  )
}