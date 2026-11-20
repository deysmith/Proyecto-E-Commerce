import { useEffect, useState } from "react"
import { buscarProductosAdmin, type PaginaProductos } from "../../services/algoliaService"

/**
 * Búsqueda y paginación del catálogo para las secciones Productos e Inventario del panel.
 */
export function useProductosAdmin() {
  const [texto, setTexto] = useState("")
  const [pagina, setPagina] = useState(0)
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<{ clave: string; datos: PaginaProductos | null } | null>(null)

  const clave = JSON.stringify({ texto, pagina, intento })
  const cargando = resultado?.clave !== clave

  useEffect(() => {
    let cancelado = false
    const espera = setTimeout(() => {
      buscarProductosAdmin(texto, pagina).then((datos) => {
        if (!cancelado) setResultado({ clave, datos })
      })
    }, 300)

    return () => {
      cancelado = true
      clearTimeout(espera)
    }
  }, [texto, pagina, clave])

  function buscar(nuevoTexto: string) {
    setTexto(nuevoTexto)
    setPagina(0)
  }

  return {
    texto,
    buscar,
    pagina,
    setPagina,
    datos: resultado?.datos,
    cargando,
    reintentar: () => setIntento(intento + 1),
  }
}