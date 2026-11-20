interface AdminPaginacionProps {
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

/**
 * Botones de anterior y siguiente para las tablas del panel.
 */
export function AdminPaginacion({ pagina, totalPaginas, onCambiar }: AdminPaginacionProps) {
  if (totalPaginas <= 1) return null

  return (
    <nav className="admin-paginacion" aria-label="Páginas">
      <button
        type="button"
        className="checkout-btn checkout-btn--ghost"
        disabled={pagina === 0}
        onClick={() => onCambiar(pagina - 1)}
      >
        Anterior
      </button>
      <span>Página {pagina + 1} de {totalPaginas}</span>
      <button
        type="button"
        className="checkout-btn checkout-btn--ghost"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}