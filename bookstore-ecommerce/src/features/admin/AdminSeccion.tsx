import type { ReactNode } from "react"

interface AdminSeccionProps {
  titulo: string
  descripcion: string
  children: ReactNode
}

/**
 * Contenedor común de cada sección del panel (título, descripción y contenido).
 */
export function AdminSeccion({ titulo, descripcion, children }: AdminSeccionProps) {
  return (
    <section className="admin-seccion">
      <div className="admin-seccion__head">
        <h2 className="admin-seccion__titulo">{titulo}</h2>
        <p className="admin-seccion__texto">{descripcion}</p>
      </div>
      {children}
    </section>
  )
}