import type { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { listaPaginasLegales } from "../features/legal/LegalContent"

interface FooterProps {
  // Solo se usa en el checkout: en vez de salir directo, avisa a la página para pedir confirmación
  onSalir?: (destino: string) => void
}

export function Footer({ onSalir }: FooterProps) {
  // Dentro del checkout salir de la página haría perder los datos escritos, por eso se pide confirmación primero
  function alHacerClic(destino: string) {
    return (evento: MouseEvent<HTMLAnchorElement>) => {
      if (!onSalir) return
      evento.preventDefault()
      onSalir(destino)
    }
  }

  return (
    <footer className="catalog-footer">
      <nav className="catalog-footer__legal" aria-label="Información y políticas">
        <ul>
          {listaPaginasLegales.map(({ ruta, titulo }) => (
            <li key={ruta}>
              <Link to={ruta} onClick={alHacerClic(ruta)}>{titulo}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="catalog-footer__details">
        <span>©2026 Booksmart</span>
        <span>Limón, Costa Rica · CRC</span>
      </div>

    </footer>
  )
}