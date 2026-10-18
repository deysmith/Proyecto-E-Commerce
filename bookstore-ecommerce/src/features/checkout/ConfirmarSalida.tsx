import { useEffect, useRef } from "react"

interface ConfirmarSalidaProps {
  abierto: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Ventana que pide confirmación antes de salir del checkout, porque al salir se pierden los datos escritos.
 * Se cierra con el botón de cancelar, con la tecla Escape o haciendo clic fuera de la ventana.
 */
export function ConfirmarSalida({ abierto, onConfirmar, onCancelar }: ConfirmarSalidaProps) {
  const botonCancelar = useRef<HTMLButtonElement>(null)

  // Al abrir la ventana el foco va al botón seguro (quedarse), para no salir por accidente con Enter
  useEffect(() => {
    if (abierto) botonCancelar.current?.focus()
  }, [abierto])

  useEffect(() => {
    if (!abierto) return

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCancelar()
    }

    document.addEventListener("keydown", alPresionarTecla)
    return () => document.removeEventListener("keydown", alPresionarTecla)
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <div className="salida-fondo" onClick={onCancelar}>
      <div
        className="salida-caja"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="salida-titulo"
        aria-describedby="salida-texto"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="salida-caja__icono" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </div>

        <h2 id="salida-titulo" className="salida-caja__titulo">¿Salir del checkout?</h2>
        <p id="salida-texto" className="salida-caja__texto">
          Si sales ahora vas a perder los datos que ya escribiste en el checkout. Tus libros se mantienen en el carrito.
        </p>

        <div className="salida-caja__acciones">
          <button ref={botonCancelar} type="button" className="checkout-btn" onClick={onCancelar}>
            Seguir en el checkout
          </button>
          <button type="button" className="checkout-btn salida-caja__salir" onClick={onConfirmar}>
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  )
}