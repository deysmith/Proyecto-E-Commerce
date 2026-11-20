import type { ProblemaCarrito } from "./CartValidation"

interface CartIssuesProps {
  problemas: ProblemaCarrito[]
}

/**
 * Aviso con los libros que impiden continuar al checkout y el motivo de cada uno.
 */
export function CartIssues({ problemas }: CartIssuesProps) {
  if (problemas.length === 0) return null

  return (
    <div className="cart-issues" role="alert">
      <strong>No puedes continuar al checkout todavía</strong>
      <ul>
        {problemas.map((problema) => (
          <li key={`${problema.itemId}-${problema.tipo}`}>{problema.mensaje}</li>
        ))}
      </ul>
    </div>
  )
}