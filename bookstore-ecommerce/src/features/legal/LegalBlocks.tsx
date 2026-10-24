import { Link } from "react-router-dom"
import { paginasLegales } from "./LegalContent"
import type { BloqueLegal } from "./LegalTypes"

interface LegalBlockProps {
  bloque: BloqueLegal
}

/**
 * Se encarga de doibujar y acomodar el contenido de los componentes de la página legal
 */
export function LegalBlock({ bloque }: LegalBlockProps) {
  switch (bloque.tipo) {
    case "parrafo":
      return <p className="legal-texto">{bloque.texto}</p>

    case "lista":
      return (
        <ul className="legal-lista">
          {bloque.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    case "pasos":
      return (
        <ol className="legal-pasos">
          {bloque.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )

    case "aviso":
      return (
        <aside className="legal-aviso">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </svg>
          <p>{bloque.texto}</p>
        </aside>
      )

    case "tabla":
      return (
        <div className="legal-tabla">
          <table>
            <thead>
              <tr>
                {bloque.encabezados.map((encabezado) => (
                  <th key={encabezado} scope="col">{encabezado}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloque.filas.map((fila) => (
                <tr key={fila[0]}>
                  {fila.map((celda, indice) => (
                    <td key={indice}>{celda}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "pregunta":
      // details/summary es un desplegable nativo: funciona con teclado y lectores de pantalla sin código extra
      return (
        <details className="legal-pregunta">
          <summary>{bloque.pregunta}</summary>
          <div className="legal-pregunta__respuesta">
            <p>{bloque.respuesta}</p>
            {bloque.enlace && (
              <Link to={paginasLegales[bloque.enlace.clave].ruta} className="legal-pregunta__enlace">
                {bloque.enlace.texto} →
              </Link>
            )}
          </div>
        </details>
      )
  }
}