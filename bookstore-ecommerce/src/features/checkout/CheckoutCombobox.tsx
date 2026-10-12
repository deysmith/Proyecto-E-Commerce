import { useState, type KeyboardEvent } from "react"

export interface OpcionCombobox {
  codigo: number
  nombre: string
}

interface CheckoutComboboxProps {
  id: string
  etiqueta: string
  opciones: OpcionCombobox[]
  valor: number | null
  onSeleccionar: (codigo: number | null) => void
  onBlur?: () => void
  error?: string
  ayuda?: string
  placeholder?: string
  obligatorio?: boolean
  deshabilitado?: boolean
}

// Quita tildes y mayúsculas para que "limon" encuentre "Limón"
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

/**
 * Combobox para elegir una opción de una lista. Permite escribir para filtrar.
 */
export function CheckoutCombobox({
  id,
  etiqueta,
  opciones,
  valor,
  onSeleccionar,
  onBlur,
  error,
  ayuda,
  placeholder,
  obligatorio = false,
  deshabilitado = false,
}: CheckoutComboboxProps) {
  // Al montar, si ya había algo elegido se muestra su nombre
  const [texto, setTexto] = useState(() => opciones.find((o) => o.codigo === valor)?.nombre ?? "")
  const [abierto, setAbierto] = useState(false)
  const [indiceActivo, setIndiceActivo] = useState(0)

  const idLista = `${id}-lista`
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  // Con una opción ya elegida se muestra toda la lista; si no, se filtra por lo escrito
  const visibles = valor !== null
    ? opciones
    : opciones.filter((opcion) => normalizar(opcion.nombre).includes(normalizar(texto)))

  function cambiarTexto(nuevoTexto: string) {
    setTexto(nuevoTexto)
    setAbierto(true)
    setIndiceActivo(0)

    // Si lo escrito es igual a una opción, se elige sola y se cierra la lista; si no, se deselecciona
    const exacta = opciones.find((o) => normalizar(o.nombre) === normalizar(nuevoTexto))

    if (exacta) {
      onSeleccionar(exacta.codigo)
    } else if (valor !== null) {
      onSeleccionar(null)
    }
  }

  function elegir(opcion: OpcionCombobox) {
    setTexto(opcion.nombre)
    setAbierto(false)
    onSeleccionar(opcion.codigo)
  }

  function manejarTeclas(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault()
      if (!abierto) {
        setAbierto(true)
        return
      }
      setIndiceActivo((actual) => Math.min(actual + 1, visibles.length - 1))
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault()
      setIndiceActivo((actual) => Math.max(actual - 1, 0))
    } else if (evento.key === "Enter" && abierto && visibles[indiceActivo]) {
      // Con la lista abierta, Enter elige la opción (y no envía el formulario)
      evento.preventDefault()
      elegir(visibles[indiceActivo])
    } else if (evento.key === "Escape") {
      setAbierto(false)
    }
  }

  function cerrar() {
    setAbierto(false)
    onBlur?.()
  }

  const idOpcionActiva = abierto && visibles[indiceActivo] ? `${id}-opcion-${visibles[indiceActivo].codigo}` : undefined

  return (
    <div className={`checkout-field checkout-combobox${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span className="checkout-field__required" aria-hidden="true">*</span>}
      </label>

      <div className="checkout-combobox__box">
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={abierto}
          aria-controls={idLista}
          aria-activedescendant={idOpcionActiva}
          aria-required={obligatorio || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
          placeholder={placeholder}
          disabled={deshabilitado}
          value={texto}
          onChange={(e) => cambiarTexto(e.target.value)}
          onClick={() => setAbierto(true)}
          onKeyDown={manejarTeclas}
          onBlur={cerrar}
        />

        {abierto && (
          <ul id={idLista} className="checkout-combobox__list" role="listbox" aria-label={etiqueta}>
            {visibles.length === 0 ? (
              <li className="checkout-combobox__empty">No hay resultados para "{texto}"</li>
            ) : (
              visibles.map((opcion, indice) => (
                <li
                  key={opcion.codigo}
                  id={`${id}-opcion-${opcion.codigo}`}
                  role="option"
                  aria-selected={opcion.codigo === valor}
                  className={
                    "checkout-combobox__option" +
                    (indice === indiceActivo ? " is-active" : "") +
                    (opcion.codigo === valor ? " is-selected" : "")
                  }
                  // onMouseDown evita que el input pierda el foco antes de elegir la opción
                  onMouseDown={(e) => {
                    e.preventDefault()
                    elegir(opcion)
                  }}
                  onMouseEnter={() => setIndiceActivo(indice)}
                >
                  {opcion.nombre}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error ? (
        <p id={idError} className="checkout-field__error" role="alert">{error}</p>
      ) : (
        ayuda && <p id={idAyuda} className="checkout-field__help">{ayuda}</p>
      )}
    </div>
  )
}