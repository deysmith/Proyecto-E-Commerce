import { Link } from "react-router-dom"
import { paginasLegales } from "./LegalContent"
import { NOMBRE_TIENDA } from "./InfoTienda"

interface AceptacionTerminosProps {
  aceptado: boolean
  // true cuando el usuario intentó continuar sin aceptar
  mostrarError: boolean
  onCambiar: (aceptado: boolean) => void
}

// Id del checkbox
export const ID_ACEPTAR_TERMINOS = "aceptar-terminos"

/**
 * Componente encargado de devolver la casilla para aceptar los términos y las políticas de la tienda durante el checkout.
 */
export function AceptacionTerminos({ aceptado, mostrarError, onCambiar }: AceptacionTerminosProps) {
  return (
    <div className={mostrarError ? "terminos has-error" : "terminos"}>
      <div className="terminos__control">
        <input
          id={ID_ACEPTAR_TERMINOS}
          type="checkbox"
          checked={aceptado}
          aria-invalid={mostrarError}
          aria-describedby={mostrarError ? "error-terminos terminos-nota" : "terminos-nota"}
          onChange={(evento) => onCambiar(evento.target.checked)}
        />
        <label htmlFor={ID_ACEPTAR_TERMINOS}>
          He leído y acepto los{" "}
          <Link to={paginasLegales.terminos.ruta} target="_blank" rel="noopener noreferrer">Términos y Condiciones</Link>, la{" "}
          <Link to={paginasLegales.privacidad.ruta} target="_blank" rel="noopener noreferrer">Política de Privacidad</Link>, la{" "}
          <Link to={paginasLegales.devoluciones.ruta} target="_blank" rel="noopener noreferrer">Política de Devoluciones</Link> y la{" "}
          <Link to={paginasLegales.envios.ruta} target="_blank" rel="noopener noreferrer">Política de Envíos</Link> de {NOMBRE_TIENDA}.
          <span className="terminos__obligatorio" aria-hidden="true"> *</span>
        </label>
      </div>

      <p id="terminos-nota" className="terminos__nota">
        Los documentos se abren en una pestaña nueva, así no pierdes tu compra.
      </p>

      {mostrarError && (
        <p id="error-terminos" className="terminos__error" role="alert">
          Debes aceptar los Términos y Condiciones y las políticas de la tienda para continuar con tu compra.
        </p>
      )}
    </div>
  )
}